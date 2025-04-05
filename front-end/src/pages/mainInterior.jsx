import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/interior.css";

const Interior = () => {
  const [isPropietario, setIsPropietario] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false); // Estado para desplegar el menú
  const navigate = useNavigate();

  useEffect(() => {
    // Simulamos rol "propietario" (puedes quitarlo si quieres probar "interesado")
    setIsPropietario(true);

    // Datos simulados (en producción, llamarías a tu API)
    const dataSimulada = [
      {
        id: 1,
        titulo: "Alquiler de Apartamento - 15 piso unidad A",
        precio: "1.500.000",
        estado: "Disponible",
        habitaciones: 3,
        banos: 2,
        tipo: "apartamento",
      },
      
      {
        id: 2,
        titulo: "Bodega en zona industrial",
        precio: "2.000.000",
        estado: "Disponible",
        habitaciones: 0,
        banos: 0,
        tipo: "bodega",
      },
      // ...más publicaciones
    ];
    setPublicaciones(dataSimulada);
  }, []);

  // Función para filtrar publicaciones según el tipo
  const filterPublications = (tipo) => {
    console.log("Filtrando por tipo:", tipo);
    // Aquí podrías filtrar o llamar a tu API
  };

  // Redirigir a la página de detalle de la publicación
  const handlePublicationClick = (pubId) => {
    navigate(`/publicacion/${pubId}`);
  };

  // Redirigir a "Nuevo Aviso"
  const handleNuevoAviso = () => {
    navigate("/nuevo-aviso");
  };


  return (
    <div className="interior-page">
      <header>
      <h1>Servicio de Arrendamientos</h1>
        <div className="menu-container">
          {/* Botón de arrendamientos */}
          <button 
            className="alquileres-btn" 
            onClick={() => setMostrarMenu(!mostrarMenu)}
          >
            Alquileres
          </button>
          {mostrarMenu && (
            <div className="dropdown-content">
              <button onClick={() => filterPublications("apartamento")}>Apartamentos</button>
              <button onClick={() => filterPublications("bodega")}>Bodegas</button>
              <button onClick={() => filterPublications("garajes")}>Garajes</button>
              <button onClick={() => filterPublications("parqueadero")}>Parqueaderos</button>
            </div>
          )}
        </div>

        {/* Botón "Nuevo Aviso" solo si el usuario es propietario */}
        {isPropietario && (
        <>
          <button className="nuevo-aviso-btn" onClick={handleNuevoAviso}>
            Nuevo Aviso
          </button>
          <button className="perfil-btn" onClick={() => navigate("/perfil")}>
            Mi Perfil
          </button>
        </>
        )}
      </header>

      <section className="publicaciones">
        <h2>Publicaciones</h2>
        <div className="publicaciones-list">
          {publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="publicacion"
              onClick={() => handlePublicationClick(pub.id)}
            >
              <h3>{pub.titulo}</h3>
              <p>Precio: {pub.precio}</p>
              <p>Estado: {pub.estado}</p>
              <p>Habitaciones: {pub.habitaciones}</p>
              <p>Baños: {pub.banos}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Interior;
