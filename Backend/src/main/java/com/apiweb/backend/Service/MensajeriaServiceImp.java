package com.apiweb.backend.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apiweb.backend.Exception.InvalidMensajeriaConfigurationException;
import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;
import com.apiweb.backend.Model.Notificaciones;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.TipoNotificacion;
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

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

@Override
@Transactional
public MensajeriaModel crearChat(MensajeriaModel chat) {
    // 1. Validaciones básicas de existencia
    AvisosModel aviso = AvisosRepository.findById(chat.getIdAviso())
        .orElseThrow(() -> new ResourceNotFoundException(
            "El aviso con el id: " + chat.getIdAviso() + " no existe."));
    UsuariosModel interesado = UsuarioRepository.findById(chat.getIdInteresado())
        .orElseThrow(() -> new UserNotFoundException(
            "El usuario con id: " + chat.getIdInteresado() + " no existe."));
    
    // 2. Validaciones de roles
    ObjectId idPropietario = aviso.getPropietarioId().getUsuarioId();
    if (interesado.getId().equals(idPropietario)) {
        throw new InvalidUserRoleException(
            "Un usuario no se puede interesar por un aviso que es de su propiedad.");
    }
    if (interesado.getTipo() == TipoUsuario.administrador) {
        throw new InvalidUserRoleException(
            "Un administrador no se puede interesar por un aviso.");
    }

    // 3. Validar que no exista ya un chat entre interesado y aviso
    if (MensajeriaRepository
          .findByIdInteresadoAndIdAviso(interesado.getId(), chat.getIdAviso())
          .isPresent()) {
        throw new InvalidMensajeriaConfigurationException(
            "El interesado con id: " + chat.getIdInteresado()
            + " ya tiene un chat creado con ese aviso");
    }

    // 4. Preparar nombres y mensaje inicial
    String nombrePropietario   = aviso.getPropietarioId().getNombre();
    String nombreInteresado    = interesado.getNombre();
    String textoInicial = String.format(
        "Hola %s, soy %s y estoy interesado en tu aviso llamado: %s",
        nombrePropietario, nombreInteresado, aviso.getNombre()
    );

    // 5. Setear datos en el chat
    chat.setMensaje(textoInicial);
    chat.setFecha(Instant.now());
    chat.setLeido(false);
    chat.setNombrePropietario(nombrePropietario);
    chat.setNombreInteresado(nombreInteresado);

    // 6. Crear y agregar el mensaje inicial
    MensajesMensajeria mensajeInicial = new MensajesMensajeria();
    mensajeInicial.setIdRemitente(interesado.getId());
    mensajeInicial.setNombreRemitente(nombreInteresado);
    mensajeInicial.setIdDestinatario(idPropietario);
    mensajeInicial.setNombreDestinatario(nombrePropietario);
    mensajeInicial.setMensaje(textoInicial);
    mensajeInicial.setFecha(chat.getFecha());
    mensajeInicial.setLeido(false);

    chat.getMensajes().add(mensajeInicial);

    // 7. Guardar y devolver
    return MensajeriaRepository.save(chat);
}

@Override
@Transactional
public MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria nuevoMsg) {
    System.out.println("Iniciando mandarMensaje para id: " + idMensajeria);
    MensajeriaModel chat = MensajeriaRepository.findById(idMensajeria)
        .orElseThrow(() -> new ResourceNotFoundException(
            "La mensajería con id: " + idMensajeria + " no existe."));

    AvisosModel aviso = AvisosRepository.findById(chat.getIdAviso())
        .orElseThrow(() -> new ResourceNotFoundException(
            "El aviso con id: " + chat.getIdAviso() + " no existe."));

    UsuariosModel remitente = UsuarioRepository.findById(nuevoMsg.getIdRemitente())
        .orElseThrow(() -> new UserNotFoundException(
            "El id: " + nuevoMsg.getIdRemitente() + " no pertenece a ningún usuario."));

    ObjectId idInteresado = chat.getIdInteresado();
    ObjectId idPropietario = aviso.getPropietarioId().getUsuarioId();

    if (!remitente.getId().equals(idInteresado)
     && !remitente.getId().equals(idPropietario)) {
        throw new InvalidUserRoleException("El remitente debe ser el interesado o el propietario del aviso.");
    }

    if (!chat.getMensajes().isEmpty()) {
        MensajesMensajeria ultimo = chat.getMensajes().get(chat.getMensajes().size() - 1);
        if (ultimo.getIdRemitente().equals(idInteresado)
         && !remitente.getId().equals(idPropietario)) {
            throw new InvalidUserRoleException("El propietario debe responder al mensaje del interesado.");
        }
        if (ultimo.getIdRemitente().equals(idPropietario)
         && !remitente.getId().equals(idInteresado)) {
            throw new InvalidUserRoleException("El interesado debe responder al mensaje del propietario.");
        }
    } else {
        if (!remitente.getId().equals(idPropietario)) {
            throw new InvalidUserRoleException("El propietario debe responder el primer mensaje del interesado.");
        }
    }

    ObjectId destinatario = remitente.getId().equals(idInteresado) ? idPropietario : idInteresado;
    String nombreDest = remitente.getId().equals(idInteresado)
        ? aviso.getPropietarioId().getNombre()
        : chat.getNombreInteresado();

    nuevoMsg.setIdDestinatario(destinatario);
    nuevoMsg.setNombreDestinatario(nombreDest);
    nuevoMsg.setNombreRemitente(remitente.getNombre());
    nuevoMsg.setFecha(Instant.now());
    nuevoMsg.setLeido(false);
    nuevoMsg.setNombreRemitente(remitente.getNombre());
    // Obtener el usuario destinatario para obtener su nombre
    UsuariosModel usuarioDest = UsuarioRepository.findById(destinatario).orElse(null);
    nuevoMsg.setNombreDestinatario(usuarioDest != null ? usuarioDest.getNombre() : "");

    chat.getMensajes().add(nuevoMsg);

    // Crear notificación
    Notificaciones notificacion = new Notificaciones();
    notificacion.setTipo(TipoNotificacion.Mensaje); // Usa el enum, NO el string
    notificacion.setContenido("Nuevo mensaje de " + remitente.getNombre());
    notificacion.setFecha(Instant.now());
    notificacion.setLeido(false);

    // Guardar notificación en el usuario destinatario
    UsuariosModel usuarioDestinatario = UsuarioRepository.findById(destinatario)
        .orElse(null);
    if (usuarioDestinatario != null) {
        usuarioDestinatario.getNotificaciones().add(notificacion);
        UsuarioRepository.save(usuarioDestinatario);

        // Enviar notificación por WebSocket
        messagingTemplate.convertAndSend(
            "/topic/notificaciones/" + destinatario.toHexString(),
            notificacion
        );
    }

    System.out.println("Finalizando mandarMensaje");
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

    // 1) Chats donde el usuario es el interesado
    List<MensajeriaModel> conversacionesInteresado =
        MensajeriaRepository.findByIdInteresado(userObjectId);

    // 2) Chats donde el usuario es propietario de avisos
    List<AvisosModel> avisosPropietario =
        AvisosRepository.findByPropietarioIdUsuarioId(userObjectId);
    List<MensajeriaModel> conversacionesPropietario = new ArrayList<>();
    for (AvisosModel aviso : avisosPropietario) {
        conversacionesPropietario.addAll(
            MensajeriaRepository.findByIdAviso(aviso.getId())
        );
    }

    // 3) Unir y eliminar duplicados
    Set<MensajeriaModel> conversacionesUnicas = new HashSet<>();
    conversacionesUnicas.addAll(conversacionesInteresado);
    conversacionesUnicas.addAll(conversacionesPropietario);

    // 4) Para cada conversación, cargar nombres y poblar mensajes
    List<MensajeriaModel> resultado = new ArrayList<>();
    for (MensajeriaModel chat : conversacionesUnicas) {
        // 4a) Nombre de interesado
        UsuariosModel interesado = UsuarioRepository
            .findById(chat.getIdInteresado()).orElse(null);
        chat.setNombreInteresado(
            interesado != null ? interesado.getNombre() : ""
        );

        // 4b) Nombre de propietario (desde el aviso)
        AvisosModel aviso = AvisosRepository.findById(chat.getIdAviso())
            .orElse(null);
        UsuariosModel propietario = aviso != null
            ? UsuarioRepository.findById(aviso.getPropietarioId().getUsuarioId()).orElse(null)
            : null;
        chat.setNombrePropietario(
            propietario != null ? propietario.getNombre() : ""
        );

        // 4c) Para cada mensaje interno, setear remitente y destinatario
        for (MensajesMensajeria msg : chat.getMensajes()) {
            // Remitente
            UsuariosModel rem = UsuarioRepository
                .findById(msg.getIdRemitente()).orElse(null);
            msg.setNombreRemitente(
                rem != null ? rem.getNombre() : ""
            );
            // Destinatario
            UsuariosModel dest = UsuarioRepository
                .findById(msg.getIdDestinatario()).orElse(null);
            msg.setNombreDestinatario(
                dest != null ? dest.getNombre() : ""
            );
        }

        resultado.add(chat);
    }

    return resultado;
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

    @Override
    public MensajeriaModel mostrarChat(ObjectId idMensajeria) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'mostrarChat'");
    }

    


}
