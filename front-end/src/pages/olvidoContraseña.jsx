import React from "react";
import "../styles/olvidoContraseña.css";

const OlvidoContraseña = () => {
  return (
    <div className="container">
      <h2>Recuperar mi Contraseña</h2>
      <div id="email-form">
        <form>
          <input type="email" placeholder="Correo Electrónico" required />
          <input type="text" placeholder="Palabra de seguridad" required />
          <button type="button">Validar y Enviar Código</button>
        </form>
      </div>

      <div id="verification-form" style={{ display: "none" }}>
        <input type="text" placeholder="Código de Verificación" required />
        <button type="button">Validar</button>
      </div>
    </div>
  );
};

export default OlvidoContraseña;


  