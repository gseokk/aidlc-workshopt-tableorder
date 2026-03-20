package com.tableorder.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseService {

    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30분

    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(Long storeId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitters.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> removeEmitter(storeId, emitter));
        emitter.onError(e -> removeEmitter(storeId, emitter));

        return emitter;
    }

    public void sendEvent(Long storeId, String eventType, Object payload) {
        CopyOnWriteArrayList<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters == null || storeEmitters.isEmpty()) return;

        for (SseEmitter emitter : storeEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventType).data(payload));
            } catch (IOException e) {
                log.warn("SSE 이벤트 전송 실패 - storeId: {}, event: {}", storeId, eventType);
                removeEmitter(storeId, emitter);
            }
        }
    }

    public void removeEmitter(Long storeId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> storeEmitters = emitters.get(storeId);
        if (storeEmitters != null) {
            storeEmitters.remove(emitter);
            if (storeEmitters.isEmpty()) {
                emitters.remove(storeId);
            }
        }
    }

    public int getEmitterCount(Long storeId) {
        return emitters.getOrDefault(storeId, new CopyOnWriteArrayList<>()).size();
    }
}
