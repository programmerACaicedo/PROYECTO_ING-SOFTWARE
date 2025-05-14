package com.apiweb.backend.Model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExtensionAcuerdo {
    private Instant fechaFin;
    private String archivoContrato;
}
