package sh.andrews.smartpark.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import sh.andrews.smartpark.model.enums.TicketStatus;

@Entity
@Table(name = "tickets")
public class Ticket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String code;
  private LocalDateTime entryTime;
  private LocalDateTime exitTime;
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  private TicketStatus status;

  @ManyToOne
  @JoinColumn(name = "vehicle_id")
  private Vehicle vehicle;

  @ManyToOne
  @JoinColumn(name = "parking_space_id")
  private ParkingSpace parkingSpace;

  @ManyToOne
  @JoinColumn(name = "tariff_id")
  private Tariff tariff;

  public Ticket() {
  }

  public Ticket(Long id, String code, LocalDateTime entryTime, LocalDateTime exitTime, BigDecimal amount,
      TicketStatus status, Vehicle vehicle, ParkingSpace parkingSpace, Tariff tariff) {
    super();
    this.id = id;
    this.code = code;
    this.entryTime = entryTime;
    this.exitTime = exitTime;
    this.amount = amount;
    this.status = status;
    this.vehicle = vehicle;
    this.parkingSpace = parkingSpace;
    this.tariff = tariff;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public LocalDateTime getEntryTime() {
    return entryTime;
  }

  public void setEntryTime(LocalDateTime entryTime) {
    this.entryTime = entryTime;
  }

  public LocalDateTime getExitTime() {
    return exitTime;
  }

  public void setExitTime(LocalDateTime exitTime) {
    this.exitTime = exitTime;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public TicketStatus getStatus() {
    return status;
  }

  public void setStatus(TicketStatus status) {
    this.status = status;
  }

  public Vehicle getVehicle() {
    return vehicle;
  }

  public void setVehicle(Vehicle vehicle) {
    this.vehicle = vehicle;
  }

  public ParkingSpace getParkingSpace() {
    return parkingSpace;
  }

  public void setParkingSpace(ParkingSpace parkingSpace) {
    this.parkingSpace = parkingSpace;
  }

  public Tariff getTariff() {
    return tariff;
  }

  public void setTariff(Tariff tariff) {
    this.tariff = tariff;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((id == null) ? 0 : id.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    Ticket other = (Ticket) obj;
    if (id == null) {
      if (other.id != null)
        return false;
    } else if (!id.equals(other.id))
      return false;
    return true;
  }
}
