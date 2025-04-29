package com.apiweb.backend.Service;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.LoginFailedException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Exception.UserRegistrationException;
import com.apiweb.backend.Exception.UserDeletionException;
import com.apiweb.backend.Exception.UserUpdateException;


import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class UsuariosServiceImp implements IUsuariosService {
    @Autowired
    IUsuariosRepository usuariosRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private EmailService emailService;

    @Override
    public String registroUsuario(UsuariosModel usuario) {
        try {
            if (usuariosRepository.findByCorreo(usuario.getCorreo()) != null) {
                throw new UserRegistrationException("El correo " + usuario.getCorreo() + " ya está registrado.");
            }

            String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
            usuario.setContrasena(contrasenaEncriptada);
            usuariosRepository.save(usuario);

            // Generar token de verificación válido por 24 horas
            String token = jwtTokenService.generarTokenVerificacion(usuario.getCorreo(), 24 * 60 * 60);
            String enlaceVerificacion = "http://localhost:8080/appi/usuario/verificar?token=" + token;

            // Enviar correo de verificación
            emailService.sendEmail(
                usuario.getCorreo(),
                "Verificación de cuenta",
                "Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: " + enlaceVerificacion
            );

            return "El usuario " + usuario.getNombre() + " fue registrado con éxito. Se ha enviado un correo de verificación.";
        } catch (Exception e) {
            throw new UserRegistrationException("Error al registrar el usuario: " + e.getMessage());
        }
    }

    @Override
    public String verificarCuenta(String token) {
        try {
            // Validar el token y obtener el correo
            String correo = jwtTokenService.validarTokenVerificacion(token);

            // Buscar el usuario por correo
            UsuariosModel usuario = usuariosRepository.findByCorreo(correo);
            if (usuario == null) {
                throw new UserNotFoundException("Usuario no encontrado con el correo: " + correo);
            }

            // Activar la cuenta del usuario
            usuario.setVerificado(true);
            usuariosRepository.save(usuario);

            return "Cuenta verificada con éxito.";
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la cuenta: " + e.getMessage());
        }
    }

    @Override
    public String iniciarSesion(UsuariosModel usuario) {
        try {
        // Buscar el usuario por correo
        UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(usuario.getCorreo());
        if (usuarioExistente == null) {
            throw new LoginFailedException("El correo proporcionado no está registrado.");
        }

        // Validar la contraseña
        if (!passwordEncoder.matches(usuario.getContrasena(), usuarioExistente.getContrasena())) {
            throw new LoginFailedException("La contraseña es incorrecta.");
        }

        return "Inicio de sesión exitoso";
        } catch (Exception e) {
        throw new LoginFailedException("Error al iniciar sesión: " + e.getMessage());
        }  
    }

    @Override
    public String recuperarContrasena(UsuariosModel usuario) {
    try {
        // Buscar el usuario por correo
        UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(usuario.getCorreo());
        if (usuarioExistente == null) {
            throw new UserNotFoundException("El correo proporcionado no está registrado.");
        }

        // Validar la palabra de seguridad
        if (!usuarioExistente.getPalabra_seguridad().equals(usuario.getPalabra_seguridad())) {
            throw new LoginFailedException("La palabra de seguridad es incorrecta.");
        }

        return "Validación exitosa. Ahora puedes restablecer tu contraseña.";
    } catch (Exception e) {
        throw new LoginFailedException("Error al recuperar la contraseña: " + e.getMessage());
    }
}

    @Override
    public UsuariosModel actualizarUsuario(ObjectId id, UsuariosModel usuario) {
    try {
        UsuariosModel buscarUsuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con el ID: " + id));

        buscarUsuario.setNombre(usuario.getNombre());
        buscarUsuario.setTelefono(usuario.getTelefono());
        buscarUsuario.setCorreo(usuario.getCorreo());
        buscarUsuario.setContrasena(usuario.getContrasena());
        buscarUsuario.setFoto(usuario.getFoto());

        return usuariosRepository.save(buscarUsuario);
        
    } catch (Exception e) {
        throw new UserUpdateException("Error al actualizar el usuario con ID: " + id + ". Detalles: " + e.getMessage());
    }
}

    @Override
    public String eliminarUsuario(ObjectId id) {
    try {
        UsuariosModel buscarUsuarioA = usuariosRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con el ID: " + id));
        String nombre = buscarUsuarioA.getNombre();

        usuariosRepository.deleteById(id);
        return "El usuario " + nombre + " fue eliminado con éxito";
    } catch (Exception e) {
        throw new UserDeletionException("Error al eliminar el usuario con ID: " + id + ". Detalles: " + e.getMessage());
    }
    }
}
