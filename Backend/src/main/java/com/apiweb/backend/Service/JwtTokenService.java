package com.apiweb.backend.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class JwtTokenService {

    @Value("${jwt.secret}") // Clave secreta desde application.properties
    private String secretKey;

    @Value("${jwt.expiration}") // Tiempo de expiración en milisegundos (24h)
    private long expirationMs;

    // Genera un token JWT con el ID del usuario y tiempo de expiración
    @SuppressWarnings("deprecation")
    public String generarToken(ObjectId userId) {
        return Jwts.builder()
                .setSubject(userId.toString()) // ID del usuario como sujeto del token
                .setIssuedAt(new Date()) // Fecha de creación
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // Expira en 24h
                .signWith(SignatureAlgorithm.HS512, secretKey) // Firma con algoritmo HS512
                .compact();
    }

    // Valida el token y retorna el ID del usuario si es válido
    public String validarToken(String token) {
        try {
            @SuppressWarnings("deprecation")
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.getSubject(); // Retorna el ID del usuario
        } catch (Exception e) {
            return null; // Token inválido o expirado
        }
    }
}
