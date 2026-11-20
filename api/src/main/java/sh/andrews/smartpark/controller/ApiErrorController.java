package sh.andrews.smartpark.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Hidden
@RestController
public class ApiErrorController implements ErrorController {

  @RequestMapping("/error")
  public void handleError(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    int status = status(request);
    String label = label(status);
    String message = message(status);
    String path = path(request);

    response.setStatus(status);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());

    String accept = request.getHeader(HttpHeaders.ACCEPT);
    if (accept != null && accept.contains(MediaType.TEXT_HTML_VALUE)) {
      response.setContentType(MediaType.TEXT_HTML_VALUE);
      response.getWriter().write(html(status, label, message, path));
    } else {
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write(json(status, label, message, path));
    }
  }

  private int status(HttpServletRequest request) {
    Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
    return (status instanceof Integer value) ? value : 500;
  }

  private String path(HttpServletRequest request) {
    Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
    return (uri != null) ? uri.toString() : request.getRequestURI();
  }

  private String label(int status) {
    return switch (status) {
      case 400 -> "Requisição inválida";
      case 401 -> "Não autorizado";
      case 403 -> "Acesso negado";
      case 404 -> "Não encontrado";
      case 405 -> "Método não permitido";
      case 406 -> "Formato não aceitável";
      case 415 -> "Tipo de conteúdo não suportado";
      case 429 -> "Muitas requisições";
      case 500 -> "Erro interno";
      default -> "Erro na requisição";
    };
  }

  private String message(int status) {
    return switch (status) {
      case 400 -> "A requisição enviada é inválida.";
      case 404 -> "O recurso solicitado não existe.";
      case 405 -> "O método HTTP não é suportado para este recurso.";
      case 415 -> "O tipo de conteúdo enviado não é suportado.";
      case 429 -> "Limite de requisições excedido.";
      case 500 -> "Ocorreu um erro inesperado.";
      default -> "Não foi possível processar a requisição.";
    };
  }

  private String json(int status, String label, String message, String path) {
    return "{\"timestamp\":\"" + LocalDateTime.now()
        + "\",\"status\":" + status
        + ",\"error\":\"" + jsonEscape(label)
        + "\",\"message\":\"" + jsonEscape(message)
        + "\",\"path\":\"" + jsonEscape(path) + "\"}";
  }

  private String html(int status, String label, String message, String path) {
    return """
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>%d — %s</title>
          <style>
            body { margin: 0; height: 100vh; display: grid; place-items: center;
                   font-family: system-ui, sans-serif; background: #111; color: #eee; }
            main { text-align: center; padding: 2rem; }
            h1 { font-size: 5rem; margin: 0; }
            p { margin: .5rem 0; color: #aaa; }
            code { color: #8ab4f8; }
          </style>
        </head>
        <body>
          <main>
            <h1>%d</h1>
            <p>%s</p>
            <p><code>%s</code></p>
          </main>
        </body>
        </html>
        """.formatted(status, htmlEscape(label), status, htmlEscape(message), htmlEscape(path));
  }

  private String jsonEscape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }

  private String htmlEscape(String value) {
    return value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }
}
