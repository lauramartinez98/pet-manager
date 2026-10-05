package com.petmanager.backend.controllers;

import com.petmanager.backend.dtos.VetAppointmentRequestDTO;
import com.petmanager.backend.dtos.VetAppointmentResponseDTO;
import com.petmanager.backend.services.CurrentUserService;
import com.petmanager.backend.services.VetAppointmentService;
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
@RequestMapping("/api/v1/pets/{petId}/vet-appointments")
@RequiredArgsConstructor
public class VetAppointmentController {

    private final VetAppointmentService vetAppointmentService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<VetAppointmentResponseDTO>> findAll(@PathVariable UUID petId) {
        return ResponseEntity.ok(vetAppointmentService.findAllByPet(currentUserService.getCurrentUserId(), petId));
    }

    @PostMapping
    public ResponseEntity<VetAppointmentResponseDTO> create(@PathVariable UUID petId,
                                                            @Valid @RequestBody VetAppointmentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vetAppointmentService.create(currentUserService.getCurrentUserId(), petId, request));
    }
}
