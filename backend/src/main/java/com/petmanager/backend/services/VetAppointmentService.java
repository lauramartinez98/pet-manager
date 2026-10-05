package com.petmanager.backend.services;

import com.petmanager.backend.dtos.VetAppointmentRequestDTO;
import com.petmanager.backend.dtos.VetAppointmentResponseDTO;
import com.petmanager.backend.entities.VetAppointment;
import com.petmanager.backend.repositories.VetAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VetAppointmentService {

    private final VetAppointmentRepository vetAppointmentRepository;
    private final PetService petService;

    @Transactional
    public VetAppointmentResponseDTO create(UUID ownerId, UUID petId, VetAppointmentRequestDTO request) {
        VetAppointment appointment = VetAppointment.builder()
                .pet(petService.getPetOrThrow(ownerId, petId))
                .description(request.description())
                .cost(request.cost())
                .appointmentDate(request.appointmentDate())
                .build();

        return VetAppointmentResponseDTO.from(vetAppointmentRepository.save(appointment));
    }

    public List<VetAppointmentResponseDTO> findAllByPet(UUID ownerId, UUID petId) {
        petService.assertPetExists(ownerId, petId);
        return vetAppointmentRepository.findByPetIdOrderByAppointmentDateAsc(petId).stream()
                .map(VetAppointmentResponseDTO::from)
                .toList();
    }
}
