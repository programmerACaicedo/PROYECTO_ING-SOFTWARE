package com.apiweb.backend.Model;



import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropietarioAviso {
    @JsonSerialize(using = ToStringSerializer.class)
    @Field("usuario_id")
    private ObjectId usuarioId;
    private String nombre;
}
