package com.tableorder.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu_categories", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"store_id", "name"})
})
@Getter
@NoArgsConstructor
public class MenuCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MenuCategory(Store store, String name, Integer displayOrder) {
        this.store = store;
        this.name = name;
        this.displayOrder = displayOrder;
        this.createdAt = LocalDateTime.now();
    }
}
