import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { iniciarSesion } from "../services/conexiones";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../services/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext); // Obtener la función login del contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mostrarPalabraSeguridad, setMostrarPalabraSeguridad] = useState(false);
  const [palabraSeguridad, setPalabraSeguridad] = useState("");
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

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
            login(data.token); // Usar la función login del contexto
            localStorage.setItem("reciénIniciado", "true");

            if (data.tipoUsuario) {
              localStorage.setItem("sesionActiva", "true");
              if (data.tipoUsuario === "propietario") {
                navigate("/propietario");
              } else if (data.tipoUsuario === "interesado") {
                navigate("/interesado");
              } else {
                navigate("/interior");
              }
            } else {
              setErrorMessage("Tipo de usuario no definido.");
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

    if (!email.trim()) {
      setErrorMessage("El correo es obligatorio.");
      return;
    }

    if (mostrarPalabraSeguridad && !palabraSeguridad.trim()) {
      setErrorMessage("La palabra de seguridad no puede estar vacía.");
      return;
    }

    if (!mostrarPalabraSeguridad && !password.trim()) {
      setErrorMessage("La contraseña es obligatoria.");
      return;
    }

    try {
      const credenciales = {
        correo: email,
        ...(mostrarPalabraSeguridad
          ? { palabra_seguridad: palabraSeguridad }
          : { contrasena: password }),
      };

      const data = await iniciarSesion(credenciales);

      if (!data.token) {
        setErrorMessage("El servidor no devolvió un token.");
        return;
      }

      login(data.token); // Usar la función login del contexto
      localStorage.setItem("reciénIniciado", "true");

      const usuario = jwtDecode(data.token);
      if (usuario.tipo === "propietario") {
        navigate("/propietario");
      } else if (usuario.tipo === "interesado") {
        navigate("/interesado");
      } else {
        navigate("/interior");
      }

      if (rememberMe && !mostrarPalabraSeguridad) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }
    } catch (error) {
      console.error("Error completo:", error);
      if (error.response) {
        const mensajeError = error.response.data;
        if (mensajeError.includes("palabra de seguridad")) {
          setMostrarPalabraSeguridad(true);
          setErrorMessage("Ingresa la palabra de seguridad.");
        } else if (mensajeError.includes("Credenciales incorrectas")) {
          setErrorMessage("Credenciales incorrectas.");
        } else {
          setErrorMessage(mensajeError || "Error desconocido.");
        }
      } else {
        setErrorMessage("Error de conexión con el servidor.");
      }
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
          {mostrarPalabraSeguridad && (
            <input
              type="text"
              placeholder="Palabra de Seguridad"
              required
              value={palabraSeguridad}
              onChange={(e) => setPalabraSeguridad(e.target.value)}
              className={styles.inputPassword}
            />
          )}
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
        </form>
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
        <p className={styles.registerLink}>
          ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;