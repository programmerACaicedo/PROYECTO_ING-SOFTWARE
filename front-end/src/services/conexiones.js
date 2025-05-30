import axios from "axios";

const api = axios.create({
  //"https://fkzklx7z-8080.use2.devtunnels.ms/api"  URL para funcionamiento con tunel
  baseURL: "http://localhost:8080/api", // Base URL de la API
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar token a cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.url.startsWith("/")) {  // Solo si es ruta interna
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejar expiración o errores de permisos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.warn("Token inválido o sin permiso. Cerrando sesión.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem("token");
      if (token && !config.url.includes("/recuperar")) { // No agregar token para /recuperar
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la solicitud:", error.response || error.message);
    return Promise.reject(error);
  }
);

// Funciones de API

export const registrarUsuario = async (datosRegistro) => {
  try {
    const respuesta = await api.post("/usuario/registrar", datosRegistro);
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar usuario:", error.response || error.message);
    throw error;
  }
};

export const iniciarSesion = async (credenciales) => {
  try {
    const respuesta = await api.post("/usuario/login", credenciales);
    return respuesta.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error.response || error.message);
    throw error;
  }
};

export const obtenerUsuario = async () => {
  try {
    const respuesta = await api.get("/usuario");
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error.response || error.message);
    throw error;
  }
};

export const actualizarUsuario = async (id, datosActualizados) => {
  try {
    const respuesta = await api.put(`/usuario/${id}`, datosActualizados);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error.response || error.message);
    throw error;
  }
};

export const subirImagenACloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_perfil');  // Reemplaza con tu upload preset sin firmar

  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dygshdqud/image/upload', // Reemplaza con tu cloud_name
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw error;
  }
};

export const eliminarCuenta = async (id) => {
  try {
    const respuesta = await api.delete(`/usuario/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar cuenta:", error.response || error.message);
    throw error;
  }
};

export const registrarAviso = async (aviso) => {
  try {
    // Enviar los datos como JSON
    const respuesta = await api.post("/avisos/registrar", aviso, {
      headers: {
        "Content-Type": "application/json", // Asegurarse de que sea JSON
      },
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar aviso:", error.response || error.message);
    throw error;
  }
};

export const actualizarAviso = async (id, datosActualizados) => {
  try {
    const respuesta = await api.put(`/avisos/${id}`, datosActualizados);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar aviso:", error.response || error.message);
    throw error;
  }
};

export const listarAvisosConReportes = async () => {
  try {
    const respuesta = await api.get("/avisos/listarReportes");
    return respuesta.data;
  } catch (error) {
    console.error("Error al listar avisos con reportes:", error.response || error.message);
    throw error;
  }
};
export const obtenerUsuarioPorId = async (id) => {
  try {
    const respuesta = await api.get(`/usuarios/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener usuario:", error.response || error.message);
    throw error;
  }
};

export const actualizarEstadoReporte = async (avisoId, reporteActualizado) => {
  try {
    const respuesta = await api.put(`/avisos/actualizarEstadoReporteSiendoAdministrador/${avisoId}`, reporteActualizado);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar estado del reporte:", error.response || error.message);
    throw error;
  }
};

export const reportarAviso = async (avisoId, reporte) => {
  try {
    const respuesta = await api.put(`/avisos/reportar/${avisoId}`, reporte);
    return respuesta.data;
  } catch (error) {
    console.error("Error al reportar aviso:", error.response || error.message);
    throw error;
  }
};

export const listarAvisosPropietario = async (propietarioId) => {
  try {
    const respuesta = await api.get(`/avisos/${propietarioId}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al listar avisos del propietario:", error.response || error.message);
    throw error;
  }
};

// Función para listar los avisos
export const listarSinReportes = async () => {
  try {
    const response = await api.get('/avisos/listarSinReportes');
    return response.data;
  } catch (error) {
    console.error('Error al listar avisos:', {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    throw error;
  }
};

//conexion para eliminar aviso 
export const eliminarAviso = async (id) => {
  try {
    const response = await api.delete(`/avisos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar aviso:', {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    throw error;
  }
}

export const registrarAcuerdo = async (acuerdo) => {
  try {
    const respuesta = await api.post(`/acuerdos/registrar`, acuerdo, {
      headers: { "Content-Type": "application/json" }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar acuerdo:", error.response || error.message);
    throw error;
  }
};
export const listarAcuerdos = async (idPropietario) => {
  try{
    const respuesta = await api.get("/acuerdos/listarAcuerdos/" + idPropietario);
    return respuesta.data;
  }
  catch (error) {
    console.error("Error al listar acuerdos:", error.response || error.message);
    throw error;
  }
}

export const obtenerAcuerdoPorId = async (idAcuerdo) => {
  const respuesta = await api.get(`/acuerdos/DetallarUnAcuerdo/${idAcuerdo}`);
  return respuesta.data;
};

/*export const obtenerAcuerdoPorId = async (idAcuerdo) => {
  try {
    const respuesta = await api.get(`/acuerdos/DetallarUnAcuerdo/${idAcuerdo}`);
    return respuesta.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Error al obtener acuerdo por aviso:", error.response || error.message);
    throw error;
  }
};*/

export const listarAcuerdosPropietario = async (idPropietario) => {
  const respuesta = await api.get(`/acuerdos/listarAcuerdosDeUnPropietario/${idPropietario}`);
  return respuesta.data;
};

export const modificarAcuerdo = async (idAcuerdo, extension) => {
  const respuesta = await api.put(`/acuerdos/extension/${idAcuerdo}`, extension, {
    headers: { "Content-Type": "application/json" }
  });
  return respuesta.data;
};

export const cancelarAcuerdo = async (idAcuerdo, razon) => {
  const respuesta = await api.put(`/acuerdos/cancelarAcuerdo/${idAcuerdo}`, razon, {
    headers: { "Content-Type": "application/json" }
  });
  return respuesta.data;
};


export const obtenerAvisoPorId = async (idAviso) => {
  const respuesta = await api.get(`/avisos/${idAviso}`);
  return respuesta.data;
};

// Funciones de mensajería
export const crearChat = async (chatData) => {
  // Validar que todos los campos necesarios estén presentes
  if (!chatData.idInteresado || !chatData.idAviso || !chatData.propietarioId) {
    throw new Error("Faltan campos requeridos en chatData: se necesitan idInteresado, idAviso y propietarioId.");
  }
  
  try {
    const response = await api.post("/mensajeria/crearChat", chatData);
    return response.data;
  } catch (error) {
    console.error("Error al crear chat:", error.response?.data || error.message);
    throw error;
  }
};
/*implementar
  @PutMapping("/mandarMensaje/{idMensajeria}")
  public ResponseEntity<MensajeriaModel> mandarMensaje(
      @PathVariable("idMensajeria") String idMensajeria,
      @RequestBody MensajesMensajeria mensajes) {
    MensajeriaModel chatActualizado = mensajeriaService.mandarMensaje(idMensajeria, mensajes);
    messagingTemplate.convertAndSend("/topic/nuevoMensaje", 
        new MensajeSocket(idMensajeria, mensajes));
    return new ResponseEntity<>(chatActualizado, HttpStatus.OK);
  }
*/
export const mandarMensaje = async (idMensajeria, mensajeData) => {
  const id = typeof idMensajeria === "object" ? idMensajeria.id : idMensajeria;
  if (!id) throw new Error("idMensajeria es requerido para mandarMensaje");
  try {
    const response = await api.post(`/mensajeria/mandarMensaje/${id}`, mensajeData);
    return response.data;
  } catch (error) {
    console.error("Error al enviar mensaje:", error.response || error.message);
    throw error;
  }
};

export const obtenerChat = async (idMensajeria) => {
  // Asegúrate de que idMensajeria sea string
  const id = typeof idMensajeria === "object" ? idMensajeria.id : idMensajeria;
  if (!id) throw new Error("idMensajeria es requerido para obtenerChat");
  try {
    const response = await api.get(`/mensajeria/mostrarChat/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener chat:", error.response || error.message);
    throw error;
  }
};

// Nueva función para obtener todas las conversaciones (requiere un endpoint en el backend)
export const obtenerConversaciones = async (userId) => {
  // Asegúrate de que userId sea string
  const id = typeof userId === "object" ? userId.id : userId;
  if (!id) throw new Error("userId es requerido para obtener las conversaciones.");
  try {
    const response = await api.get(`/mensajeria/conversaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener conversaciones para el usuario ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export default api;

// NUEVA FUNCIÓN PARA CREAR CALIFICACIÓN (AJUSTE SOLICITADO)

export const crearCalificacion = async (idAcuerdo, calificacionData) => {
  try {
    const respuesta = await api.post(`/calificaciones/${idAcuerdo}`, calificacionData);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear calificación:", error.response || error.message);
    throw error;
  }
};
