package com.tableorder.dto.response;

public record LoginResponse(String token, Long storeId, String storeName, Long expiresAt) {}
