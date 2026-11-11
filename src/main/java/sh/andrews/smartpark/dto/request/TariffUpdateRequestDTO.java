package sh.andrews.smartpark.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TariffUpdateRequestDTO {

  @NotBlank(message = "A descrição é obrigatória")
  @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
  private String description;

  @NotNull(message = "O valor da primeira hora é obrigatório")
  @DecimalMin(value = "0.0", message = "O valor da primeira hora não pode ser negativo")
  @Digits(integer = 8, fraction = 2, message = "O valor da primeira hora deve ter até 8 dígitos inteiros e 2 decimais")
  private BigDecimal firstHourRate;

  @NotNull(message = "O valor da hora adicional é obrigatório")
  @DecimalMin(value = "0.0", message = "O valor da hora adicional não pode ser negativo")
  @Digits(integer = 8, fraction = 2, message = "O valor da hora adicional deve ter até 8 dígitos inteiros e 2 decimais")
  private BigDecimal additionalHourRate;

  @NotNull(message = "Os minutos de tolerância são obrigatórios")
  @PositiveOrZero(message = "Os minutos de tolerância não podem ser negativos")
  private Short toleranceMinutes;
}
