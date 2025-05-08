package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.InvalidAvisoConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaAviso;
import com.apiweb.backend.Model.Mensajes;
import com.apiweb.backend.Model.Notificaciones;
import com.apiweb.backend.Model.ReporteAviso;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.EstadoAviso;
import com.apiweb.backend.Model.ENUM.EstadoReporte;
import com.apiweb.backend.Model.ENUM.TipoNotificacion;
import com.apiweb.backend.Model.ENUM.TipoUsuario;
import com.apiweb.backend.Repository.IAvisosRepository;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class AvisosServiceImp implements IAvisosService{
    @Autowired
    IAvisosRepository avisosRepository;

    @Autowired
    IUsuariosRepository usuariosRepository;

    @Override
    public AvisosModel crearAviso(AvisosModel aviso) {
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(aviso.getPropietarioId().getUsuarioId());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario no existe.");
        }
        UsuariosModel usuario = usuarioExiste.get();
        if (usuario.getTipo() != TipoUsuario.propietario){
            throw new InvalidUserRoleException("Solamente un propietario puede crear un aviso.");
        }
        if (aviso.getReporte() != null || aviso.getMensajes() != null) {
            throw new InvalidAvisoConfigurationException("El aviso no puede tener un reporte o mensaje de interes al momento de crearse.");
        }
        if (aviso.getCalificacion_prom() != null && aviso.getCalificacion_prom() != 0) {
            throw new InvalidAvisoConfigurationException("El aviso no puede tener una calificacion promedio al momento de crearse.");
        }

        Optional<AvisosModel> avisoExistente = avisosRepository.findByUbicacion(aviso.getUbicacion());
        if (avisoExistente.isPresent()) {
            throw new InvalidAvisoConfigurationException("Ya existe un aviso en esa ubicacion.");
        }
        if (aviso.getEstado() != null) {
            throw new InvalidAvisoConfigurationException("El aviso no puede tener un estado al momento de crearse, ya que al crearse el sistema le asignara el estado disponible por defecto.");
        }
        aviso.setEstado(EstadoAviso.Disponible);

        //Notificacion al propietario
        Notificaciones notificacionPropietario = new Notificaciones();
        notificacionPropietario.setRemitente(null);
        notificacionPropietario.setContenido("Se ha creado un nuevo aviso llamado: " + aviso.getNombre() + " en la ubicacion: " + aviso.getUbicacion() + ".");
        notificacionPropietario.setFecha(Instant.now());
        notificacionPropietario.setTipo(TipoNotificacion.Mensaje);
        notificacionPropietario.setLeido(false);
        usuario.getNotificaciones().add(notificacionPropietario);
        usuariosRepository.save(usuario);

        //Notificacion a los administradores
        List<UsuariosModel> administradores = usuariosRepository.findByTipo(TipoUsuario.administrador);
        for (UsuariosModel administrador : administradores) {
            Notificaciones notificacionAdministrador = new Notificaciones();
            notificacionAdministrador.setRemitente(usuario.getId());
            notificacionAdministrador.setContenido("El propietario " + usuario.getNombre() + " ha creado un nuevo aviso llamado: " + aviso.getNombre() + " en la ubicacion: " + aviso.getUbicacion() + ".");
            notificacionAdministrador.setFecha(Instant.now());
            notificacionAdministrador.setTipo(TipoNotificacion.Mensaje);
            notificacionAdministrador.setLeido(false);
            administrador.getNotificaciones().add(notificacionAdministrador);
            
        }
        usuariosRepository.saveAll(administradores);


        return avisosRepository.save(aviso);
    }
    @Override
    public AvisosModel actualizarAviso(ObjectId id, AvisosModel aviso){
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(id);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }

        AvisosModel avisoActualizado = avisoExiste.get();

        if (aviso.getNombre() != null) {
            if (aviso.getNombre().isBlank()) {
                throw new InvalidAvisoConfigurationException("El nombre no puede estar vacío.");
            }
            if (aviso.getNombre().length() > 100) {
                throw new InvalidAvisoConfigurationException("El nombre no puede exceder 100 caracteres.");
            }
            avisoActualizado.setNombre(aviso.getNombre());
        }
    
        if (aviso.getDescripcion() != null) {
            if (aviso.getDescripcion().isBlank()) {
                throw new InvalidAvisoConfigurationException("La descripción no puede estar vacía.");
            }
            if (aviso.getDescripcion().length() > 500) {
                throw new InvalidAvisoConfigurationException("La descripción no puede superar 500 caracteres.");
            }
            avisoActualizado.setDescripcion(aviso.getDescripcion());
        }
    
        if (aviso.getPrecio_mensual() != null) {
            if (aviso.getPrecio_mensual() <= 0) {
                throw new InvalidAvisoConfigurationException("El precio mensual debe ser un número positivo.");
            }
            avisoActualizado.setPrecio_mensual(aviso.getPrecio_mensual());
        }

        if (aviso.getCondiciones() != null) {
            avisoActualizado.setCondiciones(aviso.getCondiciones());
        }

        if (aviso.getImagenes() != null && !aviso.getImagenes().isEmpty()) {
            avisoActualizado.setImagenes(aviso.getImagenes());
        }

        if (aviso.getEstado() != null) {
            avisoActualizado.setEstado(aviso.getEstado());
        }

        if (aviso.getReporte() != null) {
            if (aviso.getReporte().getEstadoReporte() == EstadoReporte.Excluido) {
                aviso.getReporte().setEstadoReporte(EstadoReporte.AvisoActualizado);
                aviso.getReporte().setComentario("El aviso fue actualizado por el propietario.");
            }
        }
        
        
        

        return avisosRepository.save(avisoActualizado);
    }

    @Override
    public String eliminarAviso(ObjectId id) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(id);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }
        AvisosModel aviso = avisoExiste.get();
        avisosRepository.deleteById(id);
        return "El aviso " + aviso.getNombre() + "fue eliminado con éxito.";
    }

    

    @Override 
    public List<AvisosModel> listarAvisos() {
        return avisosRepository.findAll();
    }


    @Override
    public List<AvisosModel> listarAvisosPropietario(ObjectId propietarioId) {
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(propietarioId);
        if (!usuarioExiste.isPresent()){
            throw new UserNotFoundException("El usuario no existe");
        }
        UsuariosModel usuario = usuarioExiste.get();
        if (usuario.getTipo() != TipoUsuario.propietario){
            throw new InvalidUserRoleException("Solamente un propietario puede listar sus avisos.");
        }
        
        return avisosRepository.findByPropietarioIdUsuarioId(propietarioId);
    }



    @Override
    public AvisosModel crearReporte(ObjectId id, ReporteAviso reporte) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(id);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(reporte.getUsuarioReporta());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario no existe.");
        }

        UsuariosModel usuario = usuarioExiste.get();
        if (usuario.getTipo() == TipoUsuario.administrador) {
            throw new InvalidUserRoleException("Un admninistrador no tiene que reportar, directamente puede desactivar la publicación. la función de reportar es para los usuarios como arrendatarios o propietarios.");
        }
        AvisosModel avisoActualizado = avisoExiste.get();

        if (reporte.getMotivo() == null || reporte.getMotivo().isBlank()) {
            throw new InvalidAvisoConfigurationException("El motivo no puede estar vacío.");
        }

        

        
        reporte.setFecha(Instant.now());
        reporte.setEstadoReporte(EstadoReporte.Reportado);
        avisoActualizado.setReporte(reporte);
        return avisosRepository.save(avisoActualizado);  
    }

    @Override
    public List<AvisosModel> listarAvisosConReportes() {
        return avisosRepository.findByReporteIsNotNull();
    }
    
    @Override
    public List<AvisosModel> listarAvisosSinReportes() {
        return avisosRepository.findByReporteIsNullOrReporteEstadoReporte(EstadoReporte.Invalido, EstadoReporte.AvisoActualizado);
    }

    @Override
    public AvisosModel actualizarEstadoReporteSiendoAdministrador(ObjectId id, ReporteAviso reporte) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(id);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }
        AvisosModel aviso = avisoExiste.get();

        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(reporte.getUsuarioReporta());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario no existe.");
        }
        UsuariosModel usuarioAdministrador = usuarioExiste.get();
        if (usuarioAdministrador.getTipo() != TipoUsuario.administrador) {
            throw new InvalidUserRoleException("El usuario no es un administrador.");
        }
        if (reporte.getEstadoReporte() == null) {
            throw new InvalidAvisoConfigurationException("El estado del reporte no puede estar vacío.");
        }
        if (reporte.getEstadoReporte() == EstadoReporte.Reportado) {
            throw new InvalidAvisoConfigurationException("El administrador no tiene necesidad de reportar, el toma la desicion de excluir o de dejar el aviso.");
        } 
        if (reporte.getMotivo() != null) {
            throw new InvalidAvisoConfigurationException("El administrador no tiene necesidad de poner un motivo, el toma la desicion de excluir o de dejar el aviso.");
        }
        if (reporte.getFecha() != null) {
            throw new InvalidAvisoConfigurationException("La fecha se actualizara automaticamente al momento de que el administrador actualiza el estado del reporte.");
        }
        if (reporte.getEstadoReporte() == EstadoReporte.Excluido) {
            if (reporte.getComentario() == null || reporte.getComentario().isBlank()) {
                throw new InvalidAvisoConfigurationException("El administrador tiene que poner un comentario justificando porque exluyo el aviso.");
            }
        }

        //Notificacion al propietario si se excluye un aviso
        Optional<UsuariosModel> usuarioPropietario = usuariosRepository.findById(aviso.getPropietarioId().getUsuarioId());
        UsuariosModel propietario = usuarioPropietario.get();
        if (reporte.getEstadoReporte() == EstadoReporte.Excluido) {
            Notificaciones notificacionPropietario = new Notificaciones();
            notificacionPropietario.setRemitente(usuarioAdministrador.getId());
            notificacionPropietario.setContenido("El administrador " + usuarioAdministrador.getNombre() + " ha excluido su aviso llamado: " + aviso.getNombre() + " en la ubicacion: " + aviso.getUbicacion() + " por la siguiente razón: "+ reporte.getComentario() +".");
            notificacionPropietario.setFecha(Instant.now());
            notificacionPropietario.setTipo(TipoNotificacion.Mensaje);
            notificacionPropietario.setLeido(false);
            propietario.getNotificaciones().add(notificacionPropietario);
            usuariosRepository.save(propietario);
        }

        //Notificación al usuario que hizo el reporte, sobre la decisión del administrador
        Optional<UsuariosModel> usuarioReporta = usuariosRepository.findById(reporte.getUsuarioReporta());
        UsuariosModel usuarioReporto = usuarioReporta.get();
        Notificaciones notificacionQuienReporto = new Notificaciones();
        notificacionQuienReporto.setRemitente(usuarioAdministrador.getId());
        notificacionQuienReporto.setContenido("El administrador " + usuarioAdministrador.getNombre() + " ha tomado la siguiente decisión sobre su reporte del aviso llamado: " + aviso.getNombre() + " en la ubicacion: " + aviso.getUbicacion() + ": " + reporte.getEstadoReporte() + ".");
        notificacionQuienReporto.setFecha(Instant.now());
        notificacionQuienReporto.setTipo(TipoNotificacion.Mensaje);
        notificacionQuienReporto.setLeido(false);
        usuarioReporto.getNotificaciones().add(notificacionQuienReporto);
        usuariosRepository.save(usuarioReporto);   
        reporte.setFecha(Instant.now());
        aviso.setReporte(reporte);

        return avisosRepository.save(aviso);
    }

    @Override
    public List<AvisosModel> filtrarAvisos(String tipo, Integer precioMin, Integer precioMax, String disponibilidad) {
        // Obtener todos los avisos
        List<AvisosModel> avisos = avisosRepository.findAll();

        // Filtrar por tipo de espacio si se especifica
        if (tipo != null && !tipo.isEmpty()) {
            avisos = avisos.stream()
                    .filter(aviso -> aviso.getTipo().toString().equalsIgnoreCase(tipo))
                    .toList();
        }

        // Filtrar por rango de precio si se especifica
        if (precioMin != null || precioMax != null) {
            avisos = avisos.stream()
                    .filter(aviso -> {
                        boolean cumpleMin = precioMin == null || aviso.getPrecio_mensual() >= precioMin;
                        boolean cumpleMax = precioMax == null || aviso.getPrecio_mensual() <= precioMax;
                        return cumpleMin && cumpleMax;
                    })
                    .toList();
        }
        
        // Filtrar por disponibilidad si se especifica
        if (disponibilidad != null && !disponibilidad.isEmpty()) {
            avisos = avisos.stream()
                    .filter(aviso -> aviso.getEstado().toString().equalsIgnoreCase(disponibilidad))
                    .toList();
        }

        // Retornar la lista filtrada
        return avisos;
    }

    //Metodos de la epica 3 mensajeria
    @Override
    public AvisosModel crearChat (ObjectId idAviso, MensajeriaAviso mensaje) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(idAviso);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }
        AvisosModel aviso = avisoExiste.get();
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(mensaje.getIdInteresado());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario interesado no existe.");
        }

        UsuariosModel interesado = usuarioExiste.get();
        if (interesado.getTipo() != TipoUsuario.interesado) {
            throw new InvalidUserRoleException("Solo un usuario interesado puede crear un chat con el propietario");

        }

        Optional<MensajeriaAviso> mensajeAviso = avisosRepository.findByMensajesIdInteresado(mensaje.getIdInteresado());
        if (mensajeAviso.isPresent()) {
            throw new InvalidAvisoConfigurationException("El usuario ya tiene un chat en este aviso.");
        }


        mensaje.setFecha(Instant.now());
        mensaje.setLeido(false);
        aviso.setMensajes(mensaje);
        return avisosRepository.save(aviso);

    }

    @Override
    public AvisosModel mandarMensajes(ObjectId idAviso, ObjectId idInteresado, Mensajes mensaje) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(idAviso);
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso no existe.");
        }
        AvisosModel aviso = avisoExiste.get();

        Optional<MensajeriaAviso> mensajeAviso = avisosRepository.findByMensajesIdInteresado(idInteresado);
        if (!mensajeAviso.isPresent()) {
            throw new ResourceNotFoundException("El mensaje no existe.");
        }
        MensajeriaAviso mensajeExistente = mensajeAviso.get();

        
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(mensajeExistente.getIdInteresado());
        UsuariosModel redactor = usuarioExiste.get();
        if (redactor.getTipo() == TipoUsuario.interesado) {
            if (redactor.getId() != idInteresado) {
                throw new InvalidUserRoleException("El usuario no es el interesado.");
            }
        }
        if (redactor.getTipo() == TipoUsuario.propietario) {
            if (redactor.getId() != aviso.getPropietarioId().getUsuarioId()) {
                throw new InvalidUserRoleException("El usuario no es el propietario.");
            }
        }
        mensajeExistente.getMensajes().add(mensaje);
        return avisosRepository.save(aviso);   
    }

}
