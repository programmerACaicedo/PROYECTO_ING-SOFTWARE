import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/interiorInteresado.module.css";

const InteriorInteresado = () => {
  const [isPropietario, setIsPropietario] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const [mostrarSplash, setMostrarSplash] = useState(() => {
    const fueRecienIniciado = localStorage.getItem("reciénIniciado") === "true";
    if (fueRecienIniciado) {
      localStorage.removeItem("reciénIniciado");
      return true;
    }
    return false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (mostrarSplash) {
      const timer = setTimeout(() => setMostrarSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mostrarSplash]);

  useEffect(() => {
    setIsPropietario(true);
    const dataSimulada = [
      { id: 1, titulo: "Alquiler de Apartamento - 15 piso unidad A", precio: "1.500.000", estado: "Disponible", habitaciones: 3, banos: 2, tipo: "apartamento" },
      { id: 2, titulo: "Bodega en zona industrial", precio: "2.000.000", estado: "Disponible", habitaciones: 0, banos: 0, tipo: "bodega" },
    ];
    setPublicaciones(dataSimulada);
  }, []);

  const filterPublications = (tipo) => {
    setMostrarMenu(false);
    navigate(`/publicaciones/${tipo}`);
  };
  const handlePublicationClick = (pubId) => navigate(`/publicacion/${pubId}`);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Redirige al usuario a la página de inicio de sesión
  };
  return (
    <>
      {mostrarSplash && (
        <div className={styles.splashScreen}>
          <h1>🏘️ Bienvenido a Servicios de Arrendamientos 🏠🔑</h1>
        </div>
      )}

      {!mostrarSplash && (
        <div className={styles.interiorPage}>
          <header className={styles.header1}>
            <div className={styles.barraRectangular}>
              <div className={styles.interior}>
                <h1>Servicio de Arrendamientos🏘️</h1>
              </div>
              <div className={styles.menuContainer}>
                <button
                  className={styles.alquileresBtn}
                  onClick={() => setMostrarMenu(!mostrarMenu)}
                >
                  Alquileres
                </button>
                {mostrarMenu && (
                  <div className={styles.dropdownContent}>
                    <button onClick={() => filterPublications("apartamento")}>Apartamentos</button>
                    <button onClick={() => filterPublications("bodega")}>Bodegas</button>
                    <button onClick={() => filterPublications("garajes")}>Garajes</button>
                    <button onClick={() => filterPublications("parqueadero")}>Parqueaderos</button>
                  </div>
                )}
              </div>
              {isPropietario && (
                <button className={styles.perfilBtn} onClick={() => navigate("/perfil")}>
                  Mi Perfil
                </button>
              )}
              <button className={styles.logoutBtn} onClick={handleLogout}>
               Cerrar Sesión
            </button>
            </div>
          </header>

          <section className={styles.publicaciones}>
            <h2>Publicaciones</h2>
            <div className={styles.publicacionesList}>
              {publicaciones.map((pub) => (
                <div
                  key={pub.id}
                  className={styles.publicacion}
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

export default InteriorInteresado;
