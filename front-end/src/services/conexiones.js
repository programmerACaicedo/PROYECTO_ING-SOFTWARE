import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Base URL for API requests
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la solicitud:", error.response || error.message);
    return Promise.reject(error);
  }
);

//Registro de usuario
export const registrarUsuario = async (datosRegistro) => {
    try {
      console.log('Sending request to:', api.defaults.baseURL + '/usuario/registrar');
      const respuesta = await api.post("/usuario/registrar", datosRegistro);
      return respuesta.data;
    } catch (error) {
      console.error("Error al registrar usuario:", error.response || error.message);
      throw error;
    }
};

//Login de usuario
export const iniciarSesion = async (credenciales) => {
  try {
    const respuesta = await api.post("/usuario/login", credenciales);
    return respuesta.data; // Asegúrate de que el backend envíe el token en `respuesta.data.token`
  } catch (error) {
    console.error("Error al iniciar sesión:", error.response || error.message);
    throw error;
  }
};

export const obtenerUsuario = async () => {
  try {
    const respuesta = await api.get("/usuario", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error.response || error.message);
    throw error;
  }
};

export const actualizarUsuario = async (id, datosActualizados) => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    };

    console.log("Datos enviados al backend:", datosActualizados);
    const respuesta = await axios.put(`http://localhost:8080/api/usuario/${id}`, datosActualizados, { headers });
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error.response || error.message);
    throw error;
  }
};

export const eliminarCuenta = async () => {
  try {
    const respuesta = await api.delete("/eliminar-cuenta", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar cuenta:", error.response || error.message);
    throw error;
  }
};

export default api;