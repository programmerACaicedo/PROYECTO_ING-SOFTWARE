package com.apiweb.backend.Repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.AcuerdosModel;

public interface IAcuerdosRepository extends MongoRepository <AcuerdosModel, ObjectId> {
    void deleteByArrendatario_UsuarioId(ObjectId usuarioId);
}
