package com.apiweb.backend.Repository;


import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Model.ENUM.EstadoAcuerdo;

public interface IAcuerdosRepository extends MongoRepository <AcuerdosModel, ObjectId> {
    void deleteByArrendatario_UsuarioId(ObjectId usuarioId); 
    List<AcuerdosModel> findByPropietarioId(ObjectId propietarioId);
    List<AcuerdosModel> findByPropietarioIdAndEstado(ObjectId propietarioId, EstadoAcuerdo estado);
    Optional<AcuerdosModel> findByAvisosIdAndEstado(ObjectId avisosId, EstadoAcuerdo estado);
    List<AcuerdosModel> findByEstado(EstadoAcuerdo estado);
}
