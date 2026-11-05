package sh.andrews.smartpark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.ParkingSpaceType;

@Repository
public interface ParkingSpaceTypeRepository extends JpaRepository<ParkingSpaceType, Long> {

  boolean existsByName(String name);

  Optional<ParkingSpaceType> findByName(String name);

  Optional<ParkingSpaceType> findByIdAndActiveTrue(Long id);

  List<ParkingSpaceType> findByActiveTrueOrderByNameAsc();

  List<ParkingSpaceType> findByRequiresCredentialAndActiveTrue(Boolean requiresCredential);

  List<ParkingSpaceType> findByNameContainingIgnoreCase(String fragment);

  Page<ParkingSpaceType> findByActiveTrue(Pageable pageable);
}
