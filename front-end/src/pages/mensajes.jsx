import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {jwtDecode}   from "jwt-decode";
import { SocketContext } from "../context/SocketContext";
import { obtenerConversaciones, mandarMensaje, obtenerChat } from "../services/conexiones";
import styles from "../styles/mensajes.module.css";

const Mensajes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, notifications, setNotifications } = useContext(SocketContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userNotifications, setUserNotifications] = useState([]);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setTipoUsuario(decoded.tipo || "");
    const id = decoded.id?._id || decoded.id || "";
    setUserId(id);

    // Extraer notificaciones del token
    setUserNotifications(decoded.notificaciones || []);

    socket.emit("join", id);
    fetchConversaciones(id);

    // Escuchar notificaciones en tiempo real
    socket.on("nuevaNotificacion", (notificacion) => {
      setUserNotifications(prev => [notificacion, ...prev]);
      setNotifications(prev => prev + 1);
    });

    socket.on("error", ({ mensaje }) => {
      setError(mensaje);
      setTimeout(() => setError(""), 3000);
    });

    if (location.state?.conversacionId) {
      seleccionarConversacionPorId(location.state.conversacionId);
    }

    return () => {
      socket.off("nuevoMensaje");
      socket.off("nuevoChat");
      socket.off("receiveNotification");
      socket.off("error");
      socket.off("nuevaNotificacion");
    };
  }, [socket, navigate, location.state, userId, conversacionSeleccionada]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversacionSeleccionada?.mensajes]);

  const fetchConversaciones = async id => {
    try {
      const data = await obtenerConversaciones(id);
      const conversaciones = data.map(conv => ({
        ...conv,
        id: conv.id || conv._id // usa 'id' si existe, si no usa '_id'
      }));
      setConversaciones(conversaciones);
    } catch {
      setError("Error al cargar conversaciones");
    }
  };

  const seleccionarConversacionPorId = async chatId => {
    try {
      const chat = await obtenerChat(chatId);
      setConversacionSeleccionada(chat);
    } catch {
      console.error("Error al seleccionar conversación");
    }
  };

  const seleccionarConversacion = conv => {
    console.log("Conversación seleccionada:", conv);
    setConversacionSeleccionada(conv); // conv debe tener el campo 'id'
    setError("");
  };

  const handleEnviarMensaje = async () => {
    if (
      !nuevoMensaje.trim() ||
      !conversacionSeleccionada ||
      !conversacionSeleccionada.id
    ) return;

    const mensajeData = {
      idRemitente: userId,
      mensaje: nuevoMensaje,
      idDestinatario:
        userId === conversacionSeleccionada.idInteresado
          ? conversacionSeleccionada.propietarioId
          : conversacionSeleccionada.idInteresado,
    };

    try {
      await mandarMensaje(conversacionSeleccionada.id, mensajeData);
      setNuevoMensaje(""); // Solo limpia el input
      // NO hagas socket.emit aquí
    } catch (err) {
      setError("Error al enviar el mensaje: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleNotifications = () => setShowNotifications(prev => !prev);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleInicioClick = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      const usuario = jwtDecode(token);
      navigate(usuario.tipo === "propietario" ? "/propietario" : "/interesado");
    } catch {
      navigate("/login");
    }
    closeMenu();
  };

  useEffect(() => {
    if (!socket) return;

    const handleNuevoMensaje = ({ conversacionId, mensaje }) => {
      setConversaciones(prev =>
        prev.map(conv =>
          conv.id === conversacionId
            ? { ...conv, mensajes: [...conv.mensajes, mensaje] }
            : conv
        )
      );
      if (conversacionSeleccionada?.id === conversacionId) {
        setConversacionSeleccionada(prev => ({
          ...prev,
          mensajes: [...prev.mensajes, mensaje],
        }));
      }
    };

    socket.on('nuevoMensaje', handleNuevoMensaje);

    return () => {
      socket.off('nuevoMensaje', handleNuevoMensaje);
    };
  }, [socket, conversacionSeleccionada]);

  return (
    <div className={styles.mensajesContainer}>
      <header className={styles.header}>
        <span className={styles.iconMenu} onClick={toggleMenu}>≡</span>
        <h1 className={styles.titulo}>Servicio de Arrendamientos</h1>
        <div className={styles.notificationBell} onClick={toggleNotifications}>
          🔔<span className={styles.notificationCount}>{notifications}</span>
        </div>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button onClick={handleInicioClick}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        {tipoUsuario === "propietario" && (
          <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
        )}
        <button onClick={() => { navigate("/mensajes"); closeMenu(); }}>Mensajes</button>
      </nav>

      <main className={styles.mainContent}>
        {showNotifications && (
          <div className={styles.notificationDropdown}>
            <h3>Notificaciones</h3>
            {userNotifications.length > 0 ? (
              <ul>
                {userNotifications.map((notif, idx) => (
                  <li key={idx}>
                    {/* Mostrar solo los primeros 60 caracteres del contenido */}
                    {notif.contenido?.substring(0, 48)}
                    {/* Mostrar fecha y hora completa */}
                    <br />
                    <small>
                      {notif.fecha
                        ? new Date(notif.fecha).toLocaleString()
                        : ""}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay notificaciones.</p>
            )}
            <button
              onClick={() => setUserNotifications([])}
              className={styles.clearButton}
            >
              Limpiar Notificaciones
            </button>
          </div>
        )}

        <div className={styles.chatLayout}>
          <aside className={styles.conversaciones}>
            <h2>Conversaciones</h2>
            {conversaciones.length === 0
              ? <p>No tienes conversaciones.</p>
              : conversaciones.map(conv => (
                <div
                  key={conv.id}
                  className={`${styles.conversacion} ${
                    conversacionSeleccionada?.id === conv.id ? styles.selected : ""
                  }`}
                  onClick={() => seleccionarConversacion(conv)}
                >
                  <p>
                    {userId === conv.idInteresado
                      ? conv.nombrePropietario
                      : conv.nombreInteresado}
                  </p>
                </div>
              ))
            }
          </aside>

          <section className={styles.chatArea}>
            {conversacionSeleccionada ? (
              <>
                <div className={styles.chatHeader}>
                  <h3>
                    {userId === conversacionSeleccionada.idInteresado
                      ? conversacionSeleccionada.nombrePropietario
                      : conversacionSeleccionada.nombreInteresado}
                  </h3>
                </div>
                <div className={styles.mensajes}>
                  {conversacionSeleccionada.mensajes.map((msg, i) => (
                    <div
                      key={i}
                      className={`${styles.mensaje} ${
                        msg.idRemitente === userId
                          ? styles.mensajeEnviado
                          : styles.mensajeRecibido
                      }`}
                    >
                      <p>
                        <strong>{msg.nombreRemitente}:</strong> {msg.mensaje}
                      </p>
                      <span>{new Date(msg.fecha).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  <div ref={mensajesEndRef} />
                </div>
                <div className={styles.inputArea}>
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={e => e.key === "Enter" && handleEnviarMensaje()}
                  />
                  <button onClick={handleEnviarMensaje}>➤</button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
              </>
            ) : (
              <p className={styles.noChat}>Selecciona una conversación para empezar a chatear.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Mensajes;
