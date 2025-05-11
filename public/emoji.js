const emojiPicker = document.getElementById('emoji-picker');
const toggleEmojiBtn = document.getElementById('toggle-emoji-picker');
const inputField = document.getElementById('input');

if (emojiPicker && toggleEmojiBtn && inputField) {
  emojiPicker.style.display = 'none';

  toggleEmojiBtn.onclick = () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
  };

  emojiPicker.addEventListener('emoji-click', e => {
    inputField.value += e.detail.unicode;
    inputField.focus();
  });
}
