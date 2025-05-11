document.getElementById('start-chat').addEventListener('click', () => {
  const username = document.getElementById('username-input').value.trim();
  if (username) {
    localStorage.setItem('username', username);
    window.location.href = 'index.html';
  }
});