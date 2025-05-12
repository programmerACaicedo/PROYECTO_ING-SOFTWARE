package com.apiweb.backend.Service;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.AvisosModel;
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
        Optional<AvisosModel> avisoExiste = avisosRepository.findById(acuerdo.getAvisos_id());
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
        if (acuerdo.getCalificacion_servicio() != null && !acuerdo.getCalificacion_servicio().isEmpty()) {
            throw new InvalidUserRoleException("El propietario no puede calificar el servicio");
        }
        if(acuerdo.getFecha_fin().isBefore(acuerdo.getFecha_inicio())){
            throw new IllegalArgumentException("La fecha de finalización del arrendamiento no puede ser anterior a la fecha de inicio.");
        }


        Optional<UsuariosModel> arrendatarioExiste = usuariosRepository.findById(acuerdo.getArrendatario().getUsuario_id());
        if (!arrendatarioExiste.isPresent()) {
            throw new UserNotFoundException("El id: " + acuerdo.getArrendatario().getUsuario_id() + " no corresponde a un usuario.");
        }
        UsuariosModel arrendatario = arrendatarioExiste.get();
        if (arrendatario.getTipo() != TipoUsuario.interesado) {
            throw new InvalidUserRoleException("El id: " + acuerdo.getArrendatario().getUsuario_id() + " ingresado en 'usuario_id' de arrendatario no corresponde ad de un interesado.");
        }

        aviso.setEstado(EstadoAviso.Arrendado);
        acuerdo.setEstado(EstadoAcuerdo.Activo);
        return acuerdosRepository.save(acuerdo);
    }
}
