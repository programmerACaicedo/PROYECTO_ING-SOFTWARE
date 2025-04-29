package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AvisosModel;

public interface IAvisosService {
    public AvisosModel crearAviso(AvisosModel aviso);
    public AvisosModel actualizarAviso(ObjectId id, AvisosModel aviso);
    public String eliminarAviso(ObjectId id);
}
