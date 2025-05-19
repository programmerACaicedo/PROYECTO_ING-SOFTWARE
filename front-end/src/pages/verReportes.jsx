import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/verReportes.module.css'
import { listarAvisosConReportes, actualizarEstadoReporte, obtenerUsuarioPorId } from '../services/conexiones'


export default function VerReportes() {
  const navigate = useNavigate()

  // Estado con los reportes
  const [reportes, setReportes] = useState([])
  // Reporte seleccionado (para el modal)
  const [modalReporte, setModalReporte] = useState(null)
  const [loading, setLoading] = useState(false)


 useEffect(() => {
  const fetchReportes = async () => {
    setLoading(true)
    try {
      const avisos = await listarAvisosConReportes()
      // Trae los nombres de los usuarios que reportaron
      const reportesList = await Promise.all(
        avisos
          .filter(aviso => aviso.reporte)
          .map(async aviso => {
            let nombreUsuario = aviso.reporte.usuarioReporta
            try {
              const usuario = await obtenerUsuarioPorId(aviso.reporte.usuarioReporta)
              nombreUsuario = usuario.nombre || usuario.correo || aviso.reporte.usuarioReporta
            } catch (e) {
              // Si falla, deja el id
            }
            return {
              id: aviso.id,
              pubId: aviso.id,
              pubTitulo: aviso.nombre,
              pubImagen: aviso.imagenes?.[0] || '/assets/img/apartamento.jpg',
              pubDescripcion: aviso.descripcion,
              reporter: nombreUsuario,
              motivo: aviso.reporte.motivo,
              comentario: aviso.reporte.comentario,
              fecha: aviso.reporte.fecha ? new Date(aviso.reporte.fecha).toLocaleString() : '',
              estadoReporte: aviso.reporte.estadoReporte,
            }
          })
      )
      setReportes(reportesList)
    } catch (error) {
      alert('Error al cargar reportes')
    }
    setLoading(false)
  }
  fetchReportes()
}, [])

  const abrirModal = (r) => setModalReporte(r)
  const cerrarModal = () => setModalReporte(null)

  // Acción de excluir publicación
const handleExcluir = async () => {
  if (!modalReporte) return
  try {
    const token = localStorage.getItem("token");
    const decoded = require("jwt-decode").jwtDecode(token);
    const adminId = decoded.id?._id || decoded.id;

    await actualizarEstadoReporte(modalReporte.pubId, {
      estadoReporte: 'Excluido',
      comentario: 'Excluido por el administrador',
      usuarioReporta: adminId
    })
    alert(`Se ha excluido la publicación "${modalReporte.pubTitulo}".`)
    // Elimina el reporte del estado local
    setReportes(prev => prev.filter(r => r.pubId !== modalReporte.pubId))
    cerrarModal()
  } catch (error) {
    alert('Error al excluir publicación')
  }
}

const handleInvalidar = async () => {
  if (!modalReporte) return
  try {
    const token = localStorage.getItem("token");
    const decoded = require("jwt-decode").jwtDecode(token);
    const adminId = decoded.id?._id || decoded.id;

    await actualizarEstadoReporte(modalReporte.pubId, {
      estadoReporte: 'Invalido',
      comentario: 'El reporte fue marcado como inválido por el administrador',
      usuarioReporta: adminId
    })
    alert(`Se marcó como inválido el reporte sobre "${modalReporte.pubTitulo}".`)
    // Elimina el reporte del estado local
    setReportes(prev => prev.filter(r => r.pubId !== modalReporte.pubId))
    cerrarModal()
  } catch (error) {
    alert('Error al marcar como inválido')
  }
}
return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Servicio de Arrendamientos</h1>
      </header>
      <main className={styles.main}>
        <h2 className={styles.title}>Listado de Reportes</h2>
        {loading ? <p>Cargando...</p> : (
          <div className={styles.grid}>
            {reportes.map((r) => (
              <div
                key={r.id}
                className={styles.card}
                onClick={() => abrirModal(r)}
              >
                <strong>{r.pubTitulo}</strong>
                <p>
                  <span className={styles.reporter}>{r.reporter}:</span>{' '}
                  {r.motivo}; {r.comentario}
                </p>
                <small className={styles.fecha}>{r.fecha}</small>
              </div>
            ))}
          </div>
        )}
      </main>
      {modalReporte && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={cerrarModal}>×</button>
            <h3>{modalReporte.pubTitulo}</h3>
            <img src={modalReporte.pubImagen} alt={modalReporte.pubTitulo} className={styles.pubImage} />
            <p>{modalReporte.pubDescripcion}</p>
            <hr />
            <h4>Reporte de {modalReporte.reporter}</h4>
            <p><strong>Motivo:</strong> {modalReporte.motivo}</p>
            <p><strong>Comentarios:</strong> {modalReporte.comentario}</p>
            <p><strong>Fecha:</strong> {modalReporte.fecha}</p>
            <div className={styles.actions}>
              <button className={styles.btnExclude} onClick={handleExcluir}>Excluir publicación</button>
              <button className={styles.btnInvalid} onClick={handleInvalidar}>Marcar reporte inválido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}