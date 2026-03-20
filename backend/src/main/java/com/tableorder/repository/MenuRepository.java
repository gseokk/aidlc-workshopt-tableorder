package com.tableorder.repository;

import com.tableorder.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(Long storeId);
    List<Menu> findByStoreIdAndCategoryIdAndIsDeletedFalseOrderByDisplayOrder(Long storeId, Long categoryId);
    List<Menu> findByCategoryIdAndIsDeletedFalseOrderByDisplayOrder(Long categoryId);
    Optional<Menu> findByIdAndStoreId(Long id, Long storeId);
    long countByCategoryIdAndIsDeletedFalse(Long categoryId);
}
