/**
 * BraveShield Bypass Pro — Popup HUD Controller
 * Version: 6.0.0
 */

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterSubtitle = document.getElementById('master-subtitle');
  const stealthGrade = document.getElementById('stealth-grade');
  const stealthScoreText = document.getElementById('stealth-score-text');

  const profileSearch = document.getElementById('profile-search');
  const profileSelect = document.getElementById('device-profile-select');
  const metricTimeSaved = document.getElementById('metric-timesaved');
  const metricTraps = document.getElementById('metric-traps');
  const metricLinks = document.getElementById('metric-links');

  // Anti-Fingerprinting Switches
  const toggleCanvas = document.getElementById('toggle-canvas');
  const toggleAudio = document.getElementById('toggle-audio');
  const toggleWebgl = document.getElementById('toggle-webgl');
  const toggleHints = document.getElementById('toggle-hints');
  const toggleBrave = document.getElementById('toggle-brave');
  const toggleWebrtc = document.getElementById('toggle-webrtc');
  const toggleDomjitter = document.getElementById('toggle-domjitter');
  const toggleTimercoarse = document.getElementById('toggle-timercoarse');

  // Productivity Switches
  const toggleUnshortener = document.getElementById('toggle-unshortener');
  const togglePaywall = document.getElementById('toggle-paywall');
  const toggleTimers = document.getElementById('toggle-timers');
  const toggleAdblock = document.getElementById('toggle-adblock');
  const toggleMedia = document.getElementById('toggle-media');
  const toggleCleanurl = document.getElementById('toggle-cleanurl');
  const toggleRightclick = document.getElementById('toggle-rightclick');
  const toggleVideospeed = document.getElementById('toggle-videospeed');

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
  let selectedProfileId = 'win-rtx4090';

  // 1. Populate 110+ Hardware Profiles into Dropdown
  function renderProfileOptions(filter = '') {
    if (!profileSelect) return;
    const filterLower = filter.trim().toLowerCase();
    const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];

    profileSelect.innerHTML = '';

    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '🛠️ Custom Hardware Profile (Configure in Studio)';
    profileSelect.appendChild(customOpt);

    const categories = {};
    catalog.forEach(p => {
      if (!filterLower || p.name.toLowerCase().includes(filterLower) || p.category.toLowerCase().includes(filterLower) || p.renderer.toLowerCase().includes(filterLower)) {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
      }
    });

    for (const [catName, profiles] of Object.entries(categories)) {
      const group = document.createElement('optgroup');
      group.label = catName;
      profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        group.appendChild(opt);
      });
      profileSelect.appendChild(group);
    }

    profileSelect.value = selectedProfileId;
  }

  renderProfileOptions();

  if (profileSearch) {
    profileSearch.addEventListener('input', (e) => {
      renderProfileOptions(e.target.value);
    });
  }

  // 2. Get Active Tab Domain
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

  function updateStealthScore() {
    if (!masterToggle.checked) {
      if (stealthGrade) stealthGrade.textContent = 'OFF';
      if (stealthScoreText) stealthScoreText.textContent = '0% Protection — Defense Offline';
      return;
    }

    let activeModules = 0;
    const toggles = [
      toggleCanvas, toggleAudio, toggleWebgl, toggleHints, toggleBrave, toggleWebrtc,
      toggleDomjitter, toggleTimercoarse, toggleUnshortener, togglePaywall,
      toggleTimers, toggleAdblock, toggleMedia, toggleCleanurl, toggleRightclick, toggleVideospeed
    ];

    toggles.forEach(t => {
      if (t && t.checked) activeModules++;
    });

    const percent = Math.round((activeModules / toggles.length) * 100);
    if (percent >= 90) {
      if (stealthGrade) stealthGrade.textContent = 'A+';
      if (stealthScoreText) stealthScoreText.textContent = `${percent}% Titanium Stealth Active`;
    } else if (percent >= 70) {
      if (stealthGrade) stealthGrade.textContent = 'A';
      if (stealthScoreText) stealthScoreText.textContent = `${percent}% High Stealth Active`;
    } else if (percent >= 50) {
      if (stealthGrade) stealthGrade.textContent = 'B';
      if (stealthScoreText) stealthScoreText.textContent = `${percent}% Moderate Protection`;
    } else {
      if (stealthGrade) stealthGrade.textContent = 'C';
      if (stealthScoreText) stealthScoreText.textContent = `${percent}% Minimal Shield Active`;
    }
  }

  function updateMasterUI(enabled) {
    if (enabled) {
      masterSubtitle.textContent = 'All 32 Stealth Modules Armed';
      statusDot.classList.remove('disabled');
      statusLabel.textContent = 'Guarded';
    } else {
      masterSubtitle.textContent = 'System Defense Disabled';
      statusDot.classList.add('disabled');
      statusLabel.textContent = 'Disabled';
    }
    updateStealthScore();
  }

  // 3. Load Stored States & Live Telemetry
  chrome.storage.local.get([
    'masterEnabled', 'unshortenerEnabled', 'paywallDefuserEnabled',
    'autoBypassTimers', 'bypassAdblockDetection', 'spotifyUnlocked', 'youtubeAds',
    'canvasNoiseEnabled', 'audioNoiseEnabled', 'webglSpoofingEnabled', 'clientHintsEnabled',
    'maskBraveApi', 'webrtcShieldEnabled', 'domJitterEnabled', 'timerCoarseningEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'deviceProfile', 'timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked',
    'whitelist', 'updateAvailable'
  ], (res) => {
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;

    if (toggleCanvas) toggleCanvas.checked = res.canvasNoiseEnabled !== false;
    if (toggleAudio) toggleAudio.checked = res.audioNoiseEnabled !== false;
    if (toggleWebgl) toggleWebgl.checked = res.webglSpoofingEnabled !== false;
    if (toggleHints) toggleHints.checked = res.clientHintsEnabled !== false;
    if (toggleBrave) toggleBrave.checked = res.maskBraveApi !== false;
    if (toggleWebrtc) toggleWebrtc.checked = res.webrtcShieldEnabled !== false;
    if (toggleDomjitter) toggleDomjitter.checked = res.domJitterEnabled !== false;
    if (toggleTimercoarse) toggleTimercoarse.checked = res.timerCoarseningEnabled !== false;

    if (toggleUnshortener) toggleUnshortener.checked = res.unshortenerEnabled !== false;
    if (togglePaywall) togglePaywall.checked = res.paywallDefuserEnabled !== false;
    if (toggleTimers) toggleTimers.checked = res.autoBypassTimers !== false;
    if (toggleAdblock) toggleAdblock.checked = res.bypassAdblockDetection !== false;
    if (toggleMedia) toggleMedia.checked = (res.spotifyUnlocked !== false || res.youtubeAds !== false);
    if (toggleCleanurl) toggleCleanurl.checked = res.cleanUrlEnabled !== false;
    if (toggleRightclick) toggleRightclick.checked = res.rightClickEnabled !== false;
    if (toggleVideospeed) toggleVideospeed.checked = (res.videoSpeedEnabled !== false || res.autoSkipIntrosEnabled !== false);

    updateMasterUI(isMaster);

    if (res.deviceProfile) {
      selectedProfileId = res.deviceProfile;
      if (profileSelect) profileSelect.value = selectedProfileId;
    }

    if (metricTimeSaved) metricTimeSaved.textContent = formatSeconds(res.timeSavedSeconds || 0);
    if (metricTraps) metricTraps.textContent = (res.trapsNeutralized || 0).toString();
    if (metricLinks) metricLinks.textContent = (res.directLinksUnlocked || 0).toString();

    if (res.updateAvailable) {
      updateBadge.classList.remove('hidden');
    }

    const whitelist = Array.isArray(res.whitelist) ? res.whitelist : [];
    if (currentHostname && (whitelist.includes(currentHostname) || whitelist.some(d => d && currentHostname.endsWith('.' + d)))) {
      whitelistText.textContent = 'Whitelisted';
      statusLabel.textContent = 'Whitelisted';
      statusDot.classList.add('disabled');
    }
  });

  // 4. Storage Change Listener (Bidirectional Live Sync)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.masterEnabled !== undefined) {
        masterToggle.checked = changes.masterEnabled.newValue !== false;
        updateMasterUI(masterToggle.checked);
      }
      if (changes.canvasNoiseEnabled !== undefined && toggleCanvas) toggleCanvas.checked = changes.canvasNoiseEnabled.newValue !== false;
      if (changes.audioNoiseEnabled !== undefined && toggleAudio) toggleAudio.checked = changes.audioNoiseEnabled.newValue !== false;
      if (changes.webglSpoofingEnabled !== undefined && toggleWebgl) toggleWebgl.checked = changes.webglSpoofingEnabled.newValue !== false;
      if (changes.clientHintsEnabled !== undefined && toggleHints) toggleHints.checked = changes.clientHintsEnabled.newValue !== false;
      if (changes.maskBraveApi !== undefined && toggleBrave) toggleBrave.checked = changes.maskBraveApi.newValue !== false;
      if (changes.webrtcShieldEnabled !== undefined && toggleWebrtc) toggleWebrtc.checked = changes.webrtcShieldEnabled.newValue !== false;
      if (changes.domJitterEnabled !== undefined && toggleDomjitter) toggleDomjitter.checked = changes.domJitterEnabled.newValue !== false;
      if (changes.timerCoarseningEnabled !== undefined && toggleTimercoarse) toggleTimercoarse.checked = changes.timerCoarseningEnabled.newValue !== false;

      if (changes.unshortenerEnabled !== undefined && toggleUnshortener) toggleUnshortener.checked = changes.unshortenerEnabled.newValue !== false;
      if (changes.paywallDefuserEnabled !== undefined && togglePaywall) togglePaywall.checked = changes.paywallDefuserEnabled.newValue !== false;
      if (changes.autoBypassTimers !== undefined && toggleTimers) toggleTimers.checked = changes.autoBypassTimers.newValue !== false;
      if (changes.bypassAdblockDetection !== undefined && toggleAdblock) toggleAdblock.checked = changes.bypassAdblockDetection.newValue !== false;
      if (changes.spotifyUnlocked !== undefined || changes.youtubeAds !== undefined) {
        if (toggleMedia) toggleMedia.checked = (changes.spotifyUnlocked?.newValue !== false || changes.youtubeAds?.newValue !== false);
      }
      if (changes.cleanUrlEnabled !== undefined && toggleCleanurl) toggleCleanurl.checked = changes.cleanUrlEnabled.newValue !== false;
      if (changes.rightClickEnabled !== undefined && toggleRightclick) toggleRightclick.checked = changes.rightClickEnabled.newValue !== false;
      if (changes.videoSpeedEnabled !== undefined || changes.autoSkipIntrosEnabled !== undefined) {
        if (toggleVideospeed) toggleVideospeed.checked = (changes.videoSpeedEnabled?.newValue !== false || changes.autoSkipIntrosEnabled?.newValue !== false);
      }
      if (changes.deviceProfile !== undefined) {
        selectedProfileId = changes.deviceProfile.newValue;
        if (profileSelect) profileSelect.value = selectedProfileId;
      }
      if (changes.timeSavedSeconds !== undefined && metricTimeSaved) {
        metricTimeSaved.textContent = formatSeconds(changes.timeSavedSeconds.newValue || 0);
      }
      if (changes.trapsNeutralized !== undefined && metricTraps) {
        metricTraps.textContent = (changes.trapsNeutralized.newValue || 0).toString();
      }
      if (changes.directLinksUnlocked !== undefined && metricLinks) {
        metricLinks.textContent = (changes.directLinksUnlocked.newValue || 0).toString();
      }
      updateStealthScore();
    }
  });

  // 5. Event Listeners for UI Actions
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
      selectedProfileId = profileSelect.value;
      chrome.storage.local.set({ deviceProfile: selectedProfileId });
    });
  }

  // Anti-Fingerprinting Toggles
  if (toggleCanvas) toggleCanvas.addEventListener('change', () => { chrome.storage.local.set({ canvasNoiseEnabled: toggleCanvas.checked }); updateStealthScore(); });
  if (toggleAudio) toggleAudio.addEventListener('change', () => { chrome.storage.local.set({ audioNoiseEnabled: toggleAudio.checked }); updateStealthScore(); });
  if (toggleWebgl) toggleWebgl.addEventListener('change', () => { chrome.storage.local.set({ webglSpoofingEnabled: toggleWebgl.checked, normalizeWebgl: toggleWebgl.checked }); updateStealthScore(); });
  if (toggleHints) toggleHints.addEventListener('change', () => { chrome.storage.local.set({ clientHintsEnabled: toggleHints.checked, maskClientHints: toggleHints.checked }); updateStealthScore(); });
  if (toggleBrave) toggleBrave.addEventListener('change', () => { chrome.storage.local.set({ maskBraveApi: toggleBrave.checked }); updateStealthScore(); });
  if (toggleWebrtc) toggleWebrtc.addEventListener('change', () => { chrome.storage.local.set({ webrtcShieldEnabled: toggleWebrtc.checked, batteryMaskEnabled: toggleWebrtc.checked }); updateStealthScore(); });
  if (toggleDomjitter) toggleDomjitter.addEventListener('change', () => { chrome.storage.local.set({ domJitterEnabled: toggleDomjitter.checked }); updateStealthScore(); });
  if (toggleTimercoarse) toggleTimercoarse.addEventListener('change', () => { chrome.storage.local.set({ timerCoarseningEnabled: toggleTimercoarse.checked }); updateStealthScore(); });

  // Productivity Toggles
  if (toggleUnshortener) toggleUnshortener.addEventListener('change', () => { chrome.storage.local.set({ unshortenerEnabled: toggleUnshortener.checked }); updateStealthScore(); });
  if (togglePaywall) togglePaywall.addEventListener('change', () => { chrome.storage.local.set({ paywallDefuserEnabled: togglePaywall.checked }); updateStealthScore(); });
  if (toggleTimers) toggleTimers.addEventListener('change', () => { chrome.storage.local.set({ autoBypassTimers: toggleTimers.checked }); updateStealthScore(); });
  if (toggleAdblock) toggleAdblock.addEventListener('change', () => { chrome.storage.local.set({ bypassAdblockDetection: toggleAdblock.checked }); updateStealthScore(); });
  if (toggleMedia) toggleMedia.addEventListener('change', () => {
    const val = toggleMedia.checked;
    chrome.storage.local.set({ spotifyUnlocked: val, youtubeAds: val, twitchShieldEnabled: val });
    updateStealthScore();
  });
  if (toggleCleanurl) toggleCleanurl.addEventListener('change', () => { chrome.storage.local.set({ cleanUrlEnabled: toggleCleanurl.checked }); updateStealthScore(); });
  if (toggleRightclick) toggleRightclick.addEventListener('change', () => { chrome.storage.local.set({ rightClickEnabled: toggleRightclick.checked }); updateStealthScore(); });
  if (toggleVideospeed) toggleVideospeed.addEventListener('change', () => {
    const val = toggleVideospeed.checked;
    chrome.storage.local.set({ videoSpeedEnabled: val, autoSkipIntrosEnabled: val });
    updateStealthScore();
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