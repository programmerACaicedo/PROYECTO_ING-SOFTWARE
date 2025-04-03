package com.apiweb.backend.Exception;

public class InmuebleCreateException extends RuntimeException {

    public InmuebleCreateException(String message) {
        super(message);
    }

    public InmuebleCreateException(String message, Throwable cause) {
        super(message, cause);
    }
}

