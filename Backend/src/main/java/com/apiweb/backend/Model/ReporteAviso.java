package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteAviso {
    @Field("usuario_reporta")
    private ObjectId usuarioReporta;
    private String motivo;
    private Instant fecha;
}
