package com.apiweb.backend.Model;

import java.time.Instant;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("ACUERDOS")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AcuerdosModel {
    @Id
    private Object id;
    private Object idInmueble;
    private Instant Inicio;
    private Instant fechaFin;
    private String razonCancelacion;
    private String estado;
    private String archivoContrato;
    private ArrendatarioAcuerdo arrendatario;// Este atributo hace ref a el documento embebido 
} 