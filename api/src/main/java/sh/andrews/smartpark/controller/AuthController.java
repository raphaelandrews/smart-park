package sh.andrews.smartpark.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import sh.andrews.smartpark.dto.request.GoogleLoginRequestDTO;
import sh.andrews.smartpark.dto.request.LoginRequestDTO;
import sh.andrews.smartpark.dto.request.RegisterRequestDTO;
import sh.andrews.smartpark.dto.response.AuthResponseDTO;
import sh.andrews.smartpark.dto.response.UserResponseDTO;
import sh.andrews.smartpark.security.CurrentUserService;
import sh.andrews.smartpark.service.AuthService;

@Tag(name = "Authentication", description = "Email/password and Google login")
@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final CurrentUserService currentUserService;

  public AuthController(AuthService authService, CurrentUserService currentUserService) {
    this.authService = authService;
    this.currentUserService = currentUserService;
  }

  @Operation(operationId = "register", summary = "Register a new user")
  @PostMapping("/register")
  public ResponseEntity<AuthResponseDTO> register(
      @RequestBody @Valid RegisterRequestDTO request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
  }

  @Operation(operationId = "login", summary = "Login with email and password")
  @PostMapping("/login")
  public AuthResponseDTO login(@RequestBody @Valid LoginRequestDTO request) {
    return authService.login(request);
  }

  @Operation(operationId = "loginWithGoogle", summary = "Login with a Google ID token")
  @PostMapping("/google")
  public AuthResponseDTO loginWithGoogle(
      @RequestBody @Valid GoogleLoginRequestDTO request) {
    return authService.loginWithGoogle(request);
  }

  @Operation(operationId = "getCurrentUser", summary = "Return the authenticated user")
  @GetMapping("/me")
  public UserResponseDTO me() {
    return UserResponseDTO.fromEntity(currentUserService.requireCurrentUser());
  }

  @Operation(operationId = "logout", summary = "Logout (the client discards its token)")
  @PostMapping("/logout")
  public ResponseEntity<Void> logout() {
    return ResponseEntity.noContent().build();
  }
}
