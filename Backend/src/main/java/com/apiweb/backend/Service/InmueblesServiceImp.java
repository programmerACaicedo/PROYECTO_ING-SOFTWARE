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
        
        // Validar que la ubicación y el tipo no sean nulos
        if (inmueble.getUbicacion() == null 
                || inmueble.getUbicacion().getEdificio() == null 
                || inmueble.getUbicacion().getPiso() == null 
                || inmueble.getTipo() == null) {
            throw new IllegalArgumentException("La ubicación o el tipo no pueden ser nulos.");
        }
        
        // Verificar si ya existe un inmueble con el mismo tipo, edificio y piso
        boolean existeInmueble = inmueblesRepository
                .findByTipoAndUbicacion_EdificioAndUbicacion_Piso(
                        inmueble.getTipo(), 
                        inmueble.getUbicacion().getEdificio(), 
                        inmueble.getUbicacion().getPiso())
                .isPresent();
                        
        if (existeInmueble) {
            throw new IllegalArgumentException("Ya existe un inmueble registrado en el edificio " 
                    + inmueble.getUbicacion().getEdificio() + " en el piso " 
                    + inmueble.getUbicacion().getPiso() + " con el tipo " + inmueble.getTipo() + ".");
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
            buscarInmueble.getUbicacion().setEdificio(inmueble.getUbicacion().getEdificio());
            buscarInmueble.getUbicacion().setPiso(inmueble.getUbicacion().getPiso());
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
