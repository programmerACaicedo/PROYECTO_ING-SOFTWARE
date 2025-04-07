import React, { useState } from "react";
import "../styles/olvidoContraseña.css";

const OlvidoContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [palabra, setPalabra] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const validarCorreo = (correo) => {
    // Expresión regular básica para correos electrónicos válidos
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleValidarYEnviar = () => {
    if (!correo || !palabra) {
      setMensajeError("Por favor, llena todos los campos.");
      setMostrarCodigo(false);
      return;
    }

    if (!validarCorreo(correo)) {
      setMensajeError("El correo debe ser válido. Ej: ejemplo@dominio.com");
      setMostrarCodigo(false);
      return;
    }

    // Si todo está correcto
    setMensajeError("");
    setMostrarCodigo(true);

    // Aquí podrías enviar el código de verificación
  };

  return (
    <div className="container">
      <h2>Recuperar mi Contraseña</h2>

      <div id="email-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Palabra de seguridad"
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            required
          />
          <button type="button" onClick={handleValidarYEnviar}>
            Validar y Enviar Código
          </button>
        </form>
        {mensajeError && <p style={{ color: "red", marginTop: "10px" }}>{mensajeError}</p>}
      </div>

      {mostrarCodigo && (
        <div id="verification-section">
          <input type="text" placeholder="Código de Verificación" required />
          <button type="button">Validar</button>
        </div>
      )}
    </div>
  );
};

export default OlvidoContraseña;
