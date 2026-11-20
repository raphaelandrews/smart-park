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
import sh.andrews.smartpark.dto.request.ParkingSpaceTypeRequestDTO;
import sh.andrews.smartpark.dto.request.ParkingSpaceTypeUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.ParkingSpaceTypeResponseDTO;
import sh.andrews.smartpark.service.ParkingSpaceTypeService;

@Tag(name = "Parking Space Types", description = "Parking space type management")
@RestController
@RequestMapping("/parking-space-type")
public class ParkingSpaceTypeController {

  private final ParkingSpaceTypeService service;

  public ParkingSpaceTypeController(ParkingSpaceTypeService service) {
    this.service = service;
  }

  @Operation(summary = "List all active parking space types")
  @GetMapping
  public Page<ParkingSpaceTypeResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(summary = "Find a parking space type by ID")
  @GetMapping("/{id}")
  public ParkingSpaceTypeResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(summary = "Register a parking space type")
  @PostMapping
  public ResponseEntity<ParkingSpaceTypeResponseDTO> register(
      @RequestBody @Valid ParkingSpaceTypeRequestDTO request) {
    ParkingSpaceTypeResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/parking-space-type/" + created.getId()))
        .body(created);
  }

  @Operation(summary = "Update a parking space type")
  @PutMapping("/{id}")
  public ParkingSpaceTypeResponseDTO update(@PathVariable Long id,
      @RequestBody @Valid ParkingSpaceTypeUpdateRequestDTO request) {
    return service.update(id, request);
  }

  @Operation(summary = "Deactivate a parking space type")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
