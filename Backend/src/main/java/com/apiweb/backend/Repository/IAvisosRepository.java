package com.apiweb.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.apiweb.backend.Model.AvisosModel;
import com.apiweb.backend.Model.UbicacionAviso;
import com.apiweb.backend.Model.ENUM.EstadoReporte;

public interface IAvisosRepository extends MongoRepository<AvisosModel, ObjectId> {
    Optional<AvisosModel> findByUbicacion(UbicacionAviso ubicacion);
    void deleteByPropietarioId_UsuarioId(ObjectId usuarioId);
    List<AvisosModel> findByPropietarioIdUsuarioId(ObjectId propietarioId);
    List<AvisosModel> findByReporteIsNotNull();
    @Query("{ 'reporte': { $not: { $elemMatch: { 'estadoReporte': ?0 } } } }")
    List<AvisosModel> findAvisosWithoutExcludedReports(EstadoReporte estado);
}
