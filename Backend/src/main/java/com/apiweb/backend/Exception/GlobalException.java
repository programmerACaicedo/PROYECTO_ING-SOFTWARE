package com.apiweb.backend.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

// Clase para manejar excepciones globales
@RestControllerAdvice
public class GlobalException {

    // Manejo genérico de excepciones
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGlobalException(Exception ex, WebRequest request) {
        return new ResponseEntity<>("Ocurrió un error inesperado: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Manejo de excepciones para registro de usuario
    @ExceptionHandler(UserRegistrationException.class)
    public ResponseEntity<String> handleUserRegistrationException(UserRegistrationException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // Manejo de excepciones para inicio de sesión
    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<String> handleLoginException(LoginFailedException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    // Manejo de excepciones para actualización de usuario
    @ExceptionHandler(UserUpdateException.class)
    public ResponseEntity<String> handleUserUpdateException(UserUpdateException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
    }

    // Manejo de excepciones para eliminación de usuario
    @ExceptionHandler(UserDeletionException.class)
    public ResponseEntity<String> handleUserDeletionException(UserDeletionException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // Manejo de excepciones para creación de inmueble
    @ExceptionHandler(InmuebleCreateException.class)
    public ResponseEntity<String> handleInmuebleCreateException(InmuebleCreateException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // Manejo de excepciones para actualización de inmueble
    @ExceptionHandler(InmuebleUpdateException.class)
    public ResponseEntity<String> handleInmuebleUpdateException(InmuebleUpdateException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
    }

    // Manejo de excepciones para eliminación de usuario
    @ExceptionHandler(InmuebleDeletionException.class)
    public ResponseEntity<String> handleInmuebleDeletionException(InmuebleDeletionException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // Manejo de excepciones para creación de publicación
    @ExceptionHandler(PublicacionCreateException.class)
    public ResponseEntity<String> handlePublicacionCreateException(PublicacionCreateException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // Manejo de excepciones para actualización de publicación
    @ExceptionHandler(PublicacionUpdateException.class)
    public ResponseEntity<String> handlePublicacionUpdateException(PublicacionUpdateException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
    }

    // Manejo de excepciones para eliminación de publicación
    @ExceptionHandler(PublicacionDeletionException.class)
    public ResponseEntity<String> handlePublicacionDeletionException(PublicacionDeletionException ex, WebRequest request) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    //Excepciones de vila
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleInvalidFormat(HttpMessageNotReadableException ex) {
        String detalle = ex.getMostSpecificCause().getMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Formato inválido en la solicitud: " + detalle);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND); // 404 Not Found
    }

    @ExceptionHandler(InvalidUserRoleException.class)
    public ResponseEntity<String> handleInvalidUserRoleException(InvalidUserRoleException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST); // 400 Bad Request
    }

    @ExceptionHandler(InvalidAvisoConfigurationException.class)
    public ResponseEntity<String> handleInvalidAvisoConfigurationException(InvalidAvisoConfigurationException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST); // 400 Bad Request
    }
}