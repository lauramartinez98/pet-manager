package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.enums.Species;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

// Contrato: #/components/schemas/PetRequest en api-docs/openapi.yaml
// Sin ownerId: el dueño es el usuario autenticado
public record PetRequestDTO(
        @NotBlank @Size(max = 100) String name,
        @NotNull Species species,
        @Size(max = 100) String breed,
        @DecimalMin(value = "0.0", inclusive = false) @DecimalMax("999.99") @Digits(integer = 3, fraction = 2)
        BigDecimal weightKg,
        String personality,
        String pathologies
) {
}
