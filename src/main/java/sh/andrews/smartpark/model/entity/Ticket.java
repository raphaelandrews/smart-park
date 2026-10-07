package sh.andrews.smartpark.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tickets")
public class Ticket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @EqualsAndHashCode.Include
  private Long id;

  @Column(name = "qrCodeToken", nullable = false, unique = true)
  private UUID qrCodeToken;

  @Column(name = "active", nullable = false)
  private Boolean active = true;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "GMT")
  @Column(name = "entryTime")
  private LocalDateTime entryTime;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "GMT")
  @Column(name = "exitTime")
  private LocalDateTime exitTime;

  @Column(name = "createdAt", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updatedAt", nullable = false)
  private LocalDateTime updatedAt;

  @ManyToOne
  @JoinColumn(name = "vehicle_id", nullable = false)
  private Vehicle vehicle;

  @ManyToOne
  @JoinColumn(name = "parking_space_id", nullable = false)
  private ParkingSpace parkingSpace;

  @ManyToOne
  @JoinColumn(name = "tariff_id", nullable = false)
  private Tariff tariff;

  @OneToOne(mappedBy = "ticket")
  private Payment payment;

  @PrePersist
  private void uponRegistration() {
    LocalDateTime now = LocalDateTime.now();
    createdAt = now;
    updatedAt = now;
    if (qrCodeToken == null) {
      qrCodeToken = UUID.randomUUID();
    }
  }

  @PreUpdate
  private void uponUpdating() {
    updatedAt = LocalDateTime.now();
  }
}
