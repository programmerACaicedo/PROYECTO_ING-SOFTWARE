package com.apiweb.backend.Model;

import java.time.Instant;
import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.apiweb.backend.Model.ENUM.EstadoAcuerdo;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("Acuerdos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AcuerdosModel {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;
    private ObjectId avisosId;
    private ObjectId propietarioId;
    private Instant fechaInicio;
    private Instant fechaFin;
    private String razonCancelacion;
    private EstadoAcuerdo estado;
    private String archivoContrato;
    private CalificacionServicio calificacionServicio;
    private ArrendatarioAcuerdo arrendatario;
    private ArrayList<ExtensionAcuerdo> extensiones = new ArrayList<ExtensionAcuerdo>();
} 