package com.apiweb.backend.Service;

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
    public AcuerdosModel crearAcuerdo(ObjectId idPropietario,AcuerdosModel acuerdo) {
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(idPropietario);
        if (!usuarioExiste.isPresent()) {
            throw new UserNotFoundException("El id: " + idPropietario + " no corresponde a un usuario.");
        }
        UsuariosModel propietario = usuarioExiste.get();
        if (propietario.getTipo() != TipoUsuario.propietario) {
            throw new InvalidUserRoleException("El usuario no es propietario.");
        }
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(acuerdo.getAvisosId());
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe");
        }
        AvisosModel aviso = avisoExiste.get();
        if (!aviso.getPropietarioId().getUsuarioId().equals(propietario.getId())) {
            throw new InvalidUserRoleException("El usuario no es el propietario del aviso");
        }
        if (aviso.getEstado() != EstadoAviso.Disponible && aviso.getEstado() != EstadoAviso.EnProceso) {
            throw new InvalidUserRoleException("El estado del aviso debe ser 'Disponible' o 'EnProceso' para poder crear un acuerdo.");
        }

        if (acuerdo.getCalificacionServicio() != null ) {
            throw new InvalidUserRoleException("El propietario no puede calificar el servicio");
        }
        if(acuerdo.getFechaFin().isBefore(acuerdo.getFechaInicio())){
            throw new IllegalArgumentException("La fecha de finalización del arrendamiento no puede ser anterior a la fecha de inicio.");
        }


        UsuariosModel arrendatarioExiste = usuariosRepository.findByCorreo(acuerdo.getArrendatario().getCorreo());
        if (arrendatarioExiste == null){
            throw new UserNotFoundException("El correo: " + acuerdo.getArrendatario().getCorreo() + " no corresponde a un usuario.");
        }

        if (arrendatarioExiste.getId()==acuerdo.getPropietarioId()) {
            throw new InvalidAcuerdoConfigurationException("El arrendador y el arrendatario no pueden ser la misma persona a la ahora de crear un acuerdo. ");
        }
        if (arrendatarioExiste.getTipo() == TipoUsuario.administrador){
            throw new InvalidUserRoleException("El arrendatario no puede ser un administrador. ");
        }
        acuerdo.getArrendatario().setUsuarioId(arrendatarioExiste.getId());
        if (acuerdo.getExtensiones() != null && !acuerdo.getExtensiones().isEmpty()) {
            throw new InvalidAcuerdoConfigurationException("El acuerdo no puede tener extensiones al momento de su creación. ");
        }

        aviso.setEstado(EstadoAviso.Arrendado);
        acuerdo.setEstado(EstadoAcuerdo.Activo);
        acuerdo.setPropietarioId(aviso.getPropietarioId().getUsuarioId());
        return acuerdosRepository.save(acuerdo);
    }

    @Override
    public AcuerdosModel modificarAcuerdo(ObjectId idAcuerdo, ExtensionAcuerdo extension) {
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoExiste.isPresent()){
            throw new ResourceNotFoundException("El id: " + idAcuerdo + " no corresponde a un acuerdo.");
        }
        AcuerdosModel acuerdoActualizar = acuerdoExiste.get();
        if (acuerdoActualizar.getEstado() == EstadoAcuerdo.Cancelado) {
            throw new InvalidUserRoleException("El acuerdo ya ha sido cancelado.");
        } else if (acuerdoActualizar.getEstado() == EstadoAcuerdo.Finalizado) {
            throw new InvalidUserRoleException("El acuerdo ya ha sido finalizado.");
        }//Validacion del acuerdo sin los cambios aún

        if (acuerdoActualizar.getExtensiones() == null || acuerdoActualizar.getExtensiones().isEmpty()) {
            if (extension.getFechaInicio().isBefore(acuerdoActualizar.getFechaInicio())) {
                throw new InvalidAcuerdoConfigurationException("La nueva fecha inicio de extensión debe ser despues de la fecha fin del acuerdo. ");
            }
            if (extension.getFechaFin().isBefore(extension.getFechaInicio())) {
                throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la nueva fecha inicio extensión. ");
            } 
        } else {
                if (extension.getFechaFin().isBefore(extension.getFechaInicio())) {
                    throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la nueva fecha inicio extensión. ");
                }
                for(ExtensionAcuerdo extensionAcuer : acuerdoActualizar.getExtensiones()){
                    if (extension.getFechaInicio().isBefore(extensionAcuer.getFechaFin())) {
                        throw new InvalidAcuerdoConfigurationException("La nueva fecha inicio de extensión debe ser despues de la ultima fecha fin de las extensiones ya creadas. ");
                    }
                }
            }

        return acuerdosRepository.save(acuerdoActualizar);

    }

    @Override
    @Transactional
    public AcuerdosModel cancelarAcuerdo(ObjectId idAcuerdo, String razonCancelacion) {
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoExiste.isPresent()) {
            throw new ResourceNotFoundException("El id: " + idAcuerdo + " no corresponde a un acuerdo.");
        }
        AcuerdosModel acuerdo = acuerdoExiste.get();
        if (razonCancelacion.isBlank()) {
            throw new InvalidAcuerdoConfigurationException("La razon de cancelación es obligatoria y no puede estar vacia. ");
        }
        acuerdo.setRazonCancelacion(razonCancelacion);
        acuerdo.setEstado(EstadoAcuerdo.Cancelado);

        return acuerdosRepository.save(acuerdo);
    }

    @Override
    public List<AcuerdosModel> listarAcuerdosDeUnPropietario (ObjectId propietarioId){
        List<AcuerdosModel> acuerdos = acuerdosRepository.findByPropietarioId(propietarioId);
        return acuerdos;
    }

    @Override
    public List<AcuerdosModel> listarAcuerdosDeUnPropietarioAndEstado (ObjectId propietarioId, EstadoAcuerdo estado){
        List<AcuerdosModel> acuerdos = acuerdosRepository.findByPropietarioIdAndEstado(propietarioId, estado);
        return acuerdos;
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
}
