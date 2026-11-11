package sh.andrews.smartpark.exception;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;

@Getter
public class ValidationError extends StandardError {

  private final List<FieldMessage> errors = new ArrayList<>();

  public ValidationError(Integer status, String error, String message, String path) {
    super(LocalDateTime.now(), status, error, message, path);
  }

  public void addError(String fieldName, String message) {
    errors.add(new FieldMessage(fieldName, message));
  }
}
