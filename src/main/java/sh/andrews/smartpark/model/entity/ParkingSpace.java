package sh.andrews.smartpark.model.entity;

import sh.andrews.smartpark.model.enums.ParkingSpaceStatus;
import sh.andrews.smartpark.model.enums.ParkingSpaceType;

public class ParkingSpace {
  private Long id;
  private String code;
  private ParkingSpaceType parkingSpaceType;
  private ParkingSpaceStatus parkingSpaceStatus;
  private Sector sector;

  public ParkingSpace() {
  }

  public ParkingSpace(Long id, String code, ParkingSpaceType parkingSpaceType, ParkingSpaceStatus parkingSpaceStatus,
      Sector sector) {
    super();
    this.id = id;
    this.code = code;
    this.parkingSpaceType = parkingSpaceType;
    this.parkingSpaceStatus = parkingSpaceStatus;
    this.sector = sector;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public ParkingSpaceType getParkingSpaceType() {
    return parkingSpaceType;
  }

  public void setParkingSpaceType(ParkingSpaceType parkingSpaceType) {
    this.parkingSpaceType = parkingSpaceType;
  }

  public ParkingSpaceStatus getParkingSpaceStatus() {
    return parkingSpaceStatus;
  }

  public void setParkingSpaceStatus(ParkingSpaceStatus parkingSpaceStatus) {
    this.parkingSpaceStatus = parkingSpaceStatus;
  }

  public Sector getSector() {
    return sector;
  }

  public void setSector(Sector sector) {
    this.sector = sector;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((id == null) ? 0 : id.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    ParkingSpace other = (ParkingSpace) obj;
    if (id == null) {
      if (other.id != null)
        return false;
    } else if (!id.equals(other.id))
      return false;
    return true;
  }
}
