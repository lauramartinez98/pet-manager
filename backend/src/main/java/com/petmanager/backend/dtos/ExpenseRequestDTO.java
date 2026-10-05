package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.enums.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

// Sin petId: va en la ruta (/api/pets/{petId}/expenses)
public record ExpenseRequestDTO(
        @NotNull ExpenseCategory category,
        @Size(max = 2000) String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 8, fraction = 2)
        BigDecimal amount,
        @NotNull @PastOrPresent LocalDate expenseDate
) {
}
