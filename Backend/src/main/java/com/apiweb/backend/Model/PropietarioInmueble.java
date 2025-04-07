package com.apiweb.backend.Model;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropietarioInmueble {

    @Field("usuario_id")
    @JsonProperty("usuario_id")
    private ObjectId usuarioId;
    private String nombre;
    
}
