package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;

@Getter
@Setter
@NoArgsConstructor
public class ParkingSpaceRequestDTO {

  @NotBlank(message = "O código é obrigatório")
  @Size(max = 20, message = "O código deve ter no máximo 20 caracteres")
  private String code;

  @NotNull(message = "O tipo da vaga é obrigatório")
  @Positive(message = "O ID do tipo da vaga deve ser positivo")
  private Long parkingSpaceTypeId;

  private Boolean blocked;

  @Size(max = 255, message = "O motivo do bloqueio deve ter no máximo 255 caracteres")
  private String blockingReason;

  public void setCode(String code) {
    this.code = (code == null) ? null : code.trim();
  }

  public ParkingSpace toEntity(ParkingSpaceType type) {
    ParkingSpace space = new ParkingSpace();
    space.setCode(code);
    space.setType(type);
    space.setBlocked(blocked != null && blocked);
    space.setBlockingReason(blockingReason);
    return space;
  }
}
