package com.apiweb.backend.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class JwtTokenService {

    // Define una clave secreta fija (de al menos 64 caracteres)
    private static final String CLAVE_SECRETA_FIJA = "estaEsUnaClaveSecretaMuySeguraYDeAlMenos64CaracteresParaHS512";
    private static final Key CLAVE_SECRETA = Keys.hmacShaKeyFor(CLAVE_SECRETA_FIJA.getBytes());

    public String generarTokenVerificacion(String correo, long segundosExpiracion) {
        try {
            Date ahora = new Date();
            Date expiracion = new Date(ahora.getTime() + (segundosExpiracion * 1000));
    
            return Jwts.builder()
                    .setSubject(correo) // El correo será el "subject" del token
                    .setIssuedAt(ahora)
                    .setExpiration(expiracion)
                    .signWith(CLAVE_SECRETA) // Usa la clave secreta configurada
                    .compact();
        } catch (Exception e) {
            System.out.println("Error al generar el token: " + e.getMessage());
            throw new RuntimeException("Error al generar el token.");
        }
    }
    
    public String validarTokenVerificacion(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(CLAVE_SECRETA) // Usa la misma clave secreta que al generar el token
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject(); // Devuelve el "subject" (correo) del token
        } catch (Exception e) {
            System.out.println("Error al validar el token: " + e.getMessage());
            throw new RuntimeException("Token inválido o expirado.");
        }
    }
}