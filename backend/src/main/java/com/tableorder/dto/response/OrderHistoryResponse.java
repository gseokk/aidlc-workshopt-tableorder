package com.tableorder.dto.response;

import com.tableorder.entity.TableSession;

import java.time.LocalDateTime;
import java.util.List;

public record OrderHistoryResponse(Long sessionId, LocalDateTime startedAt,
                                   LocalDateTime completedAt, List<OrderResponse> orders) {
    public static OrderHistoryResponse from(TableSession session, List<OrderResponse> orders) {
        return new OrderHistoryResponse(
                session.getId(), session.getStartedAt(), session.getCompletedAt(), orders
        );
    }
}
