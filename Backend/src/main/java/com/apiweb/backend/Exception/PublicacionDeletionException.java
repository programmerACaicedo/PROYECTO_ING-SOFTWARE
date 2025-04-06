package com.apiweb.backend.Exception;

public class PublicacionDeletionException extends RuntimeException {

    public PublicacionDeletionException(String message) {
        super(message);
    }

    public PublicacionDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}