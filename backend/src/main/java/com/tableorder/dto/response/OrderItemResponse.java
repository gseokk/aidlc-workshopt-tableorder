package com.tableorder.dto.response;

import com.tableorder.entity.OrderItem;

public record OrderItemResponse(Long id, String menuName, Integer menuPrice, Integer quantity, Integer subtotal) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getId(), item.getMenuName(), item.getMenuPrice(),
                item.getQuantity(), item.getSubtotal()
        );
    }
}
