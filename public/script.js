const socket = io();

const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

const username = localStorage.getItem('username');
if (!username) window.location.href = 'login.html';

const sanitize = (text) => {
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.innerHTML;
};

const convertLinks = (text) => {
  return text.replace(/(https?:\/\/[^\s]+)/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
};

const appendMessage = ({ user, message }) => {
  const item = document.createElement('div');
  item.innerHTML = `<strong>${sanitize(user)}:</strong> <span>${convertLinks(sanitize(message))}</span>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
};

const showChat = () => {
  chatContainer.hidden = false;
  socket.emit('user joined', username);
  input.focus();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('chat message', { user: username, message: msg });
  input.value = '';
});

socket.on('chat message', appendMessage);
socket.on('chat history', (history) => {
  messages.innerHTML = '';
  history.forEach(appendMessage);
});
socket.on('user list', (users) => {
  userList.innerHTML = `<strong>Usuarios conectados:</strong><br>${users.map(u => `• ${u}`).join('<br>')}`;
});

showChat();
