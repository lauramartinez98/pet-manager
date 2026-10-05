package com.petmanager.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Propiedades app.jwt.* de application.properties.
 *
 * @param secret     clave HMAC en Base64 (mínimo 256 bits), viene de JWT_SECRET en el .env
 * @param expiration validez del token (p. ej. 7d)
 * @param issuer     emisor que se firma en el token y se exige al validarlo
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {
}
