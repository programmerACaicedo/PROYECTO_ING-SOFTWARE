// src/pages/DetallePublicacion.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/detallePublicacion.css";

const DetallePublicacion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Ejemplo de imágenes locales:
  // Si quieres usar imágenes locales en src/assets/img,
  // puedes importar y usarlas en lugar de la URL "https://via.placeholder..."
  // import apartamentoImg from "../assets/img/apartamento.jpg";
  // import bodegaImg from "../assets/img/bodega.jpg";

  // Simulamos una lista de publicaciones (en producción, se obtendría de una API)
  const [publicaciones] = useState([
    {
      id: "1",
      titulo: "Alquiler de Apartamento - 15 piso unidad A",
      descripcion:
        "Apartamento en unidad ubicada en el sector sur de la ciudad de Cali. Cuenta con 3 habitaciones, 2 baños y estufa eléctrica. Es muy luminoso y cercano a centros comerciales y transporte público.",
      // Si quieres usar una imagen local (por ejemplo, en public/assets/img/apartamento.jpg),
      // pon imagen: "/assets/img/apartamento.jpg"
      // o si es en src/assets, normalmente importas y usas la variable.
      imagen: "../assets/img/apartamento.jpg", 
    },
    {
      id: "2",
      titulo: "Bodega en zona industrial",
      descripcion:
        "Bodega espaciosa ideal para almacenamiento de productos a gran escala, ubicada cerca de la autopista principal. Cuenta con sistema de ventilación y acceso para camiones de carga pesada.",
      imagen: "../assets/img/apartamento.jpg",
    },
  ]);

  const [publicacion, setPublicacion] = useState(null);

  // Estado para el menú hamburguesa
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // Estado para el modal de reporte
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [mensajeReporte, setMensajeReporte] = useState("");

  // Cargamos la publicación según el :id de la URL
  useEffect(() => {
    const encontrada = publicaciones.find((p) => p.id === id);
    setPublicacion(encontrada || null);
  }, [id, publicaciones]);

  // Maneja el envío del reporte
  const handleEnviarReporte = (e) => {
    e.preventDefault();
    // Simulamos registro del reporte
    setMensajeReporte("Reporte enviado con éxito. El administrador ha sido notificado.");
    setTimeout(() => {
      setMostrarModal(false);
      setMotivo("");
      setComentarios("");
      setMensajeReporte("");
    }, 2000);
  };

  // Maneja la notificación al arrendatario (simulado)
  const handleNotificar = () => {
    alert("Has notificado al arrendatario. (Funcionalidad simulada)");
  };

  if (!publicacion) {
    return (
      <div className="detalle-publicacion-container">
        <p>Publicación no encontrada.</p>
      </div>
    );
  }
  const handleActualizar = ()=>{
    navigate(`/actualizar-publicacion/${publicacion.id}`);
  } 

  return (
    <div className="detalle-publicacion-container">
      {/* Encabezado */}
      <header className="header-detalle">
        <button
          className="hamburger-btn"
          onClick={() => setMostrarMenu(!mostrarMenu)}
        >
          ☰
        </button>
        <h1>Servicio de Arrendamientos</h1>
        {mostrarMenu && (
          <div className="hamburger-menu">
            <button onClick={() => navigate("/interior")}>Inicio</button>
            <button onClick={() => navigate("/perfil")}>Perfil</button>
            <button onClick={() => navigate("/nuevo-aviso")}>Nuevo Aviso</button>
            <button onClick={() => navigate("/publicacion/1")}>Ver Publicación 1</button>
            <button onClick={() => navigate("/publicacion/2")}>Ver Publicación 2</button>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <div className="contenido-detalle">
        <img
          src={publicacion.imagen}
          alt={publicacion.titulo}
        />
        <div className="texto-detalle">
          <h2>{publicacion.titulo}</h2>
          <p>{publicacion.descripcion}</p>

          <div className="botones-accion">
            <button onClick={handleNotificar}>Notificar arrendatario</button>
            <button onClick={handleActualizar}>Actualizar publicacion</button>
            <button onClick={() => setMostrarModal(true)}>Reportar</button>
          </div>
        </div>
      </div>

      {/* Modal para Reportar */}
      {mostrarModal && (
        <div className="modal-fondo">
          <div className="modal-contenido">
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
              {mensajeReporte && <p className="exito">{mensajeReporte}</p>}
              <div className="modal-botones">
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
