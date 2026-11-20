package sh.andrews.smartpark;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  @Autowired
  private MockMvc mockMvc;

  @Test
  void registersLogsInAndReturnsCurrentUser() throws Exception {
    String token = register("user1@test.local", "User One", "password123");

    mockMvc.perform(get("/auth/me").header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("user1@test.local"))
        .andExpect(jsonPath("$.role").value("USER"));
  }

  @Test
  void rejectsDuplicateEmail() throws Exception {
    register("duplicate@test.local", "Duplicate", "password123");

    mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(registerBody("duplicate@test.local", "Duplicate", "password123")))
        .andExpect(status().isConflict());
  }

  @Test
  void rejectsWrongPassword() throws Exception {
    register("wrong-password@test.local", "Wrong Password", "password123");

    mockMvc.perform(post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"email":"wrong-password@test.local","password":"not-the-password"}
            """))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void requiresAuthenticationForPrivateEndpoints() throws Exception {
    mockMvc.perform(get("/vehicle"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void userCannotAccessAdminEndpoints() throws Exception {
    String token = register("user2@test.local", "User Two", "password123");

    mockMvc.perform(get("/parking-space").header("Authorization", bearer(token)))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminCanAccessAdminEndpoints() throws Exception {
    mockMvc.perform(get("/parking-space")
        .header("Authorization", bearer(loginAdmin())))
        .andExpect(status().isOk());
  }

  @Test
  void googleLoginIsUnavailableWhenNotConfigured() throws Exception {
    mockMvc.perform(post("/auth/google")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"idToken":"fake-google-token"}
            """))
        .andExpect(status().isServiceUnavailable());
  }

  @Test
  void usersOnlySeeTheirOwnVehicles() throws Exception {
    String userAToken = register("owner@test.local", "Owner", "password123");
    String userBToken = register("other@test.local", "Other", "password123");

    mockMvc.perform(post("/vehicle")
        .header("Authorization", bearer(userAToken))
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "licensePlate": "ABC1D23",
              "model": "Gol",
              "color": "Prata",
              "vehicleType": "CAR"
            }
            """))
        .andExpect(status().isCreated());

    mockMvc.perform(get("/vehicle").header("Authorization", bearer(userBToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(0));

    mockMvc.perform(get("/vehicle").header("Authorization", bearer(loginAdmin())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1));
  }

  private String register(String email, String name, String password) throws Exception {
    MvcResult result = mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(registerBody(email, name, password)))
        .andExpect(status().isCreated())
        .andReturn();
    return tokenFrom(result);
  }

  private String loginAdmin() throws Exception {
    MvcResult result = mockMvc.perform(post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"email":"admin@test.local","password":"admin12345"}
            """))
        .andExpect(status().isOk())
        .andReturn();
    return tokenFrom(result);
  }

  private String tokenFrom(MvcResult result) throws Exception {
    String body = result.getResponse().getContentAsString();
    String token = JSON.readTree(body).path("accessToken").asText();
    if (token == null || token.isBlank()) {
      throw new IllegalStateException("Authentication response did not contain a token.");
    }
    return token;
  }

  private String registerBody(String email, String name, String password) {
    return """
        {"name":"%s","email":"%s","password":"%s"}
        """.formatted(name, email, password);
  }

  private String bearer(String token) {
    return "Bearer " + token;
  }
}
