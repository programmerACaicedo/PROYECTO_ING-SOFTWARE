package com.apiweb.backend.Service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.PublicacionCreateException;
import com.apiweb.backend.Exception.PublicacionDeletionException;
import com.apiweb.backend.Exception.PublicacionUpdateException;
import com.apiweb.backend.Model.PublicacionesModel;
import com.apiweb.backend.Repository.IInmueblesRepository;
import com.apiweb.backend.Repository.IPublicacionesRepository;

@Service
public class PublicacionesServiceImp implements IPublicacionesService{

    @Autowired
    private IPublicacionesRepository publicacionesRepository;
    private IInmueblesRepository inmueblesRepository;

    @Override
    public String guardarPublicacion(PublicacionesModel publicacion) {
    try {
        // Validar si el lugar existe
        if (publicacion.getLugar() == null || publicacion.getLugar().getInmuebleId() == null) {
            throw new IllegalArgumentException("El lugar no puede ser nulo y debe contener un inmueble_id válido.");
        }

        if (!inmueblesRepository.existsById(publicacion.getLugar().getInmuebleId())) {
            throw new IllegalArgumentException("El inmueble con ID " + publicacion.getLugar().getInmuebleId() + " no existe.");
        }

        publicacionesRepository.save(publicacion);
        return "La publicación " + publicacion.getNombre() + " fue registrada con éxito";
    } catch (Exception e) {
        throw new PublicacionCreateException("Error al registrar la Publicación: " + e.getMessage());
    }
}

@Override
public PublicacionesModel actualizarPublicacion(ObjectId id, PublicacionesModel publicacion) {
    try {
        PublicacionesModel publicacionExistente = publicacionesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La publicación con ID " + id + " no existe."));

        publicacionExistente.setNombre(publicacion.getNombre());
        publicacionExistente.setPrecioMensual(publicacion.getPrecioMensual());
        publicacionExistente.setDisponibilidad(publicacion.getDisponibilidad());
        
        return publicacionesRepository.save(publicacionExistente);

    } catch (Exception e) {
        throw new PublicacionUpdateException("Error al actualizar la Publicación con ID " + id + ": " + e.getMessage());
    }
}

    @Override
    public String eliminarPublicacion(ObjectId id) {
    try {
        // Buscar la publicación existente por ID
        PublicacionesModel publicacionExistente = publicacionesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La publicación con ID " + id + " no existe."));

        // Eliminar la publicación
        publicacionesRepository.deleteById(id);

        return "La publicación " + publicacionExistente.getNombre() + " fue eliminada con éxito";
    } catch (Exception e) {
        throw new PublicacionDeletionException("Error al eliminar la Publicación con ID " + id + ": " + e.getMessage());
    }
    }



// @Override
// public PublicacionesModel añadirReportePublicacion(ObjectId id, PublicacionesModel publicacion) {
//     try {
//         PublicacionesModel publicacionExistente = publicacionesRepository.findById(id)
//                 .orElseThrow(() -> new IllegalArgumentException("La publicación con ID " + id + " no existe."));

//         publicacionExistente.setNombre(publicacion.getNombre());
//         publicacionExistente.setPrecioMensual(publicacion.getPrecioMensual());
//         publicacionExistente.setDisponibilidad(publicacion.getDisponibilidad());
        
//         return publicacionesRepository.save(publicacionExistente);

//     } catch (Exception e) {
//         throw new PublicacionUpdateException("Error al actualizar la Publicación con ID " + id + ": " + e.getMessage());
//     }
// }

}