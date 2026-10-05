package com.petmanager.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

// Habilita @Async (p. ej. el envío del correo de bienvenida sin bloquear el registro)
@Configuration
@EnableAsync
public class AsyncConfig {
}
