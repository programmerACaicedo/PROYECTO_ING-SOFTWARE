import React, { useEffect, useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
        setIsAuthenticated(true);
        navigate("/interior");
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          ux_mode: "popup",
          auto_select: false,
        });

        document
          .querySelector(".google-btn")
          ?.addEventListener("click", () => {
            window.google.accounts.id.prompt();
          });
      } else {
        console.error("window.google no está disponible");
      }
    };
    document.body.appendChild(script);

    // Cargar credenciales si existen
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedPassword && savedRemember) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Borrar el mensaje automáticamente a los 5 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLoginClick = (event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Credenciales incorrectas.");
      return;
    }

    // Simular autenticación exitosa
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem("savedEmail", email);
      localStorage.setItem("savedPassword", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("savedEmail");
      localStorage.removeItem("savedPassword");
      localStorage.removeItem("rememberMe");
    }

    navigate("/interior");
  };

  return (
    <div className="login-page">
      {/* Mensaje de error fuera del contenedor */}
      {errorMessage && <div className="floating-error">{errorMessage}</div>}

      <div className="login-container">
        <h2>Iniciar Sesión</h2>
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
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Guardar credenciales
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

