package com.apiweb.backend.Model;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Calificaciones {
    private ObjectId calificador;
    private Integer calificacion;
    private String comentario;
}
