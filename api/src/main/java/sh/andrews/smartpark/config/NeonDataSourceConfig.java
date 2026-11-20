package sh.andrews.smartpark.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
@Profile("prod")
public class NeonDataSourceConfig {

  @Bean
  @ConfigurationProperties("spring.datasource.hikari")
  public HikariDataSource dataSource(Environment environment) {
    String databaseUrl = environment.getRequiredProperty("DATABASE_URL");
    ConnectionInfo info = ConnectionInfo.parse(databaseUrl);

    String username = info.username() != null
        ? info.username()
        : environment.getProperty("DATABASE_USERNAME");
    String password = info.password() != null
        ? info.password()
        : environment.getProperty("DATABASE_PASSWORD");

    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl(info.jdbcUrl());
    dataSource.setUsername(username);
    dataSource.setPassword(password);
    return dataSource;
  }

  record ConnectionInfo(String jdbcUrl, String username, String password) {

    static ConnectionInfo parse(String rawUrl) {
      String url = rawUrl.trim();
      if (url.startsWith("jdbc:")) {
        return new ConnectionInfo(url, null, null);
      }
      if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
        throw new IllegalArgumentException(
            "DATABASE_URL must start with postgresql://, postgres:// or jdbc:postgresql://");
      }

      URI uri = URI.create(url);
      if (uri.getHost() == null) {
        throw new IllegalArgumentException("DATABASE_URL has no host");
      }

      String username = null;
      String password = null;
      String userInfo = uri.getUserInfo();
      if (userInfo != null) {
        int separator = userInfo.indexOf(':');
        username = decode(separator >= 0 ? userInfo.substring(0, separator) : userInfo);
        password = separator >= 0 ? decode(userInfo.substring(separator + 1)) : null;
      }

      int port = uri.getPort() > 0 ? uri.getPort() : 5432;
      String path = uri.getRawPath() == null ? "" : uri.getRawPath();
      String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();

      String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path + query;
      return new ConnectionInfo(jdbcUrl, username, password);
    }

    private static String decode(String value) {
      return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
  }
}
