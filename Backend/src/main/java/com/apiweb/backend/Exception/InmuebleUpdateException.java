package com.apiweb.backend.Exception;

public class InmuebleUpdateException extends RuntimeException {

    public InmuebleUpdateException(String message) {
        super(message);
    }

    public InmuebleUpdateException(String message, Throwable cause) {
        super(message, cause);
    }
}