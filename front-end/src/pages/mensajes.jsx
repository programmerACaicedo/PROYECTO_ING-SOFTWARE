import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SocketContext } from '../context/SocketContext';
import styles from '../styles/mensajes.module.css';

const Mensajes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, notifications, setNotifications } = useContext(SocketContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const mensajesEndRef = useRef(null); // Para auto-scroll

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    setTipoUsuario(decodedToken.tipo || '');
    const id = decodedToken.id?._id || decodedToken.id || '';
    setUserId(id);

    socket.emit('join', id);

    fetchConversaciones(id);

    socket.on('nuevoMensaje', ({ conversacionId, mensaje }) => {
      setConversaciones((prev) =>
        prev.map((conv) =>
          conv._id === conversacionId
            ? { ...conv, mensajes: [...conv.mensajes, mensaje] }
            : conv
        )
      );
      if (conversacionSeleccionada && conversacionId === conversacionSeleccionada._id) {
        setConversacionSeleccionada((prev) => ({
          ...prev,
          mensajes: [...prev.mensajes, mensaje],
        }));
      }
    });

    socket.on('receiveNotification', (data) => {
      setNotifications((prev) => prev + 1);
    });

    socket.on('error', ({ mensaje }) => {
      setError(mensaje);
      setTimeout(() => setError(''), 3000);
    });

    if (location.state?.iniciarChat) {
      const { propietarioId } = location.state;
      socket.emit('iniciarChat', {
        emisorId: id,
        receptorId: propietarioId,
        mensajeInicial: 'Hola, estoy interesado en el inmueble. ¿Se encuentra disponible?',
      });
      location.state.iniciarChat = false;
    }

    return () => {
      socket.off('nuevoMensaje');
      socket.off('receiveNotification');
      socket.off('error');
    };
  }, [socket, navigate, location.state]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversacionSeleccionada?.mensajes]);

  const fetchConversaciones = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/conversaciones?userId=${userId}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  };

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

  const seleccionarConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setError('');
  };

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    if (!conversacionSeleccionada) return;

    const receptorId = conversacionSeleccionada.participantes.find((id) => id !== userId);
    socket.emit('enviarMensaje', {
      conversacionId: conversacionSeleccionada._id,
      emisorId: userId,
      receptorId,
      mensaje: nuevoMensaje,
    });
    setNuevoMensaje('');
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

        <div className={styles.chatLayout}>
          <div className={styles.conversaciones}>
            <h2>Conversaciones</h2>
            {conversaciones.length === 0 ? (
              <p>No tienes conversaciones.</p>
            ) : (
              conversaciones.map((conv) => (
                <div
                  key={conv._id}
                  className={`${styles.conversacion} ${
                    conversacionSeleccionada?._id === conv._id ? styles.selected : ''
                  }`}
                  onClick={() => seleccionarConversacion(conv)}
                >
                  <p>{conv.participantes.find((id) => id !== userId)}</p>
                </div>
              ))
            )}
          </div>

          <div className={styles.chatArea}>
            {conversacionSeleccionada ? (
              <>
                <div className={styles.chatHeader}>
                  <h3>{conversacionSeleccionada.participantes.find((id) => id !== userId)}</h3>
                </div>
                <div className={styles.mensajes}>
                  {conversacionSeleccionada.mensajes.map((msg) => (
                    <div
                      key={msg._id}
                      className={`${styles.mensaje} ${
                        msg.emisorId === userId ? styles.mensajeEnviado : styles.mensajeRecibido
                      }`}
                    >
                      <p>{msg.mensaje}</p>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  <div ref={mensajesEndRef} />
                </div>
                <div className={styles.inputArea}>
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  />
                  <button onClick={enviarMensaje}>➤</button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
              </>
            ) : (
              <p className={styles.noChat}>Selecciona una conversación para empezar a chatear.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mensajes;