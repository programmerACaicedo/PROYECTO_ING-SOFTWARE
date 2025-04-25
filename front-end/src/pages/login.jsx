import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/login.module.css"; // Importamos el módulo de estilo
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const googleButtonRef = useRef(null); // Ref para el botón de Google

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
        setIsAuthenticated(true);
        localStorage.setItem("reciénIniciado", "true");
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

        if (googleButtonRef.current) {
          googleButtonRef.current.addEventListener("click", () => {
            window.google.accounts.id.prompt();
          });
        }
      }
    };
    document.body.appendChild(script);

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
      if (googleButtonRef.current) {
        googleButtonRef.current.removeEventListener("click", () => {
          window.google.accounts.id.prompt();
        });
      }
    };
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!emailRegex.test(email) || !passwordRegex.test(password)) {
      setErrorMessage("❌Credenciales Incorrectas");
      return;
    }

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
    localStorage.setItem("reciénIniciado", "true");
    navigate("/interior");
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={`${styles.error} ${errorMessage ? "" : styles.oculto}`}>
          {errorMessage}
        </div>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputEmail}
          />
          <div className={styles.passwordContainer}>
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputPassword}
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <div className={styles.options}>
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
          <button type="submit" className={styles.submitButton}>
            Ingresar
          </button>
          <button
            type="button"
            className={styles.googleBtn}
            ref={googleButtonRef}
          >
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google Logo"
            />
            Continuar con Google
          </button>
        </form>
        <p className={styles.registerLink}>
          ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;