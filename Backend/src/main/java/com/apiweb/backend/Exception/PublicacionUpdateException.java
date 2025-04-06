package com.apiweb.backend.Exception;

public class PublicacionUpdateException extends RuntimeException {

    public PublicacionUpdateException(String message) {
        super(message);
    }

    public PublicacionUpdateException(String message, Throwable cause) {
        super(message, cause);
    }
}