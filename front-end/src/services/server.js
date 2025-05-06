const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/arrendamientos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Conectado a MongoDB')).catch(err => console.error('Error conectando a MongoDB:', err));

// Esquema de mensajes
const mensajeSchema = new mongoose.Schema({
  emisorId: String,
  receptorId: String,
  mensaje: String,
  timestamp: { type: Date, default: Date.now },
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// Esquema de conversaciones
const conversacionSchema = new mongoose.Schema({
  participantes: [String], // IDs de propietario e interesado
  mensajes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mensaje' }],
});
const Conversacion = mongoose.model('Conversacion', conversacionSchema);

// Middleware para verificar autenticación (simplificado)
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  // Aquí deberías verificar el token JWT, por simplicidad lo omitimos
  next();
};

// Ruta para obtener conversaciones de un usuario
app.get('/api/conversaciones', verificarToken, async (req, res) => {
  const userId = req.query.userId;
  try {
    const conversaciones = await Conversacion.find({ participantes: userId })
      .populate('mensajes')
      .exec();
    res.json(conversaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
});

// Manejo de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unir al usuario a su sala basada en su ID
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  // Iniciar o continuar una conversación
  socket.on('iniciarChat', async ({ emisorId, receptorId, mensajeInicial }) => {
    try {
      let conversacion = await Conversacion.findOne({
        participantes: { $all: [emisorId, receptorId] },
      });

      if (!conversacion) {
        conversacion = new Conversacion({
          participantes: [emisorId, receptorId],
          mensajes: [],
        });
      }

      const mensaje = new Mensaje({
        emisorId,
        receptorId,
        mensaje: mensajeInicial,
      });
      await mensaje.save();

      conversacion.mensajes.push(mensaje._id);
      await conversacion.save();

      io.to(emisorId).to(receptorId).emit('nuevoMensaje', {
        conversacionId: conversacion._id,
        mensaje,
      });
    } catch (error) {
      console.error('Error al iniciar chat:', error);
    }
  });

  // Enviar un nuevo mensaje en una conversación existente
  socket.on('enviarMensaje', async ({ conversacionId, emisorId, receptorId, mensaje }) => {
    try {
      const conversacion = await Conversacion.findById(conversacionId);
      if (!conversacion) {
        return socket.emit('error', { mensaje: 'Conversación no encontrada' });
      }

      const mensajes = await Mensaje.find({ _id: { $in: conversacion.mensajes } })
        .sort({ timestamp: -1 })
        .exec();
      const ultimoMensaje = mensajes[0];

      // Verificar si el emisor es un interesado y si puede enviar otro mensaje
      const decodedToken = socket.handshake.auth.token ? require('jsonwebtoken').decode(socket.handshake.auth.token) : { tipo: '' };
      const esInteresado = decodedToken.tipo === 'interesado';

      if (esInteresado && ultimoMensaje.emisorId === emisorId) {
        return socket.emit('error', {
          mensaje: 'Debes esperar la respuesta del propietario antes de enviar otro mensaje.',
        });
      }

      const nuevoMensaje = new Mensaje({
        emisorId,
        receptorId,
        mensaje,
      });
      await nuevoMensaje.save();

      conversacion.mensajes.push(nuevoMensaje._id);
      await conversacion.save();

      io.to(emisorId).to(receptorId).emit('nuevoMensaje', {
        conversacionId,
        mensaje: nuevoMensaje,
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      socket.emit('error', { mensaje: 'Error al enviar mensaje' });
    }
  });

  // Mantener la funcionalidad de notificaciones
  socket.on('sendNotification', (data) => {
    io.emit('receiveNotification', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});