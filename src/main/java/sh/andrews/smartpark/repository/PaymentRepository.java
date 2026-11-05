package sh.andrews.smartpark.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

  boolean existsByTicketId(Long ticketId);

  Optional<Payment> findByTicketId(Long ticketId);

  Optional<Payment> findByIdAndActiveTrue(Long id);

  List<Payment> findByPaymentDateTimeBetweenAndActiveTrueOrderByPaymentDateTimeAsc(
      LocalDateTime start, LocalDateTime end);

  @Query("""
      SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
       WHERE p.active = true
         AND p.paymentDateTime BETWEEN :start AND :end
      """)
  BigDecimal totalAmountBetween(LocalDateTime start, LocalDateTime end);

  List<Payment> findTop5ByActiveTrueOrderByPaymentDateTimeDesc();

  Page<Payment> findByActiveTrue(Pageable pageable);
}
