package com.petmanager.backend.services;

import com.petmanager.backend.dtos.AuthResponseDTO;
import com.petmanager.backend.dtos.LoginRequestDTO;
import com.petmanager.backend.dtos.UserRequestDTO;
import com.petmanager.backend.dtos.UserResponseDTO;
import com.petmanager.backend.entities.User;
import com.petmanager.backend.events.UserRegisteredEvent;
import com.petmanager.backend.exceptions.EmailAlreadyUsedException;
import com.petmanager.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final ApplicationEventPublisher events;

    /** Crea la cuenta (email normalizado, contraseña hasheada), lanza el evento del correo de bienvenida y devuelve ya un token de sesión. 409 si el email existe. */
    @Transactional
    public AuthResponseDTO register(UserRequestDTO request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException();
        }

        User user = userRepository.save(User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .birthDate(request.birthDate())
                .build());

        // El correo de bienvenida se envía tras el commit (WelcomeEmailService)
        events.publishEvent(new UserRegisteredEvent(user.getEmail(), user.getFullName()));
        return tokenService.issue(user);
    }

    /**
     * Login con Google: entra en la cuenta con ese email o la crea si no existe.
     * Solo se fía de emails verificados por Google, porque si no cualquiera podría entrar en una cuenta ajena.
     */
    @Transactional
    public AuthResponseDTO loginWithGoogle(String rawEmail, String fullName, boolean emailVerified) {
        if (!emailVerified) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "El email de Google no está verificado");
        }
        String email = normalize(rawEmail);
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User created = userRepository.save(User.builder()
                    .email(email)
                    .fullName(fullName == null || fullName.isBlank() ? email.substring(0, email.indexOf('@')) : fullName.trim())
                    // Sin contraseña propia: un hash aleatorio impide el login por contraseña hasta que se defina una
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build());
            events.publishEvent(new UserRegisteredEvent(created.getEmail(), created.getFullName()));
            return created;
        });
        return tokenService.issue(user);
    }

    /** Inicia sesión con email y contraseña y devuelve un token; 401 con el mismo mensaje tanto si falla el email como la contraseña. */
    public AuthResponseDTO login(LoginRequestDTO request) {
        // Mismo error para email inexistente y contraseña incorrecta: no revela qué cuentas existen
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));

        return tokenService.issue(user);
    }

    /** Devuelve el usuario de la sesión; 401 si el token es válido pero la cuenta ya no existe. */
    public UserResponseDTO me(UUID userId) {
        return userRepository.findById(userId)
                .map(UserResponseDTO::from)
                // Token válido pero la cuenta ya no existe
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La cuenta no existe"));
    }

    /** Normaliza el email (sin espacios y en minúsculas) para que no haya cuentas duplicadas por mayúsculas. */
    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
