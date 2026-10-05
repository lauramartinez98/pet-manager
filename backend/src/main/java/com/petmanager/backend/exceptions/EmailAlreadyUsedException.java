package com.petmanager.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyUsedException extends RuntimeException {

    /** Registro con un email que ya tiene cuenta (se traduce en un 409). */
    public EmailAlreadyUsedException() {
        super("Ya existe una cuenta con ese email");
    }
}
