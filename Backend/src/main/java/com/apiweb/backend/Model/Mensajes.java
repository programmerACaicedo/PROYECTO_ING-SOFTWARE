package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Mensajes {
    public ObjectId idRemitente;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
}
