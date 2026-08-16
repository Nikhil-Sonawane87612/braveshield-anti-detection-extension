/**
 * BraveShield Bypass Pro — Popup HUD Controller
 * Version: 5.4.0
 */

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterSubtitle = document.getElementById('master-subtitle');
  const profileSelect = document.getElementById('device-profile-select');
  const metricTimeSaved = document.getElementById('metric-timesaved');
  const metricTraps = document.getElementById('metric-traps');
  const metricLinks = document.getElementById('metric-links');

  const toggleUnshortener = document.getElementById('toggle-unshortener');
  const togglePaywall = document.getElementById('toggle-paywall');
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

  function formatSeconds(secs) {
    if (!secs || secs < 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  }

  // 2. Load Stored States & Live Telemetry
  chrome.storage.local.get([
    'masterEnabled', 'unshortenerEnabled', 'paywallDefuserEnabled',
    'autoBypassTimers', 'bypassAdblockDetection', 'spotifyUnlocked', 'youtubeAds',
    'deviceProfile', 'timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked',
    'whitelist', 'updateAvailable'
  ], (res) => {
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;
    updateMasterUI(isMaster);

    toggleUnshortener.checked = res.unshortenerEnabled !== false;
    togglePaywall.checked = res.paywallDefuserEnabled !== false;
    toggleTimers.checked = res.autoBypassTimers !== false;
    toggleAdblock.checked = res.bypassAdblockDetection !== false;
    toggleMedia.checked = (res.spotifyUnlocked !== false || res.youtubeAds !== false);

    if (res.deviceProfile && profileSelect) {
      profileSelect.value = res.deviceProfile;
    }

    if (metricTimeSaved) metricTimeSaved.textContent = formatSeconds(res.timeSavedSeconds || 0);
    if (metricTraps) metricTraps.textContent = (res.trapsNeutralized || 0).toString();
    if (metricLinks) metricLinks.textContent = (res.directLinksUnlocked || 0).toString();

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
      masterSubtitle.textContent = 'All 28 Stealth Modules Armed';
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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_MASTER_STATE', enabled: val }).catch(() => {});
      }
    });
  });

  if (profileSelect) {
    profileSelect.addEventListener('change', () => {
      const selected = profileSelect.value;
      chrome.storage.local.set({ deviceProfile: selected });
    });
  }

  toggleUnshortener.addEventListener('change', () => {
    chrome.storage.local.set({ unshortenerEnabled: toggleUnshortener.checked });
  });

  togglePaywall.addEventListener('change', () => {
    chrome.storage.local.set({ paywallDefuserEnabled: togglePaywall.checked });
  });

  toggleTimers.addEventListener('change', () => {
    chrome.storage.local.set({ autoBypassTimers: toggleTimers.checked });
  });

  toggleAdblock.addEventListener('change', () => {
    chrome.storage.local.set({ bypassAdblockDetection: toggleAdblock.checked });
  });

  toggleMedia.addEventListener('change', () => {
    const val = toggleMedia.checked;
    chrome.storage.local.set({ spotifyUnlocked: val, youtubeAds: val, twitchShieldEnabled: val });
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
      syncText.textContent = 'Synced!';
    }
    setTimeout(() => {
      btnSync.classList.remove('syncing');
      syncText.textContent = 'Auto-Sync';
    }, 2000);
  });
});