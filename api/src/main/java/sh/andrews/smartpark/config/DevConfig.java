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
  public void run(String... args) throws Exception {
    seedVehicle();
    seedParkingSpaces();
    seedTariff();
  }

  private void seedVehicle() {
    Vehicle vehicle = new Vehicle(null, "a10", "HB20", "red", VehicleType.CAR);
    User owner = userRepository.findByEmailIgnoreCase(authProperties.getAdmin().getEmail())
        .orElse(null);
    vehicle.setOwner(owner);

    if (!vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
      vehicleRepository.save(vehicle);
    }
  }

  private void seedParkingSpaces() {
    ParkingSpaceType type = parkingSpaceTypeRepository.findByName("Standard")
        .orElseGet(() -> {
          ParkingSpaceType created = new ParkingSpaceType();
          created.setName("Standard");
          created.setDescription("Regular parking spots");
          created.setRequiresCredential(false);
          return parkingSpaceTypeRepository.save(created);
        });

    List.of("A1", "A2", "A3").forEach(code -> {
      if (!parkingSpaceRepository.existsByCode(code)) {
        ParkingSpace space = new ParkingSpace();
        space.setCode(code);
        space.setType(type);
        parkingSpaceRepository.save(space);
      }
    });
  }

  private void seedTariff() {
    Tariff tariff = new Tariff();
    tariff.setDescription("Hourly");
    tariff.setFirstHourRate(new BigDecimal("10.00"));
    tariff.setAdditionalHourRate(new BigDecimal("5.00"));
    tariff.setToleranceMinutes((short) 15);

    if (!tariffRepository.existsByDescription(tariff.getDescription())) {
      tariffRepository.save(tariff);
    }
  }
}
