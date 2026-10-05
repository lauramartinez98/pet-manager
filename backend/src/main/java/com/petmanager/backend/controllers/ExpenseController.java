package com.petmanager.backend.controllers;

import com.petmanager.backend.dtos.ExpenseRequestDTO;
import com.petmanager.backend.dtos.ExpenseResponseDTO;
import com.petmanager.backend.services.CurrentUserService;
import com.petmanager.backend.services.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets/{petId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CurrentUserService currentUserService;

    /** GET /pets/{petId}/expenses: gastos de la mascota, del más reciente al más antiguo. */
    @GetMapping
    public ResponseEntity<List<ExpenseResponseDTO>> findAll(@PathVariable UUID petId) {
        return ResponseEntity.ok(expenseService.findAllByPet(currentUserService.getCurrentUserId(), petId));
    }

    /** POST /pets/{petId}/expenses: registra un gasto y responde 201 con el gasto creado. */
    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> create(@PathVariable UUID petId,
                                                     @Valid @RequestBody ExpenseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.create(currentUserService.getCurrentUserId(), petId, request));
    }
}
