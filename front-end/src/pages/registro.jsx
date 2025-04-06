import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importar useNavigate
import "../styles/registro.css";

const Registro = () => {
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate(); // ✅ Usar el hook de navegación

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const handleCredentialResponse = (response) => {
        console.log("Token JWT recibido:", response.credential);
      };

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com",
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
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault(); // ✅ Prevenir recarga por defecto

    if (!aceptaTerminos) {
      alert("Debes aceptar el tratamiento de datos personales para continuar.");
      return;
    }


    // ✅ Aquí podrías enviar los datos a un backend...

    // ✅ Redirigir a login
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Registrar Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-container">
              <input type="text" placeholder="Nombre" required />
            </div>
            <div className="input-container">
              <input type="text" placeholder="Apellidos" required />
            </div>
            <div className="input-container">
              <input type="email" placeholder="Correo Electrónico" required />
            </div>
            <div className="input-container">
              <input type="tel" placeholder="Teléfono" required />
            </div>
            <div className="input-container">
              <input type="password" placeholder="Crear Contraseña" required />
            </div>
            <div className="input-container">
              <input type="password" placeholder="Confirmar Contraseña" required />
            </div>
            <div className="input-container full-width">
              <input type="text" placeholder="Palabra de seguridad" required />
            </div>
            <div className="input-container full-width">
              <select required>
                <option value="">Tipo de Usuario</option>
                <option value="propietario">Propietario</option>
                <option value="interesado">Interesado</option>
              </select>
            </div>
          </div>

          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <label htmlFor="terms">
              Acepto el{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMostrarModal(true);
                }}
              >
                tratamiento de datos personales
              </a>
            </label>
          </div>

          <button type="submit">Registrar</button>

          <button type="button" className="google-btn">
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google Logo"
            />
            Continuar con Google
          </button>
        </form>

        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Tratamiento de Datos Personales</h3>
              <p>
                En Servicio de Arrendamiento, los datos personales recolectados
                son tratados de forma segura y confidencial, con el fin de
                gestionar procesos de arrendamiento, validar identidades,
                realizar análisis financieros, y cumplir con obligaciones
                contractuales y legales. El titular de los datos tiene derecho a
                conocer, actualizar, rectificar o suprimir su información, y
                puede ejercer estos derechos en cualquier momento. Al
                proporcionar sus datos, el titular autoriza expresamente su
                tratamiento conforme a nuestra política de protección de datos.
              </p>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registro;
