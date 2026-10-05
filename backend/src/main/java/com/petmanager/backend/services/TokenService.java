package com.petmanager.backend.services;

import com.petmanager.backend.config.JwtProperties;
import com.petmanager.backend.dtos.AuthResponseDTO;
import com.petmanager.backend.dtos.UserResponseDTO;
import com.petmanager.backend.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    /** El "sub" del token es el id del usuario; CurrentUserService lo lee de ahí */
    public AuthResponseDTO issue(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.expiration());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("email", user.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AuthResponseDTO(token, expiresAt, UserResponseDTO.from(user));
    }
}
