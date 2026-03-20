package com.tableorder.controller;

import com.tableorder.dto.request.OrderCreateRequest;
import com.tableorder.dto.request.OrderStatusRequest;
import com.tableorder.dto.response.OrderResponse;
import com.tableorder.security.AdminClaims;
import com.tableorder.security.TableClaims;
import com.tableorder.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Order", description = "주문 관리 API")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/customer/orders")
    @Operation(summary = "주문 생성")
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal TableClaims claims,
            @Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(claims.tableId(), claims.sessionId(), request));
    }

    @GetMapping("/api/customer/orders/session")
    @Operation(summary = "현재 세션 주문 목록")
    public ResponseEntity<List<OrderResponse>> getSessionOrders(
            @AuthenticationPrincipal TableClaims claims) {
        return ResponseEntity.ok(orderService.getSessionOrders(claims.sessionId()));
    }

    @GetMapping("/api/admin/orders/table/{tableId}")
    @Operation(summary = "테이블 주문 목록 조회")
    public ResponseEntity<List<OrderResponse>> getTableOrders(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.getTableOrders(tableId));
    }

    @GetMapping("/api/admin/orders/tables")
    @Operation(summary = "전체 테이블 주문 요약 조회")
    public ResponseEntity<List<com.tableorder.dto.response.TableOrderSummaryResponse>> getAllTableOrders(
            @AuthenticationPrincipal AdminClaims claims) {
        return ResponseEntity.ok(orderService.getAllTableOrders(claims.storeId()));
    }

    @PatchMapping("/api/admin/orders/{orderId}/status")
    @Operation(summary = "주문 상태 변경")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, claims.storeId(), request.status()));
    }

    @DeleteMapping("/api/admin/orders/{orderId}")
    @Operation(summary = "주문 삭제")
    public ResponseEntity<Void> deleteOrder(
            @AuthenticationPrincipal AdminClaims claims,
            @PathVariable Long orderId) {
        orderService.deleteOrder(orderId, claims.storeId());
        return ResponseEntity.noContent().build();
    }
}
