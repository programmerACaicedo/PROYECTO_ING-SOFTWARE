import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { iniciarSesion } from "../services/conexiones";
import { jwtDecode } from "jwt-decode";

const obtenerInformacionUsuario = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const usuario = jwtDecode(token);
    return usuario; // Contiene la información del usuario (id, correo, tipo, etc.)
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const usuario = jwtDecode(token);
        console.log("Usuario autenticado:", usuario);
        setIsAuthenticated(true);

        // Redirigir automáticamente según el tipo de usuario
        if (usuario.tipo === "propietario") {
          navigate("/propietario");
        } else if (usuario.tipo === "interesado") {
          navigate("/interesado");
        } else {
          navigate("/interior");
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setErrorMessage("Error al procesar la sesión. Por favor, inicie sesión nuevamente.");
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const handleCredentialResponse = async (response) => {
        try {
          const res = await fetch("http://localhost:8080/api/login/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            setIsAuthenticated(true);
            localStorage.setItem("reciénIniciado", "true");
            // Redirigir según el tipo de usuario
            if (data.tipoUsuario) {
              if (data.tipoUsuario === "propietario") {
                navigate("/propietario");
              } else if (data.tipoUsuario === "interesado") {
                navigate("/interesado");
              } else {
                navigate("/interior");
              }
            } else {
              setErrorMessage("Tipo de usuario no definido. Contacte al administrador.");
            }
          } else {
            setErrorMessage("Error al iniciar sesión con Google");
          }
        } catch (error) {
          setErrorMessage("Error de conexión con el servidor");
        }
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

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    try {
      const credenciales = {
        correo: email,
        contrasena: password,
      };

      // Llamar al servicio para iniciar sesión
      const data = await iniciarSesion(credenciales);

      // Verificar si el token está presente en la respuesta
      console.log("Respuesta del backend:", data);

      if (!data.token) {
        setErrorMessage("El servidor no devolvió un token. Verifica el backend.");
        return;
      }

      // Guardar el token en localStorage
      localStorage.setItem("token", data.token);

      // Decodificar el token para obtener la información del usuario
      const usuario = jwtDecode(data.token);

      console.log("Información del usuario:", usuario);

      // Redirigir según el tipo de usuario
      if (usuario.tipo) {
        if (usuario.tipo === "propietario") {
          navigate("/propietario");
        } else if (usuario.tipo === "interesado") {
          navigate("/interesado");
        } else {
          navigate("/interior");
        }
      } else {
        setErrorMessage("Tipo de usuario no definido. Contacte al administrador.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMessage("Credenciales incorrectas o error en el servidor");
    }
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