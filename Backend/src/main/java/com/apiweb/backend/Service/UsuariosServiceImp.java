package com.apiweb.backend.Service;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private EmailService emailService;

    @Override
    public String registroUsuario(UsuariosModel usuario) {
        try {
            // 1. Verificar si el correo ya está registrado
            UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(usuario.getCorreo());
            if (usuarioExistente != null) {
                throw new UserRegistrationException("El correo " + usuario.getCorreo() + " ya está registrado");
            }

            // 2. Encriptar la contraseña
            String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
            usuario.setContrasena(contrasenaEncriptada);
            
            // 3. Establecer estado de verificación
            usuario.setVerificado(false);

            // 4. Guardar usuario en la base de datos
            UsuariosModel usuarioGuardado = usuariosRepository.save(usuario);

            // 5. Generar token JWT con ID del usuario
            String tokenVerificacion = jwtTokenService.generarToken(usuarioGuardado.getId());

            // 6. Enviar correo de verificación
            emailService.enviarEmailVerificacion(
                usuario.getCorreo(),
                usuario.getNombre(),
                tokenVerificacion
            );

            return "Usuario registrado con éxito. Por favor verifica tu cuenta mediante el enlace enviado a " + usuario.getCorreo();

        } catch (UserRegistrationException e) {
            throw e; // Relanzar excepción específica
        } catch (Exception e) {
            // 7. Manejo de errores genéricos
            throw new UserRegistrationException("Error al registrar el usuario: " + e.getMessage());
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
