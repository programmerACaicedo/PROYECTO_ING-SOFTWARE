import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/detalleAvisoAdmin.module.css";

export default function DetalleAvisoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* Datos simulados — en tu caso vendrán de API
  const [avisos] = useState([
    {
      id: "1",
      titulo: "Alquiler de Apartamento - 15 piso unidad A",
      descripcion: "Un apartamento amplio y luminoso, con vista al río...",
      imagenes: ["/assets/img/apartamento1.jpg", "/assets/img/apartamento2.jpg"],
      estado: "por confirmar", // por confirmar | activo | desactivo
      // podrías tener también un campo `razonRechazo`
    },
    // ...
  ]);*/
  
  // después — mete aquí todos tus avisos
  const [avisos] = useState([
     {
       id: "1",
       titulo: "Alquiler de Apartamento - 15 piso unidad A",
       descripcion: "Un apartamento amplio y luminoso…",
       imagenes: ["/assets/img/apartamento1.jpg", "/assets/img/apartamento2.jpg"],
       estado: "por confirmar",
     },
     {
       id: "2",
       titulo: "Bodega en zona industrial",
       descripcion: "Ideal para almacenamiento de mercancía…",
       imagenes: ["/assets/img/bodega1.jpg"],
       estado: "desactivo",
     },
     {
       id: "3",
       titulo: "Garaje céntrico",
       descripcion: "Parking cubierto con seguridad 24h…",
       imagenes: ["/assets/img/garaje1.jpg"],
       estado: "activo",
     },
     // Y si tienes más, sigue agregándolos aquí…
   ]);

  const [aviso, setAviso] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [razon, setRazon] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [currentEstado, setCurrentEstado] = useState("");

  useEffect(() => {
    const found = avisos.find((a) => a.id === id);
    if (found) {
      setAviso(found);
      setCurrentEstado(found.estado);
    }
  }, [id, avisos]);

  if (!aviso) return <p className={styles.container}>Aviso no encontrado.</p>;

  const handleApprove = () => {
    // Aquí harías tu llamada a API para aprobar...
    setCurrentEstado("activo");
    setMensaje("✅ Aviso aprobado y ahora está visible.");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleReject = (e) => {
    e.preventDefault();
    // Llamada a API para rechazar, enviando `razon`...
    setCurrentEstado("desactivo");
    setShowRejectModal(false);
    setMensaje(`❌ Aviso rechazado. Razón: "${razon}"`);
    setRazon("");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Servicio de Arrendamientos</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.images}>
          {aviso.imagenes.map((src, idx) => (
            <img key={idx} src={src} alt={`${aviso.titulo} ${idx+1}`} />
          ))}
        </div>

        <div className={styles.detail}>
          <h2>{aviso.titulo}</h2>
          <p className={styles.descripcion}>{aviso.descripcion}</p>
          <p className={styles.estado}>
            Estado actual:{" "}
            <span className={styles[`status_${currentEstado}`]}>
              {currentEstado === "por confirmar"
                ? "Por confirmar"
                : currentEstado === "activo"
                ? "Activo"
                : "Desactivado"}
            </span>
          </p>

          <div className={styles.actions}>
            <button
              className={styles.btnApprove}
              disabled={currentEstado === "activo"}
              onClick={handleApprove}
            >
              Aprobar Aviso
            </button>
            <button
              className={styles.btnReject}
              disabled={currentEstado === "desactivo"}
              onClick={() => setShowRejectModal(true)}
            >
              Desactivar Aviso
            </button>
          </div>

          {mensaje && <p className={styles.feedback}>{mensaje}</p>}
        </div>
      </div>

      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Razón de Rechazo</h3>
            <form onSubmit={handleReject}>
              <select
                required
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
              >
                <option value="">-- Selecciona motivo --</option>
                <option value="contenido inapropiado">Contenido inapropiado</option>
                <option value="spam">Spam</option>
                <option value="información falsa">Información falsa</option>
              </select>
              <textarea
                placeholder="Comentarios opcionales"
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
              />
              <div className={styles.modalActions}>
                <button type="submit">Confirmar Rechazo</button>
                <button type="button" onClick={() => setShowRejectModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
