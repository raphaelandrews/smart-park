package sh.andrews.smartpark.security;

import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import sh.andrews.smartpark.config.AuthProperties;
import sh.andrews.smartpark.model.entity.User;

@Service
public class JwtService {

  private final JwtEncoder encoder;
  private final AuthProperties properties;

  public JwtService(JwtEncoder encoder, AuthProperties properties) {
    this.encoder = encoder;
    this.properties = properties;
  }

  public IssuedToken issue(User user) {
    Instant now = Instant.now();
    Instant expiresAt = now.plus(properties.getJwt().getAccessTokenTtl());

    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(properties.getJwt().getIssuer())
        .issuedAt(now)
        .expiresAt(expiresAt)
        .subject(user.getId().toString())
        .claim("email", user.getEmail())
        .claim("name", user.getName())
        .claim("role", user.getRole().name())
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    return new IssuedToken(token, properties.getJwt().getAccessTokenTtl().toSeconds());
  }

  public record IssuedToken(String value, long expiresInSeconds) {
  }
}
