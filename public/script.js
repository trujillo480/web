const socket = io();

const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');
const fileInput = document.getElementById('file-input');

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

const appendMessage = ({ user, message, filename }) => {
  const item = document.createElement('div');
  let html = `<strong>${sanitize(user)}:</strong> `;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(message);

  if (isImage && message.startsWith('http')) {
    html += `<br><img src="${message}" alt="${filename || 'imagen'}" style="max-width: 200px; border-radius: 8px;" />`;
  } else if (message.startsWith('http')) {
    html += `<br><a href="${message}" target="_blank" download>📎 ${sanitize(filename) || 'Archivo'}</a>`;
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

const uploadToCloudinary = async (file) => {
  const url = 'https://api.cloudinary.com/v1_1/daoks8k0s/upload';
  const preset = 'chat_unsigned';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
};

const resetForm = () => {
  input.value = '';
  fileInput.value = '';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const msg = input.value.trim();
  const file = fileInput.files[0];

  if (!msg && !file) return;

  if (file) {
    try {
      const fileUrl = await uploadToCloudinary(file);
      socket.emit('chat message', {
        user: username,
        message: fileUrl,
        filename: file.name,
        filetype: file.type
      });
    } catch (err) {
      alert('Error al subir el archivo.');
      return;
    }
  } else {
    socket.emit('chat message', { user: username, message: msg });
  }

  resetForm();
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
