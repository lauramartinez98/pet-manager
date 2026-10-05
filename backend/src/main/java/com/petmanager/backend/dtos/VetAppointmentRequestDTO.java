package com.petmanager.backend.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

// Sin petId: va en la ruta (/api/pets/{petId}/vet-appointments). La fecha puede ser futura (citas próximas)
public record VetAppointmentRequestDTO(
        @Size(max = 2000) String description,
        @DecimalMin("0.0") @Digits(integer = 8, fraction = 2) BigDecimal cost,
        @NotNull OffsetDateTime appointmentDate
) {
}
