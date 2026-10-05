package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.Pet;
import com.petmanager.backend.entities.enums.Species;

import java.math.BigDecimal;
import java.util.UUID;

// Contrato: #/components/schemas/PetResponse en api-docs/openapi.yaml (sin datos del dueño)
public record PetResponseDTO(
        UUID id,
        String name,
        Species species,
        String breed,
        BigDecimal weightKg,
        String personality,
        String pathologies,
        String photoUrl
) {

    /** Construye la respuesta de la API a partir de la entidad (sin datos del dueño). */
    public static PetResponseDTO from(Pet pet) {
        return new PetResponseDTO(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getWeightKg(),
                pet.getPersonality(),
                pet.getPathologies(),
                pet.getPhotoUrl());
    }
}
