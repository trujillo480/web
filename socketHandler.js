import { Server } from 'socket.io';

const messageHistory = [];
const connectedUsers = new Map();
const disconnectTimers = new Map();

export const setupSocket = (io) => {
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
      io.emit('user list', [...connectedUsers.keys()]);
    });

    socket.on('chat message', ({ message }) => {
      const msg = {
        user: socket.username || 'Anónimo',
        message
      };
      messageHistory.push(msg);
      if (messageHistory.length > 100) messageHistory.shift();
      io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
      const username = socket.username;
      if (username) {
        const timeout = setTimeout(() => {
          connectedUsers.delete(username);
          disconnectTimers.delete(username);
          io.emit('user list', [...connectedUsers.keys()]);
          io.emit('chat message', {
            user: 'Sistema',
            message: `❌ ${username} salió del chat`
          });
          console.log(`🕒 ${username} fue removido después de 10 segundos`);
        }, 10000);
        disconnectTimers.set(username, timeout);
      }
      console.log('❎ Usuario desconectado');
    });
  });
};
