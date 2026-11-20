package sh.andrews.smartpark.controller;

import java.net.URI;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import sh.andrews.smartpark.dto.request.VehicleRequestDTO;
import sh.andrews.smartpark.dto.request.VehicleUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.VehicleResponseDTO;
import sh.andrews.smartpark.service.VehicleService;

@Tag(name = "Vehicles", description = "Vehicle management")
@RestController
@RequestMapping("/vehicle")
public class VehicleController {

  private final VehicleService service;

  public VehicleController(VehicleService service) {
    this.service = service;
  }

  @Operation(operationId = "listVehicles", summary = "List all active vehicles")
  @GetMapping
  public Page<VehicleResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "model") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(operationId = "getVehicle", summary = "Find a vehicle by ID")
  @GetMapping("/{id}")
  public VehicleResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(operationId = "registerVehicle", summary = "Register a vehicle")
  @PostMapping
  public ResponseEntity<VehicleResponseDTO> register(
      @RequestBody @Valid VehicleRequestDTO request) {
    VehicleResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/vehicle/" + created.getId()))
        .body(created);
  }

  @Operation(operationId = "updateVehicle", summary = "Update a vehicle")
  @PutMapping("/{id}")
  public VehicleResponseDTO update(@PathVariable Long id,
      @RequestBody @Valid VehicleUpdateRequestDTO request) {
    return service.update(id, request);
  }

  @Operation(operationId = "deactivateVehicle", summary = "Deactivate a vehicle")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
