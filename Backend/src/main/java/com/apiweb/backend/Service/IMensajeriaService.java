package com.apiweb.backend.Service;


import org.bson.types.ObjectId;

import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;

public interface IMensajeriaService {
    public MensajeriaModel crearChat(MensajeriaModel chat); //Ya esta testeado en postman
    public MensajeriaModel mandarMensaje(ObjectId idMensajeria, MensajesMensajeria mensajes); //Ya esta hecho el metodo pero falta testear en postman
}
