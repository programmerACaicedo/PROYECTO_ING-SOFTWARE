package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.PublicacionesModel;

public interface IPublicacionesService {
    public String guardarPublicacion(PublicacionesModel publicacion);
    public PublicacionesModel actualizarPublicacion(ObjectId id, PublicacionesModel publicacion);
    public String eliminarPublicacion(ObjectId id);
}