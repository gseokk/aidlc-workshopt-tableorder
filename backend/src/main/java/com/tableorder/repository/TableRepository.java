package com.tableorder.repository;

import com.tableorder.entity.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<TableEntity, Long> {
    Optional<TableEntity> findByStoreIdAndTableNumber(Long storeId, Integer tableNumber);
    Optional<TableEntity> findByIdAndStoreId(Long id, Long storeId);
    List<TableEntity> findByStoreId(Long storeId);
}
