import React, { useEffect, useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
        navigate("/interior");
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
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
  }, [navigate]);

  const validarEmail = (correo) => {
    // Verifica que tenga @ y algo después
    const partes = correo.split("@");
    return partes.length === 2 && partes[1].trim() !== "";
  };

  const handleLoginClick = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }

    if (!validarEmail(email)) {
      setErrorMessage("El correo electrónico no es válido.");
      return;
    }

    setErrorMessage("");
    navigate("/interior");
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
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
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

