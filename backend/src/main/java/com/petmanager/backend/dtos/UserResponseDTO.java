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

    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(user.getId(), user.getFullName(), user.getEmail(), user.getBirthDate());
    }
}
