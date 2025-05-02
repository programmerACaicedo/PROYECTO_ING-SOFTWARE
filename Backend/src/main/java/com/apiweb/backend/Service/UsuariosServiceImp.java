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

import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Repository.IAcuerdosRepository;
import com.apiweb.backend.Repository.IAvisosRepository;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class UsuariosServiceImp implements IUsuariosService {
    @Autowired
    IUsuariosRepository usuariosRepository;
    @Autowired
    IAvisosRepository avisosRepository;
    @Autowired
    IAcuerdosRepository acuerdosRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenService jwtTokenService;
    @Autowired
    private EmailService emailService;

    private final Map<String, Integer> intentosFallidos = new ConcurrentHashMap<>();
    private final Map<String, Long> tiempoBloqueo = new ConcurrentHashMap<>();

    @Override
    public String registroUsuario(UsuariosModel usuario) {
        try {
            if (usuariosRepository.findByCorreo(usuario.getCorreo()) != null) {
                throw new UserRegistrationException("El correo " + usuario.getCorreo() + " ya está registrado.");
            }

            System.out.println("Datos antes de guardar:");
            System.out.println("Nombre: " + usuario.getNombre());
            System.out.println("Teléfono: " + usuario.getTelefono());
            System.out.println("Correo: " + usuario.getCorreo());

            String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
            usuario.setContrasena(contrasenaEncriptada);
            usuariosRepository.save(usuario);

            // Generar token de verificación válido por 24 horas
            String token = jwtTokenService.generarTokenVerificacion(usuario.getCorreo(), 24 * 60 * 60);
            String enlaceVerificacion = "http://localhost:8080/api/usuario/verificar?token=" + token;

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
            String correo = usuario.getCorreo();
            final int MAX_INTENTOS = 5;
            final long BLOQUEO_DURACION = TimeUnit.HOURS.toMillis(2); // 2 hours lockout
    
            // Verificar si el usuario está bloqueado
            if (tiempoBloqueo.containsKey(correo)) {
                long tiempoInicioBloqueo = tiempoBloqueo.get(correo);
                long tiempoTranscurrido = System.currentTimeMillis() - tiempoInicioBloqueo;
                long tiempoRestante = BLOQUEO_DURACION - tiempoTranscurrido;
    
                if (tiempoRestante > 0) {
                    long minutosRestantes = TimeUnit.MILLISECONDS.toMinutes(tiempoRestante);
                    long segundosRestantes = TimeUnit.MILLISECONDS.toSeconds(tiempoRestante) % 60;
                    String mensajeBloqueo = String.format(
                        "La cuenta está bloqueada. Intenta nuevamente en %d minutos y %d segundos.",
                        minutosRestantes, segundosRestantes
                    );
                    throw new LoginFailedException(mensajeBloqueo);
                } else {
                    tiempoBloqueo.remove(correo);
                    intentosFallidos.remove(correo);
                }
            }
    
            // Buscar el usuario por correo
            UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(correo);
            if (usuarioExistente == null) {
                throw new LoginFailedException("El correo proporcionado no está registrado.");
            }
    
            // Verificar si se proporcionó palabra_seguridad
            String palabraSeguridad = usuario.getPalabra_seguridad();
            if (palabraSeguridad != null && !palabraSeguridad.trim().isEmpty()) {
                // Validar palabra_seguridad
                if (!palabraSeguridad.equals(usuarioExistente.getPalabra_seguridad())) {
                    intentosFallidos.put(correo, intentosFallidos.getOrDefault(correo, 0) + 1);
                    int intentosRestantes = MAX_INTENTOS - intentosFallidos.get(correo);
                    if (intentosFallidos.get(correo) >= MAX_INTENTOS) {
                        tiempoBloqueo.put(correo, System.currentTimeMillis());
                        throw new LoginFailedException(
                            "Has alcanzado el límite de intentos fallidos. La cuenta está bloqueada por 2 horas."
                        );
                    }
                    throw new LoginFailedException(
                        String.format("Palabra de seguridad incorrecta. Te quedan %d intentos.", intentosRestantes)
                    );
                }
            } else {
                // Validar contraseña si no se proporcionó palabra_seguridad
                String contrasena = usuario.getContrasena();
                if (contrasena == null || contrasena.trim().isEmpty()) {
                    intentosFallidos.put(correo, intentosFallidos.getOrDefault(correo, 0) + 1);
                    int intentosRestantes = MAX_INTENTOS - intentosFallidos.get(correo);
                    if (intentosFallidos.get(correo) >= MAX_INTENTOS) {
                        tiempoBloqueo.put(correo, System.currentTimeMillis());
                        throw new LoginFailedException(
                            "Has alcanzado el límite de intentos fallidos. La cuenta está bloqueada por 2 horas."
                        );
                    }
                    throw new LoginFailedException(
                        String.format("La contraseña es obligatoria cuando no se proporciona palabra de seguridad. Te quedan %d intentos.", intentosRestantes)
                    );
                }
    
                if (!passwordEncoder.matches(contrasena, usuarioExistente.getContrasena())) {
                    intentosFallidos.put(correo, intentosFallidos.getOrDefault(correo, 0) + 1);
                    int intentosRestantes = MAX_INTENTOS - intentosFallidos.get(correo);
    
                    if (intentosFallidos.get(correo) >= 3) {
                        throw new LoginFailedException(
                            String.format("Debes ingresar la palabra de seguridad para continuar. Te quedan %d intentos.", intentosRestantes)
                        );
                    }
    
                    throw new LoginFailedException(
                        String.format("Credenciales incorrectas. Te quedan %d intentos.", intentosRestantes)
                    );
                }
            }
    
            // Login exitoso: resetear intentos fallidos y bloqueo
            intentosFallidos.remove(correo);
            tiempoBloqueo.remove(correo);
    
            // Crear claims con la información del usuario
            Map<String, Object> claims = new HashMap<>();
            claims.put("id", usuarioExistente.getId().toString());
            claims.put("correo", usuarioExistente.getCorreo());
            claims.put("tipo", usuarioExistente.getTipo());
            claims.put("nombre", usuarioExistente.getNombre());
            claims.put("telefono", usuarioExistente.getTelefono());
            claims.put("foto", usuarioExistente.getFoto());
            claims.put("verificado", usuarioExistente.isVerificado());
            claims.put("palabra_seguridad", usuarioExistente.getPalabra_seguridad());
    
            // Generar el token JWT
            return jwtTokenService.generarToken(claims, 60 * 60 * 24);
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
    public UsuariosModel actualizarUsuario(ObjectId id, UsuariosModel usuarioActualizado) {
        UsuariosModel usuario = usuariosRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con el ID: " + id));

        if (usuarioActualizado.getNombre() != null && !usuarioActualizado.getNombre().isBlank()) {
            usuario.setNombre(usuarioActualizado.getNombre());
        }
        if (usuarioActualizado.getTelefono() != null && !usuarioActualizado.getTelefono().isBlank()) {
            if (!usuarioActualizado.getTelefono().matches("^\\d{10}$")) {
                throw new UserUpdateException("El número de teléfono debe contener exactamente 10 dígitos.");
            }
            usuario.setTelefono(usuarioActualizado.getTelefono());
        }
        if (usuarioActualizado.getCorreo() != null && !usuarioActualizado.getCorreo().isBlank()) {
            usuario.setCorreo(usuarioActualizado.getCorreo());
        }
        if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(usuarioActualizado.getContrasena()));
        }
        if (usuarioActualizado.getFoto() != null) {
            usuario.setFoto(usuarioActualizado.getFoto());
        }

        return usuariosRepository.save(usuario);
    }

    @Override
    public String eliminarUsuario(ObjectId id) {
        try {
            UsuariosModel buscarUsuario = usuariosRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con el ID: " + id));
            String nombre = buscarUsuario.getNombre();
            String correo = buscarUsuario.getCorreo();

            // Eliminación de los acuerdos del usuario
            acuerdosRepository.deleteByArrendatario_UsuarioId(id);

            // Eliminación del usuario
            usuariosRepository.deleteById(id);

            // Eliminación de las publicaciones del usuario
            avisosRepository.deleteByPropietarioId_UsuarioId(id);

            // Envío de mensaje de confirmación
            emailService.sendEmail(
                correo,
                "Confirmación de eliminación de cuenta",
                "Hola " + nombre + ",\n\nTu cuenta ha sido eliminada exitosamente. Si tienes alguna duda, no dudes en contactarnos.\n\nSaludos,\nEquipo de Soporte"
            );

            return "El usuario " + nombre + " fue eliminado con éxito";
        } catch (Exception e) {
            throw new UserDeletionException("Error al eliminar el usuario con ID: " + id + ". Detalles: " + e.getMessage());
        }
    }
}