package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void enviarEmailVerificacion(String emailDestino, String nombreUsuario, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(emailDestino);
        mensaje.setSubject("Verificación de cuenta");
        mensaje.setText(
            "Hola " + nombreUsuario + ",\n\n" +
            "Por favor verifica tu cuenta haciendo clic en este enlace:\n" +
            "http://tudominio.com/api/auth/verificar?token=" + token + "\n\n" +
            "El enlace expirará en 24 horas."
        );
        mailSender.send(mensaje);
    }
}