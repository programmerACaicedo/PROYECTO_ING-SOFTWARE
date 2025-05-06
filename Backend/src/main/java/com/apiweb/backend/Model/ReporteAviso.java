package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

import com.apiweb.backend.Model.ENUM.EstadoReporte;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteAviso {
    @JsonSerialize(using = ToStringSerializer.class)
    @Field("usuario_reporta")
    private ObjectId usuarioReporta;
    private String motivo;
    private Instant fecha;
    private String comentario;
    private EstadoReporte estadoReporte;
}
