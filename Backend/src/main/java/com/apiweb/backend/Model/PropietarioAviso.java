package com.apiweb.backend.Model;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropietarioAviso {
    private ObjectId usuario_id;
    private String nombre;
}
