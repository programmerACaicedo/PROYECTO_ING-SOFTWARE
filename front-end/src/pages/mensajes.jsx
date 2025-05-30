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
  const conversacionSeleccionadaRef = useRef(conversacionSeleccionada);
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

    // Agrega este log para depurar
    console.log("Tipo de usuario:", decoded.tipo, "ID usado para socket:", id);

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
        id: conv.id || conv._id
      }));
      setConversaciones(conversaciones);
      // Limpia el error si la carga fue exitosa
      setError("");
    } catch {
      // Solo muestra el error si no hay conversaciones cargadas
      if (conversaciones.length === 0) {
        setError("Error al cargar conversaciones");
      }
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
    if (!conv?.id) return;
    seleccionarConversacionPorId(conv.id); // Siempre obtiene el chat actualizado del backend
    setError("");
  };

  const handleEnviarMensaje = async () => {
    if (
      !nuevoMensaje.trim() ||
      !conversacionSeleccionada ||
      !conversacionSeleccionada.id
    ) return;

    // Validación: si el último mensaje lo envió el usuario actual, no permitir enviar otro
    const mensajes = conversacionSeleccionada.mensajes;
    if (
      mensajes.length > 0 &&
      mensajes[mensajes.length - 1].idRemitente === userId
    ) {
      // Determina el nombre del otro usuario
      const nombreOtroUsuario =
        userId === conversacionSeleccionada.idInteresado
          ? conversacionSeleccionada.nombrePropietario
          : conversacionSeleccionada.nombreInteresado;
      setError(`Debes esperar la respuesta de ${nombreOtroUsuario} antes de enviar otro mensaje.`);
      return;
    }

    const mensajeData = {
      idRemitente: userId,
      mensaje: nuevoMensaje,
      idDestinatario:
        userId === conversacionSeleccionada.idInteresado
          ? conversacionSeleccionada.propietarioId
          : conversacionSeleccionada.idInteresado,
    };

    try {
      // Espera la respuesta del backend (chat actualizado)
      const chatActualizado = await mandarMensaje(conversacionSeleccionada.id, mensajeData);
      setNuevoMensaje(""); // Limpia el input

      // Actualiza el estado local del chat seleccionado y la lista de conversaciones
      setConversacionSeleccionada(chatActualizado);
      setConversaciones(prev =>
        prev.map(conv =>
          conv.id === chatActualizado.id ? chatActualizado : conv
        )
      );
      // El socket también actualizará cuando llegue el evento, pero esto da feedback inmediato
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
    conversacionSeleccionadaRef.current = conversacionSeleccionada;
  }, [conversacionSeleccionada]);

  useEffect(() => {
    if (!socket || !userId) return;

    // Actualiza la lista de conversaciones cuando haya un nuevo chat o cambio
    const handleNuevoChat = () => {
      fetchConversaciones(userId);
    };

    socket.on("nuevoChat", handleNuevoChat);

    return () => {
      socket.off("nuevoChat", handleNuevoChat);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;

    // Cuando llega un nuevo mensaje, actualiza el chat seleccionado desde el backend
    const handleNuevoMensaje = ({ conversacionId }) => {
      // Si el chat abierto es el que recibió el mensaje, actualízalo completamente
      if (conversacionSeleccionadaRef.current?.id === conversacionId) {
        seleccionarConversacionPorId(conversacionId);
      }
      // Siempre actualiza la lista de conversaciones
      fetchConversaciones(userId);
    };

    socket.on('nuevoMensaje', handleNuevoMensaje);

    return () => {
      socket.off('nuevoMensaje', handleNuevoMensaje);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!userId) return;

    // Refresca conversaciones y chat seleccionado cada 5 segundos
    const interval = setInterval(() => {
      fetchConversaciones(userId);
      if (conversacionSeleccionada?.id) {
        seleccionarConversacionPorId(conversacionSeleccionada.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, conversacionSeleccionada?.id]);

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