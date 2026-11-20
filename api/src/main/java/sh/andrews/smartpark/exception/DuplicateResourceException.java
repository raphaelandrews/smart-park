package sh.andrews.smartpark.exception;

public class DuplicateResourceException extends BusinessRuleException {

  public DuplicateResourceException(String resource, String field, Object value) {
    super("Já existe um registro de " + resource + " com " + field + " " + value + ".");
  }
}
