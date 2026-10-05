package com.petmanager.backend.dtos;

import java.time.Instant;

// Contrato: #/components/schemas/AuthResponse en api-docs/openapi.yaml
public record AuthResponseDTO(
        String token,
        Instant expiresAt,
        UserResponseDTO user
) {
}
