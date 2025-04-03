import React, { useState } from "react";
import "../styles/interior.css";

const properties = {
  apartamento: [
    {
      image: "img_bg.png",
      price: "1.500.000",
      state: "Disponible",
      rooms: 3,
      bathrooms: 2
    }
  ],
  bodega: [
    {
      image: "image-placeholder.jpg",
      price: "2.000.000",
      state: "Disponible",
      rooms: 0,
      bathrooms: 0
    }
  ]
};

const Interior = () => {
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");

  const showProperties = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  return (
    <div>
      {/* Barra de navegación */}
      <header>
        <h1>Servicio de Arrendamientos</h1>
        <select required onChange={(e) => showProperties(e.target.value)}>
          <option value="">Alquileres</option>
          <option value="apartamento">Apartamento</option>
          <option value="bodega">Bodegas</option>
          <option value="garajes">Garajes</option>
          <option value="parqueadero">Parqueadero</option>
        </select>
      </header>

      {/* Sección Nuevo Aviso */}
      {mostrarAviso && (
        <div id="nuevo-aviso">
          <h2>Nuevo Aviso</h2>
          <p>¡Publica tu propiedad aquí!</p>
          <form>
            <input type="text" placeholder="Nombre de la propiedad" required />
            <input type="text" placeholder="Precio" required />
            <input type="number" placeholder="Habitaciones" required />
            <input type="number" placeholder="Baños" required />
            <input type="text" placeholder="Estado" required />
            <button type="submit">Publicar</button>
          </form>
        </div>
      )}

      {/* Sección Contáctanos */}
      <section id="contactos">
        <h2>Contáctanos</h2>
        <p>Déjanos tu mensaje, pronto nos pondremos en contacto.</p>
      </section>

      {/* Publicaciones de Propiedades */}
      <div id="publicaciones">
        <h2>Publicaciones</h2>
        <div className="property-card" id="property-list">
          {properties[tipoSeleccionado]?.map((property, index) => (
            <div key={index} className="property-card">
              <img src={property.image} alt="Imagen de propiedad" />
              <p>Precio: {property.price}</p>
              <p>Estado: {property.state}</p>
              <p>Habitaciones: {property.rooms}</p>
              <p>Baños: {property.bathrooms}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Interior; // Se renombró el componente para coincidir con la importación
