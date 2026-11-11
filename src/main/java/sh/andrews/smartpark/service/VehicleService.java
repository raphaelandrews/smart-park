package sh.andrews.smartpark.service;

import java.util.List;

import org.springframework.stereotype.Service;

import sh.andrews.smartpark.dto.response.VehicleResponseDTO;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.repository.VehicleRepository;

@Service
public class VehicleService {

  private final VehicleRepository repository;

  public VehicleService(VehicleRepository repository) {
    this.repository = repository;
  }

  public List<VehicleResponseDTO> findAll() {
    return repository.findAll().stream()
        .map(VehicleResponseDTO::fromEntity)
        .toList();
  }

  public VehicleResponseDTO findById(Long id) {
    Vehicle vehicle = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado com id " + id));
    return VehicleResponseDTO.fromEntity(vehicle);
  }
}
