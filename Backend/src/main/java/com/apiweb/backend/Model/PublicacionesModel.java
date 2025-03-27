package com.apiweb.backend.Model;

import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class PublicacionesModel {
    @Id
    private ObjectId id;
    private int precioMensual;
    private String disponibilidad;
    private ArrayList<calificacionesServicios> calificacionesServicios = new ArrayList<calificacionesServicios>();
}
