package com.apiweb.backend.Model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajesInteres {
    private String descripcion;
    private Instant fecha;
}
