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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Repository.IUsuariosRepository;
import com.apiweb.backend.Service.IUsuariosService;
import com.apiweb.backend.Service.JwtTokenService;
import com.apiweb.backend.Exception.LoginFailedException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuario")
public class UsuariosController {
    @Autowired IUsuariosService usuariosService;
    @Autowired
    JwtTokenService jwtTokenService;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Autowired IUsuariosRepository usuariosRepository;

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
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            // Fetch tipoUsuario from the database
            UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(usuario.getCorreo());
            if (usuarioExistente != null) {
                response.put("tipoUsuario", usuarioExistente.getTipo());
            } else {
                throw new LoginFailedException("Usuario no encontrado.");
            }
            return ResponseEntity.ok(response);
        } catch (LoginFailedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/recuperar")
    public ResponseEntity<String> recuperarContrasena(@RequestBody UsuariosModel usuario) {
        return new ResponseEntity<>(usuariosService.recuperarContrasena(usuario), HttpStatus.OK);

    }

   @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerUsuario(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Map<String, Object> tokenData = jwtTokenService.validarToken(token);
            String correo = (String) tokenData.get("correo");
            UsuariosModel usuario = usuariosRepository.findByCorreo(correo);
            if (usuario == null) {
                return new ResponseEntity<>(new HashMap<>(), HttpStatus.NOT_FOUND);
            }

            // Crear un mapa para la respuesta con el id como cadena
            Map<String, Object> response = new HashMap<>();
            response.put("id", usuario.getId().toString());
            response.put("nombre", usuario.getNombre());
            response.put("correo", usuario.getCorreo());
            response.put("telefono", usuario.getTelefono());
            response.put("tipo", usuario.getTipo());
            response.put("verificado", usuario.isVerificado());
            response.put("foto", usuario.getFoto());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new HashMap<>(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/restablecer-contraseña")
    public ResponseEntity<String> restablecerContrasena(@RequestBody Map<String, String> datos) {
        try {
            String token = datos.get("token");
            String nuevaContrasena = datos.get("nuevaContraseña");
    
            if (token == null || nuevaContrasena == null) {
                return new ResponseEntity<>("Token o nueva contraseña faltante.", HttpStatus.BAD_REQUEST);
            }
    
            // Validar el token y obtener el correo asociado
            String correo = jwtTokenService.validarTokenVerificacion(token);
    
            // Buscar el usuario por correo
            UsuariosModel usuario = usuariosRepository.findByCorreo(correo);
            if (usuario == null) {
                return new ResponseEntity<>("Usuario no encontrado.", HttpStatus.NOT_FOUND);
            }
    
            // Actualizar la contraseña
            usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
            usuariosRepository.save(usuario);
            
            return new ResponseEntity<>("Contraseña actualizada con éxito.", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error al restablecer la contraseña: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable String id, @RequestBody UsuariosModel usuarioActualizado) {
        try {
            System.out.println("Datos recibidos para actualizar:");
            System.out.println("Nombre: " + usuarioActualizado.getNombre());
            System.out.println("Teléfono: " + usuarioActualizado.getTelefono());
            System.out.println("Foto: " + usuarioActualizado.getFoto());

            UsuariosModel resultado = usuariosService.actualizarUsuario(new ObjectId(id), usuarioActualizado);
            return new ResponseEntity<>(resultado, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("ID inválido: debe ser un ObjectId válido.", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error interno del servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable("id") ObjectId id){
        return new ResponseEntity<>(usuariosService.eliminarUsuario(id), HttpStatus.OK);
    }
}
