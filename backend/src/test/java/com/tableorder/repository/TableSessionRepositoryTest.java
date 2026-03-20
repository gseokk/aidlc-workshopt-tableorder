package com.tableorder.repository;

import com.tableorder.entity.Store;
import com.tableorder.entity.TableEntity;
import com.tableorder.entity.TableSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TableSessionRepositoryTest {

    @Autowired TableSessionRepository tableSessionRepository;
    @Autowired TableRepository tableRepository;
    @Autowired StoreRepository storeRepository;

    private TableEntity table;

    @BeforeEach
    void setUp() {
        Store store = storeRepository.save(Store.builder()
                .storeIdentifier("store001").name("테스트 매장")
                .adminUsername("admin").adminPassword("pw").build());
        table = tableRepository.save(TableEntity.builder()
                .store(store).tableNumber(1).password("1234").build());
    }

    // TC-BE-034
    @Test
    @DisplayName("활성 세션 조회 성공")
    void findByTableIdAndIsActiveTrue_found() {
        TableSession session = tableSessionRepository.save(TableSession.builder().table(table).build());

        Optional<TableSession> result = tableSessionRepository.findByTableIdAndIsActiveTrue(table.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(session.getId());
    }

    // TC-BE-035
    @Test
    @DisplayName("활성 세션 없을 때 Optional.empty() 반환")
    void findByTableIdAndIsActiveTrue_notFound() {
        TableSession session = tableSessionRepository.save(TableSession.builder().table(table).build());
        session.complete();
        tableSessionRepository.save(session);

        Optional<TableSession> result = tableSessionRepository.findByTableIdAndIsActiveTrue(table.getId());

        assertThat(result).isEmpty();
    }
}
