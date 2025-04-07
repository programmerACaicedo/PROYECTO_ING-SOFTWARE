package com.apiweb.backend.Model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.apiweb.backend.Model.ENUM.tipoDisponibilidad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("Publicacion")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicacionesModel {
    @Id
    private ObjectId id;
    private String nombre;
    private int precio_mensual;
    private tipoDisponibilidad disponibilidad;
    private Lugar lugar;
    private MensajesInteres mensaje_interes;
    private Reportes reporte;
}
