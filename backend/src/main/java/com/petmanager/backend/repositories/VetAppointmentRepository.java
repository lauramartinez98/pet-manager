package com.petmanager.backend.repositories;

import com.petmanager.backend.entities.VetAppointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VetAppointmentRepository extends JpaRepository<VetAppointment, UUID> {

    List<VetAppointment> findByPetIdOrderByAppointmentDateAsc(UUID petId);
}
