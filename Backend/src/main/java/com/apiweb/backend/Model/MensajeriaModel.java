package com.apiweb.backend.Model;

import java.time.Instant;
import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("Mensajeria")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajeriaModel {
    @Id
    private ObjectId id;
    @JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idInteresado;
    @JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idAviso;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
    public ArrayList<MensajesMensajeria> mensajes = new ArrayList<MensajesMensajeria>();
    
    
}
