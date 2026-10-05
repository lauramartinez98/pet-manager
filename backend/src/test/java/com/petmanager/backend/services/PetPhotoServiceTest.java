package com.petmanager.backend.services;

import com.petmanager.backend.dtos.PetResponseDTO;
import com.petmanager.backend.entities.enums.Species;
import com.petmanager.backend.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** Respuestas 400/404/413/415/502 de PUT /pets/{petId}/photo definidas en api-docs/openapi.yaml */
@ExtendWith(MockitoExtension.class)
class PetPhotoServiceTest {

    private static final UUID OWNER = UUID.randomUUID();
    private static final UUID PET = UUID.randomUUID();
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};

    @Mock PetService petService;
    @Mock PhotoStorageService storage;
    @InjectMocks PetPhotoService service;

    private static MockMultipartFile file(byte[] bytes, String declaredType) {
        return new MockMultipartFile("file", "foto", declaredType, bytes);
    }

    private static int statusOf(Throwable e) {
        return ((ResponseStatusException) e).getStatusCode().value();
    }

    @ParameterizedTest
    @ValueSource(strings = {"png", "jpg", "webp"})
    void formatosAdmitidosSeSubenConSuTipoReal(String format) {
        byte[] bytes = switch (format) {
            case "png" -> PNG;
            case "jpg" -> JPEG;
            default -> WEBP;
        };
        PetResponseDTO updated = new PetResponseDTO(PET, "Toby", Species.PERRO, null, null, null, null, "url-nueva");
        when(storage.upload(anyString(), any(), anyString())).thenReturn("url-nueva");
        when(petService.updatePhotoUrl(OWNER, PET, "url-nueva"))
                .thenReturn(new PetPhotoService.PetPhotoUpdate(updated, "url-vieja"));

        // El Content-Type declarado no importa: manda el contenido
        assertThat(service.replacePhoto(OWNER, PET, file(bytes, "application/octet-stream")).photoUrl()).isEqualTo("url-nueva");

        verify(storage).upload(org.mockito.ArgumentMatchers.endsWith("." + format), eq(bytes),
                eq("image/" + (format.equals("jpg") ? "jpeg" : format)));
        verify(storage).deleteByPublicUrl("url-vieja");
    }

    @Test
    void archivoVacio_400() {
        assertThatThrownBy(() -> service.replacePhoto(OWNER, PET, file(new byte[0], "image/png")))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_REQUEST.value()));
        verifyNoInteractions(storage);
    }

    @Test
    void masDe5MB_413() {
        byte[] big = Arrays.copyOf(PNG, (int) PhotoStorageService.MAX_BYTES + 1);
        assertThatThrownBy(() -> service.replacePhoto(OWNER, PET, file(big, "image/png")))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE.value()));
        verifyNoInteractions(storage);
    }

    @Test
    void formatoNoAdmitidoAunqueDigaSerImagen_415() {
        byte[] gif = {'G', 'I', 'F', '8', '9', 'a', 0, 0};
        assertThatThrownBy(() -> service.replacePhoto(OWNER, PET, file(gif, "image/png")))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value()));
        verifyNoInteractions(storage);
    }

    @Test
    void mascotaAjena_404AntesDeSubirNada() {
        when(petService.findById(OWNER, PET)).thenThrow(new ResourceNotFoundException("Mascota", PET));
        assertThatThrownBy(() -> service.replacePhoto(OWNER, PET, file(PNG, "image/png")))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(storage);
    }

    @Test
    void falloDeSupabase_502() {
        when(storage.upload(anyString(), any(), anyString())).thenThrow(new RestClientException("caído"));
        assertThatThrownBy(() -> service.replacePhoto(OWNER, PET, file(PNG, "image/png")))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_GATEWAY.value()));
    }
}
