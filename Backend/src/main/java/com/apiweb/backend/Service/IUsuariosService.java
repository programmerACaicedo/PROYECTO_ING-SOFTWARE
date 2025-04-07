package com.apiweb.backend.Service;

import org.bson.types.ObjectId;

import com.apiweb.backend.Model.UsuariosModel;

public interface IUsuariosService {
    public String registroUsuario(UsuariosModel usuario);
    public String iniciarSesion(UsuariosModel usuario);
    public String recuperarContrasena(UsuariosModel usuario);
    public UsuariosModel actualizarUsuario(ObjectId id, UsuariosModel usuario);
    public String eliminarUsuario(ObjectId id);
}
