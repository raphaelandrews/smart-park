package sh.andrews.smartpark.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sh.andrews.smartpark.model.entity.UserIdentity;
import sh.andrews.smartpark.model.enums.AuthProvider;

@Repository
public interface UserIdentityRepository extends JpaRepository<UserIdentity, Long> {

  Optional<UserIdentity> findByProviderAndProviderUserId(AuthProvider provider,
      String providerUserId);
}
