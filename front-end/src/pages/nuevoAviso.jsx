import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoAviso.css";  // Crea este archivo para estilos específicos o reutiliza interior.css si prefieres

const NuevoAviso = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se implementaría la lógica para enviar el aviso a tu API
    alert("Aviso publicado con éxito");
    navigate("/");  // Redirige a la página principal (Interior) después de publicar
  };

  return (
    <div className="nuevo-aviso-page">
      <h2>Nuevo Aviso</h2>
      <p>¡Publica tu propiedad aquí!</p>
      <form onSubmit={handleSubmit}>
        <input name="nombre" type="text" placeholder="Nombre de la propiedad" required />
        <input name="precio" type="text" placeholder="Precio" required />
        <input name="habitaciones" type="number" placeholder="Habitaciones" required />
        <input name="banos" type="number" placeholder="Baños" required />
        <input name="estado" type="text" placeholder="Estado" required />
        <button type="submit">Publicar</button>
      </form>
      <section id="contactos">
        <h2>Contáctanos</h2>
        <p>Déjanos tu mensaje, pronto nos pondremos en contacto.</p>
      </section>
    </div>
  );
};

export default NuevoAviso;
