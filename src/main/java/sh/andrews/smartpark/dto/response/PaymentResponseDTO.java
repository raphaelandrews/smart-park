package sh.andrews.smartpark.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.Payment;

@Getter
@AllArgsConstructor
@ToString
public class PaymentResponseDTO {

  private Long id;
  private Long ticketId;
  private BigDecimal amount;
  private LocalDateTime paymentDateTime;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static PaymentResponseDTO fromEntity(Payment payment) {
    return new PaymentResponseDTO(payment.getId(), payment.getTicket().getId(),
        payment.getAmount(), payment.getPaymentDateTime(), payment.getActive(),
        payment.getCreatedAt(), payment.getUpdatedAt());
  }
}
