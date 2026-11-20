package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GoogleLoginRequestDTO {

  @NotBlank(message = "O token do Google é obrigatório")
  private String idToken;
}
