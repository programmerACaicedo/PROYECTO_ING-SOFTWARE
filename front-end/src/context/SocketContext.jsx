import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:4000'); // Conectar al servidor
    setSocket(newSocket);

    newSocket.on('receiveNotification', (data) => {
      setNotifications((prev) => prev + 1); // Incrementar contador de notificaciones
      alert(`Nueva notificación: ${data.message}`); // Mostrar notificación
    });

    return () => newSocket.close(); // Limpiar al desmontar
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};