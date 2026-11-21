package sh.andrews.smartpark.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sh.andrews.smartpark.dto.request.TicketRequestDTO;
import sh.andrews.smartpark.dto.response.TicketQuoteResponseDTO;
import sh.andrews.smartpark.dto.response.TicketResponseDTO;
import sh.andrews.smartpark.exception.BusinessRuleException;
import sh.andrews.smartpark.exception.ResourceNotFoundException;
import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.Tariff;
import sh.andrews.smartpark.model.entity.Ticket;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.repository.ParkingSpaceRepository;
import sh.andrews.smartpark.repository.TicketRepository;
import sh.andrews.smartpark.repository.VehicleRepository;
import sh.andrews.smartpark.security.CurrentUserService;

@Service
public class TicketService {

  private final TicketRepository ticketRepository;
  private final VehicleRepository vehicleRepository;
  private final ParkingSpaceRepository parkingSpaceRepository;
  private final TariffService tariffService;
  private final CurrentUserService currentUserService;
  private final TicketPricingService pricingService;

  public TicketService(TicketRepository ticketRepository,
      VehicleRepository vehicleRepository,
      ParkingSpaceRepository parkingSpaceRepository,
      TariffService tariffService,
      CurrentUserService currentUserService,
      TicketPricingService pricingService) {
    this.ticketRepository = ticketRepository;
    this.vehicleRepository = vehicleRepository;
    this.parkingSpaceRepository = parkingSpaceRepository;
    this.tariffService = tariffService;
    this.currentUserService = currentUserService;
    this.pricingService = pricingService;
  }

  @Transactional
  public TicketResponseDTO register(TicketRequestDTO request) {
    Vehicle vehicle = findActiveVehicle(request.getVehicleId());
    ParkingSpace space = findActiveSpace(request.getParkingSpaceId());
    Tariff tariff = tariffService.resolveForVehicleType(vehicle.getVehicleType());

    if (Boolean.TRUE.equals(space.getBlocked())) {
      throw new BusinessRuleException(
          "A vaga " + space.getCode() + " está bloqueada e não pode receber um ticket.");
    }
    if (ticketRepository.existsByVehicleIdAndExitTimeIsNullAndActiveTrue(vehicle.getId())) {
      throw new BusinessRuleException(
          "O veículo " + vehicle.getLicensePlate() + " já possui um ticket aberto.");
    }
    if (ticketRepository.existsByParkingSpaceIdAndExitTimeIsNullAndActiveTrue(space.getId())) {
      throw new BusinessRuleException(
          "A vaga " + space.getCode() + " já está ocupada.");
    }

    Ticket saved = ticketRepository.save(request.toEntity(vehicle, space, tariff));
    return TicketResponseDTO.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public TicketResponseDTO findById(Long id) {
    return TicketResponseDTO.fromEntity(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public TicketQuoteResponseDTO quote(Long id) {
    return pricingService.quote(findActiveEntity(id));
  }

  @Transactional(readOnly = true)
  public Page<TicketResponseDTO> findAll(Pageable pageable) {
    if (currentUserService.isAdmin()) {
      return ticketRepository.findByActiveTrue(pageable)
          .map(TicketResponseDTO::fromEntity);
    }

    Long ownerId = currentUserService.requireCurrentUser().getId();
    return ticketRepository.findByActiveTrueAndVehicleOwnerId(ownerId, pageable)
        .map(TicketResponseDTO::fromEntity);
  }

  @Transactional
  public void deactivate(Long id) {
    Ticket ticket = findActiveEntity(id);
    ticket.setActive(false);
  }

  private Ticket findActiveEntity(Long id) {
    if (currentUserService.isAdmin()) {
      return ticketRepository.findByIdAndActiveTrue(id)
          .orElseThrow(() -> new ResourceNotFoundException(
              "Ticket " + id + " não encontrado."));
    }

    Long ownerId = currentUserService.requireCurrentUser().getId();
    return ticketRepository.findByIdAndActiveTrueAndVehicleOwnerId(id, ownerId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Ticket " + id + " não encontrado."));
  }

  private Vehicle findActiveVehicle(Long id) {
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

  private ParkingSpace findActiveSpace(Long id) {
    return parkingSpaceRepository.findByIdAndActiveTrue(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Vaga " + id + " não encontrada."));
  }
}
