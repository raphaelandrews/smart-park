package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.ParkingSpaceRequestDTO;
import sh.andrews.smartpark.dto.request.ParkingSpaceUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.ParkingSpaceResponseDTO;
import sh.andrews.smartpark.exception.DuplicateResourceException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;
import sh.andrews.smartpark.repository.ParkingSpaceRepository;
import sh.andrews.smartpark.repository.ParkingSpaceTypeRepository;

@Service
public class ParkingSpaceService {

  private final ParkingSpaceRepository parkingSpaceRepository;
  private final ParkingSpaceTypeRepository parkingSpaceTypeRepository;

  public ParkingSpaceService(ParkingSpaceRepository parkingSpaceRepository,
      ParkingSpaceTypeRepository parkingSpaceTypeRepository) {
    this.parkingSpaceRepository = parkingSpaceRepository;
    this.parkingSpaceTypeRepository = parkingSpaceTypeRepository;
  }

  @Transactional
  public ParkingSpaceResponseDTO register(ParkingSpaceRequestDTO request) {
    if (parkingSpaceRepository.existsByCode(request.getCode())) {
      throw new DuplicateResourceException("vaga", "código", request.getCode());
    }

    ParkingSpaceType type = findActiveType(request.getParkingSpaceTypeId());
    ParkingSpace saved = parkingSpaceRepository.save(request.toEntity(type));
    return ParkingSpaceResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public ParkingSpaceResponseDTO findById(Long id) {
    return ParkingSpaceResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<ParkingSpaceResponseDTO> findAll(Pageable pageable) {
    return parkingSpaceRepository.findByActiveTrue(pageable)
        .map(ParkingSpaceResponseDTO::fromEntity);
  }

  @Transactional
  public ParkingSpaceResponseDTO update(Long id, ParkingSpaceUpdateRequestDTO request) {
    ParkingSpace space = findActiveEntity(id);
    ParkingSpaceType type = findActiveType(request.getParkingSpaceTypeId());

    space.setType(type);
    space.setBlocked(request.getBlocked());
    space.setBlockingReason(request.getBlockingReason());
    return ParkingSpaceResponseDTO.fromEntity(space);
  }

  @Transactional
  public void deactivate(Long id) {
    ParkingSpace space = findActiveEntity(id);
    space.setActive(false);
  }

  private ParkingSpace findActiveEntity(Long id) {
    return parkingSpaceRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Vaga " + id + " não encontrada."));
  }

  private ParkingSpaceType findActiveType(Long id) {
    return parkingSpaceTypeRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Tipo de vaga " + id + " não encontrado."));
  }
}
