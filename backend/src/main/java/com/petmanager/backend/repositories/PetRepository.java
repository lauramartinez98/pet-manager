package com.petmanager.backend.repositories;

import com.petmanager.backend.entities.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PetRepository extends JpaRepository<Pet, UUID> {

    List<Pet> findByOwnerIdOrderByNameAsc(UUID ownerId);

    // Filtran también por dueño: una mascota ajena se comporta igual que una inexistente
    Optional<Pet> findByIdAndOwnerId(UUID id, UUID ownerId);

    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);
}
