package sh.andrews.smartpark.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.enums.UserRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @EqualsAndHashCode.Include
  private Long id;

  @Column(name = "name", length = 100, nullable = false)
  private String name;

  @Column(name = "email", length = 255, nullable = false, unique = true)
  private String email;

  @Column(name = "passwordHash")
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", length = 20, nullable = false)
  private UserRole role = UserRole.USER;

  @Column(name = "emailVerified", nullable = false)
  private Boolean emailVerified = false;

  @Column(name = "avatarUrl", length = 500)
  private String avatarUrl;

  @Column(name = "active", nullable = false)
  private Boolean active = true;

  @Column(name = "lastLoginAt")
  private LocalDateTime lastLoginAt;

  @Column(name = "createdAt", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updatedAt", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  private void uponRegistration() {
    LocalDateTime now = LocalDateTime.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  private void uponUpdating() {
    updatedAt = LocalDateTime.now();
  }
}
