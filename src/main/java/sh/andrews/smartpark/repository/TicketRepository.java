package sh.andrews.smartpark.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

  Optional<Ticket> findByQrCodeToken(UUID qrCodeToken);

  Optional<Ticket> findByIdAndActiveTrue(Long id);

  Optional<Ticket> findByVehicleIdAndExitTimeIsNullAndActiveTrue(Long vehicleId);

  boolean existsByVehicleIdAndExitTimeIsNullAndActiveTrue(Long vehicleId);

  boolean existsByParkingSpaceIdAndExitTimeIsNullAndActiveTrue(Long parkingSpaceId);

  List<Ticket> findByVehicleIdOrderByEntryTimeDesc(Long vehicleId);

  List<Ticket> findByExitTimeIsNullAndActiveTrueOrderByEntryTimeAsc();

  List<Ticket> findByEntryTimeBetweenAndActiveTrue(LocalDateTime start, LocalDateTime end);

  @Query("""
      SELECT COUNT(t)
        FROM Ticket t
       WHERE t.active = true
         AND t.exitTime IS NULL
      """)
  long countOpen();

  List<Ticket> findTop5ByActiveTrueOrderByCreatedAtDesc();

  Page<Ticket> findByActiveTrue(Pageable pageable);
}
