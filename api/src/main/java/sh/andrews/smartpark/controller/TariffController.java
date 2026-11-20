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
import sh.andrews.smartpark.dto.request.TariffRequestDTO;
import sh.andrews.smartpark.dto.request.TariffUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.TariffResponseDTO;
import sh.andrews.smartpark.service.TariffService;

@Tag(name = "Tariffs", description = "Tariff management")
@RestController
@RequestMapping("/tariff")
public class TariffController {

  private final TariffService service;

  public TariffController(TariffService service) {
    this.service = service;
  }

  @Operation(operationId = "listTariffs", summary = "List all active tariffs")
  @GetMapping
  public Page<TariffResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "description") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(operationId = "getTariff", summary = "Find a tariff by ID")
  @GetMapping("/{id}")
  public TariffResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(operationId = "registerTariff", summary = "Register a tariff")
  @PostMapping
  public ResponseEntity<TariffResponseDTO> register(
      @RequestBody @Valid TariffRequestDTO request) {
    TariffResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/tariff/" + created.getId()))
        .body(created);
  }

  @Operation(operationId = "updateTariff", summary = "Update a tariff")
  @PutMapping("/{id}")
  public TariffResponseDTO update(@PathVariable Long id,
      @RequestBody @Valid TariffUpdateRequestDTO request) {
    return service.update(id, request);
  }

  @Operation(operationId = "deactivateTariff", summary = "Deactivate a tariff")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
