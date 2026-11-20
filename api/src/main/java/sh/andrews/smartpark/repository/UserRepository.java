package sh.andrews.smartpark.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByIdAndActiveTrue(Long id);

  boolean existsByEmailIgnoreCase(String email);
}
