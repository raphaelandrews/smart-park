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
import sh.andrews.smartpark.dto.request.TicketRequestDTO;
import sh.andrews.smartpark.dto.request.TicketUpdateRequestDTO;
import sh.andrews.smartpark.dto.response.TicketResponseDTO;
import sh.andrews.smartpark.service.TicketService;

@Tag(name = "Tickets", description = "Ticket management")
@RestController
@RequestMapping("/ticket")
public class TicketController {

  private final TicketService service;

  public TicketController(TicketService service) {
    this.service = service;
  }

  @Operation(summary = "List all active tickets")
  @GetMapping
  public Page<TicketResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "entryTime") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(summary = "Find a ticket by ID")
  @GetMapping("/{id}")
  public TicketResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(summary = "Open a ticket")
  @PostMapping
  public ResponseEntity<TicketResponseDTO> register(
      @RequestBody @Valid TicketRequestDTO request) {
    TicketResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/ticket/" + created.getId()))
        .body(created);
  }

  @Operation(summary = "Register the ticket exit time")
  @PutMapping("/{id}")
  public TicketResponseDTO update(@PathVariable Long id,
      @RequestBody @Valid TicketUpdateRequestDTO request) {
    return service.update(id, request);
  }

  @Operation(summary = "Deactivate a ticket")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
