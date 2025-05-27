package com.apiweb.backend.Model;

import java.time.Instant;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajesMensajeria {
    @JsonSerialize(using = ToStringSerializer.class)
    public ObjectId idRemitente;
    public String mensaje;
    public Instant fecha;
    public Boolean leido;
    private ObjectId idDestinatario;
    private String nombreDestinatario;
    private String nombreRemitente;
    
    
    // Agregado para el servicio
    private String nombreInteresado;
    private String nombrePropietario;
    public void setNombreRemitente(Object object) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setNombreRemitente'");
    }

      public ObjectId getIdDestinatario() {
        return idDestinatario;
    }

    public void setIdDestinatario(ObjectId idDestinatario) {
        this.idDestinatario = idDestinatario;
    }

    public String getNombreDestinatario() {
    return nombreDestinatario;
}

public void setNombreDestinatario(String nombreDestinatario) {
    this.nombreDestinatario = nombreDestinatario;
}
public String getNombreRemitente() {
    return nombreRemitente;
}

// Setter para nombreRemitente
public void setNombreRemitente(String nombreRemitente) {
    this.nombreRemitente = nombreRemitente;
}
}
