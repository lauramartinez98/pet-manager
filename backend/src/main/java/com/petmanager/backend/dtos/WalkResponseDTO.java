package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.Walk;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

// Contrato: #/components/schemas/WalkResponse en api-docs/openapi.yaml
public record WalkResponseDTO(
        UUID id,
        BigDecimal distanceKm,
        Integer durationMinutes,
        boolean didPee,
        boolean didPoop,
        OffsetDateTime walkDatetime
) {

    /** Construye la respuesta de la API a partir de la entidad. */
    public static WalkResponseDTO from(Walk walk) {
        return new WalkResponseDTO(
                walk.getId(),
                walk.getDistanceKm(),
                walk.getDurationMinutes(),
                walk.getDidPee(),
                walk.getDidPoop(),
                walk.getWalkDatetime());
    }
}
