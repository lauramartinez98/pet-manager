package com.petmanager.backend.services;

import com.petmanager.backend.dtos.PetRequestDTO;
import com.petmanager.backend.dtos.PetResponseDTO;
import com.petmanager.backend.entities.Pet;
import com.petmanager.backend.exceptions.ResourceNotFoundException;
import com.petmanager.backend.repositories.PetRepository;
import com.petmanager.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Todas las operaciones reciben el ownerId del usuario autenticado. Una mascota de otro dueño
 * responde 404 (igual que si no existiera) para no revelar qué ids existen.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    /** Crea una mascota cuyo dueño es el usuario autenticado. */
    @Transactional
    public PetResponseDTO create(UUID ownerId, PetRequestDTO request) {
        Pet pet = Pet.builder()
                // El token ya garantiza que el usuario existe: referencia sin consulta extra
                .owner(userRepository.getReferenceById(ownerId))
                .name(request.name())
                .species(request.species())
                .breed(request.breed())
                .weightKg(request.weightKg())
                .personality(request.personality())
                .pathologies(request.pathologies())
                .build();

        return PetResponseDTO.from(petRepository.save(pet));
    }

    /** Mascotas del usuario ordenadas por nombre. */
    public List<PetResponseDTO> findAllByOwner(UUID ownerId) {
        return petRepository.findByOwnerIdOrderByNameAsc(ownerId).stream()
                .map(PetResponseDTO::from)
                .toList();
    }

    /** Detalle de una mascota del usuario; 404 si no existe o es de otro. */
    public PetResponseDTO findById(UUID ownerId, UUID petId) {
        return PetResponseDTO.from(getPetOrThrow(ownerId, petId));
    }

    /** Guarda la nueva URL de la foto y devuelve la anterior para que se pueda borrar de Storage */
    @Transactional
    public PetPhotoService.PetPhotoUpdate updatePhotoUrl(UUID ownerId, UUID petId, String photoUrl) {
        Pet pet = getPetOrThrow(ownerId, petId);
        String previous = pet.getPhotoUrl();
        pet.setPhotoUrl(photoUrl);
        return new PetPhotoService.PetPhotoUpdate(PetResponseDTO.from(pet), previous);
    }

    // Uso interno de los servicios que cuelgan de una mascota (paseos, citas, gastos)

    Pet getPetOrThrow(UUID ownerId, UUID petId) {
        return petRepository.findByIdAndOwnerId(petId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota", petId));
    }

    void assertPetExists(UUID ownerId, UUID petId) {
        if (!petRepository.existsByIdAndOwnerId(petId, ownerId)) {
            throw new ResourceNotFoundException("Mascota", petId);
        }
    }
}
