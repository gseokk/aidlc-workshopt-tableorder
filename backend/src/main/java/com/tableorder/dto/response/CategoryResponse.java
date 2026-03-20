package com.tableorder.dto.response;

import com.tableorder.entity.MenuCategory;

public record CategoryResponse(Long id, String name, Integer displayOrder) {
    public static CategoryResponse from(MenuCategory category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDisplayOrder());
    }
}
