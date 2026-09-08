package sh.andrews.smartpark.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.model.enums.VehicleType;

@RestController
@RequestMapping(value = "/vehicle")
public class VehicleController {

  @GetMapping
  public ResponseEntity<Vehicle> findAll() {
    Vehicle vehicle = new Vehicle(1L, "a10", "HB20", "red", VehicleType.CAR);
    return ResponseEntity.ok().body(vehicle);
  }
}
