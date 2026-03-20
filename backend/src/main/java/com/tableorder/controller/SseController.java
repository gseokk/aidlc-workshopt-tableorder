package com.tableorder.controller;

import com.tableorder.security.AdminClaims;
import com.tableorder.service.SseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
@Tag(name = "SSE", description = "실시간 이벤트 API")
public class SseController {

    private final SseService sseService;

    @GetMapping(value = "/subscribe/{storeId}", produces = "text/event-stream")
    @Operation(summary = "SSE 구독")
    public SseEmitter subscribe(@AuthenticationPrincipal AdminClaims claims,
                                @PathVariable Long storeId) {
        return sseService.createEmitter(storeId);
    }
}
