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
    private String propietarioId;
    @JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idAviso;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
    public ArrayList<MensajesMensajeria> mensajes = new ArrayList<MensajesMensajeria>();
    
    // Getters and setters
    public ObjectId getIdInteresado() {
        return idInteresado;
    }

    public void setIdInteresado(ObjectId idInteresado) {
        this.idInteresado = idInteresado;
    }

    public String getPropietarioId() {
        return propietarioId;
    }

    public void setPropietarioId(String propietarioId) {
        this.propietarioId = propietarioId;
    }

    public void setPropietarioId(ObjectId propietarioId2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setPropietarioId'");
    }
}
