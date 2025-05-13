package com.apiweb.backend.Exception;

public class InvalidAcuerdoConfigurationException extends RuntimeException {
    public InvalidAcuerdoConfigurationException(String message) {
        super(message);
    }

    public InvalidAcuerdoConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
    
}
