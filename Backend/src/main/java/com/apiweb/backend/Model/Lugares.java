package com.apiweb.backend.Model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Lugares {
    @Id
    private ObjectId inmuebleId;
    private String nombre;
}
