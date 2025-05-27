package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

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

    // Obtener el nombre del propietario
    String nombrePropietario = aviso.getPropietarioId().getNombre();

    // Modificar el mensaje para incluir el nombre del propietario
    chat.setMensaje("Hola " + nombrePropietario + ", soy "+ interesado.getNombre() + " y estoy interesado en tu aviso llamado: "+ aviso.getNombre());
    chat.setFecha(Instant.now());
    chat.setLeido(false);

    // Crear el mensaje inicial y agregarlo al array de mensajes
    MensajesMensajeria mensajeInicial = new MensajesMensajeria();
    mensajeInicial.setIdRemitente(interesado.getId());
    mensajeInicial.setMensaje(chat.getMensaje());
    mensajeInicial.setFecha(chat.getFecha());
    mensajeInicial.setLeido(false);
    chat.getMensajes().add(mensajeInicial);

    return MensajeriaRepository.save(chat);
}

@Override
@Transactional
public MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria mensajes){
    // Verificar si el chat existe
    Optional<MensajeriaModel> chatExiste = MensajeriaRepository.findById(idMensajeria);
    if (!chatExiste.isPresent()) {
        throw new ResourceNotFoundException("La mensajeria con id: " + idMensajeria + " no existe.");
    }
    MensajeriaModel chat = chatExiste.get();

    // Verificar si el aviso asociado existe
    Optional<AvisosModel> avisoExiste = AvisosRepository.findById(chat.getIdAviso());
    if (!avisoExiste.isPresent()) {
        throw new ResourceNotFoundException("El aviso con id: " + chat.getIdAviso() + " no existe.");
    }
    AvisosModel aviso = avisoExiste.get();

    // Verificar si el usuario remitente existe
    Optional<UsuariosModel> usuarioExiste = UsuarioRepository.findById(mensajes.getIdRemitente());
    if (!usuarioExiste.isPresent()) {
        throw new UserNotFoundException("El id: " + mensajes.getIdRemitente() + " no pertenece a ningún usuario existente.");
    }
    UsuariosModel usuario = usuarioExiste.get();

    // Validar que el remitente sea el interesado o el propietario
    if (!usuario.getId().equals(chat.getIdInteresado()) && !usuario.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
        throw new InvalidUserRoleException("El usuario remitente debe ser el mismo usuario que creó el chat o el propietario del aviso.");
    }

    // Depuración: Registrar información útil
    System.out.println("Enviando mensaje - Chat ID: " + idMensajeria);
    System.out.println("Remitente: " + mensajes.getIdRemitente() + ", Mensaje: " + mensajes.getMensaje());
    System.out.println("Interesado: " + chat.getIdInteresado() + ", Propietario: " + aviso.getPropietarioId().getUsuarioId());

    // Temporalmente relajar la validación de alternancia para depurar

    if (chat.getMensajes() == null || chat.getMensajes().isEmpty()) {
        if (!usuario.getId().equals(aviso.getPropietarioId().getUsuarioId())) {
            throw new InvalidUserRoleException("El propietario debe responder el mensaje del interesado.");
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
    

    // Configurar y agregar el mensaje
    mensajes.setFecha(Instant.now());
    mensajes.setLeido(false);
    chat.getMensajes().add(mensajes);

    // Guardar y devolver el chat actualizado
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
    public List<MensajeriaModel> obtenerConversacionesPorUsuario(String userId) {
    ObjectId userObjectId = new ObjectId(userId);

    // Obtener conversaciones donde el usuario es el interesado
    List<MensajeriaModel> conversacionesInteresado = MensajeriaRepository.findByIdInteresado(userObjectId);

    // Obtener avisos donde el usuario es el propietario
    List<AvisosModel> avisosPropietario = AvisosRepository.findByPropietarioId(userId);
    List<MensajeriaModel> conversacionesPropietario = new ArrayList<>();

    for (AvisosModel aviso : avisosPropietario) {
        List<MensajeriaModel> chats = MensajeriaRepository.findByIdAviso(aviso.getId());
        conversacionesPropietario.addAll(chats);
    }

    // Combinar ambas listas y eliminar duplicados
    Set<MensajeriaModel> conversacionesUnicas = new HashSet<>();
    conversacionesUnicas.addAll(conversacionesInteresado);
    conversacionesUnicas.addAll(conversacionesPropietario);

    return new ArrayList<>(conversacionesUnicas);
}

@Override
public MensajeriaModel obtenerChat(ObjectId idMensajeria) {
    Optional<MensajeriaModel> chatExiste = MensajeriaRepository.findById(idMensajeria);
    if (!chatExiste.isPresent()) {
        throw new ResourceNotFoundException("El chat con id: " + idMensajeria + " no existe.");
    }
    return chatExiste.get();
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

@Override
public MensajeriaModel mandarMensaje(String idMensajeria, MensajesMensajeria mensajes) {
    return mandarMensaje(new ObjectId(idMensajeria), mensajes); // Reutilizar la implementación existente
}

    @Override
    public MensajeriaModel verificarChat(String idInteresado, String idAviso) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'verificarChat'");
    }


}
