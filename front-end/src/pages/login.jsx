import React, { useEffect, useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom"; // Importar useNavigate para la redirección

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  const navigate = useNavigate(); // Hook de redirección

  useEffect(() => {
    // Cargar el script de Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      console.log("Script de Google cargado");

      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
        setIsAuthenticated(true); // Establecer estado de autenticación como verdadero
        // Aquí puedes enviar el token al backend para verificar al usuario
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          ux_mode: "popup", // Usar popup en lugar de FedCM
          auto_select: false, // Desactivar selección automática
        });

        document.querySelector(".google-btn")?.addEventListener("click", () => {
          console.log("Botón de Google clickeado");
          window.google.accounts.id.prompt();
        });
      } else {
        console.error("window.google no está disponible");
      }
    };
    document.body.appendChild(script);

    // Limpiar el script al desmontar el componente
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLoginClick = () => {
    // Simular un login manual
    setIsAuthenticated(true); // Cambiar el estado a 'autenticado'

    if (isAuthenticated) {
      // Si el usuario está autenticado, redirigir a la página Interior
      navigate("/interior"); // Redirige a la página de Interior
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form>
          <input type="email" placeholder="Correo Electrónico" required />
          <input type="password" placeholder="Contraseña" required />
          <div className="options">
            
            <label>
              <input type="checkbox" /> Guardar credenciales
            </label>
            <a href="/olvido-contraseña">Olvidé mi contraseña</a>
          </div>
          <button type="button" onClick={handleLoginClick}>
            Ingresar
          </button>
          <button type="button" className="google-btn">
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google Logo"
            />
            Continuar con Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
