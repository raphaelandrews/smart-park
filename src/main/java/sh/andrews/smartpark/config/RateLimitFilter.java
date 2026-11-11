package sh.andrews.smartpark.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

  private final RateLimitProperties properties;
  private final Cache<String, Bucket> buckets;

  public RateLimitFilter(RateLimitProperties properties) {
    this.properties = properties;
    this.buckets = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(Duration.ofMinutes(10))
        .build();
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !properties.isEnabled()
        || "OPTIONS".equalsIgnoreCase(request.getMethod())
        || request.getRequestURI().startsWith("/actuator");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    Bucket bucket = buckets.get(clientIp(request), key -> newBucket());

    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
      return;
    }

    long retryAfter = retryAfterSeconds(bucket);
    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfter));
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.getWriter().write(errorBody(request, retryAfter));
  }

  private Bucket newBucket() {
    Bandwidth limit = Bandwidth.classic(properties.getCapacity(),
        Refill.greedy(properties.getRefillTokens(), properties.getRefillPeriod()));
    return Bucket.builder().addLimit(limit).build();
  }

  private long retryAfterSeconds(Bucket bucket) {
    long nanos = bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill();
    return Math.max(1, (nanos + 999_999_999L) / 1_000_000_000L);
  }

  private String clientIp(HttpServletRequest request) {
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isBlank()) {
      String[] hops = forwardedFor.split(",");
      return hops[hops.length - 1].trim();
    }
    return request.getRemoteAddr();
  }

  private String errorBody(HttpServletRequest request, long retryAfter) {
    return "{\"timestamp\":\"" + LocalDateTime.now()
        + "\",\"status\":429,\"error\":\"" + escape("Muitas requisições")
        + "\",\"message\":\"" + escape(
            "Limite de requisições excedido. Tente novamente em " + retryAfter + " segundos.")
        + "\",\"path\":\"" + escape(request.getRequestURI()) + "\"}";
  }

  private String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
