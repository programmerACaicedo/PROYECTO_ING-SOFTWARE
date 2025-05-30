import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  listarSinReportes,
  reportarAviso,
  obtenerAcuerdoPorId,
  eliminarAviso,
  crearCalificacion,
  crearChat,
} from "../services/conexiones";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch publication
        const avisos = await listarSinReportes();
        const encontrada = avisos.find((p) => String(p.id) === String(id));
        setPublicacion(encontrada || null);
        console.log("Publicacion:", encontrada);

        // Fetch user data from token
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          setTipoUsuario(decodedToken.tipo || "unknown");
          console.log("Decoded Token:", decodedToken);
          const userId = decodedToken.id?._id || decodedToken.id || "";
          setUsuarioId(userId);
          console.log("usuarioId:", userId);

          // Fetch agreement if usuarioId is available
          if (userId) {
            try {
              const acuerdo = await obtenerAcuerdoPorId(id);
              console.log("Acuerdo from API:", acuerdo);
              // Normalize estado to handle potential enum serialization issues
              const estadoStr = typeof acuerdo?.estado === "string"
                ? acuerdo.estado.toLowerCase()
                : String(acuerdo?.estado).toLowerCase();
              console.log("Estado processed:", estadoStr);
              if (
                acuerdo &&
                (estadoStr === "activo" || estadoStr === "finalizado")
              ) {
                setAcuerdoActivo(acuerdo);
                setHasRated(
                  acuerdo.calificacionServicio &&
                    String(acuerdo.calificacionServicio.calificador) === String(userId)
                );
              } else {
                setAcuerdoActivo(null);
                setHasRated(false);
                console.log("No valid estado or acuerdo missing");
              }
            } catch (error) {
              console.error("Error fetching acuerdo:", error);
              setAcuerdoActivo(null);
              setHasRated(false);
            }
          } else {
            console.log("No userId available");
          }
        } else {
          console.log("No token available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPublicacion(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const puedeCalificar = () => {
    if (!acuerdoActivo) {
      console.log("No acuerdoActivo");
      return false;
    }

    // Normalizar el estado para manejar posibles problemas de serialización
    const estadoStr = typeof acuerdoActivo.estado === "string"
      ? acuerdoActivo.estado.toLowerCase()
      : String(acuerdoActivo.estado).toLowerCase();
    const estadoTerminado = estadoStr === "finalizado";

    // Verificar si el usuario es parte del acuerdo (propietario o arrendatario)
    const esPropietario = String(acuerdoActivo.propietarioId) === String(usuarioId);
    const esArrendatario = String(acuerdoActivo.arrendatario?.usuarioId) === String(usuarioId);
    const esParteDelAcuerdo = esPropietario || esArrendatario;

    // Verificar si el usuario ya ha calificado
    const yaCalifico =
      acuerdoActivo.calificacionServicio &&
      String(acuerdoActivo.calificacionServicio.calificador) === String(usuarioId);

    console.log({
      estado: acuerdoActivo.estado,
      estadoStr,
      estadoTerminado,
      esPropietario,
      esArrendatario,
      esParteDelAcuerdo,
      yaCalifico,
    });

    return estadoTerminado && esParteDelAcuerdo && !yaCalifico;
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      setRatingMessage("Por favor, selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    setLoadingRating(true);
    setRatingMessage("");

    try {
      const calificacionData = {
        calificador: usuarioId,
        calificacion: rating,
        comentario: reviewComment,
      };

      await crearCalificacion(acuerdoActivo.id, calificacionData);
      setHasRated(true);
      setRatingMessage("Calificación enviada con éxito.");
    } catch (error) {
      console.error("Error enviando calificación:", error);
      setRatingMessage("Error al enviar la calificación. Intenta de nuevo.");
    } finally {
      setLoadingRating(false);
    }
  };

  if (!publicacion) {
    return <div className={styles.detallePublicacionContainer}>Publicación no encontrada.</div>;
  }

  return (
    <div className={styles.detallePublicacionContainer}>
      <header className={styles.headerDetalle}>
        <span className={styles.iconMenu} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </span>
        <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate("/login");
              return;
            }
            const usuario = jwtDecode(token);
            if (usuario.tipo === "propietario") navigate("/propietario");
            else if (usuario.tipo === "interesado") navigate("/interesado");
            setIsMenuOpen(false);
          }}
        >
          Inicio
        </button>
        <button onClick={() => { navigate("/perfil"); setIsMenuOpen(false); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); setIsMenuOpen(false); }}>Nuevo Aviso</button>
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
                    onClick={() => setSelectedImage(img) || setIsModalOpen(true)}
                  />
                ))}
              </div>
              <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={() => {
                  if (carruselRef.current) {
                    const width = carruselRef.current.querySelector(`.${styles.imagen}`).offsetWidth;
                    carruselRef.current.scrollBy({ left: -width, behavior: "smooth" });
                  }
                }}
              >
                ◄
              </button>
              <button
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={() => {
                  if (carruselRef.current) {
                    const width = carruselRef.current.querySelector(`.${styles.imagen}`).offsetWidth;
                    carruselRef.current.scrollBy({ left: width, behavior: "smooth" });
                  }
                }}
              >
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
          <p><strong>Ubicación:</strong></p>
          <p><strong>Bloque:</strong> {publicacion.ubicacion?.edificio || "No especificado"}</p>
          <p><strong>Número:</strong> {publicacion.ubicacion?.piso || "No especificado"}</p>
          <p><strong>Condiciones:</strong> {publicacion.condiciones}</p>
          <p><strong>Estado:</strong> {publicacion.estado}</p>

          <div className={styles.botonesAccion}>
            {(tipoUsuario !== "propietario" || usuarioId !== publicacion?.propietarioId?.usuarioId) && (
              <button
                onClick={async () => {
                  if (!usuarioId || !publicacion?.id || !publicacion?.propietarioId) return;
                  try {
                    setMensajeNotificacion("Creando chat con el propietario...");
                    const chatData = {
                      idInteresado: usuarioId,
                      idAviso: publicacion.id,
                      propietarioId: publicacion.propietarioId.usuarioId || publicacion.propietarioId,
                    };
                    const nuevoChat = await crearChat(chatData);
                    setMensajeNotificacion("Chat creado con éxito.");
                    setTimeout(() => {
                      setMensajeNotificacion("");
                      navigate("/mensajes", { state: { conversacionId: nuevoChat.id } });
                    }, 1500);
                  } catch (e) {
                    setMensajeNotificacion("Error al crear el chat.");
                    setTimeout(() => setMensajeNotificacion(""), 3000);
                  }
                }}
              >
                Notificar arrendatario
              </button>
            )}
            {tipoUsuario === "propietario" && usuarioId === publicacion?.propietarioId?.usuarioId && (
              <button onClick={() => navigate(`/actualizar-publicacion/${publicacion.id}`)}>Actualizar publicación</button>
            )}
            {(tipoUsuario !== "propietario" || usuarioId !== publicacion?.propietarioId?.usuarioId) && (
              <button onClick={() => setMostrarModal(true)} className={styles.botonReportar}>Reportar</button>
            )}
            {tipoUsuario === "propietario" && usuarioId === publicacion?.propietarioId?.usuarioId && (
              <>
                {!acuerdoActivo && (
                  <button onClick={() => navigate(`/acuerdo/crear/${publicacion.id}`)}>Crear Acuerdo</button>
                )}
                {acuerdoActivo && (
                  <button onClick={() => navigate(`/acuerdo/modificar/${publicacion.id}`)}>Modificar Acuerdo</button>
                )}
                <button
                  onClick={async () => {
                    const confirmacion = window.confirm("¿Desea eliminar definitivamente este aviso?");
                    if (!confirmacion) return;
                    try {
                      await eliminarAviso(publicacion.id);
                      alert("Aviso eliminado con éxito");
                      navigate("/propietario");
                    } catch {
                      alert("Error al eliminar el aviso");
                    }
                  }}
                  className={styles.botonEliminar}
                >
                  Eliminar Publicación
                </button>
              </>
            )}
          </div>

          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <div className={styles.calificacionContainer}>
              <h3>Califica esta experiencia</h3>
              <label>
                Calificación:
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  disabled={!puedeCalificar() || hasRated || isLoading || loadingRating}
                >
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
                  disabled={!puedeCalificar() || hasRated || isLoading || loadingRating}
                />
              </label>
              <button
                onClick={handleSubmitRating}
                disabled={!puedeCalificar() || hasRated || loadingRating || isLoading}
              >
                {loadingRating ? "Enviando..." : "Enviar Calificación"}
              </button>
              {ratingMessage && <p>{ratingMessage}</p>}
              {!puedeCalificar() && !hasRated && !isLoading && (
                <p style={{ color: "gray" }}>No puedes calificar esta experiencia en este momento.</p>
              )}
              {hasRated && <p>Gracias por calificar esta experiencia.</p>}
            </div>
          )}

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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!motivo) {
                  setMensajeReporte("Debes seleccionar un motivo.");
                  return;
                }
                try {
                  await reportarAviso(publicacion.id, {
                    usuarioReporta: usuarioId,
                    motivo,
                    comentario: comentarios,
                  });
                  setMensajeReporte("Reporte enviado con éxito.");
                  setTimeout(() => {
                    setMostrarModal(false);
                    setMotivo("");
                    setComentarios("");
                    setMensajeReporte("");
                  }, 2000);
                } catch {
                  setMensajeReporte("Error al enviar el reporte.");
                }
              }}
            >
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
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagen ampliada" className={styles.modalImage} />
            <button className={styles.modalCloseButton} onClick={() => setIsModalOpen(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePublicacion;