package com.apiweb.backend.Controller;

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

import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;
import com.apiweb.backend.Service.IMensajeriaService;

@RestController
@RequestMapping("api/mensajeria")
public class MensajeriaContoller {

    @Autowired
    IMensajeriaService MensajeriaService;

    @PostMapping("/crearChat")
    public ResponseEntity<MensajeriaModel> crearChat (@RequestBody MensajeriaModel chat){
        return new ResponseEntity<MensajeriaModel> (MensajeriaService.crearChat(chat),HttpStatus.CREATED);
    }

    @PutMapping("/mandarMensaje/{idMensajeria}")
    public ResponseEntity<MensajeriaModel> mandarMensaje(@PathVariable("idMensajeria") ObjectId idMensajeria,@RequestBody MensajesMensajeria mensajes) {
        return new ResponseEntity<MensajeriaModel>(MensajeriaService.mandarMensaje(idMensajeria, mensajes),HttpStatus.OK);
    }

    @GetMapping("/mostrarChat/{idMensajeria}")
    public ResponseEntity<MensajeriaModel> obtenerChat(@PathVariable("idMensajeria") ObjectId idMensajeria) {
        return new ResponseEntity<MensajeriaModel>(MensajeriaService.obtenerChat(idMensajeria),HttpStatus.OK);
    }
}
