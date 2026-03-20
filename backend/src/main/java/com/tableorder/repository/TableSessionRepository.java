package com.tableorder.repository;

import com.tableorder.entity.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    Optional<TableSession> findByTableIdAndIsActiveTrue(Long tableId);
    List<TableSession> findByTableIdAndIsActiveFalseAndStartedAtBetween(
            Long tableId, LocalDateTime from, LocalDateTime to);
}
