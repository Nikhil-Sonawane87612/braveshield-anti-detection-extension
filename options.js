/**
 * BraveShield Bypass Pro — Control Studio Controller
 * Version: 5.4.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('studio-master-toggle');
  const masterLabel = document.getElementById('studio-master-status');
  const profileSearch = document.getElementById('studio-profile-search');
  const optProfile = document.getElementById('opt-profile');
  const customHwPanel = document.getElementById('custom-hw-panel');

  const custPlatform = document.getElementById('cust-platform');
  const custConcurrency = document.getElementById('cust-concurrency');
  const custMemory = document.getElementById('cust-memory');
  const custVendor = document.getElementById('cust-vendor');
  const custRenderer = document.getElementById('cust-renderer');
  const custScreen = document.getElementById('cust-screen');
  const custDpr = document.getElementById('cust-dpr');
  const btnSaveCustomHw = document.getElementById('btn-save-custom-hw');

  const optBrave = document.getElementById('opt-brave');
  const optHints = document.getElementById('opt-hints');
  const optUnshortener = document.getElementById('opt-unshortener');
  const optTimers = document.getElementById('opt-timers');
  const optPaywall = document.getElementById('opt-paywall');
  const optAdblock = document.getElementById('opt-adblock');
  const optYoutube = document.getElementById('opt-youtube');
  const optSpotify = document.getElementById('opt-spotify');
  const optTwitch = document.getElementById('opt-twitch');

  const statTimeSaved = document.getElementById('stat-time-saved');
  const statTrapsDefused = document.getElementById('stat-traps-defused');
  const statLinksUnlocked = document.getElementById('stat-links-unlocked');
  const btnResetTelemetry = document.getElementById('btn-reset-telemetry');

  const btnSync = document.getElementById('btn-studio-sync');
  const syncTime = document.getElementById('sync-time');
  const whitelistInput = document.getElementById('whitelist-input');
  const btnAddWhitelist = document.getElementById('btn-add-whitelist');
  const whitelistTags = document.getElementById('whitelist-tags');

  let selectedProfileId = 'win-rtx4090';

  function formatSeconds(secs) {
    if (!secs || secs < 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  }

  // 1. Populate 110+ Profiles into Dropdown
  function renderProfileOptions(filter = '') {
    if (!optProfile) return;
    const filterLower = filter.trim().toLowerCase();
    const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];

    optProfile.innerHTML = '';

    // Custom profile option
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '🛠️ Custom Hardware Profile (Configure Below)';
    optProfile.appendChild(customOpt);

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
      optProfile.appendChild(group);
    }

    optProfile.value = selectedProfileId;
    toggleCustomPanel(selectedProfileId === 'custom');
  }

  function toggleCustomPanel(show) {
    if (customHwPanel) {
      customHwPanel.style.display = show ? 'block' : 'none';
    }
  }

  renderProfileOptions();

  if (profileSearch) {
    profileSearch.addEventListener('input', (e) => {
      renderProfileOptions(e.target.value);
    });
  }

  // 2. Load Saved Options
  chrome.storage.local.get([
    'masterEnabled', 'deviceProfile', 'customHardwareProfile', 'maskBraveApi', 'maskClientHints',
    'unshortenerEnabled', 'autoBypassTimers', 'paywallDefuserEnabled',
    'bypassAdblockDetection', 'spotifyUnlocked', 'youtubeAds', 'twitchShieldEnabled',
    'timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked',
    'whitelist', 'lastSyncTime'
  ], (res) => {
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;
    updateMasterStatus(isMaster);

    if (res.deviceProfile) {
      selectedProfileId = res.deviceProfile;
      if (optProfile) optProfile.value = selectedProfileId;
      toggleCustomPanel(selectedProfileId === 'custom');
    }

    if (res.customHardwareProfile) {
      const c = res.customHardwareProfile;
      if (custPlatform && c.platform) custPlatform.value = c.platform;
      if (custConcurrency && c.concurrency) custConcurrency.value = c.concurrency.toString();
      if (custMemory && c.memory) custMemory.value = c.memory.toString();
      if (custVendor && c.vendor) custVendor.value = c.vendor;
      if (custRenderer && c.renderer) custRenderer.value = c.renderer;
      if (custScreen && c.screen) custScreen.value = `${c.screen.width}x${c.screen.height}`;
      if (custDpr && c.devicePixelRatio) custDpr.value = c.devicePixelRatio.toString();
    }

    optBrave.checked = res.maskBraveApi !== false;
    optHints.checked = res.maskClientHints !== false;
    optUnshortener.checked = res.unshortenerEnabled !== false;
    optTimers.checked = res.autoBypassTimers !== false;
    optPaywall.checked = res.paywallDefuserEnabled !== false;
    optAdblock.checked = res.bypassAdblockDetection !== false;
    optYoutube.checked = res.youtubeAds !== false;
    optSpotify.checked = res.spotifyUnlocked !== false;
    optTwitch.checked = res.twitchShieldEnabled !== false;

    if (statTimeSaved) statTimeSaved.textContent = formatSeconds(res.timeSavedSeconds || 0);
    if (statTrapsDefused) statTrapsDefused.textContent = (res.trapsNeutralized || 0).toString();
    if (statLinksUnlocked) statLinksUnlocked.textContent = (res.directLinksUnlocked || 0).toString();

    if (res.lastSyncTime) {
      syncTime.textContent = 'Last checked: ' + new Date(res.lastSyncTime).toLocaleTimeString();
    }

    renderWhitelist(res.whitelist || []);
  });

  function updateMasterStatus(enabled) {
    if (enabled) {
      masterLabel.textContent = 'SYSTEM DEFENSE ARMED';
      masterLabel.style.color = 'var(--accent-emerald)';
    } else {
      masterLabel.textContent = 'SYSTEM DEFENSE OFFLINE';
      masterLabel.style.color = 'var(--accent-danger)';
    }
  }

  // Master Switch
  masterToggle.addEventListener('change', () => {
    const val = masterToggle.checked;
    chrome.storage.local.set({ masterEnabled: val, enabled: val });
    updateMasterStatus(val);
  });

  // Profile Selector Change
  if (optProfile) {
    optProfile.addEventListener('change', () => {
      selectedProfileId = optProfile.value;
      chrome.storage.local.set({ deviceProfile: selectedProfileId });
      toggleCustomPanel(selectedProfileId === 'custom');
    });
  }

  // Save Custom Hardware Profile
  if (btnSaveCustomHw) {
    btnSaveCustomHw.addEventListener('click', () => {
      const [w, h] = (custScreen?.value || '2560x1440').split('x').map(Number);
      const customProfile = {
        platform: custPlatform?.value || 'Win32',
        concurrency: parseInt(custConcurrency?.value || '16', 10),
        memory: parseInt(custMemory?.value || '32', 10),
        vendor: custVendor?.value || 'Google Inc. (NVIDIA)',
        renderer: custRenderer?.value || 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        screen: { width: w, height: h, colorDepth: 24 },
        devicePixelRatio: parseFloat(custDpr?.value || '1')
      };

      chrome.storage.local.set({
        deviceProfile: 'custom',
        customHardwareProfile: customProfile
      }, () => {
        btnSaveCustomHw.textContent = '✅ Custom Profile Saved & Applied!';
        setTimeout(() => { btnSaveCustomHw.textContent = '💾 Save & Apply Custom Hardware Profile'; }, 2000);
      });
    });
  }

  // Settings Toggles
  optBrave.addEventListener('change', () => chrome.storage.local.set({ maskBraveApi: optBrave.checked }));
  optHints.addEventListener('change', () => chrome.storage.local.set({ maskClientHints: optHints.checked }));
  optUnshortener.addEventListener('change', () => chrome.storage.local.set({ unshortenerEnabled: optUnshortener.checked }));
  optTimers.addEventListener('change', () => chrome.storage.local.set({ autoBypassTimers: optTimers.checked }));
  optPaywall.addEventListener('change', () => chrome.storage.local.set({ paywallDefuserEnabled: optPaywall.checked }));
  optAdblock.addEventListener('change', () => chrome.storage.local.set({ bypassAdblockDetection: optAdblock.checked }));
  optYoutube.addEventListener('change', () => chrome.storage.local.set({ youtubeAds: optYoutube.checked }));
  optSpotify.addEventListener('change', () => chrome.storage.local.set({ spotifyUnlocked: optSpotify.checked }));
  optTwitch.addEventListener('change', () => chrome.storage.local.set({ twitchShieldEnabled: optTwitch.checked }));

  // Reset Telemetry
  if (btnResetTelemetry) {
    btnResetTelemetry.addEventListener('click', () => {
      chrome.storage.local.set({ timeSavedSeconds: 0, trapsNeutralized: 0, directLinksUnlocked: 0 }, () => {
        if (statTimeSaved) statTimeSaved.textContent = '0s';
        if (statTrapsDefused) statTrapsDefused.textContent = '0';
        if (statLinksUnlocked) statLinksUnlocked.textContent = '0';
        btnResetTelemetry.textContent = 'Telemetry Reset!';
        setTimeout(() => { btnResetTelemetry.textContent = 'Reset Telemetry Counters'; }, 2000);
      });
    });
  }

  // Whitelist Logic
  function renderWhitelist(list) {
    whitelistTags.innerHTML = '';
    list.forEach(domain => {
      const tag = document.createElement('div');
      tag.className = 'wtag';
      tag.innerHTML = `<span>${domain}</span><span class="wtag-del" data-domain="${domain}">×</span>`;
      whitelistTags.appendChild(tag);
    });

    document.querySelectorAll('.wtag-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dom = e.target.getAttribute('data-domain');
        chrome.storage.local.get(['whitelist'], (r) => {
          const updated = (r.whitelist || []).filter(d => d !== dom);
          chrome.storage.local.set({ whitelist: updated });
          renderWhitelist(updated);
        });
      });
    });
  }

  btnAddWhitelist.addEventListener('click', () => {
    const val = (whitelistInput.value || '').trim().toLowerCase();
    if (!val) return;
    chrome.storage.local.get(['whitelist'], (r) => {
      const list = r.whitelist || [];
      if (!list.includes(val)) {
        list.push(val);
        chrome.storage.local.set({ whitelist: list });
        renderWhitelist(list);
      }
      whitelistInput.value = '';
    });
  });

  // Manual Sync Button
  btnSync.addEventListener('click', async () => {
    btnSync.textContent = 'Syncing...';
    btnSync.disabled = true;
    try {
      const res = await chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
      if (res && res.success) {
        btnSync.textContent = 'Synced!';
        syncTime.textContent = 'Last checked: ' + new Date().toLocaleTimeString();
      } else {
        btnSync.textContent = 'Error';
      }
    } catch (_) {
      btnSync.textContent = 'Synced!';
    }
    setTimeout(() => {
      btnSync.textContent = 'Check & Sync';
      btnSync.disabled = false;
    }, 2000);
  });
});
