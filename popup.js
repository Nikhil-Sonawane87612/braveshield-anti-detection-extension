/**
 * BraveShield Bypass Pro — Popup HUD Controller
 * Version: 5.3.0
 */

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterSubtitle = document.getElementById('master-subtitle');
  const toggleBrave = document.getElementById('toggle-brave');
  const toggleTimers = document.getElementById('toggle-timers');
  const toggleAdblock = document.getElementById('toggle-adblock');
  const toggleMedia = document.getElementById('toggle-media');
  const statusSite = document.getElementById('status-site');
  const statusDot = document.getElementById('status-dot');
  const statusLabel = document.getElementById('status-label');
  const btnWhitelist = document.getElementById('btn-whitelist');
  const whitelistText = document.getElementById('whitelist-text');
  const btnOptions = document.getElementById('btn-open-options');
  const btnSync = document.getElementById('btn-sync-rules');
  const syncText = document.getElementById('sync-text');
  const updateBadge = document.getElementById('update-badge');

  let currentHostname = '';

  // 1. Get Active Tab Domain
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        statusSite.textContent = currentHostname || 'Local / System Page';
      } catch (_) {
        statusSite.textContent = 'System / Extension Tab';
      }
    }
  } catch (_) {
    statusSite.textContent = 'Active Session';
  }

  // 2. Load Stored States
  chrome.storage.local.get([
    'masterEnabled', 'maskBraveApi', 'autoBypassTimers',
    'bypassAdblockDetection', 'spotifyUnlocked', 'whitelist',
    'updateAvailable', 'lastSyncTime'
  ], (res) => {
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;
    updateMasterUI(isMaster);

    toggleBrave.checked = res.maskBraveApi !== false;
    toggleTimers.checked = res.autoBypassTimers !== false;
    toggleAdblock.checked = res.bypassAdblockDetection !== false;
    toggleMedia.checked = res.spotifyUnlocked !== false;

    if (res.updateAvailable) {
      updateBadge.classList.remove('hidden');
    }

    const whitelist = Array.isArray(res.whitelist) ? res.whitelist : [];
    if (currentHostname && whitelist.includes(currentHostname)) {
      whitelistText.textContent = 'Whitelisted';
      statusLabel.textContent = 'Whitelisted';
      statusDot.classList.add('disabled');
    }
  });

  function updateMasterUI(enabled) {
    if (enabled) {
      masterSubtitle.textContent = 'All 24 Stealth Modules Armed';
      statusDot.classList.remove('disabled');
      statusLabel.textContent = 'Guarded';
    } else {
      masterSubtitle.textContent = 'System Defense Disabled';
      statusDot.classList.add('disabled');
      statusLabel.textContent = 'Disabled';
    }
  }

  // 3. Event Listeners
  masterToggle.addEventListener('change', () => {
    const val = masterToggle.checked;
    chrome.storage.local.set({ masterEnabled: val, enabled: val });
    updateMasterUI(val);

    // Notify active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_MASTER_STATE', enabled: val }).catch(() => {});
      }
    });
  });

  toggleBrave.addEventListener('change', () => {
    chrome.storage.local.set({ maskBraveApi: toggleBrave.checked });
  });

  toggleTimers.addEventListener('change', () => {
    chrome.storage.local.set({ autoBypassTimers: toggleTimers.checked });
  });

  toggleAdblock.addEventListener('change', () => {
    chrome.storage.local.set({ bypassAdblockDetection: toggleAdblock.checked });
  });

  toggleMedia.addEventListener('change', () => {
    chrome.storage.local.set({ spotifyUnlocked: toggleMedia.checked, youtubeAds: toggleMedia.checked });
  });

  // Whitelist Button
  btnWhitelist.addEventListener('click', () => {
    if (!currentHostname) return;
    chrome.storage.local.get(['whitelist'], (res) => {
      let wl = Array.isArray(res.whitelist) ? res.whitelist : [];
      if (wl.includes(currentHostname)) {
        wl = wl.filter(h => h !== currentHostname);
        whitelistText.textContent = 'Whitelist Site';
        statusLabel.textContent = 'Guarded';
        statusDot.classList.remove('disabled');
      } else {
        wl.push(currentHostname);
        whitelistText.textContent = 'Whitelisted';
        statusLabel.textContent = 'Whitelisted';
        statusDot.classList.add('disabled');
      }
      chrome.storage.local.set({ whitelist: wl });
    });
  });

  // Open Options Page
  btnOptions.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html');
    }
  });

  // Auto-Sync Button
  btnSync.addEventListener('click', async () => {
    btnSync.classList.add('syncing');
    syncText.textContent = 'Syncing...';
    try {
      const res = await chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
      if (res && res.success) {
        syncText.textContent = 'Synced!';
        if (res.updateAvailable) updateBadge.classList.remove('hidden');
      } else {
        syncText.textContent = 'Error';
      }
    } catch (_) {
      syncText.textContent = 'Synced';
    }
    setTimeout(() => {
      btnSync.classList.remove('syncing');
      syncText.textContent = 'Auto-Sync';
    }, 2000);
  });

  // Two-way Live Sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.masterEnabled) {
      masterToggle.checked = changes.masterEnabled.newValue !== false;
      updateMasterUI(masterToggle.checked);
    }
    if (changes.maskBraveApi) toggleBrave.checked = changes.maskBraveApi.newValue !== false;
    if (changes.autoBypassTimers) toggleTimers.checked = changes.autoBypassTimers.newValue !== false;
    if (changes.bypassAdblockDetection) toggleAdblock.checked = changes.bypassAdblockDetection.newValue !== false;
    if (changes.spotifyUnlocked) toggleMedia.checked = changes.spotifyUnlocked.newValue !== false;
    if (changes.updateAvailable) {
      if (changes.updateAvailable.newValue) updateBadge.classList.remove('hidden');
      else updateBadge.classList.add('hidden');
    }
  });
});