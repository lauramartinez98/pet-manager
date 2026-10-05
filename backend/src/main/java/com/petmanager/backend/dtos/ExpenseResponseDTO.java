package com.petmanager.backend.dtos;

import com.petmanager.backend.entities.Expense;
import com.petmanager.backend.entities.enums.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponseDTO(
        UUID id,
        ExpenseCategory category,
        String description,
        BigDecimal amount,
        LocalDate expenseDate
) {

    /** Construye la respuesta de la API a partir de la entidad. */
    public static ExpenseResponseDTO from(Expense expense) {
        return new ExpenseResponseDTO(
                expense.getId(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getExpenseDate());
    }
}
