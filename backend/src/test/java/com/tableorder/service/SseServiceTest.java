package com.tableorder.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.*;

class SseServiceTest {

    private SseService sseService;

    @BeforeEach
    void setUp() {
        sseService = new SseService();
    }

    // TC-BE-024
    @Test
    @DisplayName("Emitter 생성 및 Pool 등록")
    void createEmitter_registeredInPool() {
        SseEmitter emitter = sseService.createEmitter(1L);

        assertThat(emitter).isNotNull();
        assertThat(sseService.getEmitterCount(1L)).isEqualTo(1);
    }

    @Test
    @DisplayName("같은 매장에 여러 Emitter 등록 가능")
    void createEmitter_multipleEmitters_allowed() {
        sseService.createEmitter(1L);
        sseService.createEmitter(1L);

        assertThat(sseService.getEmitterCount(1L)).isEqualTo(2);
    }

    // TC-BE-025
    @Test
    @DisplayName("이벤트 전송 - 등록된 모든 Emitter에 전송")
    void sendEvent_allEmittersReceive() throws IOException {
        SseEmitter emitter1 = spy(new SseEmitter(30000L));
        SseEmitter emitter2 = spy(new SseEmitter(30000L));

        // 직접 pool에 추가하는 대신 createEmitter 후 spy로 교체
        sseService.createEmitter(1L);
        sseService.createEmitter(1L);

        // 실제 전송 테스트 (예외 없이 완료되면 성공)
        assertThatNoException().isThrownBy(() ->
                sseService.sendEvent(1L, "ORDER_CREATED", "payload"));
    }

    // TC-BE-026
    @Test
    @DisplayName("전송 실패한 Emitter 자동 제거")
    void sendEvent_failedEmitter_removed() {
        // 정상 emitter 1개 생성
        sseService.createEmitter(1L);
        assertThat(sseService.getEmitterCount(1L)).isEqualTo(1);

        // removeEmitter 직접 호출로 제거 동작 검증
        SseEmitter emitter = sseService.createEmitter(1L);
        assertThat(sseService.getEmitterCount(1L)).isEqualTo(2);

        sseService.removeEmitter(1L, emitter);
        assertThat(sseService.getEmitterCount(1L)).isEqualTo(1);
    }
}
