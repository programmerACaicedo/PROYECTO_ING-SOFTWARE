package com.apiweb.backend.Service;

import java.util.List;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.ReporteAviso;

public interface IAvisosService {
    public AvisosModel crearAviso(AvisosModel aviso);
    public AvisosModel actualizarAviso(ObjectId id, AvisosModel aviso);
    public String eliminarAviso(ObjectId id);
    public List<AvisosModel> listarAvisos();
    public List<AvisosModel> listarAvisosPropietario(ObjectId propietarioId);
    public AvisosModel actualizarEstadoSiendoAdministrador(ObjectId id, AvisosModel aviso);
    public AvisosModel crearReporte(ObjectId id, ReporteAviso reporte);
    public List<AvisosModel> listarAvisosConReportes();
}
