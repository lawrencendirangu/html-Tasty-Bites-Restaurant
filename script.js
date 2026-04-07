document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.querySelector('#password');
  const toggleButton = document.querySelector('.toggle-password');

  if (passwordInput && toggleButton) {
    toggleButton.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleButton.textContent = isPassword ? 'Hide' : 'Show';
    });
  }
});