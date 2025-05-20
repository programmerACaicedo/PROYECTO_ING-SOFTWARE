package com.apiweb.backend.Repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Model.ENUM.TipoUsuario;

public interface  IUsuariosRepository extends MongoRepository<UsuariosModel, ObjectId> {
    @Query("{ 'correo' : { $regex: ?0, $options: 'i' } }")
    UsuariosModel findByCorreo(String correo);
    List<UsuariosModel> findByTipo(TipoUsuario tipo);
}
