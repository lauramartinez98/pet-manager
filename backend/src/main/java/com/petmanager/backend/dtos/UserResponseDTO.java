package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.User;

import java.time.LocalDate;
import java.util.UUID;

// Nunca expone passwordHash
public record UserResponseDTO(
        UUID id,
        String fullName,
        String email,
        LocalDate birthDate
) {

    /** Construye la respuesta de la API a partir de la entidad (sin el hash de la contraseña). */
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(user.getId(), user.getFullName(), user.getEmail(), user.getBirthDate());
    }
}
