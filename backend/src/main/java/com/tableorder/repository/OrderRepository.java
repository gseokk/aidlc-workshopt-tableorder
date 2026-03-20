package com.tableorder.repository;

import com.tableorder.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items i JOIN FETCH i.menu WHERE o.session.id = :sessionId ORDER BY o.createdAt DESC")
    List<Order> findBySessionIdOrderByCreatedAtDesc(@Param("sessionId") Long sessionId);
}
