package sh.andrews.smartpark.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import sh.andrews.smartpark.dto.response.VehicleResponseDTO;
import sh.andrews.smartpark.service.VehicleService;

@Tag(name = "Vehicles", description = "Vehicle queries")
@RestController
@RequestMapping(value = "/vehicle")
public class VehicleController {

  private final VehicleService service;

  public VehicleController(VehicleService service) {
    this.service = service;
  }

  @Operation(summary = "List all vehicles")
  @GetMapping
  public ResponseEntity<List<VehicleResponseDTO>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @Operation(summary = "Find a vehicle by ID")
  @GetMapping(value = "/{id}")
  public ResponseEntity<VehicleResponseDTO> findById(@PathVariable Long id) {
    return ResponseEntity.ok(service.findById(id));
  }
}
