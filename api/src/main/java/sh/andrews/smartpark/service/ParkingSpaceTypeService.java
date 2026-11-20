package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.ParkingSpaceTypeRequestDTO;
import sh.andrews.smartpark.dto.request.ParkingSpaceTypeUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.ParkingSpaceTypeResponseDTO;
import sh.andrews.smartpark.exception.DuplicateResourceException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;
import sh.andrews.smartpark.repository.ParkingSpaceTypeRepository;

@Service
public class ParkingSpaceTypeService {

  private final ParkingSpaceTypeRepository parkingSpaceTypeRepository;

  public ParkingSpaceTypeService(ParkingSpaceTypeRepository parkingSpaceTypeRepository) {
    this.parkingSpaceTypeRepository = parkingSpaceTypeRepository;
  }

  @Transactional
  public ParkingSpaceTypeResponseDTO register(ParkingSpaceTypeRequestDTO request) {
    if (parkingSpaceTypeRepository.existsByName(request.getName())) {
      throw new DuplicateResourceException("tipo de vaga", "nome", request.getName());
    }

    ParkingSpaceType saved = parkingSpaceTypeRepository.save(request.toEntity());
    return ParkingSpaceTypeResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public ParkingSpaceTypeResponseDTO findById(Long id) {
    return ParkingSpaceTypeResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<ParkingSpaceTypeResponseDTO> findAll(Pageable pageable) {
    return parkingSpaceTypeRepository.findByActiveTrue(pageable)
        .map(ParkingSpaceTypeResponseDTO::fromEntity);
  }

  @Transactional
  public ParkingSpaceTypeResponseDTO update(Long id, ParkingSpaceTypeUpdateRequestDTO request) {
    ParkingSpaceType type = findActiveEntity(id);

    if (!type.getName().equals(request.getName())
        && parkingSpaceTypeRepository.existsByName(request.getName())) {
      throw new DuplicateResourceException("tipo de vaga", "nome", request.getName());
    }

    type.setName(request.getName());
    type.setDescription(request.getDescription());
    type.setRequiresCredential(request.getRequiresCredential());
    return ParkingSpaceTypeResponseDTO.fromEntity(type);
  }

  @Transactional
  public void deactivate(Long id) {
    ParkingSpaceType type = findActiveEntity(id);
    type.setActive(false);
  }

  private ParkingSpaceType findActiveEntity(Long id) {
    return parkingSpaceTypeRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Tipo de vaga " + id + " não encontrado."));
  }
}
