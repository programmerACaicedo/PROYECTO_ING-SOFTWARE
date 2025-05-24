package com.apiweb.backend.Model;

import org.bson.types.ObjectId;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArrendatarioAcuerdo {
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId usuarioId;
    private String nombre;
    private String correo;
}
