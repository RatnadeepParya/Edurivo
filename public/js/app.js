/**
 * Edurivo Client Vanilla JavaScript Framework
 */

// Helper to get CSRF token
function getCsrfToken() {
  const match = document.cookie.match(new RegExp('(^| )__csrf=([^;]+)'));
  if (match) return match[2];
  const meta = document.querySelector('input[name="_csrf"]');
  return meta ? meta.value : '';
}

// Toast notification display
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="border:none;background:none;cursor:pointer;color:#94a3b8;" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global modal management
document.addEventListener('DOMContentLoaded', () => {
  // Modal open
  document.querySelectorAll('[data-modal-target]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if (modal) modal.classList.add('active');
    });
  });

  // Modal close
  document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modal when clicking on overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Auto-dismiss alert messages if any
  const autoAlerts = document.querySelectorAll('.alert');
  if (autoAlerts.length > 0) {
    setTimeout(() => {
      autoAlerts.forEach(al => {
        al.style.transition = 'opacity 0.5s';
        al.style.opacity = '0';
        setTimeout(() => al.remove(), 500);
      });
    }, 5000);
  }
});
