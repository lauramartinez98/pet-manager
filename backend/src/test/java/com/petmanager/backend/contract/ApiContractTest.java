package com.petmanager.backend.contract;

import com.petmanager.backend.config.GoogleLoginHandlers;
import com.petmanager.backend.config.SecurityConfig;
import com.petmanager.backend.dtos.AuthResponseDTO;
import com.petmanager.backend.dtos.ExpenseResponseDTO;
import com.petmanager.backend.dtos.PetResponseDTO;
import com.petmanager.backend.dtos.UserResponseDTO;
import com.petmanager.backend.dtos.VetAppointmentResponseDTO;
import com.petmanager.backend.dtos.WalkResponseDTO;
import com.petmanager.backend.entities.enums.ExpenseCategory;
import com.petmanager.backend.entities.enums.Species;
import com.petmanager.backend.exceptions.EmailAlreadyUsedException;
import com.petmanager.backend.exceptions.ResourceNotFoundException;
import com.petmanager.backend.services.AuthService;
import com.petmanager.backend.services.CurrentUserService;
import com.petmanager.backend.services.ExpenseService;
import com.petmanager.backend.services.PetPhotoService;
import com.petmanager.backend.services.PetService;
import com.petmanager.backend.services.VetAppointmentService;
import com.petmanager.backend.services.WalkService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests de contrato de la capa HTTP frente a api-docs/openapi.yaml (v1.3.1).
 *
 * Usa los controladores y la SecurityConfig reales (bearerAuth con JWT) y simula los servicios,
 * así que comprueba rutas, códigos de estado, nombres y formatos de los campos JSON, la validación
 * de los *RequestDTO y la autenticación, sin depender de la base de datos ni de Supabase.
 */
@WebMvcTest
@Import({SecurityConfig.class, CurrentUserService.class})
@TestPropertySource(properties = {
        "app.jwt.secret=c2VjcmV0by1kZS10ZXN0cy1jb24tMzItYnl0ZXMtb2shIQ==",
        "app.jwt.issuer=pet-manager",
        "app.jwt.expiration=1h",
})
class ApiContractTest {

    private static final String API = "/api/v1";
    private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PET_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final RequestPostProcessor AUTH = jwt().jwt(j -> j.subject(USER_ID.toString()));

    @Autowired
    MockMvc mvc;

    @MockitoBean AuthService authService;
    @MockitoBean PetService petService;
    @MockitoBean PetPhotoService petPhotoService;
    @MockitoBean WalkService walkService;
    @MockitoBean VetAppointmentService vetAppointmentService;
    @MockitoBean ExpenseService expenseService;
    // Solo los necesita la cadena de seguridad del login con Google, que aquí no se prueba
    @MockitoBean GoogleLoginHandlers googleLoginHandlers;
    @MockitoBean ClientRegistrationRepository clientRegistrationRepository;

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static PetResponseDTO pet() {
        return new PetResponseDTO(PET_ID, "Toby", Species.PERRO, null, new BigDecimal("12.50"), null, null, null);
    }

    private void petNotFound() {
        ResourceNotFoundException notFound = new ResourceNotFoundException("Mascota", PET_ID);
        when(petService.findById(USER_ID, PET_ID)).thenThrow(notFound);
        when(petPhotoService.replacePhoto(eq(USER_ID), eq(PET_ID), any())).thenThrow(notFound);
        when(walkService.findAllByPet(USER_ID, PET_ID)).thenThrow(notFound);
        when(walkService.create(eq(USER_ID), eq(PET_ID), any())).thenThrow(notFound);
        when(vetAppointmentService.findAllByPet(USER_ID, PET_ID)).thenThrow(notFound);
        when(vetAppointmentService.create(eq(USER_ID), eq(PET_ID), any())).thenThrow(notFound);
        when(expenseService.findAllByPet(USER_ID, PET_ID)).thenThrow(notFound);
        when(expenseService.create(eq(USER_ID), eq(PET_ID), any())).thenThrow(notFound);
    }

    // ---------------------------------------------------------------- bearerAuth

    @Nested
    class Seguridad {

        /** Todas las operaciones sin `security: []` deben responder 401 sin token */
        @ParameterizedTest
        @ValueSource(strings = {
                "GET /auth/me",
                "GET /pets", "POST /pets", "GET /pets/{petId}",
                "GET /pets/{petId}/walks", "POST /pets/{petId}/walks",
                "GET /pets/{petId}/vet-appointments", "POST /pets/{petId}/vet-appointments",
                "GET /pets/{petId}/expenses", "POST /pets/{petId}/expenses",
        })
        void operacionProtegidaSinToken_401(String operation) throws Exception {
            String[] parts = operation.split(" ");
            String path = API + parts[1].replace("{petId}", PET_ID.toString());
            MockHttpServletRequestBuilder request = parts[0].equals("GET") ? get(path) : json(post(path), "{}");

            mvc.perform(request).andExpect(status().isUnauthorized());
        }

        @Test
        void subirFotoSinToken_401() throws Exception {
            mvc.perform(multipart(HttpMethod.PUT, API + "/pets/" + PET_ID + "/photo").file(png()))
                    .andExpect(status().isUnauthorized());
            verifyNoInteractions(petPhotoService);
        }

        @Test
        void tokenMalFormado_401() throws Exception {
            mvc.perform(get(API + "/pets").header("Authorization", "Bearer no-es-un-jwt"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void registroYLoginSonPublicos() throws Exception {
            when(authService.login(any())).thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
            // Sin token: llega al controlador (401 de credenciales, no de falta de token) y no exige CSRF
            mvc.perform(json(post(API + "/auth/login"), "{\"email\":\"a@b.es\",\"password\":\"x\"}"))
                    .andExpect(status().isUnauthorized());
            verify(authService).login(any());
        }

        @Test
        void elUsuarioEsElSubDelToken() throws Exception {
            when(petService.findAllByOwner(USER_ID)).thenReturn(List.of());
            mvc.perform(get(API + "/pets").with(AUTH)).andExpect(status().isOk());
            verify(petService).findAllByOwner(USER_ID);
        }
    }

    // ---------------------------------------------------------------- Auth

    @Nested
    class Auth {

        private final AuthResponseDTO session = new AuthResponseDTO("jwt.de.prueba",
                Instant.parse("2026-10-12T10:00:00Z"),
                new UserResponseDTO(USER_ID, "Laura Martínez", "laura@test.dev", null));

        @Test
        void register_201ConAuthResponse() throws Exception {
            when(authService.register(any())).thenReturn(session);

            mvc.perform(json(post(API + "/auth/register"),
                            "{\"fullName\":\"Laura Martínez\",\"email\":\"laura@test.dev\",\"password\":\"secreta123\"}"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").value("jwt.de.prueba"))
                    .andExpect(jsonPath("$.expiresAt").value("2026-10-12T10:00:00Z"))
                    .andExpect(jsonPath("$.user.id").value(USER_ID.toString()))
                    .andExpect(jsonPath("$.user.fullName").value("Laura Martínez"))
                    .andExpect(jsonPath("$.user.email").value("laura@test.dev"))
                    // birthDate es required + nullable: debe aparecer como null, no omitirse
                    .andExpect(jsonPath("$.user.birthDate").value(nullValue()))
                    .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{\"email\":\"laura@test.dev\",\"password\":\"secreta123\"}",                       // falta fullName
                "{\"fullName\":\"\",\"email\":\"laura@test.dev\",\"password\":\"secreta123\"}",      // minLength 1
                "{\"fullName\":\"L\",\"email\":\"no-es-email\",\"password\":\"secreta123\"}",        // format email
                "{\"fullName\":\"L\",\"email\":\"laura@test.dev\",\"password\":\"corta\"}",          // minLength 8
                "{\"fullName\":\"L\",\"email\":\"laura@test.dev\",\"password\":\"secreta123\",\"birthDate\":\"2999-01-01\"}", // pasada
        })
        void register_400SiNoCumpleRegisterRequest(String body) throws Exception {
            mvc.perform(json(post(API + "/auth/register"), body)).andExpect(status().isBadRequest());
            verify(authService, never()).register(any());
        }

        @Test
        void register_400SiPasswordSuperaMaxLength72() throws Exception {
            String body = "{\"fullName\":\"L\",\"email\":\"laura@test.dev\",\"password\":\"%s\"}".formatted("a".repeat(73));
            mvc.perform(json(post(API + "/auth/register"), body)).andExpect(status().isBadRequest());
        }

        @Test
        void register_409SiElEmailYaExiste() throws Exception {
            when(authService.register(any())).thenThrow(new EmailAlreadyUsedException());
            mvc.perform(json(post(API + "/auth/register"),
                            "{\"fullName\":\"L\",\"email\":\"laura@test.dev\",\"password\":\"secreta123\"}"))
                    .andExpect(status().isConflict());
        }

        @Test
        void login_200ConAuthResponse() throws Exception {
            when(authService.login(any())).thenReturn(session);
            mvc.perform(json(post(API + "/auth/login"), "{\"email\":\"laura@test.dev\",\"password\":\"secreta123\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.user.email").value("laura@test.dev"));
        }

        @Test
        void login_400SinPassword() throws Exception {
            mvc.perform(json(post(API + "/auth/login"), "{\"email\":\"laura@test.dev\"}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void login_401ConCredencialesIncorrectas() throws Exception {
            when(authService.login(any()))
                    .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));
            mvc.perform(json(post(API + "/auth/login"), "{\"email\":\"laura@test.dev\",\"password\":\"mala\"}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void me_200ConUserResponse() throws Exception {
            when(authService.me(USER_ID)).thenReturn(session.user());
            mvc.perform(get(API + "/auth/me").with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(USER_ID.toString()))
                    .andExpect(jsonPath("$.birthDate").value(nullValue()));
        }
    }

    // ---------------------------------------------------------------- Pets

    @Nested
    class Pets {

        @Test
        void getPets_200ConPetResponse() throws Exception {
            when(petService.findAllByOwner(USER_ID)).thenReturn(List.of(pet()));

            mvc.perform(get(API + "/pets").with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(PET_ID.toString()))
                    .andExpect(jsonPath("$[0].name").value("Toby"))
                    .andExpect(jsonPath("$[0].species").value("PERRO"))
                    .andExpect(jsonPath("$[0].weightKg").value(12.5))
                    // Campos required + nullable presentes como null
                    .andExpect(jsonPath("$[0].breed").value(nullValue()))
                    .andExpect(jsonPath("$[0].personality").value(nullValue()))
                    .andExpect(jsonPath("$[0].pathologies").value(nullValue()))
                    .andExpect(jsonPath("$[0].photoUrl").value(nullValue()))
                    // Sin datos del dueño
                    .andExpect(jsonPath("$[0].owner").doesNotExist())
                    .andExpect(jsonPath("$[0].ownerId").doesNotExist());
        }

        @Test
        void createPet_201SinCuerpoYConLocation() throws Exception {
            when(petService.create(eq(USER_ID), any())).thenReturn(pet());

            mvc.perform(json(post(API + "/pets"), "{\"name\":\"Toby\",\"species\":\"PERRO\",\"weightKg\":12.5}").with(AUTH))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", endsWith("/api/v1/pets/" + PET_ID)))
                    .andExpect(result -> {
                        if (!result.getResponse().getContentAsString().isEmpty()) {
                            throw new AssertionError("El 201 de POST /pets no debe tener cuerpo");
                        }
                    });
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{\"species\":\"PERRO\"}",                                   // falta name
                "{\"name\":\"  \",\"species\":\"PERRO\"}",                   // name en blanco
                "{\"name\":\"Toby\"}",                                       // falta species
                "{\"name\":\"Toby\",\"species\":\"DOG\"}",                   // fuera del enum Species
                "{\"name\":\"Toby\",\"species\":\"perro\"}",                 // el enum distingue mayúsculas
                "{\"name\":\"Toby\",\"species\":\"GATO\",\"weightKg\":0}",   // exclusiveMinimum 0
                "{\"name\":\"Toby\",\"species\":\"GATO\",\"weightKg\":1000}",// maximum 999.99
                "{\"name\":\"Toby\",\"species\":\"GATO\",\"weightKg\":4.555}", // multipleOf 0.01
                "{\"name\":\"Toby\",\"species\":\"OTRO\",",                  // JSON mal formado
        })
        void createPet_400SiNoCumplePetRequest(String body) throws Exception {
            mvc.perform(json(post(API + "/pets"), body).with(AUTH)).andExpect(status().isBadRequest());
            verify(petService, never()).create(any(), any());
        }

        @Test
        void createPet_400SiNameSuperaMaxLength100() throws Exception {
            String body = "{\"name\":\"%s\",\"species\":\"GATO\"}".formatted("a".repeat(101));
            mvc.perform(json(post(API + "/pets"), body).with(AUTH)).andExpect(status().isBadRequest());
        }

        @Test
        void getPet_404SiNoEsDelUsuario() throws Exception {
            petNotFound();
            mvc.perform(get(API + "/pets/" + PET_ID).with(AUTH)).andExpect(status().isNotFound());
        }

        @Test
        void getPet_400SiPetIdNoEsUuid() throws Exception {
            mvc.perform(get(API + "/pets/no-es-uuid").with(AUTH)).andExpect(status().isBadRequest());
        }

        @Test
        void uploadPhoto_200ConPetResponse() throws Exception {
            PetResponseDTO withPhoto = new PetResponseDTO(PET_ID, "Toby", Species.PERRO, null, null, null, null,
                    "https://x.supabase.co/storage/v1/object/public/pet-photos/a.png");
            when(petPhotoService.replacePhoto(eq(USER_ID), eq(PET_ID), any())).thenReturn(withPhoto);

            mvc.perform(multipart(HttpMethod.PUT, API + "/pets/" + PET_ID + "/photo").file(png()).with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.photoUrl").value(containsString("/pet-photos/")));
        }

        @Test
        void uploadPhoto_400SinCampoFile() throws Exception {
            MockMultipartFile otherField = new MockMultipartFile("foto", "a.png", "image/png", new byte[]{1});
            mvc.perform(multipart(HttpMethod.PUT, API + "/pets/" + PET_ID + "/photo").file(otherField).with(AUTH))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void uploadPhoto_404SiNoEsDelUsuario() throws Exception {
            petNotFound();
            mvc.perform(multipart(HttpMethod.PUT, API + "/pets/" + PET_ID + "/photo").file(png()).with(AUTH))
                    .andExpect(status().isNotFound());
        }
    }

    // ---------------------------------------------------------------- Walks

    @Nested
    class Walks {

        private final String path = API + "/pets/" + PET_ID + "/walks";
        private final String valid = "{\"distanceKm\":2.5,\"durationMinutes\":30,\"didPee\":true,\"didPoop\":false,"
                + "\"walkDatetime\":\"2026-10-01T08:30:00Z\"}";

        @Test
        void getWalks_200ConWalkResponse() throws Exception {
            when(walkService.findAllByPet(USER_ID, PET_ID)).thenReturn(List.of(new WalkResponseDTO(UUID.randomUUID(),
                    null, null, true, false, OffsetDateTime.of(2026, 10, 1, 8, 30, 0, 0, ZoneOffset.UTC))));

            mvc.perform(get(path).with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").isString())
                    .andExpect(jsonPath("$[0].distanceKm").value(nullValue()))
                    .andExpect(jsonPath("$[0].durationMinutes").value(nullValue()))
                    .andExpect(jsonPath("$[0].didPee").value(true))
                    .andExpect(jsonPath("$[0].didPoop").value(false))
                    .andExpect(jsonPath("$[0].walkDatetime").value("2026-10-01T08:30:00Z"));
        }

        @Test
        void getWalks_conDateUsaTzPorDefectoEuropeMadrid() throws Exception {
            when(walkService.findAllByPetAndDay(any(), any(), any(), any())).thenReturn(List.of());
            mvc.perform(get(path).param("date", "2026-10-01").with(AUTH)).andExpect(status().isOk());
            verify(walkService).findAllByPetAndDay(USER_ID, PET_ID, LocalDate.of(2026, 10, 1), ZoneId.of("Europe/Madrid"));
        }

        @ParameterizedTest
        @ValueSource(strings = {"date=01-10-2026", "date=2026-10-01&tz=Marte/Olympus"})
        void getWalks_400ConParametrosInvalidos(String query) throws Exception {
            mvc.perform(get(path + "?" + query).with(AUTH)).andExpect(status().isBadRequest());
        }

        @Test
        void createWalk_201ConWalkResponse() throws Exception {
            when(walkService.create(eq(USER_ID), eq(PET_ID), any())).thenReturn(new WalkResponseDTO(UUID.randomUUID(),
                    new BigDecimal("2.50"), 30, true, false, OffsetDateTime.parse("2026-10-01T08:30:00Z")));

            mvc.perform(json(post(path), valid).with(AUTH))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.distanceKm").value(2.5))
                    .andExpect(jsonPath("$.durationMinutes").value(30));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",                     // falta didPee
                "{\"didPee\":true,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",                       // falta didPoop
                "{\"didPee\":true,\"didPoop\":false}",                                               // falta walkDatetime
                "{\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2999-01-01T08:30:00Z\"}",     // futura
                "{\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"ayer\"}",                     // format date-time
                "{\"distanceKm\":0,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
                "{\"distanceKm\":10000,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
                "{\"distanceKm\":2.555,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
                "{\"durationMinutes\":0,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
                "{\"durationMinutes\":1441,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
                "{\"durationMinutes\":1.5,\"didPee\":true,\"didPoop\":false,\"walkDatetime\":\"2026-10-01T08:30:00Z\"}",
        })
        void createWalk_400SiNoCumpleWalkRequest(String body) throws Exception {
            mvc.perform(json(post(path), body).with(AUTH)).andExpect(status().isBadRequest());
            verify(walkService, never()).create(any(), any(), any());
        }

        @Test
        void walks_404SiLaMascotaNoEsDelUsuario() throws Exception {
            petNotFound();
            mvc.perform(get(path).with(AUTH)).andExpect(status().isNotFound());
            mvc.perform(json(post(path), valid).with(AUTH)).andExpect(status().isNotFound());
        }
    }

    // ---------------------------------------------------------------- VetAppointments

    @Nested
    class VetAppointments {

        private final String path = API + "/pets/" + PET_ID + "/vet-appointments";

        @Test
        void getAppointments_200ConVetAppointmentResponse() throws Exception {
            when(vetAppointmentService.findAllByPet(USER_ID, PET_ID)).thenReturn(List.of(new VetAppointmentResponseDTO(
                    UUID.randomUUID(), null, null, OffsetDateTime.parse("2026-11-20T09:00:00Z"))));

            mvc.perform(get(path).with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].description").value(nullValue()))
                    .andExpect(jsonPath("$[0].cost").value(nullValue()))
                    .andExpect(jsonPath("$[0].appointmentDate").value("2026-11-20T09:00:00Z"));
        }

        @Test
        void createAppointment_201AdmiteFechaFutura() throws Exception {
            when(vetAppointmentService.create(eq(USER_ID), eq(PET_ID), any())).thenReturn(new VetAppointmentResponseDTO(
                    UUID.randomUUID(), "Vacuna", new BigDecimal("45.00"), OffsetDateTime.parse("2999-01-01T09:00:00Z")));

            mvc.perform(json(post(path), "{\"description\":\"Vacuna\",\"cost\":45,\"appointmentDate\":\"2999-01-01T09:00:00Z\"}")
                            .with(AUTH))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.cost").value(45.0));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{\"description\":\"Vacuna\"}",                                              // falta appointmentDate
                "{\"cost\":-1,\"appointmentDate\":\"2026-11-20T09:00:00Z\"}",                // minimum 0
                "{\"cost\":45.555,\"appointmentDate\":\"2026-11-20T09:00:00Z\"}",            // multipleOf 0.01
                "{\"cost\":100000000,\"appointmentDate\":\"2026-11-20T09:00:00Z\"}",         // maximum 99999999.99
        })
        void createAppointment_400SiNoCumpleVetAppointmentRequest(String body) throws Exception {
            mvc.perform(json(post(path), body).with(AUTH)).andExpect(status().isBadRequest());
            verify(vetAppointmentService, never()).create(any(), any(), any());
        }

        @Test
        void createAppointment_400SiDescriptionSuperaMaxLength2000() throws Exception {
            String body = "{\"description\":\"%s\",\"appointmentDate\":\"2026-11-20T09:00:00Z\"}".formatted("a".repeat(2001));
            mvc.perform(json(post(path), body).with(AUTH)).andExpect(status().isBadRequest());
        }

        @Test
        void appointments_404SiLaMascotaNoEsDelUsuario() throws Exception {
            petNotFound();
            mvc.perform(get(path).with(AUTH)).andExpect(status().isNotFound());
            mvc.perform(json(post(path), "{\"appointmentDate\":\"2026-11-20T09:00:00Z\"}").with(AUTH))
                    .andExpect(status().isNotFound());
        }
    }

    // ---------------------------------------------------------------- Expenses

    @Nested
    class Expenses {

        private final String path = API + "/pets/" + PET_ID + "/expenses";
        private final String valid = "{\"category\":\"FOOD\",\"amount\":24.9,\"expenseDate\":\"2026-10-01\"}";

        @Test
        void getExpenses_200ConExpenseResponse() throws Exception {
            when(expenseService.findAllByPet(USER_ID, PET_ID)).thenReturn(List.of(new ExpenseResponseDTO(
                    UUID.randomUUID(), ExpenseCategory.FOOD, null, new BigDecimal("24.90"), LocalDate.of(2026, 10, 1))));

            mvc.perform(get(path).with(AUTH))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].category").value("FOOD"))
                    .andExpect(jsonPath("$[0].description").value(nullValue()))
                    .andExpect(jsonPath("$[0].amount").value(24.9))
                    // format: date, no date-time
                    .andExpect(jsonPath("$[0].expenseDate").value("2026-10-01"));
        }

        @Test
        void createExpense_201ConExpenseResponse() throws Exception {
            when(expenseService.create(eq(USER_ID), eq(PET_ID), any())).thenReturn(new ExpenseResponseDTO(
                    UUID.randomUUID(), ExpenseCategory.FOOD, null, new BigDecimal("24.90"), LocalDate.of(2026, 10, 1)));

            mvc.perform(json(post(path), valid).with(AUTH))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.amount").value(24.9));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "{\"amount\":24.9,\"expenseDate\":\"2026-10-01\"}",                         // falta category
                "{\"category\":\"COMIDA\",\"amount\":24.9,\"expenseDate\":\"2026-10-01\"}", // fuera del enum
                "{\"category\":\"FOOD\",\"expenseDate\":\"2026-10-01\"}",                   // falta amount
                "{\"category\":\"FOOD\",\"amount\":0,\"expenseDate\":\"2026-10-01\"}",      // exclusiveMinimum 0
                "{\"category\":\"FOOD\",\"amount\":24.999,\"expenseDate\":\"2026-10-01\"}", // multipleOf 0.01
                "{\"category\":\"FOOD\",\"amount\":100000000,\"expenseDate\":\"2026-10-01\"}", // maximum
                "{\"category\":\"FOOD\",\"amount\":24.9}",                                  // falta expenseDate
                "{\"category\":\"FOOD\",\"amount\":24.9,\"expenseDate\":\"2999-01-01\"}",   // futura
                "{\"category\":\"FOOD\",\"amount\":24.9,\"expenseDate\":\"01/10/2026\"}",   // format date
        })
        void createExpense_400SiNoCumpleExpenseRequest(String body) throws Exception {
            mvc.perform(json(post(path), body).with(AUTH)).andExpect(status().isBadRequest());
            verify(expenseService, never()).create(any(), any(), any());
        }

        @Test
        void expenses_404SiLaMascotaNoEsDelUsuario() throws Exception {
            petNotFound();
            mvc.perform(get(path).with(AUTH)).andExpect(status().isNotFound());
            mvc.perform(json(post(path), valid).with(AUTH)).andExpect(status().isNotFound());
        }
    }

    // ---------------------------------------------------------------- utilidades

    private static MockMultipartFile png() {
        return new MockMultipartFile("file", "toby.png", "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A});
    }
}
