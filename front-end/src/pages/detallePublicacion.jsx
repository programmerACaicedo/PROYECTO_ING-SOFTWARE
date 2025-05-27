import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { listarSinReportes, reportarAviso, obtenerAcuerdoPorAviso, eliminarAviso } from "../services/conexiones";
import { crearChat } from "../services/conexiones"; // Importar la función
import styles from "../styles/detallePublicacion.module.css";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [acuerdoActivo, setAcuerdoActivo] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  useEffect(() => {
    const fetchPublicacion = async () => {
      try {
        const avisos = await listarSinReportes();
        const encontrada = avisos.find((p) => String(p.id) === String(id));
        setPublicacion(encontrada || null);
      } catch (error) {
        setPublicacion(null);
      }
    };

    fetchPublicacion();

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setTipoUsuario(decodedToken.tipo || "");
      setUsuarioId(decodedToken.id?._id || decodedToken.id || "");
    }
  }, [id]);

  useEffect(() => {
    const fetchAcuerdo = async () => {
      try {
        const acuerdo = await obtenerAcuerdoPorAviso(id);
        if (
          acuerdo &&
          (acuerdo.estado?.toLowerCase() === "activo" || acuerdo.estado?.toLowerCase() === "finalizado")
        ) {
          setAcuerdoActivo(acuerdo);
        } else {
          setAcuerdoActivo(null);
        }
      } catch (error) {
        console.error("Error fetching acuerdo:", error);
        setAcuerdoActivo(null);
      }
    };

    if (usuarioId) fetchAcuerdo();
  }, [id, usuarioId]);

  const handleNotificar = async (e) => {
    e.preventDefault();
    if (!publicacion) return;
    setMensajeNotificacion("Creando chat con el propietario...");

    try {
      const chatData = {
        idInteresado: usuarioId,
        idAviso: publicacion.id,
      };
      const nuevoChat = await crearChat(chatData);
      setMensajeNotificacion("Chat creado con éxito.");
      setTimeout(() => {
        setMensajeNotificacion("");
        navigate("/mensajes", { state: { conversacionId: nuevoChat.id } });
      }, 1500);
    } catch (error) {
      setMensajeNotificacion("Error al crear el chat.");
      console.error("Error:", error);
      setTimeout(() => setMensajeNotificacion(""), 3000);
    }
  };

  const handleEliminar = async () => {
    const confirmacion = window.confirm("¿Desea eliminar definitivamente este aviso?");
    if (!confirmacion) return;

    try {
      await eliminarAviso(publicacion.id);
      alert("Aviso eliminado con éxito");
      navigate("/propietario");
    } catch (error) {
      alert("Error al eliminar el aviso");
    }
  };

  const handleEnviarReporte = async (e) => {
    e.preventDefault();
    setMensajeReporte("");

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
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

  const handleInicioClick = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const usuario = jwtDecode(token);
      if (usuario.tipo === "propietario") {
        navigate("/propietario");
      } else if (usuario.tipo === "interesado") {
        navigate("/interesado");
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/login");
    }
    setIsMenuOpen(false);
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

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const handleSubmitRating = () => {
    if (rating < 1 || rating > 5) {
      setRatingMessage("Por favor, selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    setLoadingRating(true);
    setRatingMessage("");

    setTimeout(() => {
      setHasRated(true);
      setRatingMessage("Calificación enviada con éxito.");
      setLoadingRating(false);
    }, 1500);
  };

  const puedeCalificar = () => {
    if (!acuerdoActivo) return false;

    const estadoTerminado = acuerdoActivo.estado?.toLowerCase() === "finalizado";
    const noEsPropietario = publicacion?.propietarioId?.usuarioId !== usuarioId;
    const esUsuarioValido = tipoUsuario === "interesado" || tipoUsuario === "propietario";

    return estadoTerminado && noEsPropietario && esUsuarioValido;
  };

  if (!publicacion) {
    return <div className={styles.detallePublicacionContainer}>Publicación no encontrada.</div>;
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
        <button onClick={handleInicioClick}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
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
                    onClick={() => openModal(img)}
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
            {(tipoUsuario !== "propietario" || usuarioId !== publicacion?.propietarioId?.usuarioId) && (
              <button onClick={handleNotificar}>Notificar arrendatario</button>
            )}
            {tipoUsuario === "propietario" && usuarioId === publicacion?.propietarioId?.usuarioId && (
              <button onClick={handleActualizar}>Actualizar publicación</button>
            )}
            {(tipoUsuario !== "propietario" || usuarioId !== publicacion?.propietarioId?.usuarioId) && (
              <button onClick={() => setMostrarModal(true)} className={styles.botonReportar}>
                Reportar
              </button>
            )}
            {tipoUsuario === "propietario" && usuarioId === publicacion?.propietarioId?.usuarioId && (
              <>
                {!acuerdoActivo && (
                  <button onClick={() => navigate(`/acuerdo/crear/${publicacion.id}`)}>Crear Acuerdo</button>
                )}
                {acuerdoActivo && (
                  <button onClick={() => navigate(`/acuerdo/modificar/${publicacion.id}`)}>
                    Modificar Acuerdo
                  </button>
                )}
                <button onClick={handleEliminar} className={styles.botonEliminar}>
                  Eliminar Publicación
                </button>
              </>
            )}
          </div>

          {puedeCalificar() ? (
            !hasRated ? (
              <div className={styles.calificacionContainer}>
                <h3>Califica esta experiencia</h3>
                <label>
                  Calificación:
                  <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                    <option value={0}>Selecciona estrellas</option>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option key={star} value={star}>
                        {star} estrella{star > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Comentarios (opcional):
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Escribe tu comentario"
                  />
                </label>
                <button onClick={handleSubmitRating} disabled={loadingRating}>
                  {loadingRating ? "Enviando..." : "Enviar Calificación"}
                </button>
                {ratingMessage && <p>{ratingMessage}</p>}
              </div>
            ) : (
              <p>Gracias por calificar esta experiencia.</p>
            )
          ) : null}

          {mensajeNotificacion && (
            <div className={styles.notificacionOverlay}>
              <p className={styles.mensajeNotificacion}>{mensajeNotificacion}</p>
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