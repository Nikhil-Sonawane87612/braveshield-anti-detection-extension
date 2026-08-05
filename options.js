document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-settings');
  const toast = document.getElementById('toast');

  saveBtn.addEventListener('click', () => {
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  });
});
