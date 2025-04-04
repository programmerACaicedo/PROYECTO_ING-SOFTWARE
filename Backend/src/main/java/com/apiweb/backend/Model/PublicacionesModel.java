package com.apiweb.backend.Model;

import java.util.ArrayList;

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
    private int precioMensual;
    private tipoDisponibilidad disponibilidad;
    private ArrayList<Lugares> lugares = new ArrayList<Lugares>();
    private MensajesInteres mensajeInteres;
}
