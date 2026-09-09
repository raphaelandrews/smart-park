package sh.andrews.smartpark.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sh.andrews.smartpark.model.entity.Vehicle;
import sh.andrews.smartpark.repository.VehicleRepository;

@Service
public class VehicleService {

  @Autowired
  private VehicleRepository repository;

  public List<Vehicle> findAll() {
    return repository.findAll();
  }

  public Vehicle findById(Long id) {
    Optional<Vehicle> obj = repository.findById(id);
    return obj.get();
  }
}
