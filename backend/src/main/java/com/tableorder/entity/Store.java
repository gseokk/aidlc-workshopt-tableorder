package com.tableorder.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
@Getter
@NoArgsConstructor
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String storeIdentifier;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String adminUsername;

    @Column(nullable = false)
    private String adminPassword;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Store(String storeIdentifier, String name, String adminUsername, String adminPassword) {
        this.storeIdentifier = storeIdentifier;
        this.name = name;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.createdAt = LocalDateTime.now();
    }
}
