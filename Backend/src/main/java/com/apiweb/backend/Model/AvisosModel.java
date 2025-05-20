package com.apiweb.backend.Model;

import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.apiweb.backend.Model.ENUM.EstadoAviso;
import com.apiweb.backend.Model.ENUM.TipoAviso;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Document("Avisos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AvisosModel {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;
    private String nombre;
    private PropietarioAviso propietarioId;
    private TipoAviso tipo;
    private String descripcion;
    private String condiciones;
    private ArrayList<String> imagenes = new ArrayList<String>();
    private UbicacionAviso ubicacion;
    private Double calificacion_prom;
    private Integer precio_mensual;
    private EstadoAviso estado;
    private ArrayList<ReporteAviso> reporte = new ArrayList<ReporteAviso>();
    public void setImagenes(List<String> imagenes) {
        this.imagenes = (ArrayList<String>) imagenes;
    }
}   
