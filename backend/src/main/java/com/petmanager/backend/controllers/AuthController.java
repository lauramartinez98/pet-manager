package com.petmanager.backend.controllers;

import com.petmanager.backend.dtos.AuthResponseDTO;
import com.petmanager.backend.dtos.LoginRequestDTO;
import com.petmanager.backend.dtos.UserRequestDTO;
import com.petmanager.backend.dtos.UserResponseDTO;
import com.petmanager.backend.services.AuthService;
import com.petmanager.backend.services.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    /** Público: crea la cuenta y devuelve ya un token (el usuario queda logueado) */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /** Público */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Requiere token: el frontend lo usa para validar una sesión guardada */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me() {
        return ResponseEntity.ok(authService.me(currentUserService.getCurrentUserId()));
    }
}
