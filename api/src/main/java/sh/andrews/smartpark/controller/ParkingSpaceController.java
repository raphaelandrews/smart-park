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
import sh.andrews.smartpark.dto.request.ParkingSpaceRequestDTO;
import sh.andrews.smartpark.dto.request.ParkingSpaceUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.ParkingSpaceResponseDTO;
import sh.andrews.smartpark.service.ParkingSpaceService;

@Tag(name = "Parking Spaces", description = "Parking space management")
@RestController
@RequestMapping("/parking-space")
public class ParkingSpaceController {

  private final ParkingSpaceService service;

  public ParkingSpaceController(ParkingSpaceService service) {
    this.service = service;
  }

  @Operation(summary = "List all active parking spaces")
  @GetMapping
  public Page<ParkingSpaceResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "code") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(summary = "Find a parking space by ID")
  @GetMapping("/{id}")
  public ParkingSpaceResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(summary = "Register a parking space")
  @PostMapping
  public ResponseEntity<ParkingSpaceResponseDTO> register(
      @RequestBody @Valid ParkingSpaceRequestDTO request) {
    ParkingSpaceResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/parking-space/" + created.getId()))
        .body(created);
  }

  @Operation(summary = "Update a parking space")
  @PutMapping("/{id}")
  public ParkingSpaceResponseDTO update(@PathVariable Long id,
      @RequestBody @Valid ParkingSpaceUpdateRequestDTO request) {
    return service.update(id, request);
  }

  @Operation(summary = "Deactivate a parking space")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
