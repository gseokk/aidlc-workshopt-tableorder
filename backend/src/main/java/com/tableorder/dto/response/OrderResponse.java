package com.tableorder.dto.response;

import com.tableorder.entity.Order;
import com.tableorder.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(Long id, String orderNumber, Long tableId, Integer tableNumber,
                            OrderStatus status, Integer totalAmount,
                            List<OrderItemResponse> items, LocalDateTime createdAt) {
    public static OrderResponse from(Order order) {
        Long tableId = order.getSession().getTable().getId();
        Integer tableNumber = order.getSession().getTable().getTableNumber();
        String orderNumber = String.format("ORD-%05d", order.getId());
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderItemResponse::from).toList();
        return new OrderResponse(order.getId(), orderNumber, tableId, tableNumber,
                order.getStatus(), order.getTotalAmount(), items, order.getCreatedAt());
    }
}
