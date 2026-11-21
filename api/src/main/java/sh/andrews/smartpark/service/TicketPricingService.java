package sh.andrews.smartpark.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import sh.andrews.smartpark.dto.response.TicketQuoteResponseDTO;
import sh.andrews.smartpark.exception.BusinessRuleException;
import sh.andrews.smartpark.model.entity.Tariff;
import sh.andrews.smartpark.model.entity.Ticket;

/**
 * Single source of truth for the amount owed on a ticket. The rates are snapshotted
 * onto the ticket when the session starts, so later tariff edits do not change an
 * existing session. Both the quote endpoint and payment registration use this service.
 */
@Service
public class TicketPricingService {

  public TicketQuoteResponseDTO quote(Ticket ticket) {
    LocalDateTime entryTime = ticket.getEntryTime();
    if (entryTime == null) {
      throw new BusinessRuleException("O ticket não possui horário de entrada.");
    }

    LocalDateTime exitTime = ticket.getExitTime();
    boolean open = exitTime == null;
    LocalDateTime endTime = open ? LocalDateTime.now() : exitTime;
    if (endTime.isBefore(entryTime)) {
      throw new BusinessRuleException("A saída do ticket não pode ser anterior à entrada.");
    }

    Tariff tariff = ticket.getTariff();
    long durationMinutes = Duration.between(entryTime, endTime).toMinutes();
    int toleranceMinutes = resolveTolerance(ticket, tariff);
    long billableMinutes = Math.max(0, durationMinutes - toleranceMinutes);
    long chargedHours = billableMinutes == 0 ? 0 : (billableMinutes + 59) / 60;

    BigDecimal firstHourRate = resolveFirstHourRate(ticket, tariff);
    BigDecimal additionalHourRate = resolveAdditionalHourRate(ticket, tariff);
    BigDecimal amount = chargedHours == 0
        ? BigDecimal.ZERO
        : firstHourRate.add(
            additionalHourRate.multiply(BigDecimal.valueOf(chargedHours - 1)));

    return new TicketQuoteResponseDTO(
        ticket.getId(),
        amount.setScale(2, RoundingMode.HALF_UP),
        durationMinutes,
        billableMinutes,
        chargedHours,
        toleranceMinutes,
        firstHourRate.setScale(2, RoundingMode.HALF_UP),
        additionalHourRate.setScale(2, RoundingMode.HALF_UP),
        open);
  }

  public BigDecimal calculateAmount(Ticket ticket) {
    return quote(ticket).getAmount();
  }

  private int resolveTolerance(Ticket ticket, Tariff tariff) {
    Short snapshot = ticket.getToleranceMinutes();
    if (snapshot != null) {
      return snapshot;
    }
    return tariff.getToleranceMinutes() == null ? 0 : tariff.getToleranceMinutes();
  }

  private BigDecimal resolveFirstHourRate(Ticket ticket, Tariff tariff) {
    BigDecimal snapshot = ticket.getFirstHourRate();
    if (snapshot != null) {
      return snapshot;
    }
    return valueOrZero(tariff.getFirstHourRate());
  }

  private BigDecimal resolveAdditionalHourRate(Ticket ticket, Tariff tariff) {
    BigDecimal snapshot = ticket.getAdditionalHourRate();
    if (snapshot != null) {
      return snapshot;
    }
    return valueOrZero(tariff.getAdditionalHourRate());
  }

  private BigDecimal valueOrZero(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }
}
