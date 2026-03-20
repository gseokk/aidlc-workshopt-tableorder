package com.tableorder.repository;

import com.tableorder.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    List<MenuCategory> findByStoreIdOrderByDisplayOrder(Long storeId);
    Optional<MenuCategory> findByStoreIdAndName(Long storeId, String name);
    long countByStoreId(Long storeId);
}
