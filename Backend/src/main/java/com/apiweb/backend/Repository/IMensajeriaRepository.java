package com.apiweb.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaModel;



public interface IMensajeriaRepository extends MongoRepository<MensajeriaModel, ObjectId> {
    Optional<MensajeriaModel> findById(ObjectId id);
    Optional<MensajeriaModel> findByIdInteresadoAndIdAviso(ObjectId idInteresado, ObjectId idAviso);
    List<MensajeriaModel> findByIdInteresadoOrPropietarioId(ObjectId idInteresado, String propietarioId);
    Optional<AvisosModel> findByIdInteresadoAndIdAviso(String idInteresado, String idAviso);
    List<MensajeriaModel> findByIdInteresado(ObjectId userObjectId);
    List<MensajeriaModel> findByIdAviso(ObjectId id);

}