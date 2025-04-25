import React, { useState } from "react";
import styles from "../styles/olvidoContraseña.module.css";

const OlvidoContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [palabra, setPalabra] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const validarCorreo = (correo) => {
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

    setMensajeError("");
    setMostrarCodigo(true);
  };

  const handleValidarCodigo = () => {
    if (codigo === "123456") { // Simulación, reemplaza con tu lógica real
      alert("Código válido. Redirigiendo...");
    } else {
      setMensajeError("Código incorrecto. Intenta de nuevo.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recuperar mi Contraseña</h2>

      <div id="email-form" className={styles.formSection}>
        <form onSubmit={(e) => e.preventDefault()}>

          <input
            id="correo"
            type="email"
            placeholder="Correo Electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className={styles.input}
          />
          <input
            id="palabra"
            type="text"
            placeholder="Palabra de seguridad"
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            required
            className={styles.input}
          />
          <button
            type="button"
            onClick={handleValidarYEnviar}
            className={styles.button}
          >
            Validar y Enviar Código
          </button>
        </form>
        {mensajeError && <p className={styles.errorMessage}>{mensajeError}</p>}
      </div>

      {mostrarCodigo && (
        <div id="verification-section" className={styles.verificationSection}>
          <label htmlFor="codigo" className={styles.label}>
            Código de Verificación:
          </label>
          <input
            id="codigo"
            type="text"
            placeholder="Código de Verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className={styles.input}
          />
          <button
            type="button"
            onClick={handleValidarCodigo}
            className={styles.button}
          >
            Validar
          </button>
        </div>
      )}
    </div>
  );
};

export default OlvidoContraseña;