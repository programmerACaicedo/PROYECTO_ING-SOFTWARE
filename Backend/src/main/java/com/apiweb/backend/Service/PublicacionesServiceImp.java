package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.PublicacionCreateException;
import com.apiweb.backend.Model.PublicacionesModel;
import com.apiweb.backend.Repository.IPublicacionesRepository;

@Service
public class PublicacionesServiceImp implements IPublicacionesService{

    @Autowired
    private IPublicacionesRepository publicacionesRepository;

    @Override
    public String guardarPublicacion(PublicacionesModel publicacion) {
    try {
        publicacionesRepository.save(publicacion);
        return "La publicación " + publicacion.getNombre() + " fue registrada con éxito";
    } catch (Exception e) {
        throw new PublicacionCreateException("Error al registrar la Publicacion: " + e.getMessage());
    }
}
    
}
