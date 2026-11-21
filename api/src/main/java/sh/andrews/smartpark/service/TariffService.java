package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.TariffRequestDTO;
import sh.andrews.smartpark.dto.request.TariffUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.TariffResponseDTO;
import sh.andrews.smartpark.exception.BusinessRuleException;
import sh.andrews.smartpark.exception.DuplicateResourceException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.Tariff;
import sh.andrews.smartpark.model.enums.VehicleType;
import sh.andrews.smartpark.repository.TariffRepository;

@Service
public class TariffService {

  private final TariffRepository tariffRepository;

  public TariffService(TariffRepository tariffRepository) {
    this.tariffRepository = tariffRepository;
  }

  @Transactional
  public TariffResponseDTO register(TariffRequestDTO request) {
    if (tariffRepository.existsByDescription(request.getDescription())) {
      throw new DuplicateResourceException("tarifa", "descrição", request.getDescription());
    }
    ensureUniqueVehicleType(request.getVehicleType(), null);

    Tariff saved = tariffRepository.save(request.toEntity());
    return TariffResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public TariffResponseDTO findById(Long id) {
    return TariffResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<TariffResponseDTO> findAll(Pageable pageable) {
    return tariffRepository.findByActiveTrue(pageable)
        .map(TariffResponseDTO::fromEntity);
  }

  @Transactional
  public TariffResponseDTO update(Long id, TariffUpdateRequestDTO request) {
    Tariff tariff = findActiveEntity(id);

    if (!tariff.getDescription().equals(request.getDescription())
        && tariffRepository.existsByDescription(request.getDescription())) {
      throw new DuplicateResourceException("tarifa", "descrição", request.getDescription());
    }
    if (tariff.getVehicleType() != request.getVehicleType()) {
      ensureUniqueVehicleType(request.getVehicleType(), id);
    }

    tariff.setDescription(request.getDescription());
    tariff.setFirstHourRate(request.getFirstHourRate());
    tariff.setAdditionalHourRate(request.getAdditionalHourRate());
    tariff.setToleranceMinutes(request.getToleranceMinutes());
    tariff.setVehicleType(request.getVehicleType());
    return TariffResponseDTO.fromEntity(tariff);
  }

  @Transactional(readOnly = true)
  public Tariff resolveForVehicleType(VehicleType vehicleType) {
    return tariffRepository.findFirstByVehicleTypeAndActiveTrueOrderByIdAsc(vehicleType)
        .or(() -> tariffRepository.findFirstByVehicleTypeIsNullAndActiveTrueOrderByIdAsc())
        .orElseThrow(() -> new BusinessRuleException(
            "Nenhuma tarifa ativa configurada para "
                + vehicleTypeLabel(vehicleType) + "."));
  }

  @Transactional
  public void deactivate(Long id) {
    Tariff tariff = findActiveEntity(id);
    tariff.setActive(false);
  }

  private Tariff findActiveEntity(Long id) {
    return tariffRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Tarifa " + id + " não encontrada."));
  }

  private void ensureUniqueVehicleType(VehicleType vehicleType, Long excludeId) {
    boolean duplicate;
    if (vehicleType == null) {
      duplicate = excludeId == null
          ? tariffRepository.existsByVehicleTypeIsNullAndActiveTrue()
          : tariffRepository.existsByVehicleTypeIsNullAndActiveTrueAndIdNot(excludeId);
    } else {
      duplicate = excludeId == null
          ? tariffRepository.existsByVehicleTypeAndActiveTrue(vehicleType)
          : tariffRepository.existsByVehicleTypeAndActiveTrueAndIdNot(vehicleType, excludeId);
    }

    if (duplicate) {
      throw new BusinessRuleException("Já existe uma tarifa ativa para "
          + vehicleTypeLabel(vehicleType) + ".");
    }
  }

  private String vehicleTypeLabel(VehicleType vehicleType) {
    if (vehicleType == null) {
      return "o tipo padrão";
    }
    return "veículos do tipo " + switch (vehicleType) {
      case CAR -> "carro";
      case MOTORCYCLE -> "moto";
      case TRUCK -> "caminhão";
      case BUS -> "ônibus";
    };
  }
}
