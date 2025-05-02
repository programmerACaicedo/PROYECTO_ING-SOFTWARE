import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/confirmarAvisos.module.css'

export default function ConfirmarAvisos() {
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState([])

  useEffect(() => {
    const data = [
      {
        id: '1',
        titulo: 'Alquiler de Apartamento - 15 piso unidad A',
        imagen: '/assets/img/apartamento.jpg',
        estado: 'por confirmar',
      },
      {
        id: '2',
        titulo: 'Bodega en zona industrial',
        imagen: '/assets/img/bodega.jpg',
        estado: 'desactivo',
      },
      {
        id: '3',
        titulo: 'Garaje céntrico',
        imagen: '/assets/img/garaje.jpg',
        estado: 'activo',
      },
      // …más avisos
    ]

    // Pon "por confirmar" al inicio
    data.sort((a, b) => {
      if (a.estado === 'por confirmar' && b.estado !== 'por confirmar') return -1
      if (b.estado === 'por confirmar' && a.estado !== 'por confirmar') return 1
      return 0
    })

    setAvisos(data)
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Servicio de Arrendamientos</h1>
      </header>
      <main className={styles.main}>
        <h2 className={styles.title}>Avisos por Confirmar</h2>
        <div className={styles.grid}>
          {avisos.map((aviso) => (
            <div
              key={aviso.id}
              className={styles.card}
              onClick={() => navigate(`/admin/aviso/${aviso.id}`)}  // <-- nueva ruta de admin
              >
              <img
                src={aviso.imagen}
                alt={aviso.titulo}
                className={styles.image}
              />
              <h3 className={styles.cardTitle}>{aviso.titulo}</h3>
              <p className={styles.cardStatus}>
                {aviso.estado === 'por confirmar'
                  ? 'Por Confirmar'
                  : aviso.estado === 'activo'
                  ? 'Activo'
                  : 'Desactivo'}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
