package sh.andrews.smartpark.service;

import java.util.Locale;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import sh.andrews.smartpark.config.AuthProperties;
import sh.andrews.smartpark.exception.AuthProviderUnavailableException;
import sh.andrews.smartpark.exception.InvalidCredentialsException;

@Service
public class GoogleTokenVerifier {

  private final AuthProperties properties;
  private final NimbusJwtDecoder decoder;

  public GoogleTokenVerifier(AuthProperties properties) {
    this.properties = properties;

    String clientId = properties.getGoogle().getClientId();
    if (!StringUtils.hasText(clientId)) {
      this.decoder = null;
      return;
    }

    this.decoder = NimbusJwtDecoder
        .withJwkSetUri(properties.getGoogle().getJwksUri())
        .build();

    OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
      String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
      boolean valid = "https://accounts.google.com".equals(issuer)
          || "accounts.google.com".equals(issuer);
      return valid
          ? OAuth2TokenValidatorResult.success()
          : OAuth2TokenValidatorResult.failure(
              new OAuth2Error("invalid_token", "Emissor Google inválido.", null));
    };

    OAuth2TokenValidator<Jwt> audienceValidator = jwt -> jwt.getAudience().contains(clientId)
        ? OAuth2TokenValidatorResult.success()
        : OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Token Google destinado a outro cliente.", null));

    OAuth2TokenValidator<Jwt> emailValidator = jwt -> isEmailVerified(jwt)
        ? OAuth2TokenValidatorResult.success()
        : OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "O email da conta Google não foi verificado.", null));

    this.decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
        JwtValidators.createDefault(), issuerValidator, audienceValidator, emailValidator));
  }

  public GoogleUserInfo verify(String idToken) {
    if (decoder == null) {
      throw new AuthProviderUnavailableException(
          "O login com Google não está configurado.");
    }

    try {
      Jwt jwt = decoder.decode(idToken);
      String subject = jwt.getSubject();
      String email = jwt.getClaimAsString("email");
      String name = jwt.getClaimAsString("name");
      String avatarUrl = jwt.getClaimAsString("picture");

      if (!StringUtils.hasText(subject) || !StringUtils.hasText(email)) {
        throw new InvalidCredentialsException(
            "O token do Google não contém os dados necessários.");
      }

      String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
      String displayName = StringUtils.hasText(name)
          ? name.trim()
          : normalizedEmail.substring(0, normalizedEmail.indexOf('@'));

      return new GoogleUserInfo(subject, normalizedEmail, displayName, avatarUrl);
    } catch (JwtException exception) {
      throw new InvalidCredentialsException(
          "Não foi possível validar o login com Google.");
    }
  }

  private boolean isEmailVerified(Jwt jwt) {
    Object claim = jwt.getClaim("email_verified");
    return Boolean.TRUE.equals(claim) || "true".equalsIgnoreCase(String.valueOf(claim));
  }

  public record GoogleUserInfo(String subject, String email, String name, String avatarUrl) {
  }
}
