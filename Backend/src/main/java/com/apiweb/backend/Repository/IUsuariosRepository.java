package com.apiweb.backend.Repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.UsuariosModel;

public interface  IUsuariosRepository extends MongoRepository<UsuariosModel, ObjectId> {
    UsuariosModel findByCorreo(String correo);
}
