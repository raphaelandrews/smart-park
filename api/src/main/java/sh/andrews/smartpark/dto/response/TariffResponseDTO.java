package sh.andrews.smartpark.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.Tariff;

@Getter
@AllArgsConstructor
@ToString
public class TariffResponseDTO {

  private Long id;
  private String description;
  private BigDecimal firstHourRate;
  private BigDecimal additionalHourRate;
  private Short toleranceMinutes;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static TariffResponseDTO fromEntity(Tariff tariff) {
    return new TariffResponseDTO(tariff.getId(), tariff.getDescription(),
        tariff.getFirstHourRate(), tariff.getAdditionalHourRate(),
        tariff.getToleranceMinutes(), tariff.getActive(), tariff.getCreatedAt(),
        tariff.getUpdatedAt());
  }
}
