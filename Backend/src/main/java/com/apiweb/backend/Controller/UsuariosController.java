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

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Service.IUsuariosService;

@RestController
@RequestMapping("/appi/usuario")
public class UsuariosController {
    @Autowired IUsuariosService usuariosService;

    @PostMapping("/registrar")
    public ResponseEntity<String> registroUsuario(@RequestBody UsuariosModel usuario){
        return new ResponseEntity<>(usuariosService.registroUsuario(usuario), HttpStatus.CREATED);
    }

    @PostMapping("/ingresar")
    public ResponseEntity<String> iniciarSesion(@RequestBody UsuariosModel usuario){
        return new ResponseEntity<>(usuariosService.iniciarSesion(usuario), HttpStatus.OK);
    }

    @PostMapping("/recuperar")
    public ResponseEntity<String> recuperarContrasena(@RequestBody UsuariosModel usuario) {
        return new ResponseEntity<>(usuariosService.recuperarContrasena(usuario), HttpStatus.OK);

    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuariosModel> actualizarUsuario(@PathVariable("id") ObjectId id,  @RequestBody UsuariosModel usuario){
        return new ResponseEntity<>(usuariosService.actualizarUsuario(id, usuario), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable("id") ObjectId id){
        return new ResponseEntity<>(usuariosService.eliminarUsuario(id), HttpStatus.OK);
    }
}
