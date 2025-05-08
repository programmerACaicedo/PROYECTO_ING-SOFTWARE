import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/misAvisos.module.css";
import { listarAvisosPropietario, obtenerUsuario } from "../services/conexiones";

const MisAvisos = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarAvisos = async () => {
      try {
        setIsLoading(true);
        const usuario = await obtenerUsuario();
        if (usuario.tipo !== "propietario") {
          navigate("/");
          return;
        }
        const avisos = await listarAvisosPropietario(usuario.id);
        console.log("Avisos obtenidos:", avisos);
        setPublicaciones(avisos);
      } catch (error) {
        console.error("Error al cargar avisos:", error);
        setError("No se pudieron cargar tus avisos. Intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarAvisos();
  }, [navigate]);

  const handlePublicationClick = (pubId) => navigate(`/publicacion/${pubId}`);

  const handleNuevoAviso = () => {
    setIsMenuOpen(false);
    navigate("/nuevo-aviso");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("sesionActiva");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={styles.misAvisosPage}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <span className={styles.iconMenu} onClick={toggleMenu}>
            ☰
          </span>
          <div className={styles.title}>
            <h1>Mis Avisos 🏘️</h1>
          </div>
        </div>
      </header>

      <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <button onClick={() => { setIsMenuOpen(false); navigate("/propietario"); }}>
          Inicio
        </button>
        <button onClick={() => { setIsMenuOpen(false); navigate("/perfil"); }}>
          Perfil
        </button>
        <button onClick={handleNuevoAviso}>
          Nuevo Aviso
        </button>
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <section className={styles.avisosSection}>
        <h2>Tus Avisos</h2>
        {isLoading ? (
          <p className={styles.loading}>Cargando avisos...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : publicaciones.length > 0 ? (
          <div className={styles.avisosList}>
            {publicaciones.map((pub) => (
              <div
                key={pub.id}
                className={styles.avisoCard}
                onClick={() => handlePublicationClick(pub.id)}
              >
                <h3>{pub.nombre}</h3>
                <p>Precio: ${pub.precio_mensual.toLocaleString()}</p>
                <p>Estado: {pub.estado}</p>
                <p>Descripción: {pub.descripcion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noAvisos}>No tienes avisos publicados.</p>
        )}
      </section>
    </div>
  );
};

export default MisAvisos;