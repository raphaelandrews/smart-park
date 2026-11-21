package sh.andrews.smartpark.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@ToString
public class TicketQuoteResponseDTO {

  private Long ticketId;
  private BigDecimal amount;
  private long durationMinutes;
  private long billableMinutes;
  private long chargedHours;
  private int toleranceMinutes;
  private BigDecimal firstHourRate;
  private BigDecimal additionalHourRate;
  private boolean open;
}
