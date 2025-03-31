package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Model.InmueblesModel;
import com.apiweb.backend.Repository.IInmueblesRepository;

@Service
public class InmueblesServiceImp implements IInmueblesService{

    @Autowired
    private IInmueblesRepository inmueblesRepository;

    @Override
    public InmueblesModel guardarInmueble(InmueblesModel inmueble) {
        return inmueblesRepository.save(inmueble);
    }
    
}
