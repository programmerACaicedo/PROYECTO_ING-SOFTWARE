package com.apiweb.backend.Exception;

public class PublicacionCreateException extends RuntimeException {

    public PublicacionCreateException(String message) {
        super(message);
    }

    public PublicacionCreateException(String message, Throwable cause) {
        super(message, cause);
    }
}