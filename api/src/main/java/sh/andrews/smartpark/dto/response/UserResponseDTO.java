package sh.andrews.smartpark.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.model.enums.UserRole;

@Getter
@AllArgsConstructor
@ToString
public class UserResponseDTO {

  private Long id;
  private String name;
  private String email;
  private UserRole role;
  private String avatarUrl;
  private Boolean active;
  private LocalDateTime createdAt;

  public static UserResponseDTO fromEntity(User user) {
    return new UserResponseDTO(user.getId(), user.getName(), user.getEmail(),
        user.getRole(), user.getAvatarUrl(), user.getActive(), user.getCreatedAt());
  }
}
