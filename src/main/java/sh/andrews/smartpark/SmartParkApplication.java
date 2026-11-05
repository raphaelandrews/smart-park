package sh.andrews.smartpark;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;
import sh.andrews.smartpark.repository.VehicleRepository;

@SpringBootApplication
public class SmartParkApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartParkApplication.class, args);
	}

	@Bean
	@Profile("dev")
	CommandLineRunner testRepository(VehicleRepository repo) {
		return args -> {

			if (!repo.existsByLicensePlate("JKL3M45")) {
				Vehicle v = new Vehicle();
				v.setLicensePlate("JKL3M45");
				v.setModel("Kwid");
				v.setColor("White");
				v.setVehicleType(VehicleType.CAR);
				v.setActive(true);
				repo.save(v);

				System.out.println("Generated ID: " + v.getId());
			}
			System.out.println("Total: " + repo.count());

			repo.findByLicensePlate("RTY7890")
					.ifPresent(vehicle -> System.out.println("Found: " + vehicle.getModel()));

			boolean exists = repo.existsByLicensePlate("ABC1D23");
			System.out.println("Exists? " + exists);

			repo.findByVehicleTypeAndActiveTrueOrderByModelAsc(VehicleType.MOTORCYCLE)
					.forEach(vehicle -> System.out.println("Motorcycle: " + vehicle.getModel()));

			boolean activeVehicle = repo.findByIdAndActiveTrue(5L).isPresent();
			System.out.println("Vehicle 5 active? " + activeVehicle);

			repo.totalByVehicleType()
					.forEach(t -> System.out.println(t.getVehicleType() + ": " + t.getTotal()));

			repo.findTop5ByActiveTrueOrderByCreatedAtDesc()
					.forEach(vehicle -> System.out.println("Recent: " + vehicle.getModel()));

			Page<Vehicle> page = repo.findByActiveTrue(
					PageRequest.of(0, 2, Sort.by("model")));

			System.out.println("Active: " + page.getTotalElements());
			System.out.println("Pages: " + page.getTotalPages());
			page.forEach(vehicle -> System.out.println(vehicle.getModel()));
		};
	}

}
