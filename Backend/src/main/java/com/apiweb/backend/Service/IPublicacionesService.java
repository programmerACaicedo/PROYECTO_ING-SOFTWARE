package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.PublicacionesModel;
import com.apiweb.backend.Model.Reportes;

public interface IPublicacionesService {
    public String guardarPublicacion(PublicacionesModel publicacion);
    public PublicacionesModel actualizarPublicacion(ObjectId id, PublicacionesModel publicacion);
    public String eliminarPublicacion(ObjectId id);
    public PublicacionesModel agregarReporte(ObjectId publicacionId, Reportes reporte);
//    public PublicacionesModel añadirReportePublicacion (ObjectId id, PublicacionesModel publicacion);
}