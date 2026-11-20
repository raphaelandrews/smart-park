package sh.andrews.smartpark.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import sh.andrews.smartpark.model.entity.ParkingSpace;

@Getter
@AllArgsConstructor
@ToString
public class ParkingSpaceResponseDTO {

  private Long id;
  private String code;
  private Long parkingSpaceTypeId;
  private String parkingSpaceTypeName;
  private Boolean blocked;
  private String blockingReason;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public static ParkingSpaceResponseDTO fromEntity(ParkingSpace space) {
    return new ParkingSpaceResponseDTO(space.getId(), space.getCode(),
        space.getType().getId(), space.getType().getName(), space.getBlocked(),
        space.getBlockingReason(), space.getActive(), space.getCreatedAt(),
        space.getUpdatedAt());
  }
}
