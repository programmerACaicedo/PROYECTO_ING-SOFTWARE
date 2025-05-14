package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidMensajeriaConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.TipoUsuario;
import com.apiweb.backend.Repository.IAvisosRepository;
import com.apiweb.backend.Repository.IMensajeriaRepository;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class MensajeriaServiceImp implements IMensajeriaService{
    
    @Autowired
    IMensajeriaRepository MensajeriaRepository;

    @Autowired
    IAvisosRepository AvisosRepository;

    @Autowired
    IUsuariosRepository UsuarioRepository;

    @Override
    @Transactional
    public MensajeriaModel crearChat(MensajeriaModel chat) {
        Optional<AvisosModel> avisoExiste = AvisosRepository.findById(chat.getIdAviso());
        if (!avisoExiste.isPresent()) {
            throw new ResourceNotFoundException("El aviso con el id: "+ chat.getIdAviso() + " no existe.");
        }
        AvisosModel aviso = avisoExiste.get();
        Optional<UsuariosModel> usuarioExiste = UsuarioRepository.findById(chat.getIdInteresado());
        if (!usuarioExiste.isPresent()) {
            throw new ResourceNotFoundException("El usuario con id: "+ chat.getIdInteresado()+" no existe.");
        }
        UsuariosModel interesado = usuarioExiste.get();
        if (interesado.getTipo() != TipoUsuario.interesado) {
            throw new InvalidUserRoleException("Solo un usuario el tipo 'interesado' puede crear un chat. ");
        }
        Optional<MensajeriaModel> mensajeExiste = MensajeriaRepository.findByIdInteresadoAndIdAviso(chat.getIdInteresado(),chat.getIdAviso());
        if (mensajeExiste.isPresent()){
            throw new InvalidMensajeriaConfigurationException("El interesado con id: " + chat.getIdInteresado() + " ya tiene un chat creado con ese aviso");
        }

        chat.setMensaje("Hola, soy "+ interesado.getNombre() + " y estoy interesado en tu aviso llamado: "+ aviso.getNombre());
        chat.setFecha(Instant.now());
        chat.setLeido(false);
        return MensajeriaRepository.save(chat);
    }
}
