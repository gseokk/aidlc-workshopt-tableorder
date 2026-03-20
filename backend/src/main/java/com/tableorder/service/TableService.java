package com.tableorder.service;

import com.tableorder.dto.response.OrderHistoryResponse;
import com.tableorder.dto.response.OrderResponse;
import com.tableorder.dto.response.TableSetupResponse;
import com.tableorder.entity.Store;
import com.tableorder.entity.TableEntity;
import com.tableorder.entity.TableSession;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.OrderRepository;
import com.tableorder.repository.StoreRepository;
import com.tableorder.repository.TableRepository;
import com.tableorder.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final SseService sseService;

    @Transactional
    public TableSetupResponse setupTable(Long storeId, Integer tableNumber, String password) {
        return tableRepository.findByStoreIdAndTableNumber(storeId, tableNumber)
                .map(existing -> {
                    existing.updatePassword(password);
                    tableRepository.save(existing);
                    return new TableSetupResponse(existing.getId(), existing.getTableNumber());
                })
                .orElseGet(() -> {
                    Store store = storeRepository.getReferenceById(storeId);
                    TableEntity newTable = tableRepository.save(
                            TableEntity.builder()
                                    .store(store)
                                    .tableNumber(tableNumber)
                                    .password(password)
                                    .build()
                    );
                    return new TableSetupResponse(newTable.getId(), newTable.getTableNumber());
                });
    }

    @Transactional
    public void completeTableSession(Long tableId, Long storeId) {
        tableRepository.findByIdAndStoreId(tableId, storeId)
                .orElseThrow(() -> new NotFoundException("테이블을 찾을 수 없습니다"));

        TableSession session = tableSessionRepository.findByTableIdAndIsActiveTrue(tableId)
                .orElseThrow(() -> new NotFoundException("활성 세션이 없습니다"));

        session.complete();
        sseService.sendEvent(storeId, "SESSION_COMPLETED",
                Map.of("tableId", tableId, "sessionId", session.getId()));
    }

    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getTableHistory(Long tableId, Long storeId,
                                                       LocalDate from, LocalDate to) {
        tableRepository.findByIdAndStoreId(tableId, storeId)
                .orElseThrow(() -> new NotFoundException("테이블을 찾을 수 없습니다"));

        List<TableSession> sessions = tableSessionRepository
                .findByTableIdAndIsActiveFalseAndStartedAtBetween(
                        tableId,
                        from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay());

        return sessions.stream()
                .map(session -> {
                    List<OrderResponse> orders = orderRepository
                            .findBySessionIdOrderByCreatedAtDesc(session.getId())
                            .stream().map(OrderResponse::from).toList();
                    return OrderHistoryResponse.from(session, orders);
                })
                .toList();
    }

    @Transactional
    public TableSession getOrCreateActiveSession(Long tableId) {
        return tableSessionRepository.findByTableIdAndIsActiveTrue(tableId)
                .orElseGet(() -> {
                    TableEntity table = tableRepository.findById(tableId)
                            .orElseThrow(() -> new NotFoundException("테이블을 찾을 수 없습니다"));
                    return tableSessionRepository.save(TableSession.builder().table(table).build());
                });
    }
}
