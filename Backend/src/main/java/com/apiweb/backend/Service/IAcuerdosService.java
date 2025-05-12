package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.AcuerdosModel;

public interface IAcuerdosService {
    public AcuerdosModel crearAcuerdo(ObjectId idPropietario,AcuerdosModel acuerdo);
}
