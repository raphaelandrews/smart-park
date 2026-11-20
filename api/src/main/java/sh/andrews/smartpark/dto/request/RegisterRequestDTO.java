package sh.andrews.smartpark.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequestDTO {

  @NotBlank(message = "O nome é obrigatório")
  @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
  private String name;

  @NotBlank(message = "O email é obrigatório")
  @Email(message = "Email inválido")
  @Size(max = 255, message = "O email deve ter no máximo 255 caracteres")
  private String email;

  @NotBlank(message = "A senha é obrigatória")
  @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
  private String password;
}
