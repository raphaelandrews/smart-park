package sh.andrews.smartpark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

  boolean existsByLicensePlate(String licensePlate);

  Optional<Vehicle> findByLicensePlate(String licensePlate);

  Optional<Vehicle> findByIdAndActiveTrue(Long id);

  List<Vehicle> findByVehicleTypeAndActiveTrueOrderByModelAsc(VehicleType vehicleType);

  List<Vehicle> findByModelContainingIgnoreCase(String fragment);

  @Query("""
      SELECT v.vehicleType AS vehicleType, COUNT(v) AS total
        FROM Vehicle v
       WHERE v.active = true
       GROUP BY v.vehicleType
      """)
  List<TotalByType> totalByVehicleType();

  List<Vehicle> findTop5ByActiveTrueOrderByCreatedAtDesc();

  Page<Vehicle> findByActiveTrue(Pageable pageable);
}
