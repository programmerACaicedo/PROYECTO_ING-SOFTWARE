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
import com.apiweb.backend.Model.ReporteAviso;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.EstadoAviso;
import com.apiweb.backend.Model.ENUM.EstadoReporte;
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
        if (aviso.getReporte() != null || aviso.getMensaje_interes() != null) {
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
        return avisosRepository.findByReporteIsNullOrReporteEstadoReporte(EstadoReporte.Invalido);
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
        if (usuarioExiste.get().getTipo() != TipoUsuario.administrador) {
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
        
        
        reporte.setFecha(Instant.now());
        aviso.setReporte(reporte);

        return avisosRepository.save(aviso);
    }
}
