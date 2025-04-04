package com.apiweb.backend.Exception;

public class InmuebleNotFoundException extends RuntimeException {

    public InmuebleNotFoundException(String message) {
        super(message);
    }

    public InmuebleNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
