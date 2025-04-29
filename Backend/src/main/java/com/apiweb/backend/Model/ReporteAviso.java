package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteAviso {
    private ObjectId usuario_reporta;
    private String motivo;
    private Instant fecha;
}
