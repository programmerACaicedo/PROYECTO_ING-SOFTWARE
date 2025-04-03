package com.apiweb.backend.Model;


import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.apiweb.backend.Model.ENUM.tipoInmueble;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("Inmueble")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InmueblesModel {
    @Id
    private Object id;
    private String nombre;
    private PropietarioInmueble propietarioId;
    private tipoInmueble tipo;
    private String descripcion;
    private String condiciones;
    private List<String> imagenes = new ArrayList<>();
    private UbicacionInmueble ubicacion;
    private double calificacionProm;
}
