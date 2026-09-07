package sh.andrews.smartpark.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import sh.andrews.smartpark.model.enums.TicketStatus;

public class Ticket {
  private Long id;
  private String code;
  private LocalDateTime entryTime;
  private LocalDateTime exitTime;
  private TicketStatus ticketStatus;
  private BigDecimal amount;
  private Vehicle vehicle;
  private ParkingSpace parkingSpace;
  private Tariff tariff;

  public Ticket() {
  }

  public Ticket(Long id, String code, LocalDateTime entryTime, LocalDateTime exitTime, TicketStatus ticketStatus,
      BigDecimal amount, Vehicle vehicle, ParkingSpace parkingSpace, Tariff tariff) {
    super();
    this.id = id;
    this.code = code;
    this.entryTime = entryTime;
    this.exitTime = exitTime;
    this.ticketStatus = ticketStatus;
    this.amount = amount;
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

  public TicketStatus getTicketStatus() {
    return ticketStatus;
  }

  public void setTicketStatus(TicketStatus ticketStatus) {
    this.ticketStatus = ticketStatus;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
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
