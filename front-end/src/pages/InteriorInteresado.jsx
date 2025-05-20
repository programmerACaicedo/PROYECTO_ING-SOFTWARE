import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/interiorInteresado.module.css";
import { obtenerUsuario, listarAvisos } from "../services/conexiones";

const InteriorInteresado = () => {
  const [isPropietario, setIsPropietario] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPubs, setFilteredPubs] = useState([]);
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
  const [filtros, setFiltros] = useState({
    tipo: "",
    precioMin: "",
    precioMax: "",
    disponibilidad: "",
  });

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
        const avisos = await listarAvisos();
        setPublicaciones(avisos);
        setFilteredPubs(avisos);
      } catch (error) {
        console.error("Error al cargar datos:", {
          message: error.message,
          response: error.response ? error.response.data : null,
          status: error.response ? error.response.status : null,
        });
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    let res = [...publicaciones];

    // Filtro por tipo
    if (filtros.tipo) {
      res = res.filter((p) =>
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

    res = res.filter((p) => {
      const precio = typeof p.precio_mensual === "string"
        ? parseFloat(p.precio_mensual.replace(/[^0-9.]/g, "")) || 0
        : Number(p.precio_mensual) || 0;
      return precio >= minPrice && precio <= maxPrice;
    });

    // Filtro por disponibilidad
    if (filtros.disponibilidad) {
      res = res.filter((p) => p.estado === filtros.disponibilidad);
    }

    setFilteredPubs(res);
  }, [publicaciones, filtros]);

  const filterPublications = (tipo) => {
    setMostrarMenu(false);
    navigate(`/publicaciones/${tipo}`);
  };

  const handlePublicationClick = (pubId) => navigate(`/publicacion/${pubId}`);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
              <button
                className={styles.perfilBtn}
                onClick={() => navigate("/perfil")}
              >
                Mi Perfil
              </button>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </header>

          <div className={styles.filters}>
            <select
              value={filtros.tipo}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, tipo: e.target.value }))
              }
            >
              <option value="">Tipo</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="bodega">Bodega</option>
              <option value="garaje">Garaje</option>
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
              <option value="En proceso">Próximamente</option>
              <option value="Arrendado">Arrendado</option>
            </select>
          </div>

          <section className={styles.publicaciones}>
            <h2>Publicaciones</h2>
            {filteredPubs.length === 0 ? (
              <p className={styles.noResults}>
                No se encontraron avisos. Ajusta tus filtros.
              </p>
            ) : (
              <div className={styles.publicacionesList}>
                {filteredPubs.map((pub) => (
                  <div
                    key={pub.id}
                    className={styles.publicacion}
                    onClick={() => handlePublicationClick(pub.id)}
                  >
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
                    <h3>{pub.nombre || "Sin título"}</h3>
                    <p>Precio: {pub.precio_mensual || "No especificado"}</p>
                    <p>Estado: {pub.estado || "No especificado"}</p>
                    <p>Descripción: {pub.descripcion || "Sin descripción"}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default InteriorInteresado;