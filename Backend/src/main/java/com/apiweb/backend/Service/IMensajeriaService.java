package com.apiweb.backend.Service;

import org.bson.types.ObjectId;
import java.util.List;
import java.util.Optional;

import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;

public interface IMensajeriaService {
    MensajeriaModel crearChat(MensajeriaModel chat);
    MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria mensajes);
    MensajeriaModel obtenerChat(ObjectId idMensajeria);
    List<MensajeriaModel> obtenerConversacionesPorUsuario(String userId);
    MensajeriaModel mandarMensaje(String idMensajeria, MensajesMensajeria mensajes);
    MensajeriaModel mostrarChat(String idMensajeria);
    MensajeriaModel verificarChat(String idInteresado, String idAviso);
    Optional<MensajeriaModel> findByInteresadoAndAviso(String idInteresado, String idAviso);
    MensajeriaModel mostrarChat(ObjectId idMensajeria);
}