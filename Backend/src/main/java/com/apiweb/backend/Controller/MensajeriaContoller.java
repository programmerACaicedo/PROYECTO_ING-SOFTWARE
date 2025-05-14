package com.apiweb.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.MensajeriaModel;
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
}
