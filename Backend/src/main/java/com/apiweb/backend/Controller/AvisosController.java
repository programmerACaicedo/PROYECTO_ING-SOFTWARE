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

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Service.IAvisosService;

@RestController
@RequestMapping("api/avisos")
public class AvisosController {
    @Autowired
    IAvisosService avisosService;

    @PostMapping("/registrar")
    public ResponseEntity<AvisosModel> crearAviso(@RequestBody AvisosModel aviso){
        return new ResponseEntity<AvisosModel>(avisosService.crearAviso(aviso) ,HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvisosModel> actualizarAviso(@PathVariable("id") ObjectId id,@RequestBody AvisosModel aviso){
        return new ResponseEntity<AvisosModel>(avisosService.actualizarAviso(id, aviso), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarAviso(@PathVariable("id") ObjectId id){
        return new ResponseEntity<String>(avisosService.eliminarAviso(id), HttpStatus.OK);
    }

}
