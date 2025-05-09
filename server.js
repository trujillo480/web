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
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const messageHistory = [];
const connectedUsers = new Set();

io.on('connection', (socket) => {
  console.log('✅ Usuario conectado');

  socket.emit('chat history', messageHistory);

  socket.on('user joined', (username) => {
    if (connectedUsers.has(username)) {
      socket.emit('chat message', {
        user: 'Sistema',
        message: `⚠️ El nombre "${username}" ya está en uso. Por favor elige otro.`
      });
      return;
    }

    socket.username = username;
    connectedUsers.add(username);

    io.emit('user list', Array.from(connectedUsers));

    io.emit('chat message', {
      user: 'Sistema',
      message: `✅ ${username} se ha unido al chat`
    });
  });

  socket.on('chat message', (data) => {
    const msg = {
      user: socket.username || 'Anónimo',
      message: data.message
    };

    messageHistory.push(msg);
    if (messageHistory.length > 100) {
      messageHistory.shift(); 
    }

    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      connectedUsers.delete(socket.username);

      io.emit('user list', Array.from(connectedUsers));

      io.emit('chat message', {
        user: 'Sistema',
        message: `❌ ${socket.username} salió del chat`
      });
    }

    console.log('❎ Usuario desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});
