package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSpaceTypeUpdateRequestDTO {

  @NotBlank(message = "O nome é obrigatório")
  @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
  private String name;

  @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
  private String description;

  @NotNull(message = "Informe se o tipo de vaga exige credencial")
  private Boolean requiresCredential;
}
