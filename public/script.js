const socket = io();

const modal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-chat');

const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let username = '';

startBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    modal.style.display = 'none';
    chatContainer.style.display = 'block';
    socket.emit('user joined', username);
  }
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', `${username}: ${input.value}`);
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  const item = document.createElement('div');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chat history', (history) => {
  history.forEach((msg) => {
    const item = document.createElement('div');
    item.textContent = msg;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});
