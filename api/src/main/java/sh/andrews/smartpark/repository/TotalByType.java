package sh.andrews.smartpark.repository;

import sh.andrews.smartpark.model.enums.VehicleType;

public interface TotalByType {

  VehicleType getVehicleType();

  Long getTotal();
}
