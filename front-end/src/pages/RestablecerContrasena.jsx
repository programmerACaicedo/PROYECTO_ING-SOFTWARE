import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "../styles/restablecerContraseña.module.css";

const RestablecerContraseña = () => {
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener el token de los parámetros de la URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const validarContraseña = (contraseña) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.?]).{8,}$/;
    return regex.test(contraseña);
  };

  const handleRestablecerContraseña = async () => {
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
      //"https://fkzklx7z-8080.use2.devtunnels.ms/api/usuario/restablecer-contraseña" URL para funcionamiento con tunel
      const response = await fetch("http://localhost:3000/api/usuario/restablecer-contraseña", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaContraseña }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al restablecer la contraseña.");
      }

      setMensajeExito("Contraseña restablecida con éxito. Ahora puedes iniciar sesión.");
      setMensajeError("");
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar el mensaje de error después de 3 segundos
  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => {
        setMensajeError("");
      }, 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [mensajeError]);

  // Cerrar la ventana después de 5 segundos si hay un mensaje de éxito
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => {
        window.close(); // Cierra la ventana actual
      }, 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [mensajeExito]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Restablecer Contraseña</h2>
      <div className={styles.formSection}>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="password"
            placeholder="Nueva Contraseña"
            value={nuevaContraseña}
            onChange={(e) => setNuevaContraseña(e.target.value)}
            required
            className={styles.input}
            disabled={loading}
          />
          <input
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
            onClick={handleRestablecerContraseña}
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Restableciendo..." : "Restablecer Contraseña"}
          </button>
        </form>
        {mensajeError && <p className={styles.errorMessage}>{mensajeError}</p>}
        {mensajeExito && <p className={styles.successMessage}>{mensajeExito}</p>}
      </div>
    </div>
  );
};

export default RestablecerContraseña;