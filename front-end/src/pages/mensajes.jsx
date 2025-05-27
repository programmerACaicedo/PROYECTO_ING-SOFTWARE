import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(token);
    setTipoUsuario(decodedToken.tipo || "");
    const id = decodedToken.id?._id || decodedToken.id || "";
    setUserId(id);

    socket.emit("join", id);

    fetchConversaciones(id);

    socket.on("nuevoMensaje", ({ conversacionId, mensaje, emisorId, destinatarioId }) => {
      if (userId === destinatarioId) {
        setConversaciones((prev) =>
          prev.map((conv) =>
            conv.id === conversacionId
              ? { ...conv, mensajes: [...conv.mensajes, mensaje] }
              : conv
          )
        );
        if (conversacionSeleccionada && conversacionId === conversacionSeleccionada.id) {
          setConversacionSeleccionada((prev) => ({
            ...prev,
            mensajes: [...prev.mensajes, mensaje],
          }));
        }
      }
    });

    socket.on("nuevoChat", (nuevaConversacion) => {
      setConversaciones((prev) => [...prev, nuevaConversacion]);
    });

    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => prev + 1);
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
    };
  }, [socket, navigate, location.state]);

  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversacionSeleccionada?.mensajes]);

  const fetchConversaciones = async (userId) => {
    try {
      const data = await obtenerConversaciones(userId);
      setConversaciones(data);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      setError("Error al cargar conversaciones");
    }
  };

  const seleccionarConversacionPorId = async (chatId) => {
    try {
      const chat = await obtenerChat(chatId);
      setConversacionSeleccionada(chat);
    } catch (error) {
      console.error("Error al seleccionar conversación:", error);
    }
  };

  const seleccionarConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setError("");
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !conversacionSeleccionada) return;

    const mensajeData = {
      idRemitente: userId,
      mensaje: nuevoMensaje,
      idDestinatario: userId === conversacionSeleccionada.idInteresado
        ? conversacionSeleccionada.propietarioId
        : conversacionSeleccionada.idInteresado,
    };

    try {
      const updatedChat = await mandarMensaje(conversacionSeleccionada.id, mensajeData);
      setConversacionSeleccionada(updatedChat);
      setConversaciones((prev) =>
        prev.map((conv) => (conv.id === updatedChat.id ? updatedChat : conv))
      );
      socket.emit("enviarMensaje", {
        conversacionId: conversacionSeleccionada.id,
        emisorId: userId,
        destinatarioId: mensajeData.idDestinatario,
        mensaje: nuevoMensaje,
      });
      setNuevoMensaje("");
    } catch (error) {
      setError("Error al enviar el mensaje: " + (error.response?.data?.message || error.message));
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
    closeMenu();
  };

  return (
    <div className={styles.mensajesContainer}>
      <header className={styles.header}>
        <span className={styles.iconMenu} onClick={toggleMenu}>≡</span>
        <h1 className={styles.titulo}>Servicio de Arrendamientos</h1>
        <div className={styles.notificationBell} onClick={toggleNotifications}>
          🔔
          <span className={styles.notificationCount}>{notifications}</span>
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
                  key={conv.id}
                  className={`${styles.conversacion} ${
                    conversacionSeleccionada?.id === conv.id ? styles.selected : ""
                  }`}
                  onClick={() => seleccionarConversacion(conv)}
                >
                  <p>
                    Chat con{" "}
                    {userId === conv.idInteresado
                      ? conv.nombrePropietario
                      : conv.nombreInteresado}
                    {" "}({conv.idAviso})
                  </p>
                </div>
              ))
            )}
          </div>

          <div className={styles.chatArea}>
            {conversacionSeleccionada ? (
              <>
                <div className={styles.chatHeader}>
                  <h3>Chat con Aviso {conversacionSeleccionada.idAviso}</h3>
                </div>
                <div className={styles.mensajes}>
                  {conversacionSeleccionada.mensajes.map((msg, index) => (
                    <div
                      key={index}
                      className={`${styles.mensaje} ${
                        msg.idRemitente === userId ? styles.mensajeEnviado : styles.mensajeRecibido
                      }`}
                    >
                      <p>
                        <strong>{msg.nombreRemitente || "Usuario"}:</strong> {msg.mensaje}
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
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={(e) => e.key === "Enter" && handleEnviarMensaje()}
                  />
                  <button onClick={handleEnviarMensaje}>➤</button>
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