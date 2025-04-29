package com.apiweb.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Service.IAcuerdosService;

@RestController
@RequestMapping("/api/acuerdos")
public class AcuerdosController {
    @Autowired
    IAcuerdosService acuerdosService;

    @PostMapping("/registar")
    public ResponseEntity<AcuerdosModel> crearAcuerdo (@RequestBody AcuerdosModel acuerdo) {
        return new ResponseEntity<AcuerdosModel>(acuerdosService.guardarAcuerdo(acuerdo),HttpStatus.CREATED);
    }
    
}
