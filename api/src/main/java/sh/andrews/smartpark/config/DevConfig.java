package sh.andrews.smartpark.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;
import sh.andrews.smartpark.repository.VehicleRepository;

@Configuration
@Profile("dev")
public class DevConfig implements CommandLineRunner {

  private final VehicleRepository vehicleRepository;

  public DevConfig(VehicleRepository vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  @Override
  public void run(String... args) throws Exception {

    Vehicle vehicle = new Vehicle(null, "a10", "HB20", "red", VehicleType.CAR);

    if (!vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
      vehicleRepository.save(vehicle);
    }
  }
}
