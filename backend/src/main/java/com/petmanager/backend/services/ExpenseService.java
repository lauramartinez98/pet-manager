package com.petmanager.backend.services;

import com.petmanager.backend.dtos.ExpenseRequestDTO;
import com.petmanager.backend.dtos.ExpenseResponseDTO;
import com.petmanager.backend.entities.Expense;
import com.petmanager.backend.repositories.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final PetService petService;

    @Transactional
    public ExpenseResponseDTO create(UUID ownerId, UUID petId, ExpenseRequestDTO request) {
        Expense expense = Expense.builder()
                .pet(petService.getPetOrThrow(ownerId, petId))
                .category(request.category())
                .description(request.description())
                .amount(request.amount())
                .expenseDate(request.expenseDate())
                .build();

        return ExpenseResponseDTO.from(expenseRepository.save(expense));
    }

    public List<ExpenseResponseDTO> findAllByPet(UUID ownerId, UUID petId) {
        petService.assertPetExists(ownerId, petId);
        return expenseRepository.findByPetIdOrderByExpenseDateDesc(petId).stream()
                .map(ExpenseResponseDTO::from)
                .toList();
    }
}
