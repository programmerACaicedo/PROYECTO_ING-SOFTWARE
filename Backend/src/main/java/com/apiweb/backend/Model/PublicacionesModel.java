package com.apiweb.backend.Model;

import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private int precioMensual;
    private String disponibilidad;
    private ArrayList<Lugares> lugares = new ArrayList<Lugares>();
    private MensajesInteres mensajeInteres;
}
