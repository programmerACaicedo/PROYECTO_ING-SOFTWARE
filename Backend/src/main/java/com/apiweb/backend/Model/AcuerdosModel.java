package com.apiweb.backend.Model;

import java.time.Instant;
import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("Acuerdos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AcuerdosModel {
    @Id
    private ObjectId id;
    private ObjectId idInmueble;
    private Instant fechaInicio;
    private Instant fechaFin;
    private String razonCancelacion;
    private String estado;
    private String archivoContrato;
    private ArrayList<CalificacionesServicios> calificacionServicio = new ArrayList<CalificacionesServicios>(); // Este atributo hace ref a el documento embebido
    private ArrendatarioAcuerdo arrendatario;// Este atributo hace ref a el documento embebido 
} 