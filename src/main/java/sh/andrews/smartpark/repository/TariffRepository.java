package sh.andrews.smartpark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.Tariff;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {

  boolean existsByDescription(String description);

  Optional<Tariff> findByIdAndActiveTrue(Long id);

  List<Tariff> findByActiveTrueOrderByFirstHourRateAsc();

  List<Tariff> findByDescriptionContainingIgnoreCase(String fragment);

  Page<Tariff> findByActiveTrue(Pageable pageable);
}
