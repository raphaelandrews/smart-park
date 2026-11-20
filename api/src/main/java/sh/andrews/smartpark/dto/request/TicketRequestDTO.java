package sh.andrews.smartpark.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.Tariff;
import sh.andrews.smartpark.model.entity.Ticket;
import sh.andrews.smartpark.model.entity.Vehicle;

@Getter
@Setter
@NoArgsConstructor
public class TicketRequestDTO {

  @NotNull(message = " O veículo é obrigatório")
  @Positive(message = "O ID do veículo deve ser positivo")
  private Long vehicleId;

  @NotNull(message = "A vaga é obrigatória")
  @Positive(message = "O ID da vaga deve ser positivo")
  private Long parkingSpaceId;

  @NotNull(message = "A tarifa é obrigatória")
  @Positive(message = "O ID da tarifa deve ser positivo")
  private Long tariffId;

  public Ticket toEntity(Vehicle vehicle, ParkingSpace parkingSpace, Tariff tariff) {
    Ticket ticket = new Ticket();
    ticket.setVehicle(vehicle);
    ticket.setParkingSpace(parkingSpace);
    ticket.setTariff(tariff);
    ticket.setEntryTime(LocalDateTime.now());
    return ticket;
  }
}
