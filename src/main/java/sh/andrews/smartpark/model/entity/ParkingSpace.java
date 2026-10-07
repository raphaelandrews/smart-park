package sh.andrews.smartpark.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "parking_spaces")
public class ParkingSpace {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @EqualsAndHashCode.Include
  private Long id;

  @Column(name = "code", length = 20, nullable = false)
  private String code;

  @Column(name = "blocked", nullable = false)
  private Boolean blocked = false;

  @Column(name = "blockingReason", length = 255)
  private String blockingReason;

  @Column(name = "active", nullable = false)
  private Boolean active = true;

  @Column(name = "createdAt", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updatedAt", nullable = false)
  private LocalDateTime updatedAt;

  @ManyToOne
  @JoinColumn(name = "parking_space_type_id", nullable = false)
  private ParkingSpaceType type;

  @OneToMany(mappedBy = "parkingSpace")
  private List<Ticket> tickets = new ArrayList<>();

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
