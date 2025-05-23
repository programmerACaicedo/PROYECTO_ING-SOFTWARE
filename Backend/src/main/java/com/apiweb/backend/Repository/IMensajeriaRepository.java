package com.apiweb.backend.Repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.MensajeriaModel;

public interface IMensajeriaRepository extends MongoRepository<MensajeriaModel, ObjectId>{
    Optional<MensajeriaModel> findByIdInteresadoAndIdAviso(ObjectId idInteresado, ObjectId idAviso);
}
