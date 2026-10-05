package com.petmanager.backend.services;

import com.petmanager.backend.config.SupabaseProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Cliente mínimo de la API REST de Supabase Storage (subir, borrar, URL pública).
 * Usa la clave service_role, que salta las políticas RLS: por eso solo se usa en el backend
 * y la comprobación de propiedad de la mascota se hace antes, en PetPhotoService.
 */
@Slf4j
@Service
@EnableConfigurationProperties(SupabaseProperties.class)
public class PhotoStorageService implements ApplicationRunner {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    private final SupabaseProperties properties;
    private final RestClient client;

    /** Prepara el cliente HTTP de Supabase Storage autenticado con la service key (solo en el backend). */
    public PhotoStorageService(SupabaseProperties properties) {
        this.properties = properties;
        this.client = RestClient.builder()
                .baseUrl(properties.baseUrl() + "/storage/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.serviceKey())
                .defaultHeader("apikey", properties.serviceKey())
                .build();
    }

    /** Al arrancar, crea el bucket público si todavía no existe (idempotente) */
    @Override
    public void run(ApplicationArguments args) {
        String bucket = properties.photosBucket();
        try {
            client.get().uri("/bucket/{id}", bucket).retrieve().toBodilessEntity();
        } catch (RestClientResponseException notFound) {
            try {
                client.post().uri("/bucket")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of(
                                "id", bucket,
                                "name", bucket,
                                "public", true,
                                "file_size_limit", MAX_BYTES,
                                "allowed_mime_types", List.of("image/jpeg", "image/png", "image/webp")))
                        .retrieve()
                        .toBodilessEntity();
                log.info("Bucket de Supabase Storage creado: {}", bucket);
            } catch (RestClientException e) {
                log.warn("No se pudo crear el bucket {}: {}", bucket, e.getMessage());
            }
        } catch (RestClientException e) {
            log.warn("No se pudo comprobar el bucket {} (¿SUPABASE_URL correcta?): {}", bucket, e.getMessage());
        }
    }

    /** Sube el archivo y devuelve su URL pública */
    public String upload(String path, byte[] content, String contentType) {
        client.post().uri("/object/{bucket}/{path}", properties.photosBucket(), path)
                .contentType(MediaType.parseMediaType(contentType))
                // Las fotos no cambian nunca (cada subida tiene un nombre nuevo): caché larga
                .header("cache-control", "max-age=31536000")
                .header("x-upsert", "false")
                .body(content)
                .retrieve()
                .toBodilessEntity();
        return publicUrl(path);
    }

    /** Borra un archivo a partir de su URL pública. Si falla solo queda un archivo huérfano: se registra y sigue */
    public void deleteByPublicUrl(String publicUrl) {
        String prefix = publicUrl(""); // .../object/public/<bucket>/
        if (publicUrl == null || !publicUrl.startsWith(prefix)) return;
        String path = publicUrl.substring(prefix.length());
        try {
            client.delete().uri("/object/{bucket}/{path}", properties.photosBucket(), path)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("No se pudo borrar la foto antigua {}: {}", path, e.getMessage());
        }
    }

    /** URL pública de un archivo del bucket de fotos. */
    private String publicUrl(String path) {
        return properties.baseUrl() + "/storage/v1/object/public/" + properties.photosBucket() + "/" + path;
    }
}
