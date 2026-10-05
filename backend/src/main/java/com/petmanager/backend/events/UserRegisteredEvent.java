package com.petmanager.backend.events;

// Se publica al crear una cuenta (email/contraseña o Google). Lo escucha WelcomeEmailService
public record UserRegisteredEvent(String email, String fullName) {
}
