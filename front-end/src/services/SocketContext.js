import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(0);
  const socket = io("http://localhost:8080", {
    path: "/ws",
    transports: ["websocket", "polling"],
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket");
    });

    socket.on("error", (error) => {
      console.error("Error en WebSocket:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};