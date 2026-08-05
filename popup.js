document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('main-toggle');
  const domainStatus = document.getElementById('domain-status');
  const trapsVal = document.getElementById('traps-bypassed');

  // Load current active status
  chrome.storage.local.get(['enabled', 'blockedCounter'], (res) => {
    toggle.checked = res.enabled !== false;
    if (res.blockedCounter) {
      trapsVal.textContent = res.blockedCounter;
    }
  });

  // Get current tab domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        domainStatus.textContent = 'Active on ' + url.hostname;
      } catch (e) {
        domainStatus.textContent = 'Active on system page';
      }
    }
  });

  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled: isEnabled });
  });
});
