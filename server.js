import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('join', (username) => {
    socket.username = username;
    io.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      user: socket.username || 'Anónimo',
      text: msg.text || msg
    });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO en puerto ${PORT}`);
});

