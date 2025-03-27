package com.apiweb.backend.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UbicacionInmueble {
    private String direccion;
    private String coordenadas;
    private String ciudad;
}
