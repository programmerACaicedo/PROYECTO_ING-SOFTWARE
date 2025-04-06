package com.apiweb.backend.Service;

import java.util.concurrent.ConcurrentHashMap;

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
        private final ConcurrentHashMap<String, Integer> intentosFallidos = new ConcurrentHashMap<>();

    @Override
    public String registroUsuario(UsuariosModel usuario) {
        try {
        if (usuariosRepository.findByCorreo(usuario.getCorreo()) != null) {
            throw new UserRegistrationException("El correo " + usuario.getCorreo() + " ya está registrado.");
        }
        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);
        usuariosRepository.save(usuario);
        return "El usuario " + usuario.getNombre() + " fue registrado con éxito";
        } catch (Exception e) {
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
