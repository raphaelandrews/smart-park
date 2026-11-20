package sh.andrews.smartpark.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import sh.andrews.smartpark.exception.UnauthorizedException;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.repository.UserRepository;

@Service
public class CurrentUserService {

  private final UserRepository userRepository;

  public CurrentUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User requireCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new UnauthorizedException("Autenticação necessária.");
    }

    Long userId;
    try {
      userId = Long.valueOf(jwt.getSubject());
    } catch (NumberFormatException exception) {
      throw new UnauthorizedException("Token de autenticação inválido.");
    }

    return userRepository.findByIdAndActiveTrue(userId)
        .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado ou inativo."));
  }

  public boolean isAdmin() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication != null && authentication.getAuthorities().stream()
        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
  }
}
