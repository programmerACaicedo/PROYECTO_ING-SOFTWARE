import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/registro.css";

const Registro = () => {
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

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
      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          ux_mode: "popup",
          auto_select: false,
        });

        document.querySelector(".google-btn")?.addEventListener("click", () => {
          window.google.accounts.id.prompt();
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
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

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const validarTelefono = (telefono) => {
    const regex = /^\d{7,15}$/;
    return regex.test(telefono);
  };

  const validarContraseña = (contraseña) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:,.?]).{8,}$/;
    return regex.test(contraseña);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const camposVacios = Object.values(formulario).some((campo) => campo === "");
    if (camposVacios) {
      mostrarMensaje("Por favor, completa todos los campos.", "error");
      return;
    }

    if (!validarCorreo(formulario.correo)) {
      mostrarMensaje("El correo ingresado no es válido.", "error");
      return;
    }

    if (!validarTelefono(formulario.telefono)) {
      mostrarMensaje("El teléfono debe contener solo números (7 a 15 dígitos).", "error");
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

<<<<<<< HEAD
    // Si todo está bien, navegar al interior
    navigate("/login");
=======
    mostrarMensaje("¡Registro exitoso!", "exito");

    setTimeout(() => {
      navigate("/interior");
    }, 1500);
>>>>>>> edca4fab40a46ea8b56d00f1f9349d78498de029
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Registrar Usuario</h2>

        {mensaje && <div className={`mensaje ${tipoMensaje}`}>{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-container">
              <input type="text" placeholder="Nombre" name="nombre" value={formulario.nombre} onChange={handleChange} required />
            </div>
            <div className="input-container">
              <input type="text" placeholder="Apellidos" name="apellidos" value={formulario.apellidos} onChange={handleChange} required />
            </div>
            <div className="input-container">
              <input type="email" placeholder="Correo Electrónico" name="correo" value={formulario.correo} onChange={handleChange} required />
            </div>
            <div className="input-container">
              <input type="tel" placeholder="Teléfono" name="telefono" value={formulario.telefono} onChange={handleChange} required />
            </div>
            <div className="input-container">
              <input type="password" placeholder="Crear Contraseña" name="contraseña" value={formulario.contraseña} onChange={handleChange} required />
            </div>
            <div className="input-container">
              <input type="password" placeholder="Confirmar Contraseña" name="confirmar" value={formulario.confirmar} onChange={handleChange} required />
            </div>
            <div className="input-container full-width">
              <input type="text" placeholder="Palabra de seguridad" name="seguridad" value={formulario.seguridad} onChange={handleChange} required />
            </div>
            <div className="input-container full-width">
              <select name="tipoUsuario" value={formulario.tipoUsuario} onChange={handleChange} required>
                <option value="">Tipo de Usuario</option>
                <option value="propietario">Propietario</option>
                <option value="interesado">Interesado</option>
              </select>
            </div>
          </div>

          <div className="terms-container">
            <input type="checkbox" id="terms" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
            <label htmlFor="terms">
              Acepto el{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setMostrarModal(true); }}>
                tratamiento de datos personales
              </a>
            </label>
          </div>

          <button type="submit">Registrar</button>

          <button type="button" className="google-btn">
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" />
            Continuar con Google
          </button>
        </form>

        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Tratamiento de Datos Personales</h3>
              <p>
                En Servicio de Arrendamiento, los datos personales recolectados son tratados de forma segura y confidencial...
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
