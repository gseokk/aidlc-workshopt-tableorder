package com.tableorder.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MenuCreateRequest(
        @NotBlank String name,
        @NotNull @Min(0) Integer price,
        @NotBlank String categoryName,
        String description,
        String imageUrl
) {}
