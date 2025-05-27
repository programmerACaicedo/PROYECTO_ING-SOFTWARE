package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidMensajeriaConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;
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
            throw new UserNotFoundException("El usuario con id: "+ chat.getIdInteresado()+" no existe.");
        }
        UsuariosModel interesado = usuarioExiste.get();

        if (interesado.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
            throw new InvalidUserRoleException("Un usuario no se puede interesar por un aviso que es de su propiedad. ");
        }
        if (interesado.getTipo() == TipoUsuario.administrador) {
            throw new InvalidUserRoleException("Un administrador no se puede interesar por un aviso. ");
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

    @Override
    @Transactional
    public MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria mensajes) {
        Optional<MensajeriaModel> chatExiste = MensajeriaRepository.findById(idMensajeria);
        if (!chatExiste.isPresent()) {
            throw new ResourceNotFoundException("La mensajeria con id: " + idMensajeria + "no existe. ");
        }
        MensajeriaModel chat = chatExiste.get();

        Optional<AvisosModel> avisoExiste = AvisosRepository.findById(chat.getIdAviso());
        AvisosModel aviso = avisoExiste.get();

        Optional<UsuariosModel> usuarioExiste = UsuarioRepository.findById(mensajes.getIdRemitente());
        if (!usuarioExiste.isPresent()) {
            throw new UserNotFoundException("El id: "+ mensajes.getIdRemitente() + " no pertenece a ningun usuario existente. ");
        }
        UsuariosModel usuario = usuarioExiste.get();

        if (usuario.getId().equals(chat.getIdInteresado()) || usuario.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
            // ok
        } else {
            throw new InvalidUserRoleException("El usuario remitente debe ser el mismo usuario que creo el chat o el propietario del aviso. ");
        }
        

        if (chat.getMensajes() == null || chat.getMensajes().isEmpty()) {
            if (!usuario.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
                throw new InvalidUserRoleException("El propietario debe responder el mensaje del interesado. ");
            }
        } else {
            MensajesMensajeria ultimoMensaje = chat.getMensajes().get(chat.getMensajes().size() - 1);

            if (ultimoMensaje.getIdRemitente().equals(chat.getIdInteresado())) {
                if (!usuario.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
                    throw new InvalidUserRoleException("El propietario debe responder al mensaje del interesado.");
                }
            } else {
                if (!usuario.getId().equals(chat.getIdInteresado())) {
                    throw new InvalidUserRoleException("El interesado debe responder al mensaje del propietario.");
                }
            }
        }
        mensajes.setFecha(Instant.now());
        mensajes.setLeido(false);
        chat.getMensajes().add(mensajes);
        return MensajeriaRepository.save(chat);
    }

    @Override
    public MensajeriaModel mostrarChat(String idMensajeria) {
        Optional<MensajeriaModel> chatExiste = MensajeriaRepository.findById(new ObjectId(idMensajeria));
        if (!chatExiste.isPresent()) {
            throw new ResourceNotFoundException("El chat con id:" + idMensajeria +" no existe.");
        }
        return chatExiste.get();
    }

    @Override
    public MensajeriaModel obtenerChat(ObjectId idMensajeria) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerChat'");
    }

    @Override
    public List<MensajeriaModel> obtenerConversacionesPorUsuario(String userId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerConversacionesPorUsuario'");
    }

    @Override
    public MensajeriaModel mandarMensaje(String idMensajeria, MensajesMensajeria mensajes) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'mandarMensaje'");
    }

    // Método para buscar conversaciones por interesado o propietario
    public List<MensajeriaModel> findByInteresadoOrPropietario(String idInteresado, String propietarioId) {
        ObjectId interesadoId = new ObjectId(idInteresado); // Convertir String a ObjectId
        return MensajeriaRepository.findByIdInteresadoOrPropietarioId(interesadoId, propietarioId);
    }

    // Método para buscar conversación por interesado y aviso
    public Optional<MensajeriaModel> findByInteresadoAndAviso(String idInteresado, String idAviso) {
        ObjectId interesadoId = new ObjectId(idInteresado);
        ObjectId avisoId = new ObjectId(idAviso);
        return MensajeriaRepository.findByIdInteresadoAndIdAviso(interesadoId, avisoId);
    }
}
