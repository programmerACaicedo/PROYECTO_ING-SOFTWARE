package com.apiweb.backend.Model;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArrendatarioAcuerdo {
    @Id
    private Object usuarioId;
    private String nombre;
}
