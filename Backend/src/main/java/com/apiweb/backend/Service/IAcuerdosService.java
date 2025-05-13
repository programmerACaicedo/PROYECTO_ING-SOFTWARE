package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.ExtensionAcuerdo;

public interface IAcuerdosService {
    public AcuerdosModel crearAcuerdo(ObjectId idPropietario,AcuerdosModel acuerdo);//Falta testear
    public AcuerdosModel modificarAcuerdo(ObjectId idAcuerdo, ExtensionAcuerdo extension);//Falta crear
    //public AcuerdosModel obtenerAcuerdoPorId(ObjectId idAcuerdo);Falta crear
}
