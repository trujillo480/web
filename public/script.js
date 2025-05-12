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

const appendMessage = ({ user, message, filename, filetype, content }) => {
  const item = document.createElement('div');
  let html = `<strong>${sanitize(user)}:</strong> `;

  if (content && filetype.startsWith('image/')) {
    html += `<br><img src="${content}" alt="${filename}" style="max-width: 200px;" />`;
  } else if (content) {
    html += `<br><a href="${content}" download="${filename}">${filename}</a>`;
  } else {
    html += `<span>${convertLinks(sanitize(message))}</span>`;
  }

  item.innerHTML = html;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
};

const showChat = () => {
  chatContainer.hidden = false;
  socket.emit('user joined', username);
  input.focus();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const msg = input.value.trim();
  const file = document.getElementById('file-input').files[0];

  if (!msg && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('file upload', {
        user: username,
        filename: file.name,
        filetype: file.type,
        content: reader.result
      });
    };
    reader.readAsDataURL(file);
  } else {
    socket.emit('chat message', { user: username, message: msg });
  }

  input.value = '';
  document.getElementById('file-input').value = '';
});

socket.on('chat message', appendMessage);
socket.on('chat history', (history) => {
  messages.innerHTML = '';
  history.forEach(appendMessage);
});
socket.on('user list', (users) => {
  userList.innerHTML = `<strong>Usuarios conectados:</strong><br>${users.map(u => `• ${u}`).join('<br>')}`;
});

socket.on('username error', (msg) => {
  alert(msg); 
  localStorage.removeItem('username'); 
  window.location.href = 'login.html'; 
});

showChat();
