package com.apiweb.backend.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidAcuerdoConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.CalificacionServicio;
import com.apiweb.backend.Model.Calificaciones;
import com.apiweb.backend.Model.ExtensionAcuerdo;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.EstadoAcuerdo;
import com.apiweb.backend.Model.ENUM.EstadoAviso;
import com.apiweb.backend.Model.ENUM.TipoUsuario;
import com.apiweb.backend.Repository.IAcuerdosRepository;
import com.apiweb.backend.Repository.IAvisosRepository;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class AcuerdosServiceImp implements IAcuerdosService{
    @Autowired
    private IAcuerdosRepository acuerdosRepository;

    @Autowired
    private IAvisosRepository avisosRepository;

    @Autowired
    private IUsuariosRepository usuariosRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public AcuerdosModel crearAcuerdo(AcuerdosModel acuerdo) {
        
        //Validación del aviso
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(acuerdo.getAvisosId());
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe");
        }
        AvisosModel aviso = avisoExiste.get();

        if (aviso.getEstado() != EstadoAviso.Disponible && aviso.getEstado() != EstadoAviso.EnProceso) {
            throw new InvalidUserRoleException("El estado del aviso debe ser 'Disponible' o 'EnProceso' para poder crear un acuerdo.");
        }
        //Validación del propietario
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(aviso.getPropietarioId().getUsuarioId());
        if (!usuarioExiste.isPresent()) {
            throw new UserNotFoundException("El id: " + aviso.getPropietarioId().getUsuarioId() + " no corresponde a un usuario.");
        }
        UsuariosModel propietario = usuarioExiste.get();
        if (propietario.getTipo() != TipoUsuario.propietario) {
            throw new InvalidUserRoleException("El usuario no es propietario.");
        }

        //Validacion del propio acuerdo
        if (acuerdo.getCalificacionServicio() != null ) {
            throw new InvalidUserRoleException("El propietario no puede calificar el servicio");
        }
        if(acuerdo.getFechaFin().isBefore(acuerdo.getFechaInicio())){
            throw new InvalidAcuerdoConfigurationException("La fecha de finalización del arrendamiento no puede ser anterior a la fecha de inicio.");
        }
        if (acuerdo.getFechaFin().equals(acuerdo.getFechaInicio())) {
            throw new InvalidAcuerdoConfigurationException("La fecha de finalización no puede ser igual a la fecha de inicio. ");
        }

        //verificar si hay un acuerdo activo con ese mismo aviso
        verificacionFechaFinalizacion();
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findByAvisosIdAndEstado(acuerdo.getAvisosId(), EstadoAcuerdo.Activo);
        if (acuerdoExiste.isPresent()) {
            throw new InvalidAcuerdoConfigurationException("Ya existe un acuerdo con estado 'activo' para el aviso con ID: " + acuerdo.getAvisosId());
        }

        UsuariosModel arrendatarioExiste = usuariosRepository.findByCorreo(acuerdo.getArrendatario().getCorreo());
        if (arrendatarioExiste == null){
            throw new UserNotFoundException("El correo: " + acuerdo.getArrendatario().getCorreo() + " no corresponde a un usuario.");
        }

        if (arrendatarioExiste.getId()==acuerdo.getPropietarioId()) {
            throw new InvalidAcuerdoConfigurationException("El arrendador y el arrendatario no pueden ser la misma persona a la a hora de crear un acuerdo. ");
        }
        if (arrendatarioExiste.getCorreo().equalsIgnoreCase(propietario.getCorreo())) {
            throw new InvalidAcuerdoConfigurationException("El arrendador y el arrendatario no pueden ser la misma persona a la a hora de crear un acuerdo. ");
        }
        if (arrendatarioExiste.getTipo() == TipoUsuario.administrador){
            throw new InvalidUserRoleException("El arrendatario no puede ser un administrador. ");
        }
        acuerdo.getArrendatario().setUsuarioId(arrendatarioExiste.getId());
        if (acuerdo.getExtensiones() != null && !acuerdo.getExtensiones().isEmpty()) {
            throw new InvalidAcuerdoConfigurationException("El acuerdo no puede tener extensiones al momento de su creación. ");
        }

        // Validación: la fecha de inicio no puede ser menor a la fecha actual (solo fecha, sin hora)
        LocalDate fechaInicio = acuerdo.getFechaInicio().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate hoy = LocalDate.now(ZoneId.systemDefault());
        if (fechaInicio.isBefore(hoy)) {
            throw new InvalidAcuerdoConfigurationException("La fecha de inicio del acuerdo no puede ser anterior a la fecha actual.");
        }

        // Validación: la fecha de fin no puede ser menor a la fecha actual (solo fecha, sin hora)
        LocalDate fechaFin = acuerdo.getFechaFin().atZone(ZoneId.systemDefault()).toLocalDate();
        if (fechaFin.isBefore(hoy)) {
            throw new InvalidAcuerdoConfigurationException("La fecha de finalización del acuerdo no puede ser anterior a la fecha actual.");
        }

        aviso.setEstado(EstadoAviso.Arrendado);
        acuerdo.setEstado(EstadoAcuerdo.Activo);
        acuerdo.getArrendatario().setNombre(arrendatarioExiste.getNombre());
        acuerdo.getArrendatario().setUsuarioId(arrendatarioExiste.getId());
        acuerdo.setPropietarioId(aviso.getPropietarioId().getUsuarioId());
        avisosRepository.save(aviso);

        UsuariosModel arrendatario = usuariosRepository.findById(acuerdo.getArrendatario().getUsuarioId())
            .orElseThrow(() -> new UserNotFoundException("No se encontró el arrendatario."));
        emailService.sendEmail(
            arrendatario.getCorreo(),
            "Creacion de acuerdo de arrendamiento exitosa",
            "Creacion de acuerdo de arrendamiento exitosa.\n\n");

        return acuerdosRepository.save(acuerdo);
    }

    @Override
    @Transactional
    public AcuerdosModel modificarAcuerdo(ObjectId idAcuerdo, ExtensionAcuerdo extension) {
        //Verificar que el acuerdo a modificar no este finalizado
        verificacionFechaFinalizacion();

        //Validacion del acuerdo 
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoExiste.isPresent()){
            throw new ResourceNotFoundException("El id: " + idAcuerdo + " no corresponde a un acuerdo.");
        }
        AcuerdosModel acuerdoActualizar = acuerdoExiste.get();
        if (acuerdoActualizar.getEstado() == EstadoAcuerdo.Cancelado) {
            throw new InvalidUserRoleException("El acuerdo ya ha sido cancelado.");
        } else if (acuerdoActualizar.getEstado() == EstadoAcuerdo.Finalizado) {
            throw new InvalidUserRoleException("El acuerdo ya ha sido finalizado.");
        }
        if (acuerdoActualizar.getExtensiones() == null || acuerdoActualizar.getExtensiones().isEmpty()) {
            if (!extension.getFechaInicio().isAfter(acuerdoActualizar.getFechaFin())) {
                throw new InvalidAcuerdoConfigurationException("La nueva fecha inicio de extensión debe ser despues de la fecha fin del acuerdo. ");
            }
            if (extension.getFechaFin().isBefore(extension.getFechaInicio())) {
                throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la nueva fecha inicio extensión. ");
            } 
        } else {
                if (extension.getFechaFin().isBefore(extension.getFechaInicio())) {
                    throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la nueva fecha inicio extensión. ");
                }
                ExtensionAcuerdo ultimaExtension = acuerdoActualizar.getExtensiones().get(acuerdoActualizar.getExtensiones().size() - 1);
                if (extension.getFechaInicio().isBefore(ultimaExtension.getFechaFin())) {
                        throw new InvalidAcuerdoConfigurationException("La nueva fecha inicio de extensión debe ser despues de la ultima fecha fin de las extensiones ya creadas. ");
                }
            }
            
        acuerdoActualizar.getExtensiones().add(extension);

        UsuariosModel arrendatario = usuariosRepository.findById(acuerdoActualizar.getArrendatario().getUsuarioId())
            .orElseThrow(() -> new UserNotFoundException("No se encontró el arrendatario."));
        emailService.sendEmail(
            arrendatario.getCorreo(),
            "Modificacion de acuerdo de arrendamiento exitosa",
            "Modificacion de acuerdo de arrendamiento exitosa.\n\n");

        return acuerdosRepository.save(acuerdoActualizar);

    }

@Override
@Transactional
public AcuerdosModel cancelarAcuerdo(ObjectId idAcuerdo, String razonCancelacion) {
    // Verifica y finaliza acuerdos si corresponde
    verificacionFechaFinalizacion();

    // Busca el acuerdo
    Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
    if (!acuerdoExiste.isPresent()) {
        throw new ResourceNotFoundException("El id: " + idAcuerdo + " no corresponde a un acuerdo.");
    }
    AcuerdosModel acuerdo = acuerdoExiste.get();

    // Validaciones
    if (razonCancelacion == null || razonCancelacion.isBlank()) {
        throw new InvalidAcuerdoConfigurationException("La razón de cancelación es obligatoria y no puede estar vacía.");
    }
    if (acuerdo.getEstado() == EstadoAcuerdo.Finalizado) {
        throw new InvalidAcuerdoConfigurationException("No se puede cancelar el acuerdo, ya que el acuerdo se encuentra en estado 'Finalizado'.");
    }

    // Cambia el estado del acuerdo
    acuerdo.setRazonCancelacion(razonCancelacion);
    acuerdo.setEstado(EstadoAcuerdo.Cancelado);
    acuerdo.setFechaCancelacion(Instant.now());

    // Cambia el estado del aviso a DISPONIBLE
    Optional<AvisosModel> avisoOpt = avisosRepository.findById(acuerdo.getAvisosId());
    if (avisoOpt.isPresent()) {
        AvisosModel aviso = avisoOpt.get();
        aviso.setEstado(EstadoAviso.Disponible); // Usa tu enum o "Disponible"
        avisosRepository.save(aviso);
    }

    // Notifica al arrendatario
    UsuariosModel arrendatario = usuariosRepository.findById(acuerdo.getArrendatario().getUsuarioId())
        .orElseThrow(() -> new UserNotFoundException("No se encontró el arrendatario."));
    emailService.sendEmail(
        arrendatario.getCorreo(),
        "Cancelación de acuerdo de arrendamiento exitosa",
        "Cancelación de acuerdo de arrendamiento exitosa.\n\n"
    );

    // Guarda y retorna el acuerdo actualizado
    return acuerdosRepository.save(acuerdo);
}

    @Override
    public List<AcuerdosModel> listarAcuerdosDeUnPropietario (ObjectId propietarioId){
        verificacionFechaFinalizacion();
        List<AcuerdosModel> acuerdos = acuerdosRepository.findByPropietarioId(propietarioId);
        return acuerdos;
    }

    @Override
    public List<AcuerdosModel> listarAcuerdosDeUnPropietarioAndEstado (ObjectId propietarioId, EstadoAcuerdo estado){
        verificacionFechaFinalizacion();
        List<AcuerdosModel> acuerdos = acuerdosRepository.findByPropietarioIdAndEstado(propietarioId, estado);
        return acuerdos;
    }

    @Override
    public AcuerdosModel detallarUnAcuerdo(ObjectId idAcuerdo) {
        verificacionFechaFinalizacion();
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoExiste.isPresent()) {
            throw new ResourceNotFoundException("El id: "+idAcuerdo + " no corresponde a ningun acuerdo");
        }
        AcuerdosModel acuerdo = acuerdoExiste.get();
        return acuerdo;
    }
    @Override
    @Transactional
    public AcuerdosModel calificarArrendatario(ObjectId idAcuerdo, Integer calificacion, String comentario) {
        // Validar calificación
        if (calificacion == null || calificacion < 1 || calificacion > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5 estrellas.");
        }
        if (comentario != null && comentario.length() > 300) {
            throw new IllegalArgumentException("El comentario no puede superar los 300 caracteres.");
        }

        // Buscar el acuerdo
        Optional<AcuerdosModel> acuerdoOpt = acuerdosRepository.findById(idAcuerdo);
        verificacionFechaFinalizacion();
        if (!acuerdoOpt.isPresent()) {
            throw new ResourceNotFoundException("No se encontró el acuerdo de arrendamiento.");
        }
        AcuerdosModel acuerdo = acuerdoOpt.get();

        // Validar estado del acuerdo
        if (acuerdo.getEstado() != EstadoAcuerdo.Finalizado) {
            throw new IllegalStateException("Sólo puede calificar después de que el arrendamiento haya finalizado.");
        }

        // Buscar al arrendatario
        ObjectId idArrendatario = acuerdo.getArrendatario().getUsuarioId();
        UsuariosModel arrendatario = usuariosRepository.findById(idArrendatario)
            .orElseThrow(() -> new UserNotFoundException("No se encontró el arrendatario."));

        // Validar que no se haya calificado antes este acuerdo
        boolean yaCalificado = arrendatario.getCalificaciones().stream()
            .anyMatch(c -> c.getCalificador() != null && c.getCalificador().equals(acuerdo.getPropietarioId())
                && c.getComentario() != null && c.getComentario().contains(idAcuerdo.toHexString()));
        if (yaCalificado) {
            throw new IllegalStateException("Ya se ha calificado este arrendamiento.");
        }

        // Crear la calificación
        Calificaciones nuevaCalificacion = new Calificaciones();
        nuevaCalificacion.setCalificador(acuerdo.getPropietarioId());
        nuevaCalificacion.setCalificacion(calificacion);
        nuevaCalificacion.setComentario((comentario != null ? comentario : "") + " [Acuerdo: " + idAcuerdo.toHexString() + "]");

        // Agregar la calificación al arrendatario
        arrendatario.getCalificaciones().add(nuevaCalificacion);
        usuariosRepository.save(arrendatario);

         emailService.sendEmail(
             arrendatario.getCorreo(),
             "¡Has sido calificado!",
             "El propietario ha calificado tu experiencia como arrendatario.\n\n" +
             "Calificación: " + calificacion + " estrellas\n" +
             (comentario != null && !comentario.isBlank() ? "Comentario: " + comentario + "\n\n" : "") +
             "¡Gracias por usar nuestro servicio!"
         );
        return acuerdo;
    }

    @Override
    @Transactional
    public AcuerdosModel calificarServicio(ObjectId idAcuerdo, Integer calificacion, String comentario) {
        // 1. Validar calificación y comentario
        if (calificacion == null || calificacion < 1 || calificacion > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5 estrellas.");
        }
        if (comentario != null && comentario.length() > 300) {
            throw new IllegalArgumentException("El comentario no puede superar los 300 caracteres.");
        }

        // 2. Buscar el acuerdo
        Optional<AcuerdosModel> acuerdoOpt = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoOpt.isPresent()) {
            throw new ResourceNotFoundException("No se encontró el acuerdo de arrendamiento.");
        }
        AcuerdosModel acuerdo = acuerdoOpt.get();
        verificacionFechaFinalizacion();

        // 3. Validar estado del acuerdo
        if (acuerdo.getEstado() != EstadoAcuerdo.Finalizado) {
            throw new IllegalStateException("Sólo puede calificar después de que el arrendamiento haya finalizado.");
        }

        // 4. Validar que no se haya calificado antes
        if (acuerdo.getCalificacionServicio() != null) {
            throw new IllegalStateException("Ya se ha calificado este acuerdo. No se puede editar ni eliminar la calificación.");
        }

        // 5. Registrar la calificación en el acuerdo
        CalificacionServicio nuevaCalificacion = new CalificacionServicio();
        nuevaCalificacion.setCalificador(acuerdo.getArrendatario().getUsuarioId());
        nuevaCalificacion.setCalificacion(calificacion);
        nuevaCalificacion.setComentario(comentario);
        nuevaCalificacion.setFecha(java.time.Instant.now());
        acuerdo.setCalificacionServicio(nuevaCalificacion);

        acuerdosRepository.save(acuerdo);

        // 6. Notificar al propietario
        UsuariosModel propietario = usuariosRepository.findById(acuerdo.getPropietarioId())
            .orElseThrow(() -> new UserNotFoundException("No se encontró el propietario."));
        emailService.sendEmail(
            propietario.getCorreo(),
            "¡Has recibido una calificación!",
            "Has recibido una nueva calificación por parte del arrendatario.\n\n" +
            "Calificación: " + calificacion + " estrellas\n" +
            (comentario != null && !comentario.isBlank() ? "Comentario: " + comentario + "\n\n" : "") +
            "¡Gracias por usar nuestro servicio!"
        );
        return acuerdo;
    }

public void verificacionFechaFinalizacion() {
    List<AcuerdosModel> acuerdosActivos = acuerdosRepository.findByEstado(EstadoAcuerdo.Activo);
    Instant ahora = java.time.Instant.now();

    for (AcuerdosModel acuerdo : acuerdosActivos) {
        Instant fechaFin;
        // Si tiene extensiones entonces tomará la fecha fin de la última extensión
        if (acuerdo.getExtensiones() != null && !acuerdo.getExtensiones().isEmpty()) {
            ExtensionAcuerdo ultimaExtension = acuerdo.getExtensiones()
                .get(acuerdo.getExtensiones().size() - 1);
            fechaFin = ultimaExtension.getFechaFin();
        } else {
            // Si no tiene extensiones entonces tomará la fecha fin del acuerdo principal
            fechaFin = acuerdo.getFechaFin();
        }

        // Si la fecha fin ya se alcanzó o pasó entonces se finaliza el acuerdo
        if (!ahora.isBefore(fechaFin)) {
            acuerdo.setEstado(EstadoAcuerdo.Finalizado);
            acuerdosRepository.save(acuerdo);

            // Cambia el estado del aviso a DISPONIBLE
            Optional<AvisosModel> avisoOpt = avisosRepository.findById(acuerdo.getAvisosId());
            if (avisoOpt.isPresent()) {
                AvisosModel aviso = avisoOpt.get();
                aviso.setEstado(EstadoAviso.Disponible); // Usa tu enum o "Disponible"
                avisosRepository.save(aviso);
            }
        }
    }
}
}
