import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/misAcuerdos.module.css";
import { listarAcuerdosPropietario, obtenerUsuario, obtenerAvisoPorId } from "../services/conexiones";

const MisAcuerdos = () => {
  const [acuerdos, setAcuerdos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarAcuerdos = async () => {
      try {
        setIsLoading(true);
        const usuario = await obtenerUsuario();
        console.log("Usuario obtenido:", usuario);
        if (usuario.tipo !== "propietario") {
          navigate("/");
          return;
        }
        const acuerdosData = await listarAcuerdosPropietario(usuario.id);

        const acuerdosConNombre = await Promise.all(
          acuerdosData.map(async (acuerdo) => {
            let nombreAviso = "Sin título";
            try {
              const aviso = await obtenerAvisoPorId(acuerdo.avisosId);
              nombreAviso = aviso.nombre || "Sin título";
            } catch (e) {}
            return { ...acuerdo, nombreAviso };
          })
        );
        
        setAcuerdos(acuerdosConNombre);
      } catch (error) {
        setError("No se pudieron cargar tus acuerdos. Intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    cargarAcuerdos();
  }, [navigate]);

  const handleAcuerdoClick = (acuerdoId) => navigate(`/acuerdo/modificar/${acuerdoId}`);

    const handleLogout = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("sesionActiva");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={styles.misAcuerdosPage}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <span className={styles.iconMenu} onClick={toggleMenu}>
            ☰
          </span>
          <div className={styles.title}>
            <h1>Servicios de Arrendamientos</h1>
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
        <button onClick={() => { setIsMenuOpen(false); navigate("/MisAvisos"); }}>
          Mis Avisos
        </button>
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <section className={styles.acuerdosSection}>
        <h2>Tus Acuerdos</h2>
        {isLoading ? (
          <p className={styles.loading}>Cargando acuerdos...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : acuerdos.length === 0 ? (
          <p className={styles.noAcuerdos}>No tienes acuerdos registrados.</p>
        ) : (
          <div className={styles.acuerdosList}>
            {acuerdos.map((acuerdo) => {
                console.log(acuerdo.avisosId);
                return (
              <div
                key={acuerdo.id}
                className={styles.acuerdoCard}
                onClick={() => handleAcuerdoClick(acuerdo.id)}
              >
                <h3>{acuerdo.nombre || "Sin título"}</h3>
                <p>Arrendatario: {acuerdo.arrendatario?.nombre || "No especificado"}</p>
                <p>Fecha inicio: {acuerdo.fechaInicio?.slice(0,10)}</p>
                <p>Fecha fin: {acuerdo.fechaFin?.slice(0,10)}</p>
                <p>Estado: {acuerdo.estado}</p>
              </div>
                );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MisAcuerdos;