package com.petmanager.backend.controllers;

import com.petmanager.backend.dtos.PetRequestDTO;
import com.petmanager.backend.dtos.PetResponseDTO;
import com.petmanager.backend.services.CurrentUserService;
import com.petmanager.backend.services.PetPhotoService;
import com.petmanager.backend.services.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final CurrentUserService currentUserService;
    private final PetPhotoService petPhotoService;

    /** Contrato: GET /pets -> mascotas del usuario autenticado */
    @GetMapping
    public ResponseEntity<List<PetResponseDTO>> findAll() {
        return ResponseEntity.ok(petService.findAllByOwner(currentUserService.getCurrentUserId()));
    }

    /** GET /pets/{petId}: detalle de una mascota del usuario (404 si no existe o es de otro). */
    @GetMapping("/{petId}")
    public ResponseEntity<PetResponseDTO> findById(@PathVariable UUID petId) {
        return ResponseEntity.ok(petService.findById(currentUserService.getCurrentUserId(), petId));
    }

    /** Contrato: POST /pets -> 201 sin cuerpo (la URL del recurso va en la cabecera Location) */
    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody PetRequestDTO request) {
        PetResponseDTO created = petService.create(currentUserService.getCurrentUserId(), request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).build();
    }

    /** Sustituye la foto (multipart, campo "file"). Devuelve la mascota con la nueva photoUrl */
    @PutMapping(path = "/{petId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PetResponseDTO> replacePhoto(@PathVariable UUID petId,
                                                       @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(petPhotoService.replacePhoto(currentUserService.getCurrentUserId(), petId, file));
    }
}
