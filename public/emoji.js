const emojiPicker = document.getElementById('emoji-picker');
const toggleEmojiBtn = document.getElementById('toggle-emoji-picker');
const input = document.getElementById('input');

if (emojiPicker && toggleEmojiBtn && input) {
  emojiPicker.style.display = 'none';

  toggleEmojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
  });

  emojiPicker.addEventListener('emoji-click', event => {
    input.value += event.detail.unicode;
    input.focus();
  });
}
