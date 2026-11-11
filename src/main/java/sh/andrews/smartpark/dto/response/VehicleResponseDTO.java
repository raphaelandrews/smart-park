package sh.andrews.smartpark.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;

@Getter
@AllArgsConstructor
@ToString
public class VehicleResponseDTO {

  private Long id;
  private String licensePlate;
  private String model;
  private String color;
  private VehicleType vehicleType;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static VehicleResponseDTO fromEntity(Vehicle vehicle) {
    return new VehicleResponseDTO(vehicle.getId(), vehicle.getLicensePlate(),
        vehicle.getModel(), vehicle.getColor(), vehicle.getVehicleType(),
        vehicle.getActive(), vehicle.getCreatedAt(), vehicle.getUpdatedAt());
  }
}
