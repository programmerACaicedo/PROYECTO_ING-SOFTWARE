package com.apiweb.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.PublicacionesModel;
import com.apiweb.backend.Service.IPublicacionesService;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionesController {
    @Autowired IPublicacionesService publicacionesService;
    @PostMapping("/insertar")
    public ResponseEntity<String> crearPublicacion (@RequestBody PublicacionesModel publicacion) {
        return new ResponseEntity<>(publicacionesService.guardarPublicacion(publicacion),HttpStatus.CREATED);
    }

}
