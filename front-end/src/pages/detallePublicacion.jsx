import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/detallePublicacion.module.css"; // Assign to 'styles'

const DetallePublicacion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [publicaciones] = useState([
    {
      id: "1",
      titulo: "Alquiler de Apartamento - 15 piso unidad A",
      descripcion: "...",
      imagen: "/assets/img/apartamento.jpg", // Adjusted path
    },
    {
      id: "2",
      titulo: "Bodega en zona industrial",
      descripcion: "...",
      imagen: "/assets/img/apartamento.jpg",
    },
  ]);

  const [publicacion, setPublicacion] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [mensajeReporte, setMensajeReporte] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const encontrada = publicaciones.find((p) => p.id === id);
    setPublicacion(encontrada || null);
  }, [id, publicaciones]);

  const handleEnviarReporte = (e) => {
    e.preventDefault();
    setMensajeReporte("Reporte enviado con éxito.");
    setTimeout(() => {
      setMostrarModal(false);
      setMotivo("");
      setComentarios("");
      setMensajeReporte("");
    }, 2000);
  };

  const handleNotificar = () => {
    alert("Has notificado al arrendatario.");
  };

  const handleActualizar = () => {
    navigate(`/actualizar-publicacion/${publicacion.id}`);
  };

  if (!publicacion) {
    return <div className={styles.detallePublicacionContainer}>Publicación no encontrada.</div>;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.detallePublicacionContainer}>
    <header className={styles.headerDetalle}>
        <span className={styles.iconMenu} onClick={toggleMenu}>☰</span>
          <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
    </header>
    
    <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button onClick={() => { navigate("/interior"); closeMenu(); }}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
        <button onClick={() => { navigate("/publicacion/1"); closeMenu(); }}>Ver Publicación 1</button>
      <button onClick={() => { navigate("/publicacion/2"); closeMenu(); }}>Ver Publicación 2</button>
    </nav>
  
      <div className={styles.contenidoDetalle}>
        <img src={publicacion.imagen} alt={publicacion.titulo} />
        <div className={styles.textoDetalle}>
          <h2>{publicacion.titulo}</h2>
          <p>{publicacion.descripcion}</p>
          <div className={styles.botonesAccion}>
            <button onClick={handleNotificar}>Notificar arrendatario</button>
            <button onClick={handleActualizar}>Actualizar publicación</button>
            <button onClick={() => setMostrarModal(true)}>Reportar</button>
          </div>
        </div>
      </div>
      {mostrarModal && (
        <div className={styles.modalFondo}>
          <div className={styles.modalContenido}>
            <h3>Reportar Publicación</h3>
            <form onSubmit={handleEnviarReporte}>
              <label>
                Motivo:
                <select value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
                  <option value="">Selecciona un motivo</option>
                  <option value="inapropiado">Contenido Inapropiado</option>
                  <option value="spam">Spam</option>
                  <option value="informacion-falsa">Información Falsa</option>
                </select>
              </label>
              <label>
                Comentarios (opcional):
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Escribe tus comentarios"
                />
              </label>
              {mensajeReporte && <p className={styles.exito}>{mensajeReporte}</p>}
              <div className={styles.modalBotones}>
                <button type="submit">Enviar Reporte</button>
                <button type="button" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePublicacion;