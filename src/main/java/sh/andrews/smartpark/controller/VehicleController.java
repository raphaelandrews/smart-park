package sh.andrews.smartpark.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.service.VehicleService;

@RestController
@RequestMapping(value = "/vehicle")
public class VehicleController {

  private final VehicleService service;

  public VehicleController(VehicleService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<Vehicle>> findAll() {
    List<Vehicle> list = service.findAll();
    return ResponseEntity.ok().body(list);
  }

  @GetMapping(value = "/{id}")
  public ResponseEntity<Vehicle> findById(@PathVariable Long id) {
    Vehicle obj = service.findById(id);
    return ResponseEntity.ok().body(obj);
  }
}
