package com.tableorder.service;

import com.tableorder.dto.response.TableSetupResponse;
import com.tableorder.entity.Store;
import com.tableorder.entity.TableEntity;
import com.tableorder.entity.TableSession;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.OrderRepository;
import com.tableorder.repository.StoreRepository;
import com.tableorder.repository.TableRepository;
import com.tableorder.repository.TableSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class TableServiceTest {

    @Mock TableRepository tableRepository;
    @Mock TableSessionRepository tableSessionRepository;
    @Mock OrderRepository orderRepository;
    @Mock StoreRepository storeRepository;
    @Mock SseService sseService;

    @InjectMocks TableService tableService;

    private Store store;
    private TableEntity table;

    @BeforeEach
    void setUp() {
        store = Store.builder()
                .storeIdentifier("store001").name("테스트 매장")
                .adminUsername("admin").adminPassword("pw").build();

        table = TableEntity.builder().store(store).tableNumber(1).password("1234").build();
    }

    // TC-BE-007
    @Test
    @DisplayName("신규 테이블 설정")
    void setupTable_newTable_created() {
        given(tableRepository.findByStoreIdAndTableNumber(any(), eq(1))).willReturn(Optional.empty());
        given(tableRepository.save(any())).willReturn(table);

        TableSetupResponse response = tableService.setupTable(1L, 1, "1234");

        assertThat(response.tableNumber()).isEqualTo(1);
        then(tableRepository).should().save(any(TableEntity.class));
    }

    // TC-BE-008
    @Test
    @DisplayName("기존 테이블 비밀번호 업데이트")
    void setupTable_existingTable_passwordUpdated() {
        given(tableRepository.findByStoreIdAndTableNumber(any(), eq(1))).willReturn(Optional.of(table));
        given(tableRepository.save(any())).willReturn(table);

        tableService.setupTable(1L, 1, "newpass");

        assertThat(table.getPassword()).isEqualTo("newpass");
        then(tableRepository).should(never()).save(argThat(t ->
                t != table)); // 기존 테이블만 저장
    }

    // TC-BE-009
    @Test
    @DisplayName("활성 세션 완료 처리")
    void completeTableSession_success() {
        TableSession session = TableSession.builder().table(table).build();
        given(tableRepository.findByIdAndStoreId(any(), any())).willReturn(Optional.of(table));
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(any())).willReturn(Optional.of(session));

        tableService.completeTableSession(1L, 1L);

        assertThat(session.getIsActive()).isFalse();
        assertThat(session.getCompletedAt()).isNotNull();
        then(sseService).should().sendEvent(any(), eq("SESSION_COMPLETED"), any());
    }

    // TC-BE-010
    @Test
    @DisplayName("활성 세션 없을 때 완료 처리 실패")
    void completeTableSession_noActiveSession_throwsException() {
        given(tableRepository.findByIdAndStoreId(any(), any())).willReturn(Optional.of(table));
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(any())).willReturn(Optional.empty());

        assertThatThrownBy(() -> tableService.completeTableSession(1L, 1L))
                .isInstanceOf(NotFoundException.class);
    }
}
