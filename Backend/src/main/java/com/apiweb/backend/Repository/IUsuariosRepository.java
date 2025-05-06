package com.apiweb.backend.Repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.TipoUsuario;

public interface  IUsuariosRepository extends MongoRepository<UsuariosModel, ObjectId> {
    UsuariosModel findByCorreo(String correo);
    List<UsuariosModel> findByTipo(TipoUsuario tipo);
}
