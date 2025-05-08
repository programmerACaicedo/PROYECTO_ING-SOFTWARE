package com.apiweb.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.MensajeriaAviso;
import com.apiweb.backend.Model.UbicacionAviso;
import com.apiweb.backend.Model.ENUM.EstadoReporte;

public interface IAvisosRepository extends MongoRepository<AvisosModel, ObjectId> {
    Optional<AvisosModel> findByUbicacion(UbicacionAviso ubicacion);
    void deleteByPropietarioId_UsuarioId(ObjectId usuarioId);
    List<AvisosModel> findByPropietarioIdUsuarioId(ObjectId propietarioId);
    List<AvisosModel> findByReporteIsNotNull();
    List<AvisosModel> findByReporteIsNullOrReporteEstadoReporte(EstadoReporte estadoReporte, EstadoReporte estadoReporte2);
    Optional<MensajeriaAviso>findByMensajesIdInteresado(ObjectId idInteresado);
}
