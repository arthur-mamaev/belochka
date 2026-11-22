for (const checkbox of document.querySelectorAll('.parent-checklist input[data-check]')) {
  const key = 'belochka:preparation:' + checkbox.dataset.check;

  try {
    checkbox.checked = localStorage.getItem(key) === '1';
  } catch {
    // Checkboxes still work when the browser blocks storage.
  }

  checkbox.addEventListener('change', () => {
    try {
      if (checkbox.checked) {
        localStorage.setItem(key, '1');
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Keep the current selection visible even without storage.
    }
  });
}
