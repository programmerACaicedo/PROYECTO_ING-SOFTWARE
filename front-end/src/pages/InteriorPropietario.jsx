import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/interior.module.css";
import { obtenerUsuario } from "../services/conexiones"; // Importar solo obtenerUsuario

const InteriorPropietario = () => {
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
    const cargarDatos = async () => {
      try {
        const usuario = await obtenerUsuario();
        setIsPropietario(usuario.tipo === "propietario");
        // Aquí deberías cargar las publicaciones desde otra fuente, si aplica
        // Por ahora, dejo publicaciones como un array vacío o puedes pasarlo como prop
      } catch (error) {
        console.error("Error al cargar datos del propietario:", error);
      }
    };

    cargarDatos();
  }, []);

  const filterPublications = (tipo) => {
    setMostrarMenu(false);
    navigate(`/publicaciones/${tipo}`);
  };

  const handlePublicationClick = (pubId) => navigate(`/publicacion/${pubId}`);
  const handleNuevoAviso = () => navigate("/nuevo-aviso");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sesionActiva");
    navigate("/login");
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
                    <button onClick={() => filterPublications("Apartamento")}>Apartamentos</button>
                    <button onClick={() => filterPublications("Bodega")}>Bodegas</button>
                    <button onClick={() => filterPublications("Garaje")}>Garajes</button>
                    <button onClick={() => filterPublications("Parqueadero")}>Parqueaderos</button>
                  </div>
                )}
              </div>
              {isPropietario && (
                <>
                  <button className={styles.nuevoAvisoBtn} onClick={handleNuevoAviso}>
                    Nuevo Aviso
                  </button>
                  <button className={styles.perfilBtn} onClick={() => navigate("/perfil")}>
                    Mi Perfil
                  </button>
                </>
              )}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </header>

          <section className={styles.publicaciones}>
            <h2>Publicaciones</h2>
            <div className={styles.publicacionesList}>
              {publicaciones.length > 0 ? (
                publicaciones.map((pub) => (
                  <div
                    key={pub.id}
                    className={styles.publicacion}
                    onClick={() => handlePublicationClick(pub.id)}
                  >
                    <h3>{pub.nombre}</h3>
                    <p>Precio: {pub.precio_mensual}</p>
                    <p>Estado: {pub.estado}</p>
                    <p>Descripción: {pub.descripcion}</p>
                  </div>
                ))
              ) : (
                <p>No tienes publicaciones disponibles.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default InteriorPropietario;