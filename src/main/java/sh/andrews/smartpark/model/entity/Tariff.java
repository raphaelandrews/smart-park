package sh.andrews.smartpark.model.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tariffs")
public class Tariff {

  @Id
  private Long id;
  private BigDecimal firstHourRate;
  private BigDecimal additionalHourRate;
  private Integer freeMinutes;

  public Tariff() {
  }

  public Tariff(Long id, BigDecimal firstHourRate, BigDecimal additionalHourRate, Integer freeMinutes) {
    super();
    this.id = id;
    this.firstHourRate = firstHourRate;
    this.additionalHourRate = additionalHourRate;
    this.freeMinutes = freeMinutes;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public BigDecimal getFirstHourRate() {
    return firstHourRate;
  }

  public void setFirstHourRate(BigDecimal firstHourRate) {
    this.firstHourRate = firstHourRate;
  }

  public BigDecimal getAdditionalHourRate() {
    return additionalHourRate;
  }

  public void setAdditionalHourRate(BigDecimal additionalHourRate) {
    this.additionalHourRate = additionalHourRate;
  }

  public Integer getFreeMinutes() {
    return freeMinutes;
  }

  public void setFreeMinutes(Integer freeMinutes) {
    this.freeMinutes = freeMinutes;
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
    Tariff other = (Tariff) obj;
    if (id == null) {
      if (other.id != null)
        return false;
    } else if (!id.equals(other.id))
      return false;
    return true;
  }

}
