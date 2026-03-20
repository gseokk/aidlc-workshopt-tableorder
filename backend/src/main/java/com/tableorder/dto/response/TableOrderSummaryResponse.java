package com.tableorder.dto.response;

import java.util.List;

public record TableOrderSummaryResponse(
        Long tableId,
        Integer tableNumber,
        List<OrderResponse> orders,
        Integer totalAmount
) {}
