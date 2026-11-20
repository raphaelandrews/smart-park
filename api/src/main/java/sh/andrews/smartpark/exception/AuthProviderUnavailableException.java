package sh.andrews.smartpark.exception;

public class AuthProviderUnavailableException extends RuntimeException {

  public AuthProviderUnavailableException(String message) {
    super(message);
  }
}
