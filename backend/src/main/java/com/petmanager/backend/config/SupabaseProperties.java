package com.petmanager.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades app.supabase.* de application.properties.
 *
 * @param url          URL del proyecto (https://xxxx.supabase.co), de SUPABASE_URL
 * @param serviceKey   clave service_role, de SUPABASE_SERVICE_KEY. Nunca debe llegar al frontend
 * @param photosBucket bucket público donde se guardan las fotos de las mascotas
 */
@ConfigurationProperties(prefix = "app.supabase")
public record SupabaseProperties(String url, String serviceKey, String photosBucket) {

    public String baseUrl() {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
