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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import sh.andrews.smartpark.dto.request.PaymentRequestDTO;
import sh.andrews.smartpark.dto.response.PaymentResponseDTO;
import sh.andrews.smartpark.service.PaymentService;

@Tag(name = "Payments", description = "Payment management")
@RestController
@RequestMapping("/payment")
public class PaymentController {

  private final PaymentService service;

  public PaymentController(PaymentService service) {
    this.service = service;
  }

  @Operation(operationId = "listPayments", summary = "List all active payments")
  @GetMapping
  public Page<PaymentResponseDTO> findAll(
      @ParameterObject
      @PageableDefault(size = 10, sort = "paymentDateTime") Pageable pageable) {
    return service.findAll(pageable);
  }

  @Operation(operationId = "getPayment", summary = "Find a payment by ID")
  @GetMapping("/{id}")
  public PaymentResponseDTO findById(@PathVariable Long id) {
    return service.findById(id);
  }

  @Operation(operationId = "registerPayment", summary = "Register a payment")
  @PostMapping
  public ResponseEntity<PaymentResponseDTO> register(
      @RequestBody @Valid PaymentRequestDTO request) {
    PaymentResponseDTO created = service.register(request);
    return ResponseEntity
        .created(URI.create("/payment/" + created.getId()))
        .body(created);
  }

  @Operation(operationId = "deactivatePayment", summary = "Deactivate a payment")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    service.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
