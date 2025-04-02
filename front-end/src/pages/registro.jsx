import React, { useEffect } from "react";
import "../styles/registro.css";

const Registro = () => {
  useEffect(() => {
    // Cargar el script de Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      console.log("Script de Google cargado");

      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
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

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Registrar Usuario</h2>
        <form>
          <input type="text" placeholder="Nombre" required />
          <input type="text" placeholder="Apellidos" required />
          <input type="email" placeholder="Correo Electrónico" required />
          <input type="tel" placeholder="Teléfono" required />
          <input type="password" placeholder="Crear Contraseña" required />
          <input type="password" placeholder="Confirmar Contraseña" required />
          <input type="text" placeholder="Palabra de seguridad" required />
          <select required defaultValue="">
            <option value="">Tipo de Usuario</option>
            <option value="propietario">Propietario</option>
            <option value="interesado">Interesado</option>
          </select>
          <button type="submit">Registrar</button>
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

export default Registro;