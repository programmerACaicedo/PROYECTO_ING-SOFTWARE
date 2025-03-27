package com.apiweb.backend.Model;


import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("INMUEBLES")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InmueblesModel {
    @Id
    private Object id;
    private String nombre;
    private PropietarioInmueble propietarioId;
    private String tipo;
    private String descripcion;
    private String condiciones;
    private List<String> imagenes = new ArrayList<>();
    private UbicacionInmueble ubicacion;
}
