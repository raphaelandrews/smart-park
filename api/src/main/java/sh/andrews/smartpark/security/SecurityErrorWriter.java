package sh.andrews.smartpark.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import org.springframework.http.MediaType;

import jakarta.servlet.http.HttpServletResponse;

final class SecurityErrorWriter {

  private SecurityErrorWriter() {
  }

  static void write(HttpServletResponse response, int status, String error, String message,
      String path) throws IOException {
    String json = "{\"timestamp\":\"" + LocalDateTime.now()
        + "\",\"status\":" + status
        + ",\"error\":\"" + escape(error)
        + "\",\"message\":\"" + escape(message)
        + "\",\"path\":\"" + escape(path) + "\"}";

    response.setStatus(status);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(json);
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
