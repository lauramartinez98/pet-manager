package com.petmanager.backend.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

// Sin petId: va en la ruta (/api/pets/{petId}/walks)
public record WalkRequestDTO(
        @DecimalMin(value = "0.0", inclusive = false) @DecimalMax("9999.99") @Digits(integer = 4, fraction = 2)
        BigDecimal distanceKm,
        @Positive @Max(1440) Integer durationMinutes,
        @NotNull Boolean didPee,
        @NotNull Boolean didPoop,
        @NotNull @PastOrPresent OffsetDateTime walkDatetime
) {
}
