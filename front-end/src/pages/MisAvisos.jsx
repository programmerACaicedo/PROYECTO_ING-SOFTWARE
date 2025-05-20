import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/misAvisos.module.css";
import { listarAvisosPropietario, obtenerUsuario } from "../services/conexiones";

const MisAvisos = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: "",
    precioMin: "",
    precioMax: "",
    disponibilidad: "",
  });
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
        setPublicaciones(avisos);
        setFilteredPublicaciones(avisos);
      } catch (error) {
        console.error("Error al cargar avisos:", error);
        setError("No se pudieron cargar tus avisos. Intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarAvisos();
  }, [navigate]);

  // Filtro de búsqueda
  useEffect(() => {
    let result = [...publicaciones];

    // Filtro por tipo
    if (filtros.tipo) {
      result = result.filter((p) =>
        p.tipo?.toLowerCase() === filtros.tipo.toLowerCase()
      );
    }

    // Filtro por precio
    const minPrice = filtros.precioMin
      ? parseFloat(filtros.precioMin.replace(/[^0-9.]/g, "")) || 0
      : 0;
    const maxPrice = filtros.precioMax
      ? parseFloat(filtros.precioMax.replace(/[^0-9.]/g, "")) || Infinity
      : Infinity;

    result = result.filter((p) => {
      const precio = typeof p.precio_mensual === "string"
        ? parseFloat(p.precio_mensual.replace(/[^0-9.]/g, "")) || 0
        : Number(p.precio_mensual) || 0;
      return precio >= minPrice && precio <= maxPrice;
    });

    // Filtro por disponibilidad
    if (filtros.disponibilidad) {
      result = result.filter((p) => p.estado === filtros.disponibilidad);
    }

    setFilteredPublicaciones(result);
  }, [publicaciones, filtros]);

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

      {/* Filtros de búsqueda */}
      <br />
      <div className={styles.filters}>
        <select
          value={filtros.tipo}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, tipo: e.target.value }))
          }
        >
          <option value="">Tipo</option>
          <option value="Casa">Casa</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Bodega">Bodega</option>
          <option value="Parqueadero">Parqueadero</option>
          <option value="Habitacion">Habitacion</option>
        </select>

        <input
          type="text"
          placeholder="Precio min"
          value={filtros.precioMin}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, precioMin: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Precio max"
          value={filtros.precioMax}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, precioMax: e.target.value }))
          }
        />

        <select
          value={filtros.disponibilidad}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, disponibilidad: e.target.value }))
          }
        >
          <option value="">Disponibilidad</option>
          <option value="Disponible">Inmediata</option>
          <option value="EnProceso">Próximamente</option>
          <option value="Arrendado">Arrendado</option>
        </select>
      </div>

      <section className={styles.avisosSection}>
        <h2>Tus Avisos</h2>
        {isLoading ? (
          <p className={styles.loading}>Cargando avisos...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : publicaciones.length === 0 ? (
          <p className={styles.noAvisos}>No tienes avisos publicados.</p>
        ) : filteredPublicaciones.length === 0 ? (
          <p className={styles.noAvisos}>No tienes avisos publicados con esos criterios. Ajusta tus filtros.</p>
        ) : (
          <div className={styles.avisosList}>
            {filteredPublicaciones.map((pub) => (
              <div
                key={pub.id}
                className={styles.avisoCard}
                onClick={() => handlePublicationClick(pub.id)}
              >
                <h3>{pub.nombre || "Sin título"}</h3>
                {pub.imagenes?.length > 0 && (
                  <div className={styles.portadaWrapper}>
                    <img
                      src={pub.imagenes[0]}
                      alt={`Portada de ${pub.nombre}`}
                      className={styles.imagenPortada}
                      onError={(e) => console.log("Image load error:", e)}
                    />
                  </div>
                )}
                <p>Precio: {pub.precio_mensual ? `$${pub.precio_mensual.toLocaleString()}` : "No especificado"}</p>
                <p>Descripción: {pub.descripcion}</p>
                <p>Estado: {pub.estado}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MisAvisos;