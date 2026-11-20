package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.PaymentRequestDTO;
import sh.andrews.smartpark.dto.response.PaymentResponseDTO;
import sh.andrews.smartpark.exception.DuplicateResourceException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.Payment;
import sh.andrews.smartpark.model.entity.Ticket;
import sh.andrews.smartpark.repository.PaymentRepository;
import sh.andrews.smartpark.repository.TicketRepository;

@Service
public class PaymentService {

  private final PaymentRepository paymentRepository;
  private final TicketRepository ticketRepository;

  public PaymentService(PaymentRepository paymentRepository,
      TicketRepository ticketRepository) {
    this.paymentRepository = paymentRepository;
    this.ticketRepository = ticketRepository;
  }

  @Transactional
  public PaymentResponseDTO register(PaymentRequestDTO request) {
    Ticket ticket = findActiveTicket(request.getTicketId());

    if (paymentRepository.existsByTicketId(ticket.getId())) {
      throw new DuplicateResourceException("pagamento", "ticket", ticket.getId());
    }

    Payment saved = paymentRepository.save(request.toEntity(ticket));
    return PaymentResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public PaymentResponseDTO findById(Long id) {
    return PaymentResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<PaymentResponseDTO> findAll(Pageable pageable) {
    return paymentRepository.findByActiveTrue(pageable)
        .map(PaymentResponseDTO::fromEntity);
  }

  @Transactional
  public void deactivate(Long id) {
    Payment payment = findActiveEntity(id);
    payment.setActive(false);
  }

  private Payment findActiveEntity(Long id) {
    return paymentRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Pagamento " + id + " não encontrado."));
  }

  private Ticket findActiveTicket(Long id) {
    return ticketRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Ticket " + id + " não encontrado."));
  }
}
