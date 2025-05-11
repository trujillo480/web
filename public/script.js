const socket = io();

const modal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-chat');
const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

let username = localStorage.getItem('username') || '';

const showChat = () => {
  modal.style.display = 'none';
  chatContainer.style.display = 'block';
  socket.emit('user joined', username);
};

if (username) showChat();

startBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    localStorage.setItem('username', username);
    showChat();
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat message', { user: username, message: msg });
    input.value = '';
  }
});

socket.on('user list', (users) => {
  userList.innerHTML = `<strong>Usuarios conectados:</strong><br>${users.map(u => `• ${u}`).join('<br>')}`;
});

const appendMessage = ({ user, message }) => {
  const item = document.createElement('div');
  item.textContent = `${user}: ${message}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
};

socket.on('chat message', appendMessage);

socket.on('chat history', (history) => {
  messages.innerHTML = '';
  history.forEach(appendMessage);
});
