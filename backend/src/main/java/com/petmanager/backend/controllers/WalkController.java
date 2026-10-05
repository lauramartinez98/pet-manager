package com.petmanager.backend.controllers;

import com.petmanager.backend.dtos.WalkRequestDTO;
import com.petmanager.backend.dtos.WalkResponseDTO;
import com.petmanager.backend.services.CurrentUserService;
import com.petmanager.backend.services.WalkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets/{petId}/walks")
@RequiredArgsConstructor
public class WalkController {

    private final WalkService walkService;
    private final CurrentUserService currentUserService;

    /** Sin parámetros: todos los paseos. Con ?date=2026-10-05&tz=Europe/Madrid: solo los de ese día */
    @GetMapping
    public ResponseEntity<List<WalkResponseDTO>> findAll(
            @PathVariable UUID petId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "Europe/Madrid") String tz) {
        if (date == null) {
            return ResponseEntity.ok(walkService.findAllByPet(currentUserService.getCurrentUserId(), petId));
        }
        return ResponseEntity.ok(walkService.findAllByPetAndDay(currentUserService.getCurrentUserId(), petId, date, parseZone(tz)));
    }

    /** POST /pets/{petId}/walks: registra un paseo y responde 201 con el paseo creado. */
    @PostMapping
    public ResponseEntity<WalkResponseDTO> create(@PathVariable UUID petId,
                                                  @Valid @RequestBody WalkRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(walkService.create(currentUserService.getCurrentUserId(), petId, request));
    }

    /** Convierte el parámetro tz en una zona horaria; si no es una zona IANA válida responde 400. */
    private static ZoneId parseZone(String tz) {
        try {
            return ZoneId.of(tz);
        } catch (DateTimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zona horaria no válida: " + tz);
        }
    }
}
