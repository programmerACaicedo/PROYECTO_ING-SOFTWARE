// socket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON en el body de las peticiones

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
    io.emit('nuevoMensaje', data); // Ya lo tienes
    io.emit('actualizarConversaciones', { userId: data.idRemitente }); // Notifica a todos
    io.emit('actualizarConversaciones', { userId: data.idDestinatario });
  });

  socket.on('crearChat', (data) => {
    io.emit('nuevoChat', data); // Notifica a todos de un nuevo chat
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

app.post('/api/socket/nuevoMensaje', (req, res) => {
  io.emit('nuevoMensaje', req.body);
  res.sendStatus(200);
});

const PORT = 4000; // Puedes cambiar el puerto si lo necesitas
server.listen(PORT, () => {
  console.log(`Servidor de Socket.io corriendo en http://localhost:${PORT}`);
});
