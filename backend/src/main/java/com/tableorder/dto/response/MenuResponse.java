package com.tableorder.dto.response;

import com.tableorder.entity.Menu;

public record MenuResponse(Long id, String name, Integer price, Long categoryId, String categoryName,
                           String description, String imageUrl, Integer displayOrder) {
    public static MenuResponse from(Menu menu) {
        return new MenuResponse(
                menu.getId(), menu.getName(), menu.getPrice(),
                menu.getCategory().getId(), menu.getCategory().getName(),
                menu.getDescription(), menu.getImageUrl(), menu.getDisplayOrder()
        );
    }
}
