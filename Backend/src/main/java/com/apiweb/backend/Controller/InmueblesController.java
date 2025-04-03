package com.apiweb.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
    
}
