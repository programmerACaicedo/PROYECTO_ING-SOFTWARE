package com.apiweb.backend.Model;

import java.time.Instant;
import java.util.ArrayList;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajeriaAviso {
    public ObjectId idInteresado;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
    public ArrayList<Mensajes> mensajes;
    
    
}
