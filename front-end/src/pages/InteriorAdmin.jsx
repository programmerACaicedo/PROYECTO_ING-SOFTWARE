import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/interiorAdmin.module.css"; // Importar con variable 'styles'

const Interior = () => {
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
      const timer = setTimeout(() => setMostrarSplash(false), 1500);
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
  const handleNuevoAviso = () => navigate("/nuevo-aviso");

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
            <div className={styles.interior}>
              <h1>Servicio de Arrendamientos🏘️</h1>
              <h1>Hola de nuevo admin </h1>
            </div>
          </header>
          <section className={styles.adminOptions}>
        <div
          className={styles.optionCard}
          onClick={() => navigate("/admin/confirmar-avisos")}
        >
          <h2>Confirmar Avisos</h2>
          <p>Revisa y aprueba nuevos avisos publicados.</p>
        </div>
        <div
          className={styles.optionCard}
          onClick={() => navigate("/admin/ver-reportes")}
        >
          <h2>Ver Reportes</h2>
          <p>Gestiona los reportes realizados por usuarios.</p>
        </div>
      </section>
        </div>
      )}
    </>
  );
};

export default Interior;