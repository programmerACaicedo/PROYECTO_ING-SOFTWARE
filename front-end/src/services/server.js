const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Permitir que el frontend se conecte
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('sendNotification', (data) => {
    io.emit('receiveNotification', data); // Enviar notificación a todos los clientes
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});