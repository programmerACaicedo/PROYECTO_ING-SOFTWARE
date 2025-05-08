package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;

// import com.fasterxml.jackson.databind.annotation.JsonSerialize;
// import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Mensajes {
    //@JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idRemitente;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
}
