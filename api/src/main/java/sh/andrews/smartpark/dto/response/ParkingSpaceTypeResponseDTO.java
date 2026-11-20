package sh.andrews.smartpark.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.ParkingSpaceType;

@Getter
@AllArgsConstructor
@ToString
public class ParkingSpaceTypeResponseDTO {

  private Long id;
  private String name;
  private String description;
  private Boolean requiresCredential;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static ParkingSpaceTypeResponseDTO fromEntity(ParkingSpaceType type) {
    return new ParkingSpaceTypeResponseDTO(type.getId(), type.getName(),
        type.getDescription(), type.getRequiresCredential(), type.getActive(),
        type.getCreatedAt(), type.getUpdatedAt());
  }
}
