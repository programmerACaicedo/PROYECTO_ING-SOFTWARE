// src/pages/PublicacionesFiltradas.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/publicacionesFiltradas.module.css";

const PublicacionesFiltradas = () => {
  const { tipo } = useParams();
  const navigate = useNavigate();

  // Menú hamburguesa
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // Simulamos un array de publicaciones
  const [publicaciones] = useState([
    {
      id: 1,
      titulo: "Alquiler de Apartamento - 15 piso unidad A",
      precio: "1.500.000",
      estado: "Disponible",
      habitaciones: 3,
      banos: 2,
      tipo: "apartamento",
      imagen: "https://via.placeholder.com/300x200",
    },
    {
      id: 2,
      titulo: "Bodega en zona industrial",
      precio: "2.000.000",
      estado: "Disponible",
      habitaciones: 0,
      banos: 0,
      tipo: "bodega",
      imagen: "https://via.placeholder.com/300x200",
    },
    {
      id: 3,
      titulo: "Hermosa Casa Campestre",
      precio: "3.200.000",
      estado: "Disponible",
      habitaciones: 4,
      banos: 3,
      tipo: "casas",
      imagen: "https://via.placeholder.com/300x200",
    },
    {
      id: 4,
      titulo: "Parqueadero cubierto en el centro",
      precio: "300.000",
      estado: "Disponible",
      habitaciones: 0,
      banos: 0,
      tipo: "parqueaderos",
      imagen: "https://via.placeholder.com/300x200",
    },
  ]);

  // Estado local para publicaciones filtradas
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);

  // Filtrar publicaciones según el tipo
  useEffect(() => {
    setPublicacionesFiltradas(
      publicaciones.filter((pub) => pub.tipo === tipo)
    );
  }, [tipo, publicaciones]);

  // Navegar al detalle
  const handlePublicationClick = (pubId) => {
    navigate(`/publicacion/${pubId}`);
  };

  // Opciones del menú hamburguesa
  const handleMenuClick = (ruta) => {
    setMostrarMenu(false);
    navigate(ruta);
  };

  return (
    <div className={styles["publicaciones-filtradas-page"]}>
      <header className={styles["pf-header"]}>
        <button
          className={styles["hamburger-btn"]}
          onClick={() => setMostrarMenu(!mostrarMenu)}
        >
          ☰
        </button>
        <h1>Servicio de Arrendamientos</h1>
        {mostrarMenu && (
          <nav className={styles["hamburger-menu"]}>
            <button onClick={() => handleMenuClick("/interior")}>Inicio</button>
            <button onClick={() => handleMenuClick("/publicaciones/apartamento")}>
              Apartamentos
            </button>
            <button onClick={() => handleMenuClick("/publicaciones/parqueaderos")}>
              Parqueaderos
            </button>
            <button onClick={() => handleMenuClick("/publicaciones/bodega")}>
              Bodegas
            </button>
            <button onClick={() => handleMenuClick("/publicaciones/casas")}>
              Casas
            </button>
            <button onClick={() => handleMenuClick("/cancelar-arrendamientos")}>
              Cancelar arrendamientos
            </button>
            <button onClick={() => handleMenuClick("/tus-arrendamientos")}>
              Tus arrendamientos
            </button>
            <button onClick={() => handleMenuClick("/logout")}>Cerrar Sesión</button>
          </nav>
        )}
      </header>

      <main className={styles["pf-main"]}>
        <h2 className={styles["pf-titulo"]}>
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)} Disponibles
        </h2>

        <div className={styles["pf-grid"]}>
          {publicacionesFiltradas.length === 0 ? (
            <p>No hay publicaciones de tipo "{tipo}"</p>
          ) : (
            publicacionesFiltradas.map((pub) => (
              <div
                key={pub.id}
                className={styles["pf-card"]}
                onClick={() => handlePublicationClick(pub.id)}
              >
                <img src={pub.imagen} alt={pub.titulo} />
                <h3>{pub.titulo}</h3>
                <p>Precio: {pub.precio}</p>
                <p>Estado: {pub.estado}</p>
                {pub.habitaciones > 0 && <p>Habitaciones: {pub.habitaciones}</p>}
                {pub.banos > 0 && <p>Baños: {pub.banos}</p>}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
);
};

export default PublicacionesFiltradas;
