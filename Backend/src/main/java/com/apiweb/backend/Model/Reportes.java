package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Reportes {
    @Field("usuario_reporta")
    @JsonProperty("usuario_reporta")
    private ObjectId usuarioReporta;
    private String motivo;
    private Instant fecha;
}
