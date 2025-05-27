package com.apiweb.backend.Service;

import org.bson.types.ObjectId;
import java.util.List;

import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;

public interface IMensajeriaService {
    MensajeriaModel crearChat(MensajeriaModel chat);
    MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria mensajes);
    MensajeriaModel obtenerChat(ObjectId idMensajeria);
    List<MensajeriaModel> obtenerConversacionesPorUsuario(String userId);
    MensajeriaModel mandarMensaje(String idMensajeria, MensajesMensajeria mensajes);
    MensajeriaModel mostrarChat(String idMensajeria);
}