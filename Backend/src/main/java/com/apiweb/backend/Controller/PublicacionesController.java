package com.apiweb.backend.Controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PutMapping("/{id}")
    public ResponseEntity<PublicacionesModel> actualizarPublicacion(@PathVariable("id") ObjectId id, @RequestBody PublicacionesModel publicacion) {
        return new ResponseEntity<>(publicacionesService.actualizarPublicacion(id, publicacion), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarPublicacion(@PathVariable("id") ObjectId id) {
        return new ResponseEntity<>(publicacionesService.eliminarPublicacion(id), HttpStatus.OK);
    }

}
