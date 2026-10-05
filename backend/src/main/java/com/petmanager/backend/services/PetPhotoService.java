package com.petmanager.backend.services;

import com.petmanager.backend.dtos.PetResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.UUID;

/**
 * Sustituye la foto de una mascota: valida la imagen, la sube a Supabase Storage,
 * guarda la URL pública en la mascota y borra la foto anterior.
 *
 * No es @Transactional a propósito: la subida HTTP ocurre fuera de la transacción de BD
 * (PetService.updatePhotoUrl abre la suya) para no mantener una conexión ocupada durante la subida.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PetPhotoService {

    private final PetService petService;
    private final PhotoStorageService storage;

    public PetResponseDTO replacePhoto(UUID ownerId, UUID petId, MultipartFile file) {
        // 404 si la mascota no existe o es de otro usuario, antes de subir nada
        petService.findById(ownerId, petId);

        byte[] bytes = readAndValidate(file);
        ImageType type = ImageType.detect(bytes);
        String path = "%s/%s/%s.%s".formatted(ownerId, petId, UUID.randomUUID(), type.extension);

        String newUrl;
        try {
            newUrl = storage.upload(path, bytes, type.mimeType);
        } catch (RestClientException e) {
            log.error("Error subiendo la foto a Supabase Storage: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo guardar la foto");
        }

        PetPhotoUpdate update;
        try {
            update = petService.updatePhotoUrl(ownerId, petId, newUrl);
        } catch (RuntimeException e) {
            // La BD no se actualizó: no dejar la foto nueva huérfana
            storage.deleteByPublicUrl(newUrl);
            throw e;
        }

        if (update.previousPhotoUrl() != null) {
            storage.deleteByPublicUrl(update.previousPhotoUrl());
        }
        return update.pet();
    }

    private static byte[] readAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se ha enviado ninguna imagen");
        }
        if (file.getSize() > PhotoStorageService.MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen supera los 5 MB");
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pudo leer la imagen");
        }
    }

    public record PetPhotoUpdate(PetResponseDTO pet, String previousPhotoUrl) {
    }

    /** Tipo real del archivo según sus primeros bytes (no se confía en el Content-Type del cliente) */
    private enum ImageType {
        JPEG("image/jpeg", "jpg"),
        PNG("image/png", "png"),
        WEBP("image/webp", "webp");

        final String mimeType;
        final String extension;

        ImageType(String mimeType, String extension) {
            this.mimeType = mimeType;
            this.extension = extension;
        }

        static ImageType detect(byte[] b) {
            if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
                return JPEG;
            }
            if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
                return PNG;
            }
            if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                    && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
                return WEBP;
            }
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato no admitido: usa JPG, PNG o WebP");
        }
    }
}
