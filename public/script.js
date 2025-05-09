const socket = io();

const modal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-chat');

const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

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

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
      user: username,
      message: input.value
    });
    input.value = '';
  }
});

socket.on('chat message', function(data) {
  const item = document.createElement('div');
  item.textContent = `${data.user}: ${data.message}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chat history', (history) => {
  history.forEach((data) => {
    const item = document.createElement('div');
    item.textContent = `${data.user}: ${data.message}`;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});

window.addEventListener('beforeunload', () => {
  localStorage.removeItem('username'); 
});
