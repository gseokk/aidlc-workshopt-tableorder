package com.tableorder.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String storeIdentifier,
        @NotBlank String username,
        @NotBlank String password
) {}
