package sh.andrews.smartpark.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;

import sh.andrews.smartpark.model.entity.ParkingSpace;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;
import sh.andrews.smartpark.model.entity.Tariff;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;
import sh.andrews.smartpark.repository.ParkingSpaceRepository;
import sh.andrews.smartpark.repository.ParkingSpaceTypeRepository;
import sh.andrews.smartpark.repository.TariffRepository;
import sh.andrews.smartpark.repository.UserRepository;
import sh.andrews.smartpark.repository.VehicleRepository;

@Configuration
@Profile("dev")
@Order(1)
public class DevConfig implements CommandLineRunner {

  private final VehicleRepository vehicleRepository;
  private final ParkingSpaceTypeRepository parkingSpaceTypeRepository;
  private final ParkingSpaceRepository parkingSpaceRepository;
  private final TariffRepository tariffRepository;
  private final UserRepository userRepository;
  private final AuthProperties authProperties;

  public DevConfig(VehicleRepository vehicleRepository,
      ParkingSpaceTypeRepository parkingSpaceTypeRepository,
      ParkingSpaceRepository parkingSpaceRepository,
      TariffRepository tariffRepository,
      UserRepository userRepository,
      AuthProperties authProperties) {
    this.vehicleRepository = vehicleRepository;
    this.parkingSpaceTypeRepository = parkingSpaceTypeRepository;
    this.parkingSpaceRepository = parkingSpaceRepository;
    this.tariffRepository = tariffRepository;
    this.userRepository = userRepository;
    this.authProperties = authProperties;
  }

  @Override
  public void run(String... args) {
    seedParkingSpaceTypes();
    seedParkingSpaces();
    seedTariffs();
    seedVehicles();
  }

  private void seedParkingSpaceTypes() {
    ensureParkingSpaceType("Standard", "Vagas regulares descobertas", false);
    ensureParkingSpaceType("Coberta", "Vagas cobertas", false);
    ensureParkingSpaceType("Moto", "Vagas exclusivas para motocicletas", false);
  }

  private void seedParkingSpaces() {
    ParkingSpaceType standard = ensureParkingSpaceType(
        "Standard", "Vagas regulares descobertas", false);
    ParkingSpaceType covered = ensureParkingSpaceType(
        "Coberta", "Vagas cobertas", false);
    ParkingSpaceType motorcycle = ensureParkingSpaceType(
        "Moto", "Vagas exclusivas para motocicletas", false);

    List.of("A1", "A2", "A3").forEach(code -> ensureParkingSpace(code, standard));
    List.of("B1", "B2").forEach(code -> ensureParkingSpace(code, covered));
    List.of("M1", "M2").forEach(code -> ensureParkingSpace(code, motorcycle));
  }

  private void seedTariffs() {

    if (tariffRepository.findFirstByVehicleTypeIsNullAndActiveTrueOrderByIdAsc().isEmpty()) {
      ensureTariff("Padrão", null, "10.00", "5.00", (short) 15);
    }

    ensureVehicleTypeTariff(VehicleType.CAR, "Carro", "10.00", "5.00", (short) 15);
    ensureVehicleTypeTariff(VehicleType.MOTORCYCLE, "Moto", "6.00", "3.00", (short) 10);
    ensureVehicleTypeTariff(VehicleType.TRUCK, "Caminhão", "18.00", "9.00", (short) 30);
    ensureVehicleTypeTariff(VehicleType.BUS, "Ônibus", "25.00", "12.00", (short) 30);
  }

  private void seedVehicles() {
    User owner = userRepository.findByEmailIgnoreCase(authProperties.getAdmin().getEmail())
        .orElse(null);

    ensureVehicle("ABC1D23", "HB20", "Prata", VehicleType.CAR, owner);
    ensureVehicle("MOT1A23", "CG 160", "Vermelha", VehicleType.MOTORCYCLE, owner);
    ensureVehicle("TRK1A23", "Delivery", "Branco", VehicleType.TRUCK, owner);
    ensureVehicle("BUS1A23", "Urbano", "Azul", VehicleType.BUS, owner);
  }

  private ParkingSpaceType ensureParkingSpaceType(String name, String description,
      boolean requiresCredential) {
    return parkingSpaceTypeRepository.findByName(name).orElseGet(() -> {
      ParkingSpaceType type = new ParkingSpaceType();
      type.setName(name);
      type.setDescription(description);
      type.setRequiresCredential(requiresCredential);
      return parkingSpaceTypeRepository.save(type);
    });
  }

  private void ensureParkingSpace(String code, ParkingSpaceType type) {
    if (parkingSpaceRepository.existsByCode(code)) {
      return;
    }

    ParkingSpace space = new ParkingSpace();
    space.setCode(code);
    space.setType(type);
    parkingSpaceRepository.save(space);
  }

  private void ensureVehicleTypeTariff(VehicleType vehicleType, String description,
      String firstHourRate, String additionalHourRate, short toleranceMinutes) {
    if (tariffRepository.findFirstByVehicleTypeAndActiveTrueOrderByIdAsc(vehicleType).isPresent()) {
      return;
    }
    ensureTariff(description, vehicleType, firstHourRate, additionalHourRate, toleranceMinutes);
  }

  private Tariff ensureTariff(String description, VehicleType vehicleType,
      String firstHourRate, String additionalHourRate, short toleranceMinutes) {
    Tariff tariff = tariffRepository.findByDescription(description).orElseGet(Tariff::new);
    if (tariff.getId() == null) {
      tariff.setDescription(description);
      tariff.setVehicleType(vehicleType);
      tariff.setFirstHourRate(new BigDecimal(firstHourRate));
      tariff.setAdditionalHourRate(new BigDecimal(additionalHourRate));
      tariff.setToleranceMinutes(toleranceMinutes);
    }
    tariff.setActive(true);
    return tariffRepository.save(tariff);
  }

  private void ensureVehicle(String licensePlate, String model, String color,
      VehicleType vehicleType, User owner) {
    if (vehicleRepository.existsByLicensePlate(licensePlate)) {
      return;
    }

    Vehicle vehicle = new Vehicle(null, licensePlate, model, color, vehicleType);
    vehicle.setOwner(owner);
    vehicleRepository.save(vehicle);
  }
}
