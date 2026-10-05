package com.petmanager.backend.services;

import com.petmanager.backend.dtos.WalkRequestDTO;
import com.petmanager.backend.dtos.WalkResponseDTO;
import com.petmanager.backend.entities.Walk;
import com.petmanager.backend.repositories.WalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalkService {

    private final WalkRepository walkRepository;
    private final PetService petService;

    /** Registra un paseo en una mascota del usuario (404 si no es suya). */
    @Transactional
    public WalkResponseDTO create(UUID ownerId, UUID petId, WalkRequestDTO request) {
        Walk walk = Walk.builder()
                .pet(petService.getPetOrThrow(ownerId, petId))
                .distanceKm(request.distanceKm())
                .durationMinutes(request.durationMinutes())
                .didPee(request.didPee())
                .didPoop(request.didPoop())
                .walkDatetime(request.walkDatetime())
                .build();

        return WalkResponseDTO.from(walkRepository.save(walk));
    }

    /** Historial completo de paseos de una mascota del usuario, del más reciente al más antiguo. */
    public List<WalkResponseDTO> findAllByPet(UUID ownerId, UUID petId) {
        petService.assertPetExists(ownerId, petId);
        return walkRepository.findByPetIdOrderByWalkDatetimeDesc(petId).stream()
                .map(WalkResponseDTO::from)
                .toList();
    }

    /** Paseos de un día concreto en la zona horaria del usuario (p. ej. "paseos de hoy") */
    public List<WalkResponseDTO> findAllByPetAndDay(UUID ownerId, UUID petId, LocalDate day, ZoneId zone) {
        petService.assertPetExists(ownerId, petId);
        OffsetDateTime from = day.atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime to = day.plusDays(1).atStartOfDay(zone).toOffsetDateTime();
        return walkRepository.findByPetIdInRange(petId, from, to).stream()
                .map(WalkResponseDTO::from)
                .toList();
    }
}
