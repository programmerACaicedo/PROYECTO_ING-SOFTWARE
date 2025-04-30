import React, { useState, useEffect } from "react"; // Agregar useEffect
import styles from "../styles/olvidoContraseña.module.css";

const OlvidoContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [palabra, setPalabra] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mostrarCambioContraseña, setMostrarCambioContraseña] = useState(false);
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para limpiar el mensaje de error después de 3 segundos
  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => {
        setMensajeError("");
      }, 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [mensajeError]);

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const validarContraseña = (contraseña) => {
    const regex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[!@#$%^&*()_+\-=\[\]{}|;:,.?]).{8,}$/;
    return regex.test(contraseña);
  };

  const handleValidarYEnviar = async () => {
    if (!correo || !palabra) {
      setMensajeError("Por favor, llena todos los campos.");
      return;
    }

    if (!validarCorreo(correo)) {
      setMensajeError("El correo debe ser válido. Ej: ejemplo@dominio.com");
      return;
    }

    setLoading(true);
    try {
      // Paso 1: Verificar si el correo existe en la base de datos
      const checkEmailResponse = await fetch("/api/verificar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const emailData = await checkEmailResponse.json();

      if (!checkEmailResponse.ok || !emailData.exists) {
        throw new Error("Correo no registrado");
      }

      // Paso 2: Verificar correo y palabra de seguridad
      const response = await fetch("/api/verificar-credenciales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, palabra }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la verificación");
      }

      setMensajeError("");
      setMostrarCodigo(true);
      alert("Se ha enviado un código de verificación a tu correo.");
    } catch (error) {
      setMensajeError(
        error.message === "Correo no registrado"
          ? "Correo no registrado"
          : error.message === "Palabra de seguridad incorrecta"
          ? "Palabra de seguridad incorrecta"
          : "Error en la verificación"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidarCodigo = async () => {
    if (!codigo) {
      setMensajeError("Ingresa el código de verificación.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Código incorrecto");
      }

      setMensajeError("");
      setMostrarCambioContraseña(true);
    } catch (error) {
      setMensajeError(error.message === "El código ha expirado" ? "El código ha expirado" : "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarContraseña = async () => {
    if (!nuevaContraseña || !confirmarContraseña) {
      setMensajeError("Por favor, llena ambos campos de contraseña.");
      return;
    }

    if (!validarContraseña(nuevaContraseña)) {
      setMensajeError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
      );
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setMensajeError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/actualizar-contraseña", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaContraseña }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la contraseña");
      }

      alert("Contraseña actualizada con éxito.");
      window.location.href = "/login";
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recuperar mi Contraseña</h2>

      {!mostrarCambioContraseña && (
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
              disabled={loading}
            />
            <input
              id="palabra"
              type="text"
              placeholder="Palabra de seguridad"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              required
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleValidarYEnviar}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Validar y Enviar Código"}
            </button>
          </form>
          {mensajeError && <p className={styles.errorMessage}>{mensajeError}</p>}
        </div>
      )}

      {mostrarCodigo && !mostrarCambioContraseña && (
        <div id="verification-section" className={styles.verificationSection}>
          <input
            id="codigo"
            type="text"
            placeholder="Código de Verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className={styles.input}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleValidarCodigo}
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Validar"}
          </button>
          {mensajeError && <p className={styles.errorMessage}>{mensajeError}</p>}
        </div>
      )}

      {mostrarCambioContraseña && (
        <div id="cambio-contraseña-section" className={styles.formSection}>
          <h3 className={styles.subtitle}>Actualizar Contraseña</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              id="nueva-contraseña"
              type="password"
              placeholder="Nueva Contraseña"
              value={nuevaContraseña}
              onChange={(e) => setNuevaContraseña(e.target.value)}
              required
              className={styles.input}
              disabled={loading}
            />
            <input
              id="confirmar-contraseña"
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              required
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleCambiarContraseña}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
          {mensajeError && <p className={styles.errorMessage}>{mensajeError}</p>}
        </div>
      )}
    </div>
  );
};

export default OlvidoContraseña;