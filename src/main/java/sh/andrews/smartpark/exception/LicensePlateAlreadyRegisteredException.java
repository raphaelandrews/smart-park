package sh.andrews.smartpark.exception;

public class LicensePlateAlreadyRegisteredException extends DuplicateResourceException {

  public LicensePlateAlreadyRegisteredException(String licensePlate) {
    super("veículo", "placa", licensePlate);
  }
}
