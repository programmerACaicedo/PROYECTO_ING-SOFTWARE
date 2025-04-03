package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.InmuebleCreateException;
import com.apiweb.backend.Model.InmueblesModel;
import com.apiweb.backend.Repository.IInmueblesRepository;

@Service
public class InmueblesServiceImp implements IInmueblesService{

    @Autowired
    private IInmueblesRepository inmueblesRepository;

    @Override
    public String guardarInmueble(InmueblesModel inmueble) {
    try {
        inmueblesRepository.save(inmueble);
        return "El inmueble " + inmueble.getNombre() + " fue registrado con éxito";
    } catch (Exception e) {
        throw new InmuebleCreateException("Error al registrar el usuario: " + e.getMessage());
    }
}
    
}
