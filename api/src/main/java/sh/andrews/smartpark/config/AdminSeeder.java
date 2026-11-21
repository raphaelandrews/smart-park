package sh.andrews.smartpark.config;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import sh.andrews.smartpark.model.entity.User;
import sh.andrews.smartpark.model.enums.UserRole;
import sh.andrews.smartpark.repository.UserRepository;

@Component
@Order(0)
public class AdminSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthProperties properties;

  public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
      AuthProperties properties) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.properties = properties;
  }

  @Override
  public void run(String... args) {
    AuthProperties.Admin admin = properties.getAdmin();
    if (!StringUtils.hasText(admin.getEmail()) || !StringUtils.hasText(admin.getPassword())) {
      log.info("Admin seeding skipped: ADMIN_EMAIL/ADMIN_PASSWORD are not configured.");
      return;
    }

    String email = admin.getEmail().trim().toLowerCase(Locale.ROOT);
    User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
    boolean changed = user.getId() == null;

    user.setEmail(email);
    String configuredName = StringUtils.hasText(admin.getName())
        ? admin.getName()
        : "Admin";
    if (!configuredName.equals(user.getName())) {
      user.setName(configuredName);
      changed = true;
    }
    if (user.getRole() != UserRole.ADMIN) {
      user.setRole(UserRole.ADMIN);
      changed = true;
    }
    if (!Boolean.TRUE.equals(user.getEmailVerified())) {
      user.setEmailVerified(true);
      changed = true;
    }
    if (!Boolean.TRUE.equals(user.getActive())) {
      user.setActive(true);
      changed = true;
    }
    if (user.getPasswordHash() == null
        || !passwordEncoder.matches(admin.getPassword(), user.getPasswordHash())) {
      user.setPasswordHash(passwordEncoder.encode(admin.getPassword()));
      changed = true;
    }

    if (changed) {
      userRepository.save(user);
    }
    log.info("Admin account ready: {}", email);
  }
}
