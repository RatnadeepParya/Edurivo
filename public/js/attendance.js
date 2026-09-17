/**
 * Edurivo Fast Attendance Grid Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const gridTable = document.querySelector('.attendance-grid-table');
  if (!gridTable) return;

  // Single student status toggle
  gridTable.addEventListener('click', (e) => {
    const btn = e.target.closest('.status-btn');
    if (!btn) return;

    const row = btn.closest('tr');
    const group = btn.closest('.status-btn-group');
    const hiddenInput = row.querySelector('.student-status-input');
    const status = btn.getAttribute('data-status');

    group.querySelectorAll('.status-btn').forEach(b => {
      b.classList.remove('selected-P', 'selected-A', 'selected-L', 'selected-H', 'selected-E');
    });

    const prefix = status.charAt(0);
    btn.classList.add(`selected-${prefix}`);
    if (hiddenInput) hiddenInput.value = status;
  });

  // Mark all present button
  const markAllPBtn = document.getElementById('markAllPresentBtn');
  if (markAllPBtn) {
    markAllPBtn.addEventListener('click', () => {
      document.querySelectorAll('.attendance-grid-table tbody tr').forEach(row => {
        const btn = row.querySelector('.status-btn[data-status="PRESENT"]');
        if (btn) btn.click();
      });
    });
  }

  // Mark all absent button
  const markAllABtn = document.getElementById('markAllAbsentBtn');
  if (markAllABtn) {
    markAllABtn.addEventListener('click', () => {
      document.querySelectorAll('.attendance-grid-table tbody tr').forEach(row => {
        const btn = row.querySelector('.status-btn[data-status="ABSENT"]');
        if (btn) btn.click();
      });
    });
  }

  // Attendance form submission handler
  const attForm = document.getElementById('attendanceForm');
  if (attForm) {
    attForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = attForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Saving Attendance...';

      const classId = attForm.querySelector('input[name="classId"]').value;
      const sectionId = attForm.querySelector('input[name="sectionId"]').value;
      const date = attForm.querySelector('input[name="date"]').value;
      const csrfToken = getCsrfToken();

      const records = [];
      document.querySelectorAll('.attendance-grid-table tbody tr').forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const status = row.querySelector('.student-status-input')?.value || 'PRESENT';
        const remarks = row.querySelector('.student-remarks-input')?.value || '';
        records.push({ studentId, status, remarks });
      });

      try {
        const res = await fetch('/admin/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          body: JSON.stringify({ classId, sectionId, date, records, _csrf: csrfToken })
        });

        const data = await res.json();
        if (data.success) {
          showToast('Attendance recorded successfully!', 'success');
        } else {
          showToast(data.error?.message || 'Failed to record attendance', 'danger');
        }
      } catch (err) {
        showToast('Network error while saving attendance', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Attendance';
      }
    });
  }
});
