package com.petmanager.backend.config;

import com.petmanager.backend.dtos.AuthResponseDTO;
import com.petmanager.backend.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Final del login con Google: emite nuestro JWT y vuelve al frontend.
 * El token va en el fragmento (#token=...) para que no llegue a ningún servidor ni a los logs de acceso.
 */
@Slf4j
@Component
public class GoogleLoginHandlers implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final AuthService authService;
    private final String frontendUrl;

    public GoogleLoginHandlers(AuthService authService, @Value("${app.frontend-url}") String frontendUrl) {
        this.authService = authService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        endTemporarySession(request);
        if (!(authentication.getPrincipal() instanceof OidcUser google)) {
            response.sendRedirect(frontendUrl + "/login?error=google");
            return;
        }
        try {
            AuthResponseDTO auth = authService.loginWithGoogle(
                    google.getEmail(), google.getFullName(), Boolean.TRUE.equals(google.getEmailVerified()));
            String token = URLEncoder.encode(auth.token(), StandardCharsets.UTF_8);
            response.sendRedirect(frontendUrl + "/auth/callback#token=" + token);
        } catch (ResponseStatusException e) {
            log.warn("Login con Google rechazado: {}", e.getReason());
            response.sendRedirect(frontendUrl + "/login?error=google");
        }
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        // Incluye cuando el usuario cancela en la pantalla de Google
        log.info("Login con Google fallido o cancelado: {}", exception.getMessage());
        endTemporarySession(request);
        response.sendRedirect(frontendUrl + "/login?error=google");
    }

    // La sesión solo sirve para guardar el "state" del flujo OAuth2; después la API es sin estado (JWT)
    private static void endTemporarySession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }
}
