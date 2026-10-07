package sh.andrews.smartpark.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.enums.VehicleType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "vehicles")
public class Vehicle {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @EqualsAndHashCode.Include
  private Long id;

  @Column(name = "licensePlate", length = 10, nullable = false)
  private String licensePlate;

  @Column(name = "model", length = 100, nullable = false)
  private String model;

  @Column(name = "color", length = 50, nullable = false)
  private String color;

  @Enumerated(EnumType.STRING)
  @Column(name = "vehicleType", length = 20, nullable = false)
  private VehicleType vehicleType;

  @Column(name = "active", nullable = false)
  private Boolean active = true;

  @Column(name = "createdAt", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updatedAt", nullable = false)
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "vehicle")
  private List<Ticket> tickets = new ArrayList<>();

  public Vehicle(Long id, String licensePlate, String model, String color, VehicleType vehicleType) {
    this.id = id;
    this.licensePlate = licensePlate;
    this.model = model;
    this.color = color;
    this.vehicleType = vehicleType;
  }

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
