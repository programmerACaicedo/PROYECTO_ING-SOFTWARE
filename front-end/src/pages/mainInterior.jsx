import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/interior.css";

const Interior = () => {
  const [isPropietario, setIsPropietario] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  
  // Mostrar splash si venimos de un inicio de sesión
  const [mostrarSplash, setMostrarSplash] = useState(() => {
    const fueRecienIniciado = localStorage.getItem("reciénIniciado") === "true";
    if (fueRecienIniciado) {
      localStorage.removeItem("reciénIniciado");
      return true;
    }
    return false;
  });

  const navigate = useNavigate();

  // Ocultar splash después de cierto tiempo
  useEffect(() => {
    if (mostrarSplash) {
      const timer = setTimeout(() => {
        setMostrarSplash(false);
      }, 1500); // Duración del splash
      return () => clearTimeout(timer);
    }
  }, [mostrarSplash]);

  useEffect(() => {
    setIsPropietario(true);

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
    ];
    setPublicaciones(dataSimulada);
  }, []);

  // Actualiza filterPublications para navegar a la página con publicaciones filtradas
  const filterPublications = (tipo) => {
    console.log("Filtrando por tipo:", tipo);
    // Cierra el menú desplegable
    setMostrarMenu(false);
    // Navega a la ruta de publicaciones filtradas
    navigate(`/publicaciones/${tipo}`);
  };

  const handlePublicationClick = (pubId) => {
    navigate(`/publicacion/${pubId}`);
  };

  const handleNuevoAviso = () => {
    navigate("/nuevo-aviso");
  };

  return (
    <>
      {mostrarSplash && (
        <div className="splash-screen">
          <h1>🏘️ Bienvenido a Servicios de Arrendamientos 🏠🔑</h1>
        </div>
      )}

      {!mostrarSplash && (
        <div className="interior-page">
          <header>
            <h1>Servicio de Arrendamientos</h1>
            <div className="menu-container">
              <button
                className="alquileres-btn"
                onClick={() => setMostrarMenu(!mostrarMenu)}
              >
                Alquileres
              </button>
              {mostrarMenu && (
                <div className="dropdown-content">
                  <button onClick={() => filterPublications("apartamento")}>
                    Apartamentos
                  </button>
                  <button onClick={() => filterPublications("bodega")}>
                    Bodegas
                  </button>
                  <button onClick={() => filterPublications("garajes")}>
                    Garajes
                  </button>
                  <button onClick={() => filterPublications("parqueadero")}>
                    Parqueaderos
                  </button>
                </div>
              )}
            </div>

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
      )}
    </>
  );
};

export default Interior;
