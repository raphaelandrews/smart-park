package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.enums.VehicleType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUpdateRequestDTO {

  @NotBlank(message = "O modelo é obrigatório")
  @Size(max = 100, message = "O modelo deve ter no máximo 100 caracteres")
  private String model;

  @NotBlank(message = "A cor é obrigatória")
  @Size(max = 50, message = "A cor deve ter no máximo 50 caracteres")
  private String color;

  @NotNull(message = "O tipo de veículo é obrigatório")
  private VehicleType vehicleType;
}
