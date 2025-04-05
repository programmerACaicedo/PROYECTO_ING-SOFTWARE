import React, { useEffect, useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      console.log("Script de Google cargado");

      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
        setIsAuthenticated(true);
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          ux_mode: "popup",
          auto_select: false,
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

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLoginClick = async (event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      const response = await fetch("https://tu-api.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        navigate("/interior");
      } else {
        setErrorMessage("Usuario no registrado o credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setErrorMessage("Error en el servidor. Intente más tarde.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form>
          <input 
            type="email" 
            placeholder="Correo Electrónico" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="options">
            <label>
              <input type="checkbox" /> Guardar credenciales
            </label>
            <a href="/olvido-contraseña">Olvidé mi contraseña</a>
          </div>
          <button type="submit" onClick={handleLoginClick}>
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
        <p className="register-link">
          ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;