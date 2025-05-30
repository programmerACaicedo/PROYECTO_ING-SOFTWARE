package com.apiweb.backend.Controller;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.ExtensionAcuerdo;
import com.apiweb.backend.Model.ENUM.EstadoAcuerdo;
import com.apiweb.backend.Service.IAcuerdosService;

@RestController
@RequestMapping("/api/acuerdos")
public class AcuerdosController {
    @Autowired
    IAcuerdosService acuerdosService;

@PostMapping("/registrar")
public ResponseEntity<?> crearAcuerdo (@RequestBody AcuerdosModel acuerdo) {
    try {
        AcuerdosModel creado = acuerdosService.crearAcuerdo(acuerdo);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    } catch (Exception e) {
        e.printStackTrace(); // Log para depuración
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error al crear el acuerdo: " + e.getMessage());
    }
}

    @PutMapping("/extension/{idAcuerdo}")
    public ResponseEntity<AcuerdosModel> modificarAcuerdo(@PathVariable("idAcuerdo") ObjectId idAcuerdo, @RequestBody ExtensionAcuerdo extension) {
        return new ResponseEntity<AcuerdosModel>(acuerdosService.modificarAcuerdo(idAcuerdo, extension),HttpStatus.OK);
    }
    @PutMapping("/cancelarAcuerdo/{idAcuerdo}")
    public ResponseEntity<AcuerdosModel> cancelarAcuerdo(@PathVariable("idAcuerdo") ObjectId idAcuerdo, @RequestBody String razonCancelacion) {
        return new ResponseEntity<AcuerdosModel> (acuerdosService.cancelarAcuerdo(idAcuerdo, razonCancelacion),HttpStatus.OK);
    }
    
    @GetMapping("/listarAcuerdosDeUnPropietario/{propietarioId}")
    public ResponseEntity<List<AcuerdosModel>> listarAcuerdosDeUnPropietario (@PathVariable("propietarioId") ObjectId propietarioId) {
        return new ResponseEntity<List<AcuerdosModel>>(acuerdosService.listarAcuerdosDeUnPropietario(propietarioId),HttpStatus.OK);
    }
    @GetMapping("/listarAcuerdosDeUnPropietarioAndEstado/{propietarioId}")
    public ResponseEntity<List<AcuerdosModel>> listarAcuerdosDeUnPropietarioAndEstado (@PathVariable("propietarioId") ObjectId propietarioId,@RequestBody EstadoAcuerdo estado) {
        return new ResponseEntity<List<AcuerdosModel>>(acuerdosService.listarAcuerdosDeUnPropietarioAndEstado(propietarioId, estado),HttpStatus.OK);
    }
    @GetMapping("/DetallarUnAcuerdo/{idAcuerdo}")
    public ResponseEntity<AcuerdosModel> detallarUnAcuerdo(@PathVariable("idAcuerdo") ObjectId idAcuerdo) {
        return new ResponseEntity<AcuerdosModel> (acuerdosService.detallarUnAcuerdo(idAcuerdo),HttpStatus.OK);
    }
}
