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
const connectedUsers = new Map();       
const disconnectTimers = new Map();     

io.on('connection', (socket) => {
  console.log('✅ Usuario conectado');

  socket.emit('chat history', messageHistory);

  socket.on('user joined', (username) => {
    socket.username = username;

    if (disconnectTimers.has(username)) {
      clearTimeout(disconnectTimers.get(username));
      disconnectTimers.delete(username);
    } else {
      io.emit('chat message', {
        user: 'Sistema',
        message: `✅ ${username} se ha unido al chat`
      });
    }

    connectedUsers.set(username, socket.id);
    io.emit('user list', Array.from(connectedUsers.keys()));
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
    const username = socket.username;
    if (username) {
      const timeout = setTimeout(() => {
        connectedUsers.delete(username);
        disconnectTimers.delete(username);

        io.emit('user list', Array.from(connectedUsers.keys()));

        io.emit('chat message', {
          user: 'Sistema',
          message: `❌ ${username} salió del chat`
        });

        console.log(`🕒 ${username} fue removido después de 10 segundos de inactividad`);
      }, 10000); 

      disconnectTimers.set(username, timeout);
    }

    console.log('❎ Usuario desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO corriendo en http://localhost:${PORT}`);
});
