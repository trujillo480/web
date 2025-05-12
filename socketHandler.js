const messageHistory = [];
const connectedUsers = new Map();
const disconnectTimers = new Map();

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Usuario conectado');
    socket.emit('chat history', messageHistory);

    socket.on('user joined', (username) => {
      if (connectedUsers.has(username)) {
        socket.emit('username error', 'El nombre ya está en uso.');
        return;
      }

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
      const msg = { user: socket.username || 'Anónimo', message };
      messageHistory.push(msg);
      if (messageHistory.length > 100) messageHistory.shift();
      io.emit('chat message', msg);
    });

socket.on('file upload', ({ user, filename, filetype, content }) => {
  const fileMsg = { user, filename, filetype, content };
  messageHistory.push(fileMsg);
  if (messageHistory.length > 100) messageHistory.shift();
  io.emit('chat message', fileMsg);
});

    socket.on('disconnect', () => {
      const { username } = socket;
      if (!username) return;

      disconnectTimers.set(username, setTimeout(() => {
        connectedUsers.delete(username);
        io.emit('user list', [...connectedUsers.keys()]);
        io.emit('chat message', {
          user: 'Sistema',
          message: `❌ ${username} ha salido del chat`
        });
      }, 5000));
    });

  });
};
