package com.tableorder.dto.response;

public record TableLoginResponse(
        String token,
        Long tableId,
        Integer tableNumber,
        Long sessionId,
        Long storeId,
        String storeName
) {}
