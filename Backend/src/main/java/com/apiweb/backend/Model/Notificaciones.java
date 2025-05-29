package com.apiweb.backend.Model;


import java.time.Instant;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.ENUM.TipoNotificacion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notificaciones {
    private ObjectId remitente;
    private String contenido;
    private Instant fecha;
    private TipoNotificacion tipo;
    private Boolean leido;

    // Método para asignar directamente un valor de TipoNotificacion
    public void setTipo(TipoNotificacion mensaje) {
        this.tipo = mensaje;
    }

    // Método para convertir un String a TipoNotificacion
    public void setTipo(String string) {
        try {
            this.tipo = TipoNotificacion.valueOf(string.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de notificación inválido: " + string);
        }
    }
}