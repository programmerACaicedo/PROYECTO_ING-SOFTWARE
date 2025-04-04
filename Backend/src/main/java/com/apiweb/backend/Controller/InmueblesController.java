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

import com.apiweb.backend.Model.InmueblesModel;
import com.apiweb.backend.Service.IInmueblesService;

@RestController
@RequestMapping("/api/inmuebles")
public class InmueblesController {
    @Autowired IInmueblesService inmueblesService;

    @PostMapping("/insertar")
    public ResponseEntity<String> insertar(@RequestBody InmueblesModel inmueble){
        return new ResponseEntity<>(inmueblesService.guardarInmueble(inmueble), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InmueblesModel> actualizarInmueble(@PathVariable("id") ObjectId id,  @RequestBody InmueblesModel inmueble){
        return new ResponseEntity<>(inmueblesService.actualizarInmueble(id, inmueble), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarInmueble(@PathVariable("id") ObjectId id){
        return new ResponseEntity<>(inmueblesService.eliminarInmueble(id), HttpStatus.OK);
    }
}
