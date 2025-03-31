package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Model.PublicacionesModel;
import com.apiweb.backend.Repository.IPublicacionesRepository;

@Service
public class PublicacionesServiceImp implements IPublicacionesService{

    @Autowired
    private IPublicacionesRepository publicacionesRepository;

    @Override
    public PublicacionesModel guardarPublicacion(PublicacionesModel publicacion){
        return publicacionesRepository.save(publicacion);
    }
    
}
