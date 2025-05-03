import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

const RutaProtegida = ({ children }) => {
  const { token, cerrarSesion } = useContext(AuthContext);
  const [validando, setValidando] = useState(true);

  useEffect(() => {
    // Simula validación rápida del token desde localStorage
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      cerrarSesion();
    }
    setValidando(false);
  }, []);

  // Cierre de sesión tras 10 minutos de inactividad
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.warn("Sesión expirada por inactividad.");
        cerrarSesion();
      }, 10 * 60 * 1000); // 10 minutos
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer(); // inicia el temporizador

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  if (validando) return null; // evita que se muestre nada mientras se valida

  return token ? children : <Navigate to="/login" replace />;
};

export default RutaProtegida;
