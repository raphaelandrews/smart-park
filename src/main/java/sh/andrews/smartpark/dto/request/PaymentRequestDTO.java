package sh.andrews.smartpark.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sh.andrews.smartpark.model.entity.Payment;
import sh.andrews.smartpark.model.entity.Ticket;

@Getter
@Setter
@NoArgsConstructor
public class PaymentRequestDTO {

  @NotNull(message = "O ticket é obrigatório")
  @Positive(message = "O ID do ticket deve ser positivo")
  private Long ticketId;

  @NotNull(message = "O valor é obrigatório")
  @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
  @Digits(integer = 8, fraction = 2, message = "O valor deve ter até 8 dígitos inteiros e 2 decimais")
  private BigDecimal amount;

  public Payment toEntity(Ticket ticket) {
    Payment payment = new Payment();
    payment.setTicket(ticket);
    payment.setAmount(amount);
    payment.setPaymentDateTime(LocalDateTime.now());
    return payment;
  }
}
