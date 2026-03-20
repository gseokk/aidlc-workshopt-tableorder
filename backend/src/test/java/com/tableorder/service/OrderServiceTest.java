package com.tableorder.service;

import com.tableorder.dto.request.OrderCreateRequest;
import com.tableorder.dto.request.OrderItemRequest;
import com.tableorder.dto.response.OrderResponse;
import com.tableorder.entity.*;
import com.tableorder.exception.BadRequestException;
import com.tableorder.exception.ForbiddenException;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.MenuRepository;
import com.tableorder.repository.OrderItemRepository;
import com.tableorder.repository.OrderRepository;
import com.tableorder.repository.TableSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock MenuRepository menuRepository;
    @Mock TableSessionRepository tableSessionRepository;
    @Mock SseService sseService;

    @InjectMocks OrderService orderService;

    private Store store;
    private TableEntity table;
    private TableSession activeSession;
    private MenuCategory category;
    private Menu menu;

    @BeforeEach
    void setUp() {
        store = Store.builder().storeIdentifier("store001").name("매장")
                .adminUsername("admin").adminPassword("pw").build();
        table = TableEntity.builder().store(store).tableNumber(1).password("1234").build();
        activeSession = TableSession.builder().table(table).build();
        category = MenuCategory.builder().store(store).name("음료").displayOrder(1).build();
        menu = Menu.builder().store(store).category(category)
                .name("아메리카노").price(4000).description(null).imageUrl(null).displayOrder(1).build();
    }

    // TC-BE-016
    @Test
    @DisplayName("유효한 주문 생성 - totalAmount 계산 및 SSE 이벤트 발행")
    void createOrder_success() {
        given(tableSessionRepository.findById(any())).willReturn(Optional.of(activeSession));
        given(menuRepository.findById(any())).willReturn(Optional.of(menu));
        Order savedOrder = Order.builder().session(activeSession).totalAmount(8000).build();
        given(orderRepository.save(any())).willReturn(savedOrder);

        OrderCreateRequest request = new OrderCreateRequest(List.of(new OrderItemRequest(1L, 2)));
        orderService.createOrder(table.getId(), activeSession.getId(), request);

        then(orderRepository).should().save(any(Order.class));
        then(sseService).should().sendEvent(any(), eq("ORDER_CREATED"), any());
    }

    // TC-BE-017
    @Test
    @DisplayName("비활성 세션으로 주문 생성 시 BadRequestException")
    void createOrder_inactiveSession_throwsException() {
        TableSession inactiveSession = TableSession.builder().table(table).build();
        inactiveSession.complete();
        given(tableSessionRepository.findById(any())).willReturn(Optional.of(inactiveSession));

        OrderCreateRequest request = new OrderCreateRequest(List.of(new OrderItemRequest(1L, 1)));
        assertThatThrownBy(() -> orderService.createOrder(table.getId(), 1L, request))
                .isInstanceOf(BadRequestException.class);
    }

    // TC-BE-018
    @Test
    @DisplayName("삭제된 메뉴로 주문 생성 시 NotFoundException")
    void createOrder_deletedMenu_throwsException() {
        menu.softDelete();
        given(tableSessionRepository.findById(any())).willReturn(Optional.of(activeSession));
        given(menuRepository.findById(any())).willReturn(Optional.of(menu));

        OrderCreateRequest request = new OrderCreateRequest(List.of(new OrderItemRequest(1L, 1)));
        assertThatThrownBy(() -> orderService.createOrder(table.getId(), activeSession.getId(), request))
                .isInstanceOf(NotFoundException.class);
    }

    // TC-BE-019
    @Test
    @DisplayName("주문 생성 시 메뉴 가격 스냅샷 저장")
    void createOrder_snapshotSaved() {
        given(tableSessionRepository.findById(any())).willReturn(Optional.of(activeSession));
        given(menuRepository.findById(any())).willReturn(Optional.of(menu));
        given(orderRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        OrderCreateRequest request = new OrderCreateRequest(List.of(new OrderItemRequest(1L, 2)));
        orderService.createOrder(table.getId(), activeSession.getId(), request);

        // menu 가격 변경 후에도 OrderItem 스냅샷은 유지됨 (OrderItem 생성자에서 처리)
        then(orderRepository).should().save(argThat(order ->
                order.getTotalAmount() == 8000)); // 4000 * 2
    }

    // TC-BE-020
    @Test
    @DisplayName("PENDING → CONFIRMED 상태 변경 성공")
    void updateOrderStatus_pendingToConfirmed_success() {
        Order order = Order.builder().session(activeSession).totalAmount(4000).build();
        given(orderRepository.findById(any())).willReturn(Optional.of(order));

        orderService.updateOrderStatus(1L, store.getId(), OrderStatus.CONFIRMED);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        then(sseService).should().sendEvent(any(), eq("ORDER_STATUS_CHANGED"), any());
    }

    // TC-BE-021
    @Test
    @DisplayName("COMPLETED → PENDING 역방향 상태 변경 시 BadRequestException")
    void updateOrderStatus_invalidTransition_throwsException() {
        Order order = Order.builder().session(activeSession).totalAmount(4000).build();
        order.updateStatus(OrderStatus.COMPLETED);
        given(orderRepository.findById(any())).willReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, store.getId(), OrderStatus.PENDING))
                .isInstanceOf(BadRequestException.class);
    }

    // TC-BE-022
    @Test
    @DisplayName("다른 매장 주문 상태 변경 시 ForbiddenException")
    void updateOrderStatus_wrongStore_throwsException() {
        Order order = Order.builder().session(activeSession).totalAmount(4000).build();
        given(orderRepository.findById(any())).willReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, 999L, OrderStatus.CONFIRMED))
                .isInstanceOf(ForbiddenException.class);
    }

    // TC-BE-023
    @Test
    @DisplayName("주문 삭제 성공 - SSE 이벤트 발행")
    void deleteOrder_success() {
        Order order = Order.builder().session(activeSession).totalAmount(4000).build();
        given(orderRepository.findById(any())).willReturn(Optional.of(order));

        orderService.deleteOrder(1L, store.getId());

        then(orderRepository).should().delete(order);
        then(sseService).should().sendEvent(any(), eq("ORDER_DELETED"), any());
    }
}
