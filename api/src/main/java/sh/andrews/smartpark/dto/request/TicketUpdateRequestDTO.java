package sh.andrews.smartpark.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateRequestDTO {

  @NotNull(message = "A data/hora de saída é obrigatória")
  private LocalDateTime exitTime;
}
