package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalificacionServicio {
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId calificador;
    private Integer calificacion;
    private String comentario;
    private Instant fecha;
}
