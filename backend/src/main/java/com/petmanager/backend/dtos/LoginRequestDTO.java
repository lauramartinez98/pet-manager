package com.petmanager.backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Contrato: #/components/schemas/LoginRequest en api-docs/openapi.yaml
public record LoginRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
