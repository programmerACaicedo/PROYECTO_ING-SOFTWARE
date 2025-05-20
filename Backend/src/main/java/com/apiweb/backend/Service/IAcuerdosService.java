package com.apiweb.backend.Service;

import java.util.List;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.ExtensionAcuerdo;
import com.apiweb.backend.Model.ENUM.EstadoAcuerdo;


public interface IAcuerdosService {
    public AcuerdosModel crearAcuerdo(ObjectId idPropietario,AcuerdosModel acuerdo);//Me quedo hermoso este metodo pero falta testearlo en postman
    public AcuerdosModel modificarAcuerdo(ObjectId idAcuerdo, ExtensionAcuerdo extension);//Falta testear en postman
    public AcuerdosModel cancelarAcuerdo(ObjectId idAcuerdo, String razonCancelacion);// Falta testear en postman
    public List<AcuerdosModel> listarAcuerdosDeUnPropietario (ObjectId propietarioId);//Falta testear en postman
    public List<AcuerdosModel> listarAcuerdosDeUnPropietarioAndEstado (ObjectId propietarioId, EstadoAcuerdo estado);//Falta testear en postman
}
