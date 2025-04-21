package com.apiweb.backend.Repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.InmueblesModel;
import com.apiweb.backend.Model.ENUM.tipoInmueble;

public interface IInmueblesRepository extends MongoRepository<InmueblesModel,ObjectId>{
    Optional<InmueblesModel> findByTipoAndUbicacion_EdificioAndUbicacion_Piso(tipoInmueble tipo, String edificio, String piso);
}
