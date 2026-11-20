package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.VehicleRequestDTO;
import sh.andrews.smartpark.dto.request.VehicleUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.VehicleResponseDTO;
import sh.andrews.smartpark.exception.LicensePlateAlreadyRegisteredException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.repository.VehicleRepository;
import sh.andrews.smartpark.security.CurrentUserService;

@Service
public class VehicleService {

  private final VehicleRepository vehicleRepository;
  private final CurrentUserService currentUserService;

  public VehicleService(VehicleRepository vehicleRepository,
      CurrentUserService currentUserService) {
    this.vehicleRepository = vehicleRepository;
    this.currentUserService = currentUserService;
  }

  @Transactional
  public VehicleResponseDTO register(VehicleRequestDTO request) {
    if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
      throw new LicensePlateAlreadyRegisteredException(request.getLicensePlate());
    }

    User owner = currentUserService.requireCurrentUser();
    Vehicle vehicle = request.toEntity();
    vehicle.setOwner(owner);

    Vehicle saved = vehicleRepository.save(vehicle);
    return VehicleResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public VehicleResponseDTO findById(Long id) {
    return VehicleResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<VehicleResponseDTO> findAll(Pageable pageable) {
    if (currentUserService.isAdmin()) {
      return vehicleRepository.findByActiveTrue(pageable)
          .map(VehicleResponseDTO::fromEntity);
    }

    Long ownerId = currentUserService.requireCurrentUser().getId();
    return vehicleRepository.findByActiveTrueAndOwnerId(ownerId, pageable)
        .map(VehicleResponseDTO::fromEntity);
  }

  @Transactional
  public VehicleResponseDTO update(Long id, VehicleUpdateRequestDTO request) {
    Vehicle vehicle = findActiveEntity(id);
    vehicle.setModel(request.getModel());
    vehicle.setColor(request.getColor());
    vehicle.setVehicleType(request.getVehicleType());
    return VehicleResponseDTO.fromEntity(vehicle);
  }

  @Transactional
  public void deactivate(Long id) {
    Vehicle vehicle = findActiveEntity(id);
    vehicle.setActive(false);
  }

  private Vehicle findActiveEntity(Long id) {
    if (currentUserService.isAdmin()) {
      return vehicleRepository.findByIdAndActiveTrue(id)
          .orElseThrow(() -> new ResourceNotFoundException(
              "Veículo " + id + " não encontrado."));
    }

    Long ownerId = currentUserService.requireCurrentUser().getId();
    return vehicleRepository.findByIdAndActiveTrueAndOwnerId(id, ownerId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Veículo " + id + " não encontrado."));
  }
}
