package com.apiweb.backend.Model;

import java.time.Instant;
import java.util.ArrayList;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajeriaAviso {
    @JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idInteresado;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
    public ArrayList<Mensajes> mensajes;
    
    
}
