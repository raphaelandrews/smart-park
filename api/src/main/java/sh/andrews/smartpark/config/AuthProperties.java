package sh.andrews.smartpark.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Component
@ConfigurationProperties(prefix = "app.security")
public class AuthProperties {

  private final Jwt jwt = new Jwt();
  private final Google google = new Google();
  private final Admin admin = new Admin();

  @Getter
  @Setter
  public static class Jwt {

    private String secret;
    private String issuer = "smart-park-api";
    private Duration accessTokenTtl = Duration.ofHours(8);
  }

  @Getter
  @Setter
  public static class Google {

    private String clientId;
    private String jwksUri = "https://www.googleapis.com/oauth2/v3/certs";
    private String issuer = "https://accounts.google.com";
  }

  @Getter
  @Setter
  public static class Admin {

    private String email;
    private String name = "Operador";
    private String password;
  }
}
