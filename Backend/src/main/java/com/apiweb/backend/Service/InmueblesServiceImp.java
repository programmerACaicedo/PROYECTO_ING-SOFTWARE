package com.apiweb.backend.Service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Exception.InmuebleCreateException;
import com.apiweb.backend.Exception.InmuebleDeletionException;
import com.apiweb.backend.Exception.InmuebleNotFoundException;
import com.apiweb.backend.Exception.InmuebleUpdateException;
import com.apiweb.backend.Model.InmueblesModel;
import com.apiweb.backend.Repository.IInmueblesRepository;
import com.apiweb.backend.Repository.IUsuariosRepository;

@Service
public class InmueblesServiceImp implements IInmueblesService{
    
    @Autowired
    private IUsuariosRepository usuariosRepository;
    
    @Autowired
    private IInmueblesRepository inmueblesRepository;

    @Override
    public String guardarInmueble(InmueblesModel inmueble) {
    try {
        // Validar si el propietarioId existe
        if (inmueble.getPropietarioId() == null || inmueble.getPropietarioId().getUsuarioId() == null) {
            throw new IllegalArgumentException("El propietario no puede ser nulo.");
        }

        if (!usuariosRepository.existsById(inmueble.getPropietarioId().getUsuarioId())) {
            throw new IllegalArgumentException("El propietario con ID " + inmueble.getPropietarioId().getUsuarioId() + " no existe.");
        }

        inmueblesRepository.save(inmueble);
        return "El inmueble " + inmueble.getNombre() + " fue registrado con éxito";
    } catch (Exception e) {
        throw new InmuebleCreateException("Error al registrar el inmueble: " + e.getMessage());
    }
    }

    @Override
    public InmueblesModel actualizarInmueble(ObjectId id, InmueblesModel inmueble) {
    try {
        InmueblesModel buscarInmueble = inmueblesRepository.findById(id)
                .orElseThrow(() -> new InmuebleNotFoundException("Inmueble no encontrado con el ID: " + id));

        buscarInmueble.setNombre(inmueble.getNombre());
        buscarInmueble.setTipo(inmueble.getTipo());
        buscarInmueble.setDescripcion(inmueble.getDescripcion());
        buscarInmueble.setCondiciones(inmueble.getCondiciones());

        if (buscarInmueble.getUbicacion() != null && inmueble.getUbicacion() != null) {
            buscarInmueble.getUbicacion().setDireccion(inmueble.getUbicacion().getDireccion());
            buscarInmueble.getUbicacion().setCoordenadas(inmueble.getUbicacion().getCoordenadas());
            buscarInmueble.getUbicacion().setCiudad(inmueble.getUbicacion().getCiudad());
        }

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
        throw new InmuebleDeletionException("Error al eliminar el inmueble con ID: " + id + ". Detalles: " + e.getMessage());
    }
    }
    
}
