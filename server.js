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

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.emit('chat history', messageHistory);

  socket.on('join', (username) => {
    socket.username = username;
    io.emit('user joined', username);
  });

  socket.on('chat message', (data) => {
    const msg = {
      user: socket.username || 'Anónimo',
      message: data.message
    };
    messageHistory.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

socket.emit('chat history', messageHistory);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO en puerto ${PORT}`);
});
