package com.apiweb.backend.Controller;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaAviso;
import com.apiweb.backend.Model.Mensajes;
import com.apiweb.backend.Model.ReporteAviso;
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

    @GetMapping("/listarAvisos")
    public ResponseEntity<List<AvisosModel>> listarAvisos(){
        return new ResponseEntity<List<AvisosModel>> (avisosService.listarAvisos(), HttpStatus.OK); 
    }


    @GetMapping("/{id}")
    public ResponseEntity<List<AvisosModel>> listarAvisosPropietario(@PathVariable("id") ObjectId propietarioId){
        return new ResponseEntity<List<AvisosModel>> (avisosService.listarAvisosPropietario(propietarioId), HttpStatus.OK);
    }


    @PutMapping("/reportar/{id}")
    public ResponseEntity<AvisosModel> crearReporte(@PathVariable("id") ObjectId id,@RequestBody ReporteAviso reporte){
        return new ResponseEntity<AvisosModel>(avisosService.crearReporte(id, reporte), HttpStatus.OK);
    }

    @GetMapping("/listarReportes")
    public ResponseEntity<List<AvisosModel>> listarAvisosConReportes(){
        return new ResponseEntity<List<AvisosModel>>(avisosService.listarAvisosConReportes(), HttpStatus.OK);
    }

    @GetMapping("/listarSinReportes")
    public ResponseEntity<List<AvisosModel>> listarAvisosSinReportes() {
        return new ResponseEntity<List<AvisosModel>>(avisosService.listarAvisosSinReportes(), HttpStatus.OK);
    }

    @PutMapping("/actualizarEstadoReporteSiendoAdministrador/{id}")
    public ResponseEntity<AvisosModel> actualizarEstadoReporteSiendoAdministrador(@PathVariable("id") ObjectId id,@RequestBody ReporteAviso reporte){
        return new ResponseEntity<AvisosModel>(avisosService.actualizarEstadoReporteSiendoAdministrador(id, reporte), HttpStatus.OK);
    }

    @PutMapping("/chat/{id}")
    public ResponseEntity<AvisosModel> crearChat(@PathVariable("id") ObjectId id,@RequestBody MensajeriaAviso mensaje){
        return new ResponseEntity<AvisosModel>(avisosService.crearChat(id, mensaje), HttpStatus.OK);
    }

    @PutMapping("/mandarMensajes/{idAviso}/{idInteresado}")
    public ResponseEntity<AvisosModel> mandarMensajes(@PathVariable("idAviso") ObjectId idAviso,@PathVariable("idInteresado") ObjectId idInteresado,@RequestBody Mensajes mensaje){
        return new ResponseEntity<AvisosModel>(avisosService.mandarMensajes(idAviso, idInteresado, mensaje), HttpStatus.OK);
    }


}
