package com.apiweb.backend.Exception;

public class InmuebleDeletionException extends RuntimeException {

    public InmuebleDeletionException(String message) {
        super(message);
    }

    public InmuebleDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
