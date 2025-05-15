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
export const listarAvisos = async () => {
  try {
    const response = await api.get('/avisos/listarAvisos');
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
export const registrarAcuerdo = async (idPropietario, acuerdo) => {
  try {
    const respuesta = await api.post(`/acuerdos/registar/${idPropietario}`, acuerdo, {
      headers: { "Content-Type": "application/json" }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar acuerdo:", error.response || error.message);
    throw error;
  }
};


export default api;
