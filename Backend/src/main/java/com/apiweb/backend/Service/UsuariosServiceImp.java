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
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

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
            // Convertir el correo a minúsculas
            usuario.setCorreo(usuario.getCorreo().trim().toLowerCase());


            if (usuariosRepository.findByCorreo(usuario.getCorreo()) != null) {
                throw new UserRegistrationException("El correo " + usuario.getCorreo() + " ya está registrado.");
            }

            System.out.println("Datos antes de guardar:");
            System.out.println("Nombre: " + usuario.getNombre());
            System.out.println("Teléfono: " + usuario.getTelefono());
            System.out.println("Correo: " + usuario.getCorreo());

            String contrasenaEncriptada = null;
            if (usuario.getContrasena() != null) {
                contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
            }
            usuario.setContrasena(contrasenaEncriptada);
            usuariosRepository.save(usuario);

            // Generar token de verificación válido por 24 horas
            String token = jwtTokenService.generarTokenVerificacion(usuario.getCorreo(), 24 * 60 * 60);
            // URL para el funcionamiento del tunel
            String enlaceVerificacion = "http://localhost:8080/api/usuario/verificar?token=" + token;

            // Enviar correo de verificación
            emailService.sendEmail(
                usuario.getCorreo(),
                "Verificación de cuenta",
                "Por favor, verifica tu cuenta haciendo click en el siguiente enlace: " + enlaceVerificacion
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
            // Convertir el correo a minúsculas
            String correo = usuario.getCorreo().trim().toLowerCase();
            final int MAX_INTENTOS = 7;
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
    
            // Verificar si el usuario está verificado
            if (!usuarioExistente.isVerificado()) {
                throw new LoginFailedException("El usuario no ha verificado su cuenta. Por favor, verifica tu correo.");
            }
    
            // Check if login is via Google
            Boolean isGoogleLogin = usuario.getGoogle() != null && usuario.getGoogle();
            if (isGoogleLogin) {
                // Skip password and palabra_seguridad validation for Google login
                // Login successful, proceed to generate token
            } else {
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
    
                        if (intentosFallidos.get(correo) >= 5) {
                            throw new LoginFailedException(
                                String.format("Debes ingresar la palabra de seguridad para continuar. Te quedan %d intentos.", intentosRestantes)
                            );
                        }
    
                        throw new LoginFailedException(
                            String.format("Credenciales incorrectas. Te quedan %d intentos.", intentosRestantes)
                        );
                    }
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
            // Agrega las notificaciones completas
            List<Map<String, Object>> notificacionesSerializables = usuarioExistente.getNotificaciones().stream()
                .map(notif -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("contenido", notif.getContenido());
  
                    map.put("leido", notif.getLeido());
                    // Convierte fecha a String
                    map.put("fecha", notif.getFecha() != null ? notif.getFecha().toString() : null);
                    return map;
                })
                .collect(Collectors.toList());
            claims.put("notificaciones", notificacionesSerializables);
    
            // Generar el token JWT
            return jwtTokenService.generarToken(claims, 60 * 60 * 24);
        } catch (Exception e) {
            throw new LoginFailedException("Error al iniciar sesión: " + e.getMessage());
        }
    }
    
    @Override
    public String recuperarContrasena(UsuariosModel usuario) {
        try {
            System.out.println("Intentando recuperar contraseña para: " + usuario.getCorreo());
            System.out.println("Palabra de seguridad proporcionada: " + usuario.getPalabra_seguridad());
    
            // Buscar el usuario por correo
            UsuariosModel usuarioExistente = usuariosRepository.findByCorreo(usuario.getCorreo());
            if (usuarioExistente == null) {
                System.err.println("Usuario no encontrado con el correo: " + usuario.getCorreo());
                throw new UserNotFoundException("El correo proporcionado no está registrado.");
            }
    
            // Normalizar las palabras de seguridad para evitar errores por mayúsculas/minúsculas o espacios
            String palabraSeguridadEnviada = usuario.getPalabra_seguridad().trim().toLowerCase();
            String palabraSeguridadAlmacenada = usuarioExistente.getPalabra_seguridad().trim().toLowerCase();
    
            // Validar la palabra de seguridad
            if (!palabraSeguridadAlmacenada.equals(palabraSeguridadEnviada)) {
                System.err.println("Palabra de seguridad incorrecta para el usuario: " + usuario.getCorreo());
                throw new LoginFailedException("La palabra de seguridad es incorrecta.");
            }
    
            // Generar un token de restablecimiento válido por 1 hora
            String token = jwtTokenService.generarTokenVerificacion(usuario.getCorreo(), 60 * 60);
            String enlaceRestablecimiento = "http://localhost:8080/restablecer-contraseña?token=" + token;
    
            // Enviar correo con el enlace de restablecimiento
            emailService.sendEmail(
                usuario.getCorreo(),
                "Restablecimiento de contraseña",
                "Hola " + usuarioExistente.getNombre() + ",\n\n" +
                "Hemos recibido una solicitud para restablecer tu contraseña. " +
                "Por favor, haz clic en el siguiente enlace para continuar:\n\n" +
                enlaceRestablecimiento + "\n\n" +
                "Si no solicitaste este cambio, ignora este mensaje.\n\n" +
                "Saludos,\nEquipo de Soporte"
            );
    
            return "Se ha enviado un correo con el enlace para restablecer la contraseña.";
        } catch (Exception e) {
            System.err.println("Error al recuperar contraseña: " + e.getMessage());
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