import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SocketContext } from '../context/SocketContext';
import styles from '../styles/mensajes.module.css';

const Mensajes = () => {
  const navigate = useNavigate();
  const { socket, notifications, setNotifications } = useContext(SocketContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Obtener el tipo de usuario desde el token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setTipoUsuario(decodedToken.tipo || "");
    }
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleInicioClick = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const usuario = jwtDecode(token);
      if (usuario.tipo === 'propietario') {
        navigate('/propietario');
      } else if (usuario.tipo === 'interesado') {
        navigate('/interesado');
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      navigate('/login');
    }
    closeMenu();
  };

  return (
    <div className={styles.mensajesContainer}>
      <header className={styles.header}>
        <span className={styles.iconMenu} onClick={toggleMenu}>
          ≡
        </span>
        <h1 className={styles.titulo}>Servicio de Arrendamientos</h1>
        <div className={styles.notificationBell} onClick={toggleNotifications}>
          🔔
          <span className={styles.notificationCount}>{notifications}</span>
        </div>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <button onClick={handleInicioClick}>Inicio</button>
        <button
          onClick={() => {
            navigate('/perfil');
            closeMenu();
          }}
        >
          Perfil
        </button>
        {tipoUsuario === 'propietario' && (
          <button
            onClick={() => {
              navigate('/nuevo-aviso');
              closeMenu();
            }}
          >
            Nuevo Aviso
          </button>
        )}
        <button
          onClick={() => {
            navigate('/mensajes');
            closeMenu();
          }}
        >
          Mensajes
        </button>
      </nav>

      <main className={styles.mainContent}>
        {showNotifications && (
          <div className={styles.notificationDropdown}>
            <h3>Notificaciones</h3>
            {notifications > 0 ? (
              <p>Tienes {notifications} notificación(es) nueva(s).</p>
            ) : (
              <p>No hay notificaciones.</p>
            )}
            <button onClick={() => setNotifications(0)} className={styles.clearButton}>
              Limpiar Notificaciones
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Mensajes;