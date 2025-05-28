package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidAvisoConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
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
    @Transactional
    public AvisosModel crearAviso(AvisosModel aviso) {
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(aviso.getPropietarioId().getUsuarioId());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario no existe.");
        }
        UsuariosModel usuario = usuarioExiste.get();
        if (usuario.getTipo() != TipoUsuario.propietario){
            throw new InvalidUserRoleException("Solamente un propietario puede crear un aviso.");
        }
        if (aviso.getReporte() != null && !aviso.getReporte().isEmpty()) {
            throw new InvalidAvisoConfigurationException("El aviso no puede tener un reporte al momento de crearse.");
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

        if (aviso.getReporte() != null && !aviso.getReporte().isEmpty()) {
            aviso.getReporte().stream().filter(reporte -> reporte.getEstadoReporte() == EstadoReporte.Excluido).forEach(reporte -> {
                reporte.setEstadoReporte(EstadoReporte.AvisoActualizado);
                reporte.setComentario("El aviso fue actualizado por el propietario para cumplir con las normas.");
            });
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
        List<AvisosModel> avisos = avisosRepository.findAll();
        for (AvisosModel aviso : avisos) {
            System.out.println("URLs de imágenes: " + aviso.getImagenes());
        }
        return avisos;
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
    @Transactional
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
        avisoActualizado.getReporte().add(reporte);

        //Notificacion al propietario
        
        return avisosRepository.save(avisoActualizado);  
    }

    @Override
    public List<AvisosModel> listarAvisosConReportes() {
        return avisosRepository.findByReporteIsNotNull();
    }
    
    @Override
    public List<AvisosModel> listarAvisosSinExluir() {
        List<AvisosModel> avisosNoExcluidos = avisosRepository.findAvisosWithoutExcludedReports(EstadoReporte.Excluido);
        return avisosNoExcluidos; 
    }

    @Override
    @Transactional
    public AvisosModel decidirReporte(ObjectId idAviso,ObjectId idReporte ,ReporteAviso reporte) {
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(idAviso);
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
        
        Optional<ReporteAviso> optReporte = aviso.getReporte().stream()
            .filter(r -> r.getIdReporte().equals(idReporte))
            .findFirst();
        if (!optReporte.isPresent()) {
            throw new ResourceNotFoundException("El reporte especificado no existe en el aviso.");
        }
        ReporteAviso reporteSeleccionado = optReporte.get();

        if (reporte.getEstadoReporte() == EstadoReporte.Invalido) {
            // Se marca el reporte como inválido
            reporteSeleccionado.setEstadoReporte(EstadoReporte.Invalido);
            reporteSeleccionado.setFecha(Instant.now());
            
            // Notificar al usuario que realizó el reporte
            Optional<UsuariosModel> usuarioReportaOpt = usuariosRepository.findById(reporteSeleccionado.getUsuarioReporta());
            if (usuarioReportaOpt.isPresent()) {
                    UsuariosModel usuarioReporto = usuarioReportaOpt.get();
                    Notificaciones notificacionReporto = new Notificaciones();
                    notificacionReporto.setRemitente(usuarioAdministrador.getId());
                    notificacionReporto.setContenido("El administrador " + usuarioAdministrador.getNombre() +" ha marcado su reporte sobre el aviso '" + aviso.getNombre() + "' como inválido.");
                    notificacionReporto.setFecha(Instant.now());
                    notificacionReporto.setTipo(TipoNotificacion.Mensaje);
                    notificacionReporto.setLeido(false);
                    usuarioReporto.getNotificaciones().add(notificacionReporto);
                    usuariosRepository.save(usuarioReporto);
            }
        } else if (reporte.getEstadoReporte() == EstadoReporte.Excluido) {
            // Validar que se proporcione un comentario justificativo
            if (reporte.getComentario() == null || reporte.getComentario().isBlank()) {
                throw new InvalidAvisoConfigurationException("El administrador debe proporcionar un comentario justificando la exclusión.");
            }
            
            // Filtrar y actualizar TODOS los reportes que estén en estado Reportado
            List<ReporteAviso> reportesAActualizar = aviso.getReporte().stream()
                    .filter(r -> r.getEstadoReporte() == EstadoReporte.Reportado)
                    .toList();
            if (reportesAActualizar.isEmpty()) {
                throw new InvalidAvisoConfigurationException("No hay reportes en estado Reportado para actualizar.");
            }
            
            for (ReporteAviso rep : reportesAActualizar) {
                rep.setEstadoReporte(EstadoReporte.Excluido);
                rep.setFecha(Instant.now());
                rep.setComentario(reporte.getComentario());
            }
            
            // Notificar al propietario del aviso sobre la exclusión
            Optional<UsuariosModel> usuarioPropietarioOpt = usuariosRepository.findById(aviso.getPropietarioId().getUsuarioId());
            if (usuarioPropietarioOpt.isPresent()) {
                UsuariosModel propietario = usuarioPropietarioOpt.get();
                Notificaciones notificacionPropietario = new Notificaciones();
                notificacionPropietario.setRemitente(usuarioAdministrador.getId());
                notificacionPropietario.setContenido("El administrador " + usuarioAdministrador.getNombre() +
                        " ha excluido su aviso '" + aviso.getNombre() + "' por la siguiente razón: " + reporte.getComentario());
                notificacionPropietario.setFecha(Instant.now());
                notificacionPropietario.setTipo(TipoNotificacion.Mensaje);
                notificacionPropietario.setLeido(false);
                propietario.getNotificaciones().add(notificacionPropietario);
                usuariosRepository.save(propietario);
            }
            
            // Notificar a cada usuario que realizó un reporte (sólo para aquellos que estaban en Reportado)
            reportesAActualizar.forEach(rep -> {
                Optional<UsuariosModel> usuarioReportaOpt = usuariosRepository.findById(rep.getUsuarioReporta());
                if (usuarioReportaOpt.isPresent()) {
                    UsuariosModel usuarioReporto = usuarioReportaOpt.get();
                    Notificaciones notificacionReporto = new Notificaciones();
                    notificacionReporto.setRemitente(usuarioAdministrador.getId());
                    notificacionReporto.setContenido("El administrador " + usuarioAdministrador.getNombre() +" ha decidido excluir el aviso '" + aviso.getNombre() + "' basándose en su reporte.");
                    notificacionReporto.setFecha(Instant.now());
                    notificacionReporto.setTipo(TipoNotificacion.Mensaje);
                    notificacionReporto.setLeido(false);
                    usuarioReporto.getNotificaciones().add(notificacionReporto);
                    usuariosRepository.save(usuarioReporto);
                }
            });
        } else {
        throw new InvalidAvisoConfigurationException("La decisión debe ser Invalido o Excluido.");
        }
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


}
