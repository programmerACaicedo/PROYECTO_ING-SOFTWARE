package com.apiweb.backend.Service;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.InvalidAvisoConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.EstadoAviso;
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
        Optional<UsuariosModel> usuarioExiste = usuariosRepository.findById(aviso.getPropietarioId().getUsuario_id());
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
    
}
