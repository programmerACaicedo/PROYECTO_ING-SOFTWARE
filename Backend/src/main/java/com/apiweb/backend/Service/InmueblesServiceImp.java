package com.apiweb.backend.Service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.InmuebleCreateException;
import com.apiweb.backend.Exception.InmuebleNotFoundException;
import com.apiweb.backend.Exception.InmuebleUpdateException;
import com.apiweb.backend.Exception.UserDeletionException;
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

    @Override
    public InmueblesModel actualizarInmueble(ObjectId id, InmueblesModel inmueble) {
    try {
        InmueblesModel buscarInmueble = inmueblesRepository.findById(id)
                .orElseThrow(() -> new InmuebleNotFoundException("Inmueble no encontrado con el ID: " + id));

        buscarInmueble.setNombre(inmueble.getNombre());
        buscarInmueble.setDescripcion(inmueble.getDescripcion());
        buscarInmueble.setCondiciones(inmueble.getCondiciones());
        buscarInmueble.setCalificacionProm(inmueble.getCalificacionProm());

        return inmueblesRepository.save(buscarInmueble);
        
    } catch (Exception e) {
        throw new InmuebleUpdateException("Error al actualizar el inmueble con ID: " + id + ". Detalles: " + e.getMessage());
    }
}

    @Override
    public String eliminarInmueble(ObjectId id) {
    try {
        InmueblesModel buscarInmuebleA = inmueblesRepository.findById(id)
                .orElseThrow(() -> new InmuebleNotFoundException("Inmueble no encontrado con el ID: " + id));
        String nombre = buscarInmuebleA.getNombre();

        inmueblesRepository.deleteById(id);
        return "El inmueble " + nombre + " fue eliminado con éxito";
    } catch (Exception e) {
        throw new UserDeletionException("Error al eliminar el inmueble con ID: " + id + ". Detalles: " + e.getMessage());
    }
}
    
}
