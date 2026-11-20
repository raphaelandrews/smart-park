package sh.andrews.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.security.JwtService;

@Getter
@AllArgsConstructor
@ToString
public class AuthResponseDTO {

  private String accessToken;
  private String tokenType;
  private long expiresIn;
  private UserResponseDTO user;

  public static AuthResponseDTO of(User user, JwtService.IssuedToken token) {
    return new AuthResponseDTO(token.value(), "Bearer", token.expiresInSeconds(),
        UserResponseDTO.fromEntity(user));
  }
}
