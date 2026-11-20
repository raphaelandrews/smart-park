package sh.andrews.smartpark.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

  private boolean enabled = true;
  private long capacity = 60;
  private long refillTokens = 60;
  private Duration refillPeriod = Duration.ofMinutes(1);
}
