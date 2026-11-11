package sh.andrews.smartpark.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<StandardError> notFound(
      ResourceNotFoundException ex,
      HttpServletRequest request) {
    return response(HttpStatus.NOT_FOUND, "Não encontrado", ex.getMessage(), request);
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<StandardError> duplicate(
      DuplicateResourceException ex,
      HttpServletRequest request) {
    return response(HttpStatus.CONFLICT, "Recurso duplicado", ex.getMessage(), request);
  }

  @ExceptionHandler(BusinessRuleException.class)
  public ResponseEntity<StandardError> businessRule(
      BusinessRuleException ex,
      HttpServletRequest request) {
    return response(HttpStatus.UNPROCESSABLE_ENTITY, "Regra de negócio", ex.getMessage(), request);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationError> validation(
      MethodArgumentNotValidException ex,
      HttpServletRequest request) {
    ValidationError error = new ValidationError(
        HttpStatus.BAD_REQUEST.value(), "Erro de validação",
        "Um ou mais campos estão inválidos.", request.getRequestURI());

    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
      error.addError(fieldError.getField(), fieldError.getDefaultMessage());
    }
    return ResponseEntity.badRequest().body(error);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<StandardError> invalidJson(
      HttpMessageNotReadableException ex,
      HttpServletRequest request) {
    return response(HttpStatus.BAD_REQUEST, "JSON inválido",
        "Verifique o formato dos dados enviados.", request);
  }

  private ResponseEntity<StandardError> response(
      HttpStatus status, String error, String message, HttpServletRequest request) {
    StandardError standardError = new StandardError(LocalDateTime.now(),
        status.value(), error, message, request.getRequestURI());
    return ResponseEntity.status(status).body(standardError);
  }
}
