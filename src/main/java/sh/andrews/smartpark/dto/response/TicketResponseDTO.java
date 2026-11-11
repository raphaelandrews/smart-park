package sh.andrews.smartpark.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.Ticket;

@Getter
@AllArgsConstructor
@ToString
public class TicketResponseDTO {

  private Long id;
  private UUID qrCodeToken;
  private Long vehicleId;
  private String licensePlate;
  private Long parkingSpaceId;
  private String parkingSpaceCode;
  private Long tariffId;
  private String tariffDescription;
  private LocalDateTime entryTime;
  private LocalDateTime exitTime;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static TicketResponseDTO fromEntity(Ticket ticket) {
    return new TicketResponseDTO(ticket.getId(), ticket.getQrCodeToken(),
        ticket.getVehicle().getId(), ticket.getVehicle().getLicensePlate(),
        ticket.getParkingSpace().getId(), ticket.getParkingSpace().getCode(),
        ticket.getTariff().getId(), ticket.getTariff().getDescription(),
        ticket.getEntryTime(), ticket.getExitTime(), ticket.getActive(),
        ticket.getCreatedAt(), ticket.getUpdatedAt());
  }
}
