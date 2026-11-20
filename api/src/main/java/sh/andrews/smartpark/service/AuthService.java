package sh.andrews.smartpark.service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sh.andrews.smartpark.dto.request.GoogleLoginRequestDTO;
import sh.andrews.smartpark.dto.request.LoginRequestDTO;
import sh.andrews.smartpark.dto.request.RegisterRequestDTO;
import sh.andrews.smartpark.dto.response.AuthResponseDTO;
import sh.andrews.smartpark.exception.DuplicateResourceException;
import sh.andrews.smartpark.exception.InvalidCredentialsException;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.model.entity.UserIdentity;
import sh.andrews.smartpark.model.enums.AuthProvider;
import sh.andrews.smartpark.model.enums.UserRole;
import sh.andrews.smartpark.repository.UserIdentityRepository;
import sh.andrews.smartpark.repository.UserRepository;
import sh.andrews.smartpark.security.JwtService;
import sh.andrews.smartpark.service.GoogleTokenVerifier.GoogleUserInfo;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final UserIdentityRepository userIdentityRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final GoogleTokenVerifier googleTokenVerifier;

  public AuthService(UserRepository userRepository,
      UserIdentityRepository userIdentityRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService,
      GoogleTokenVerifier googleTokenVerifier) {
    this.userRepository = userRepository;
    this.userIdentityRepository = userIdentityRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.googleTokenVerifier = googleTokenVerifier;
  }

  @Transactional
  public AuthResponseDTO register(RegisterRequestDTO request) {
    String email = normalizeEmail(request.getEmail());
    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new DuplicateResourceException("usuário", "email", email);
    }

    User user = new User();
    user.setName(request.getName().trim());
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole(UserRole.USER);
    user.setEmailVerified(false);
    user.setActive(true);
    user = userRepository.save(user);

    return AuthResponseDTO.of(user, jwtService.issue(user));
  }

  @Transactional
  public AuthResponseDTO login(LoginRequestDTO request) {
    String email = normalizeEmail(request.getEmail());

    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(email, request.getPassword()));
    } catch (AuthenticationException exception) {
      throw new InvalidCredentialsException("Email ou senha inválidos.");
    }

    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new InvalidCredentialsException("Email ou senha inválidos."));

    user.setLastLoginAt(LocalDateTime.now());
    return AuthResponseDTO.of(user, jwtService.issue(user));
  }

  @Transactional
  public AuthResponseDTO loginWithGoogle(GoogleLoginRequestDTO request) {
    GoogleUserInfo googleUser = googleTokenVerifier.verify(request.getIdToken());
    User user = userIdentityRepository
        .findByProviderAndProviderUserId(AuthProvider.GOOGLE, googleUser.subject())
        .map(identity -> refreshGoogleIdentity(identity, googleUser))
        .orElseGet(() -> linkOrCreateGoogleUser(googleUser));

    user.setLastLoginAt(LocalDateTime.now());
    return AuthResponseDTO.of(user, jwtService.issue(user));
  }

  private User refreshGoogleIdentity(UserIdentity identity, GoogleUserInfo googleUser) {
    User user = identity.getUser();
    if (!Boolean.TRUE.equals(user.getActive())) {
      throw new InvalidCredentialsException("Conta inativa.");
    }

    if (!Objects.equals(identity.getEmail(), googleUser.email())) {
      identity.setEmail(googleUser.email());
    }
    if (!Objects.equals(identity.getAvatarUrl(), googleUser.avatarUrl())) {
      identity.setAvatarUrl(googleUser.avatarUrl());
    }
    if (!StringUtils.hasText(user.getAvatarUrl())) {
      user.setAvatarUrl(googleUser.avatarUrl());
    }
    return user;
  }

  private User linkOrCreateGoogleUser(GoogleUserInfo googleUser) {
    User user = userRepository.findByEmailIgnoreCase(googleUser.email()).orElse(null);

    if (user != null) {
      if (!Boolean.TRUE.equals(user.getActive())) {
        throw new InvalidCredentialsException("Conta inativa.");
      }
      user.setEmailVerified(true);
      if (!StringUtils.hasText(user.getAvatarUrl())) {
        user.setAvatarUrl(googleUser.avatarUrl());
      }
    } else {
      user = new User();
      user.setName(googleUser.name());
      user.setEmail(googleUser.email());
      user.setPasswordHash(null);
      user.setRole(UserRole.USER);
      user.setEmailVerified(true);
      user.setAvatarUrl(googleUser.avatarUrl());
      user.setActive(true);
      user = userRepository.save(user);
    }

    UserIdentity identity = new UserIdentity();
    identity.setProvider(AuthProvider.GOOGLE);
    identity.setProviderUserId(googleUser.subject());
    identity.setEmail(googleUser.email());
    identity.setAvatarUrl(googleUser.avatarUrl());
    identity.setUser(user);
    userIdentityRepository.save(identity);

    return user;
  }

  private String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
  }
}
