import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/detallePublicacion.module.css";
import { listarAvisos } from "../services/conexiones";
import { reportarAviso } from "../services/conexiones";

const DetallePublicacion = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const carruselRef = useRef(null);

  const [publicacion, setPublicacion] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [mensajeReporte, setMensajeReporte] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [mensajeNotificacion, setMensajeNotificacion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal de imagen
  const [selectedImage, setSelectedImage] = useState(""); // Imagen seleccionada
  const [usuarioId, setUsuarioId] = useState("");

  useEffect(() => {
    const fetchPublicacion = async () => {
      try {
        const avisos = await listarAvisos();
        const encontrada = avisos.find((p) => String(p.id) === String(id));
        setPublicacion(encontrada || null);
      } catch (error) {
        setPublicacion(null);
      }
    };

    fetchPublicacion();

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = require("jwt-decode").jwtDecode(token);
      setTipoUsuario(decodedToken.tipo || "");
    }
    if (token) {
      const decodedToken = require("jwt-decode").jwtDecode(token);
      setTipoUsuario(decodedToken.tipo || "");
      setUsuarioId(decodedToken.id?._id || decodedToken.id || "");
    }    
  }, [id]);

const handleEnviarReporte = async (e) => {
  e.preventDefault();
  setMensajeReporte("");

  try {
    const token = localStorage.getItem("token");
    const decoded = require("jwt-decode").jwtDecode(token);
    const usuarioId = decoded.id?._id || decoded.id;

    if (!motivo) {
      setMensajeReporte("Debes seleccionar un motivo.");
      return;
    }

    const reporte = {
      usuarioReporta: usuarioId,
      motivo,
      comentario: comentarios,
    };

   await reportarAviso(publicacion.id, reporte);

    setMensajeReporte("Reporte enviado con éxito.");
    setTimeout(() => {
      setMostrarModal(false);
      setMotivo("");
      setComentarios("");
      setMensajeReporte("");
    }, 2000);
  } catch (error) {
    setMensajeReporte("Error al enviar el reporte.");
  }
};

  const handleNotificar = (e) => {
    e.preventDefault();
    if (!publicacion) return;
    setMensajeNotificacion("Enviando mensaje al propietario...");
    setTimeout(() => {
      setMensajeNotificacion("");
      navigate("/mensajes", {
        state: { iniciarChat: true, propietarioId: publicacion.propietarioId },
      });
    }, 1500);
  };

  const handleActualizar = () => {
    navigate(`/actualizar-publicacion/${publicacion.id}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handlePrev = () => {
    if (carruselRef.current) {
      const imageWidth = carruselRef.current.querySelector(`.${styles.imagen}`).offsetWidth;
      carruselRef.current.scrollBy({ left: -imageWidth, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (carruselRef.current) {
      const imageWidth = carruselRef.current.querySelector(`.${styles.imagen}`).offsetWidth;
      carruselRef.current.scrollBy({ left: imageWidth, behavior: "smooth" });
    }
  };
  const handleAcuerdo = () => {
  if (!publicacion) return;
  if (publicacion.acuerdo) {
    navigate(`/acuerdo/modificar/${publicacion.id}`);
  } else {
    navigate(`/acuerdo/crear/${publicacion.id}`);
  }
};

  // Abrir el modal con la imagen seleccionada
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  if (!publicacion) {
    return (
      <div className={styles.detallePublicacionContainer}>
        Publicación no encontrada.
      </div>
    );
  }

  return (
    <div className={styles.detallePublicacionContainer}>
      <header className={styles.headerDetalle}>
        <span className={styles.iconMenu} onClick={toggleMenu}>
          ☰
        </span>
        <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button
          onClick={() => {
            navigate("/propietario");
            closeMenu();
          }}
        >
          Inicio
        </button>
        <button
          onClick={() => {
            navigate("/perfil");
            closeMenu();
          }}
        >
          Perfil
        </button>
        <button
          onClick={() => {
            navigate("/nuevo-aviso");
            closeMenu();
          }}
        >
          Nuevo Aviso
        </button>
      </nav>

      <div className={styles.contenidoDetalle}>
        <div className={styles.carruselContainer}>
          {publicacion.imagenes?.length > 0 ? (
            <>
              <div className={styles.carrusel} ref={carruselRef}>
                {publicacion.imagenes.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    className={styles.imagen}
                    onClick={() => openModal(img)} // Abrir modal al hacer clic
                  />
                ))}
              </div>
              <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrev}>
                ◄
              </button>
              <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNext}>
                ►
              </button>
            </>
          ) : (
            <p>No hay imágenes disponibles.</p>
          )}
        </div>
        <div className={styles.textoDetalle}>
          <h2>{publicacion.nombre}</h2>
          <p><strong>Descripción:</strong> {publicacion.descripcion}</p>
          <p><strong>Precio mensual:</strong> ${publicacion.precio_mensual}</p>
          <p><strong>Ubicacion:</strong></p>
          <p><strong>Bloque:</strong> {publicacion.ubicacion?.edificio || "No especificado"}</p>
          <p><strong>Número:</strong> {publicacion.ubicacion?.piso || "No especificado"}</p>
          <p><strong>Condiciones:</strong> {publicacion.condiciones}</p>
          <p><strong>Estado:</strong> {publicacion.estado}</p>
          <div className={styles.botonesAccion}>
            {tipoUsuario === "interesado" && (
              <button onClick={handleNotificar}>Notificar arrendatario</button>
            )}
            {tipoUsuario === "propietario" && (
              <button onClick={handleActualizar}>Actualizar publicación</button>
            )}
            <button onClick={() => setMostrarModal(true)}>Reportar</button>
            {tipoUsuario === "propietario" && (
              <button onClick={handleAcuerdo}>
                {publicacion.acuerdo ? "Modificar Acuerdo" : "Crear Acuerdo"}
              </button>
            )}
          </div>
          {mensajeNotificacion && (
            <div className={styles.notificacionOverlay}>
              <p className={styles.mensajeNotificacion}>
                {mensajeNotificacion}
              </p>
            </div>
          )}
        </div>
      </div>
      {mostrarModal && (
        <div className={styles.modalFondo}>
          <div className={styles.modalContenido}>
            <h3>Reportar Publicación</h3>
            <form onSubmit={handleEnviarReporte}>
              <label>
                Motivo:
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                >
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
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagen ampliada" className={styles.modalImage} />
            <button className={styles.modalCloseButton} onClick={closeModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePublicacion;