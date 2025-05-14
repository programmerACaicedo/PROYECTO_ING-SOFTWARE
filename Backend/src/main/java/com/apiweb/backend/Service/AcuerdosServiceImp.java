package com.apiweb.backend.Service;

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
        if (acuerdo.getCalificacionServicio() != null && !acuerdo.getCalificacionServicio().isEmpty()) {
            throw new InvalidUserRoleException("El propietario no puede calificar el servicio");
        }
        if(acuerdo.getFechaFin().isBefore(acuerdo.getFechaInicio())){
            throw new IllegalArgumentException("La fecha de finalización del arrendamiento no puede ser anterior a la fecha de inicio.");
        }


        Optional<UsuariosModel> arrendatarioExiste = usuariosRepository.findById(acuerdo.getArrendatario().getUsuarioId());
        if (!arrendatarioExiste.isPresent()) {
            throw new UserNotFoundException("El id: " + acuerdo.getArrendatario().getUsuarioId() + " no corresponde a un usuario.");
        }
        UsuariosModel arrendatario = arrendatarioExiste.get();
        if (arrendatario.getTipo() != TipoUsuario.interesado) {
            throw new InvalidUserRoleException("El id: " + acuerdo.getArrendatario().getUsuarioId() + " ingresado en 'usuario_id' de arrendatario no corresponde al de un interesado.");
        }
        if (acuerdo.getExtensiones() != null && !acuerdo.getExtensiones().isEmpty()) {
            throw new InvalidAcuerdoConfigurationException("El acuerdo no puede tener extensiones al momento de su creación.");
        }

        aviso.setEstado(EstadoAviso.Arrendado);
        acuerdo.setEstado(EstadoAcuerdo.Activo);
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
            if (extension.getFechaFin().isBefore(acuerdoActualizar.getFechaFin())) {
                throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la anterior fecha fin original. ");
            } else {
                for(ExtensionAcuerdo extensionAcuer : acuerdoActualizar.getExtensiones()){
                    if (extension.getFechaFin().isBefore(extensionAcuer.getFechaFin())) {
                        throw new InvalidAcuerdoConfigurationException("La nueva fecha fin de extensión debe ser despues de la anterior fecha fin extension. ");
                    }
                }
            }
        }

        return acuerdosRepository.save(acuerdoActualizar);

    }

    @Override
    public AcuerdosModel cancelarAcuerdo(ObjectId idAcuerdo, EstadoAcuerdo estado) {
        Optional<AcuerdosModel> acuerdoExiste = acuerdosRepository.findById(idAcuerdo);
        if (!acuerdoExiste.isPresent()) {
            throw new ResourceNotFoundException("El id: " + idAcuerdo + " no corresponde a un acuerdo.");
        }
        AcuerdosModel acuerdo = acuerdoExiste.get();

        if (estado != EstadoAcuerdo.Cancelado) {
            throw new InvalidAcuerdoConfigurationException("Este metodo es solo para cancelar un acuerdo. ");
        }
        acuerdo.setEstado(estado);

        return acuerdosRepository.save(acuerdo);
    }
}
