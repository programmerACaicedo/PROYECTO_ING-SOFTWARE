import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/registro.module.css";

const Registro = () => {
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const googleButtonRef = useRef(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contraseña: "",
    confirmar: "",
    seguridad: "",
    tipoUsuario: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
          callback: async (response) => {
            try {
              const res = await fetch("http://localhost:8080/api/login/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential }),
              });
              if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token);
                mostrarMensaje("¡Registro con Google exitoso!", "exito");
                setTimeout(() => navigate("/login"), 1200);
              } else {
                mostrarMensaje("Error al registrar con Google", "error");
              }
            } catch (error) {
              mostrarMensaje("Error de conexión con el servidor", "error");
            }
          },
          ux_mode: "popup",
          auto_select: false,
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.addEventListener("click", () => {
            window.google.accounts.id.prompt();
          });
        }
      }
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 3000);
  };

  const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const validarTelefono = (telefono) => /^\d{7,15}$/.test(telefono);
  const validarContraseña = (contraseña) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.?]).{8,}$/.test(
      contraseña
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formulario).some((campo) => campo === "")) {
      mostrarMensaje("Por favor, completa todos los campos.", "error");
      return;
    }

    if (!validarCorreo(formulario.correo)) {
      mostrarMensaje("El correo ingresado no es válido.", "error");
      return;
    }

    if (!validarTelefono(formulario.telefono)) {
      mostrarMensaje("El teléfono debe tener entre 7 y 15 dígitos.", "error");
      return;
    }

    if (!validarContraseña(formulario.contraseña)) {
      mostrarMensaje(
        "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial.",
        "error"
      );
      return;
    }

    if (formulario.contraseña !== formulario.confirmar) {
      mostrarMensaje("Las contraseñas no coinciden.", "error");
      return;
    }

    if (!aceptaTerminos) {
      mostrarMensaje("Debes aceptar el tratamiento de datos personales.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formulario.nombre,
          apellidos: formulario.apellidos,
          correo: formulario.correo,
          telefono: formulario.telefono,
          contraseña: formulario.contraseña,
          seguridad: formulario.seguridad,
          tipoUsuario: formulario.tipoUsuario,
        }),
      });

      if (response.ok) {
        mostrarMensaje("¡Registro exitoso!", "exito");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        const errorData = await response.json();
        mostrarMensaje(errorData.message || "Error al registrar usuario", "error");
      }
    } catch (error) {
      mostrarMensaje("Error de conexión con el servidor", "error");
    }
  };

  return (
    <div className={styles["register-page"]}>
      <div className={styles["register-container"]}>
        <h2>Registrar Usuario</h2>

        {mensaje && (
          <div
            className={`${styles.mensaje} ${
              tipoMensaje === "error" ? styles.error : styles.exito
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <div className={styles["input-container"]}>
              <input
                type="text"
                placeholder="Nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["input-container"]}>
              <input
                type="text"
                placeholder="Apellidos"
                name="apellidos"
                value={formulario.apellidos}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["input-container"]}>
              <input
                type="email"
                placeholder="Correo Electrónico"
                name="correo"
                value={formulario.correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["input-container"]}>
              <input
                type="tel"
                placeholder="Teléfono"
                name="telefono"
                value={formulario.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`${styles["input-container"]} ${styles["password-container"]}`}>
              <input
                type={verPassword ? "text" : "password"}
                placeholder="Crear Contraseña"
                name="contraseña"
                value={formulario.contraseña}
                onChange={handleChange}
                required
              />
              <span
                className={styles["eye-icon"]}
                onClick={() => setVerPassword(!verPassword)}
              >
                {verPassword ? "🙈" : "👁"}
              </span>
            </div>

            <div className={`${styles["input-container"]} ${styles["password-container"]}`}>
              <input
                type={verConfirmar ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                name="confirmar"
                value={formulario.confirmar}
                onChange={handleChange}
                required
              />
              <span
                className={styles["eye-icon"]}
                onClick={() => setVerConfirmar(!verConfirmar)}
              >
                {verConfirmar ? "🙈" : "👁"}
              </span>
            </div>

            <div className={`${styles["input-container"]} ${styles["full-width"]}`}>
              <input
                type="text"
                placeholder="Palabra de seguridad"
                name="seguridad"
                value={formulario.seguridad}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`${styles["input-container"]} ${styles["full-width"]}`}>
              <select
                name="tipoUsuario"
                value={formulario.tipoUsuario}
                onChange={handleChange}
                required
              >
                <option value="">Tipo de Usuario</option>
                <option value="propietario">Propietario</option>
                <option value="interesado">Interesado</option>
              </select>
            </div>
          </div>

          <div className={styles["terms-container"]}>
            <input
              type="checkbox"
              id="terms"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <label htmlFor="terms">
              Acepto el{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMostrarModal(true);
                }}
              >
                tratamiento de datos personales
              </a>
            </label>
          </div>

          <div className={styles["register-button"]}>
            <button type="submit">Registrar</button>
          </div>

          <button type="button" className={styles.googlebtn} ref={googleButtonRef}>
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google Logo"
              className={styles.googleIcon}
            />
            Continuar con Google
          </button>
        </form>

        {mostrarModal && (
          <div className={styles["modal-overlay"]}>
            <div className={styles["modal-content"]}>
              <h3>Tratamiento de Datos Personales</h3>
              <p>
              En Servicio de Arrendamiento, los datos personales recolectados son tratados de forma segura y 
              confidencial, con el fin de gestionar procesos de arrendamiento, validar identidades, realizar 
              análisis financieros, y cumplir con obligaciones contractuales y legales. El titular de los datos 
              tiene derecho a conocer, actualizar, rectificar o suprimir su información, y puede ejercer estos 
              derechos en cualquier momento. Al proporcionar sus datos, el titular autoriza expresamente su tratamiento 
              conforme a nuestra política de protección de datos.
              </p>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registro;