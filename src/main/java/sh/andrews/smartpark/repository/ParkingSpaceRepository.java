package sh.andrews.smartpark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;

@Repository
public interface ParkingSpaceRepository extends JpaRepository<ParkingSpace, Long> {

  boolean existsByCode(String code);

  Optional<ParkingSpace> findByCode(String code);

  Optional<ParkingSpace> findByIdAndActiveTrue(Long id);

  List<ParkingSpace> findByTypeAndActiveTrueOrderByCodeAsc(ParkingSpaceType type);

  List<ParkingSpace> findByBlockedTrueAndActiveTrue();

  List<ParkingSpace> findByCodeContainingIgnoreCase(String fragment);

  @Query("""
      SELECT s
        FROM ParkingSpace s
       WHERE s.active = true
         AND s.blocked = false
         AND NOT EXISTS (
               SELECT 1
                 FROM Ticket t
                WHERE t.parkingSpace = s
                  AND t.active = true
                  AND t.exitTime IS NULL)
       ORDER BY s.code ASC
      """)
  List<ParkingSpace> findAvailable();

  Page<ParkingSpace> findByActiveTrue(Pageable pageable);
}
