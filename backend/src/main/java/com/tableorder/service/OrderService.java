package com.tableorder.service;

import com.tableorder.dto.request.OrderCreateRequest;
import com.tableorder.dto.response.OrderResponse;
import com.tableorder.entity.*;
import com.tableorder.exception.BadRequestException;
import com.tableorder.exception.ForbiddenException;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.MenuRepository;
import com.tableorder.repository.OrderItemRepository;
import com.tableorder.repository.OrderRepository;
import com.tableorder.repository.TableSessionRepository;
import com.tableorder.dto.response.TableOrderSummaryResponse;
import com.tableorder.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuRepository menuRepository;
    private final TableSessionRepository tableSessionRepository;
    private final TableRepository tableRepository;
    private final SseService sseService;

    @Transactional
    public OrderResponse createOrder(Long tableId, Long sessionId, OrderCreateRequest request) {
        TableSession session = tableSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("유효하지 않은 세션입니다"));
        if (!session.getIsActive()) {
            throw new BadRequestException("유효하지 않은 세션입니다");
        }

        // 메뉴 검증
        List<Menu> menus = request.items().stream()
                .map(itemReq -> {
                    Menu menu = menuRepository.findById(itemReq.menuId())
                            .orElseThrow(() -> new NotFoundException("메뉴를 찾을 수 없습니다: " + itemReq.menuId()));
                    if (menu.getIsDeleted()) {
                        throw new NotFoundException("메뉴를 찾을 수 없습니다: " + itemReq.menuId());
                    }
                    return menu;
                }).toList();

        // totalAmount 계산
        int totalAmount = 0;
        for (int i = 0; i < request.items().size(); i++) {
            totalAmount += menus.get(i).getPrice() * request.items().get(i).quantity();
        }

        Order order = orderRepository.save(Order.builder().session(session).totalAmount(totalAmount).build());
        for (int i = 0; i < request.items().size(); i++) {
            order.addItem(OrderItem.builder()
                    .order(order).menu(menus.get(i))
                    .quantity(request.items().get(i).quantity()).build());
        }

        Long storeId = session.getTable().getStore().getId();
        sseService.sendEvent(storeId, "ORDER_CREATED", OrderResponse.from(order));
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getSessionOrders(Long sessionId) {
        return orderRepository.findBySessionIdOrderByCreatedAtDesc(sessionId)
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getTableOrders(Long tableId) {
        return tableSessionRepository.findByTableIdAndIsActiveTrue(tableId)
                .map(session -> orderRepository.findBySessionIdOrderByCreatedAtDesc(session.getId())
                        .stream().map(OrderResponse::from).toList())
                .orElse(List.of());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Long storeId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다"));

        Long orderStoreId = order.getSession().getTable().getStore().getId();
        if (!orderStoreId.equals(storeId)) {
            throw new ForbiddenException("접근 권한이 없습니다");
        }

        validateStatusTransition(order.getStatus(), newStatus);
        order.updateStatus(newStatus);
        orderRepository.save(order);

        sseService.sendEvent(storeId, "ORDER_STATUS_CHANGED", OrderResponse.from(order));
        return OrderResponse.from(order);
    }

    @Transactional
    public void deleteOrder(Long orderId, Long storeId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다"));

        Long orderStoreId = order.getSession().getTable().getStore().getId();
        if (!orderStoreId.equals(storeId)) {
            throw new ForbiddenException("접근 권한이 없습니다");
        }

        Long tableId = order.getSession().getTable().getId();
        orderRepository.delete(order);
        sseService.sendEvent(storeId, "ORDER_DELETED", Map.of("orderId", orderId, "tableId", tableId));
    }

    @Transactional(readOnly = true)
    public List<TableOrderSummaryResponse> getAllTableOrders(Long storeId) {
        return tableRepository.findByStoreId(storeId).stream()
                .map(table -> {
                    List<OrderResponse> orders = tableSessionRepository
                            .findByTableIdAndIsActiveTrue(table.getId())
                            .map(session -> orderRepository
                                    .findBySessionIdOrderByCreatedAtDesc(session.getId())
                                    .stream().map(OrderResponse::from).toList())
                            .orElse(List.of());
                    int total = orders.stream().mapToInt(OrderResponse::totalAmount).sum();
                    return new TableOrderSummaryResponse(table.getId(), table.getTableNumber(), orders, total);
                })
                .toList();
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.COMPLETED;
            case COMPLETED -> false;
        };
        if (!valid) {
            throw new BadRequestException("유효하지 않은 상태 전이입니다: " + current + " → " + next);
        }
    }
}
