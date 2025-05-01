package com.apiweb.backend.Controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Service.IUsuariosService;
import com.apiweb.backend.Exception.LoginFailedException;

import java.util.Map;

@RestController
@RequestMapping("/api/usuario")
public class UsuariosController {
    @Autowired IUsuariosService usuariosService;

    @PostMapping("/registrar")
    public ResponseEntity<String> registroUsuario(@RequestBody UsuariosModel usuario) {
        System.out.println("Datos recibidos: " + usuario);
        String resultado = usuariosService.registroUsuario(usuario);
        System.out.println("Resultado del servicio: " + resultado);
        return new ResponseEntity<>(resultado, HttpStatus.CREATED);
    }

    @GetMapping("/verificar")
    public ResponseEntity<String> verificarCuenta(@RequestParam String token) {
        String resultado = usuariosService.verificarCuenta(token);
        return new ResponseEntity<>(resultado, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuariosModel usuario) {
        try {
            String token = usuariosService.iniciarSesion(usuario);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (LoginFailedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
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
