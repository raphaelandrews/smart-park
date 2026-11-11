package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSpaceUpdateRequestDTO {

  @NotNull(message = "O tipo da vaga é obrigatório")
  @Positive(message = "O ID do tipo da vaga deve ser positivo")
  private Long parkingSpaceTypeId;

  @NotNull(message = "Informe se a vaga está bloqueada")
  private Boolean blocked;

  @Size(max = 255, message = "O motivo do bloqueio deve ter no máximo 255 caracteres")
  private String blockingReason;
}
