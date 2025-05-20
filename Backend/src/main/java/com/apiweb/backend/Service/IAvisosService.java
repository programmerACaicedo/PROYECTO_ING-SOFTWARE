package com.apiweb.backend.Service;

import java.util.List;


import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.ReporteAviso;

public interface IAvisosService {
    public AvisosModel crearAviso(AvisosModel aviso); //Este post es para un usuario propietario que desea crear un aviso
    public AvisosModel actualizarAviso(ObjectId id, AvisosModel aviso); //Este post es para un usuario propietario que desea actualizar su aviso
    public String eliminarAviso(ObjectId id); //Este delate es para un administrador que desea eliminar un aviso
    public AvisosModel crearReporte(ObjectId id, ReporteAviso reporte); //Este put es para un usuario que desea reportar un aviso (no administrador)
    public AvisosModel decidirReporte(ObjectId idAviso,ObjectId idReporte ,ReporteAviso reporte);
    public List<AvisosModel> listarAvisos(); //Este get es para visualizar todos los avisos sin importar si esta reportado o no (para el administrador)
    public List<AvisosModel> listarAvisosPropietario(ObjectId propietarioId); //Este get es para que los propietarios puedan ver sus publicaciones creadas
    public List<AvisosModel> listarAvisosConReportes(); //Este get es para administradores
    public List<AvisosModel> listarAvisosSinReportes(); //Este get es para mostrar en la pagina principal todos los avisos que no tienen reportes
    public List<AvisosModel> filtrarAvisos(String tipo, Integer precioMin, Integer precioMax, String disponibilidad);
}
