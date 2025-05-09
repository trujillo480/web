const socket = io();

const modal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-chat');

const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

const userListContainer = document.createElement('div');
userListContainer.id = 'user-list';
chatContainer.insertBefore(userListContainer, messages);

let username = localStorage.getItem('username') || '';

if (username) {
  modal.style.display = 'none';
  chatContainer.style.display = 'block';
  socket.emit('user joined', username);
}

startBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    localStorage.setItem('username', username);
    modal.style.display = 'none';
    chatContainer.style.display = 'block';
    socket.emit('user joined', username);
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat message', {
      user: username,
      message: msg
    });
    input.value = '';
  }
});

socket.on('user list', (users) => {
  userListContainer.innerHTML =
    '<strong>Usuarios conectados:</strong><br>' +
    users.map(user => `• ${user}`).join('<br>');
});

socket.on('chat message', (data) => {
  const item = document.createElement('div');
  item.textContent = `${data.user}: ${data.message}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chat history', (history) => {
  messages.innerHTML = ''; 
  history.forEach((data) => {
    const item = document.createElement('div');
    item.textContent = `${data.user}: ${data.message}`;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});
