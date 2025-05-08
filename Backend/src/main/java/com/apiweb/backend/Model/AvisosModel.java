package com.apiweb.backend.Model;

import java.util.ArrayList;

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
    private Integer precioMin;
    private Integer precioMax;
    private EstadoAviso estado;
    private ReporteAviso reporte;
    private MensajeriaAviso mensajes;
}
