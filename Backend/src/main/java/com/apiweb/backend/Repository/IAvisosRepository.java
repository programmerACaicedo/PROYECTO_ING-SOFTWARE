package com.apiweb.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.UbicacionAviso;

public interface IAvisosRepository extends MongoRepository<AvisosModel, ObjectId> {
    Optional<AvisosModel> findByUbicacion(UbicacionAviso ubicacion);
    void deleteByPropietarioId_UsuarioId(ObjectId usuarioId);
    List<AvisosModel> findByPropietarioIdUsuarioId(ObjectId propietarioId);
    List<AvisosModel> findByReporteIsNotNull();
}
