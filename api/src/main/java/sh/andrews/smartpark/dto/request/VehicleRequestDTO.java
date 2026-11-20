package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;

@Getter
@Setter
@NoArgsConstructor
public class VehicleRequestDTO {

  @NotBlank(message = "A placa é obrigatória")
  @Pattern(regexp = "[A-Z]{3}[0-9][A-Z0-9][0-9]{2}",
      message = "Placa inválida (ABC1234 ou ABC1D23)")
  private String licensePlate;

  @NotBlank(message = "O modelo é obrigatório")
  @Size(max = 100, message = "O modelo deve ter no máximo 100 caracteres")
  private String model;

  @NotBlank(message = "A cor é obrigatória")
  @Size(max = 50, message = "A cor deve ter no máximo 50 caracteres")
  private String color;

  @NotNull(message = "O tipo de veículo é obrigatório")
  private VehicleType vehicleType;

  public VehicleRequestDTO(String licensePlate, String model, String color, VehicleType vehicleType) {
    setLicensePlate(licensePlate);
    this.model = model;
    this.color = color;
    this.vehicleType = vehicleType;
  }

  public void setLicensePlate(String licensePlate) {
    this.licensePlate = (licensePlate == null) ? null
        : licensePlate.toUpperCase().replace("-", "").trim();
  }

  public Vehicle toEntity() {
    Vehicle vehicle = new Vehicle();
    vehicle.setLicensePlate(licensePlate);
    vehicle.setModel(model);
    vehicle.setColor(color);
    vehicle.setVehicleType(vehicleType);
    return vehicle;
  }
}
