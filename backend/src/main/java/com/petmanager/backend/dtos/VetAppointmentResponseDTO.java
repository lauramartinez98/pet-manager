package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.VetAppointment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record VetAppointmentResponseDTO(
        UUID id,
        String description,
        BigDecimal cost,
        OffsetDateTime appointmentDate
) {

    public static VetAppointmentResponseDTO from(VetAppointment appointment) {
        return new VetAppointmentResponseDTO(
                appointment.getId(),
                appointment.getDescription(),
                appointment.getCost(),
                appointment.getAppointmentDate());
    }
}
