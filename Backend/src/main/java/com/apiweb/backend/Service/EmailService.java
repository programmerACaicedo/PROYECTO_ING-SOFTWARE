package com.apiweb.backend.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender emailSender;

    public EmailService(final JavaMailSender eMailSender){
        this.emailSender = eMailSender;
    }

    public void sendEmail(String to , String subject, String content){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom("ingenieriasoftware25@gmail.com");
        emailSender.send(message);
    }
}