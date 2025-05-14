package com.apiweb.backend.Exception;

public class InvalidMensajeriaConfigurationException extends RuntimeException{
    private static final long serialVersionUID = 1L;

    public InvalidMensajeriaConfigurationException(String message) {
        super(message);
    }
}
