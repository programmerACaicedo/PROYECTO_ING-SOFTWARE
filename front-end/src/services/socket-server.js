// socket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Cambia si tu frontend está en otro puerto
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('enviarMensaje', (data) => {
    // Aquí puedes emitir el mensaje a los clientes que correspondan
    io.emit('nuevoMensaje', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = 4000; // Puedes cambiar el puerto si lo necesitas
server.listen(PORT, () => {
  console.log(`Servidor de Socket.io corriendo en http://localhost:${PORT}`);
});
