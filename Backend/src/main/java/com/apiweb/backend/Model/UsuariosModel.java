package com.apiweb.backend.Model;

import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.apiweb.backend.Model.ENUM.TipoUsuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document ("Usuarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuariosModel {
    @Id
    private ObjectId id;
    private String nombre;
    private String correo;
    private String contrasena;
    private TipoUsuario tipo;
    private Integer telefono;
    private String pregunta_seguridad;
    private ArrayList<Calificaciones> calificaciones = new ArrayList<Calificaciones>();
    private ArrayList<Notificaciones> notificaciones = new ArrayList<Notificaciones>();
    private String foto;
}
