package sh.andrews.smartpark.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import sh.andrews.smartpark.model.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

  boolean existsByLicensePlate(String licensePlate);
}
