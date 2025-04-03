package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalificacionesServicios {
    @Id
    private ObjectId calificador;
    private double calificacion;
    private String comentario;
    private Instant fecha;
}
