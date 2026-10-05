package com.petmanager.backend.repositories;

import com.petmanager.backend.entities.Walk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface WalkRepository extends JpaRepository<Walk, UUID> {

    List<Walk> findByPetIdOrderByWalkDatetimeDesc(UUID petId);

    // Paseos en el rango [from, to), p. ej. los de hoy: [inicio del día, inicio del día siguiente)
    @Query("""
            select w from Walk w
            where w.pet.id = :petId and w.walkDatetime >= :from and w.walkDatetime < :to
            order by w.walkDatetime desc
            """)
    List<Walk> findByPetIdInRange(@Param("petId") UUID petId,
                                  @Param("from") OffsetDateTime from,
                                  @Param("to") OffsetDateTime to);
}
