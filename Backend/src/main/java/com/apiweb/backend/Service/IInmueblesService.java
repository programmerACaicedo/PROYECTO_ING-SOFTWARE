package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.InmueblesModel;

public interface IInmueblesService {
    public String guardarInmueble(InmueblesModel inmueble);
    public InmueblesModel actualizarInmueble(ObjectId id, InmueblesModel inmueble);
    public String eliminarInmueble(ObjectId id);
}

