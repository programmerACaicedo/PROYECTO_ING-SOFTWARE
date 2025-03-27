package com.apiweb.backend.Repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.PublicacionesModel;

public interface IPublicacionesRepository extends MongoRepository<PublicacionesModel, ObjectId>{
    
}
