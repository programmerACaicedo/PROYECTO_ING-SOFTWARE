package com.apiweb.backend.Controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.ExtensionAcuerdo;
import com.apiweb.backend.Service.IAcuerdosService;

@RestController
@RequestMapping("/api/acuerdos")
public class AcuerdosController {
    @Autowired
    IAcuerdosService acuerdosService;

    @PostMapping("/registar/{idPropietario}")
    public ResponseEntity<AcuerdosModel> crearAcuerdo (@PathVariable("idPropietario") ObjectId idPropietario,@RequestBody AcuerdosModel acuerdo) {
        return new ResponseEntity<AcuerdosModel>(acuerdosService.crearAcuerdo(idPropietario,acuerdo),HttpStatus.CREATED);
    }

    @PutMapping("/extension/{idAcuerdo}")
    public ResponseEntity<AcuerdosModel> modificarAcuerdo(@PathVariable("idAcuerdo") ObjectId idAcuerdo, @RequestBody ExtensionAcuerdo extension) {
        return new ResponseEntity<AcuerdosModel>(acuerdosService.modificarAcuerdo(idAcuerdo, extension),HttpStatus.OK);
    }
    @PutMapping("/cancelarAcuerdo/{idAviso}")
    public ResponseEntity<AcuerdosModel> cancelarAcuerdo(@PathVariable("idAcuerdo") ObjectId idAcuerdo, @RequestBody String razonCancelacion) {
        return new ResponseEntity<AcuerdosModel> (acuerdosService.cancelarAcuerdo(idAcuerdo, razonCancelacion),HttpStatus.OK);
    }
    
}
