package com.assurance.sante.connect.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String organization;

    private String telephone;

    private String adresse;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum UserRole {
        ADMIN,
        PRESTATAIRE,
        CLIENT
    }

    public enum UserStatus {
        ACTIVE,
        PENDING,
        REJECTED,
        SUSPENDED
    }
}
