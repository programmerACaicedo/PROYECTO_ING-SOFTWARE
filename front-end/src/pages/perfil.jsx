import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/perfil.module.css";
import {
  obtenerUsuario,
  actualizarUsuario,
  eliminarCuenta,
} from "../services/conexiones";
import defaultProfilePicture from "../assets/img/por_defecto.png";

const Perfil = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    telefono: "",
    contrasena: "",
    foto: null, // Will store Base64 string or null
    correo: "",
  });
  const [initialData, setInitialData] = useState({ ...formData });
  const [mensajes, setMensajes] = useState([]);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      setTipoUsuario(decodedToken.tipo || "");
      const id = decodedToken.id?._id || decodedToken.id || "";
      const userDataFromToken = {
        id,
        nombre: decodedToken.nombre || "",
        correo: decodedToken.correo || "",
        telefono: decodedToken.telefono || "",
        foto: decodedToken.foto || null,
      };

      setFormData((prevData) => ({
        ...prevData,
        ...userDataFromToken,
      }));
      setInitialData((prevData) => ({
        ...prevData,
        ...userDataFromToken,
      }));

      const user = await obtenerUsuario();
      const backendId = user.id?._id || user.id || "";
      setFormData((prevData) => ({
        ...prevData,
        id: backendId,
        nombre: user.nombre || prevData.nombre,
        correo: user.correo || prevData.correo,
        telefono: user.telefono || prevData.telefono,
        foto: user.foto || prevData.foto,
      }));
      setInitialData((prevData) => ({
        ...prevData,
        id: backendId,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        foto: user.foto,
      }));
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Error al cargar los datos del usuario", tipo: "error" },
      ]);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const handleInicioClick = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const usuario = jwtDecode(token);
      if (usuario.tipo === "propietario") {
        navigate("/propietario");
      } else if (usuario.tipo === "interesado") {
        navigate("/interesado");
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasUnsavedChanges(hasChanges);

    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "¿Estás seguro de que deseas salir? Tienes cambios sin guardar.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, initialData]);

  useEffect(() => {
    if (mensajes.length > 0) {
      const timer = setTimeout(() => {
        setMensajes((prevMensajes) => prevMensajes.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mensajes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!validFormats.includes(file.type)) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "La foto debe ser JPG, PNG o JPEG.", tipo: "error" },
      ]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "La foto no debe superar los 5MB.", tipo: "error" },
      ]);
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result; // Includes data:image/jpeg;base64,...
      setFormData({ ...formData, foto: base64String });
    };
    reader.onerror = () => {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Error al leer la imagen.", tipo: "error" },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFoto = () => {
    setFormData({ ...formData, foto: null });
  };

  const validateForm = () => {
    const newErrores = [];
    if (!formData.nombre) {
      newErrores.push({ texto: "El nombre es obligatorio", tipo: "error" });
    } else if (!/^[A-Za-z\s]+$/.test(formData.nombre)) {
      newErrores.push({
        texto: "El nombre solo puede contener letras y espacios",
        tipo: "error",
      });
    }

    if (!formData.telefono) {
      newErrores.push({ texto: "El teléfono es obligatorio", tipo: "error" });
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrores.push({
        texto: "El teléfono debe contener exactamente 10 dígitos numéricos",
        tipo: "error",
      });
    }

    if (formData.contrasena) {
      if (formData.contrasena.length < 8) {
        newErrores.push({
          texto: "La contraseña debe tener al menos 8 caracteres",
          tipo: "error",
        });
      } else if (
        !/[A-Z]/.test(formData.contrasena) ||
        !/[a-z]/.test(formData.contrasena) ||
        !/[0-9]/.test(formData.contrasena)
      ) {
        newErrores.push({
          texto:
            "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número",
          tipo: "error",
        });
      }
    }

    if (!formData.correo) {
      newErrores.push({ texto: "El correo es obligatorio", tipo: "error" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrores.push({
        texto: "El correo electrónico no es válido",
        tipo: "error",
      });
    }

    if (newErrores.length > 0) {
      setMensajes((prevMensajes) => [...prevMensajes, ...newErrores]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Formulario no válido");
      return;
    }

    try {
      console.log("Datos enviados al backend:", formData);
      const updatedUser = await actualizarUsuario(formData.id, formData);
      console.log("Usuario actualizado:", updatedUser);

      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Perfil actualizado correctamente", tipo: "success" },
      ]);

      await fetchUserData(); // Refresh the view
      setFormData((prevData) => ({ ...prevData, contrasena: "" })); // Clear password
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: error.message || "Error al actualizar el perfil", tipo: "error" },
      ]);
    }
  };

  const handleEliminarCuenta = () => {
    setConfirmarEliminar(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await eliminarCuenta();
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        {
          texto:
            "Cuenta eliminada con éxito. Se ha enviado un correo de confirmación.",
          tipo: "success",
        },
      ]);
      setConfirmarEliminar(false);
      localStorage.removeItem("token");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      const errorMessage =
        error.response?.data?.error || "Error al eliminar la cuenta";
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: errorMessage, tipo: "error" },
      ]);
      setConfirmarEliminar(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.perfilContainer}>
      <header className={styles.header}>
        <span className={styles.iconMenu} onClick={toggleMenu}>
          ☰
        </span>
        <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button onClick={handleInicioClick}>Inicio</button>
        <button
          onClick={() => {
            navigate("/perfil");
            closeMenu();
          }}
        >
          Perfil
        </button>
        {tipoUsuario === "propietario" && (
          <button
            onClick={() => {
              navigate("/nuevo-aviso");
              closeMenu();
            }}
          >
            Nuevo Aviso
          </button>
        )}
        <button
          onClick={() => {
            navigate("/publicacion/1");
            closeMenu();
          }}
        >
          Ver Publicación 1
        </button>
        <button
          onClick={() => {
            navigate("/publicacion/2");
            closeMenu();
          }}
        >
          Ver Publicación 2
        </button>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.perfilForm}>
          <div className={styles.fotoPerfil}>
            <img
              src={formData.foto || defaultProfilePicture}
              alt="Foto de Perfil"
              onError={(e) => {
                e.target.src = defaultProfilePicture;
              }}
            />
            <div className={styles.fotoButtons}>
              <label
                htmlFor="foto-upload"
                className={styles.btnSeleccionarArchivo}
              >
                Seleccionar Archivo
              </label>
              {formData.foto && (
                <button
                  type="button"
                  onClick={handleEliminarFoto}
                  className={styles.btnEliminarFoto}
                >
                  Eliminar Foto
                </button>
              )}
            </div>
            <input
              id="foto-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFotoChange}
              style={{ display: "none" }}
            />
            {mensajes.length > 0 && (
              <p
                className={
                  mensajes[0].tipo === "success"
                    ? styles.mensajeExito
                    : styles.error
                }
              >
                {mensajes[0].texto}
              </p>
            )}
          </div>

          <div className={styles.datosPersonales}>
            <h2>Actualiza tus datos</h2>
            <form onSubmit={handleSubmit}>
              <h3>Correo Electrónico</h3>
              <label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Ingresa tu correo electrónico"
                />
              </label>

              <h3>Nombre</h3>
              <label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre (solo letras y espacios)"
                />
              </label>

              <h3>Teléfono</h3>
              <label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ingresa tu teléfono (10 dígitos)"
                />
              </label>

              <h3>Actualizar Contraseña</h3>
              <label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
                />
              </label>

              <button type="submit" className={styles.btnActualizar}>
                Actualizar
              </button>
            </form>

            <div className={styles.eliminarCuenta}>
              <button
                onClick={handleEliminarCuenta}
                className={styles.btnEliminar}
              >
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>

        {confirmarEliminar && (
          <div className={styles.confirmarEliminacion}>
            <p>
              ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es
              irreversible.
            </p>
            <p>Al eliminar tu cuenta, perderás:</p>
            <ul>
              <li>Todas tus publicaciones activas.</li>
              <li>Tus conversaciones e interacciones previas en la plataforma.</li>
              <li>Todos tus datos personales, que serán eliminados o anonimizados.</li>
            </ul>
            <button onClick={confirmarEliminacion}>Sí</button>
            <button onClick={() => setConfirmarEliminar(false)}>No</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Perfil;