/**
 * BraveShield Bypass Pro — Control Studio Controller
 * Version: 6.0.1
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

  const optAudio = document.getElementById('opt-audio');
  const optCanvas = document.getElementById('opt-canvas');
  const optWebrtc = document.getElementById('opt-webrtc');
  const optBattery = document.getElementById('opt-battery');
  const optDomjitter = document.getElementById('opt-domjitter');
  const optTimercoarse = document.getElementById('opt-timercoarse');
  const optCleanurl = document.getElementById('opt-cleanurl');
  const optRightclick = document.getElementById('opt-rightclick');
  const optVideospeed = document.getElementById('opt-videospeed');
  const optAutoskip = document.getElementById('opt-autoskip');

  const statTimeSaved = document.getElementById('stat-time-saved');
  const statTrapsDefused = document.getElementById('stat-traps-defused');
  const statLinksUnlocked = document.getElementById('stat-links-unlocked');
  const btnResetTelemetry = document.getElementById('btn-reset-telemetry');

  const btnSync = document.getElementById('btn-studio-sync');
  const syncTime = document.getElementById('sync-time');
  const whitelistInput = document.getElementById('whitelist-input');
  const btnAddWhitelist = document.getElementById('btn-add-whitelist');
  const whitelistTags = document.getElementById('whitelist-tags');

  const btnExportBackup = document.getElementById('btn-export-backup');
  const btnImportTrigger = document.getElementById('btn-import-backup-trigger');
  const fileImportBackup = document.getElementById('file-import-backup');

  let selectedProfileId = 'win-rtx4090';

  function formatSeconds(secs) {
    if (!secs || secs < 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  }

  function updateMasterStatus(enabled) {
    if (enabled) {
      masterLabel.textContent = 'SYSTEM DEFENSE ARMED';
      masterLabel.style.color = 'var(--accent-emerald)';
    } else {
      masterLabel.textContent = 'SYSTEM DEFENSE OFFLINE';
      masterLabel.style.color = 'var(--accent-danger)';
    }
  }

  function toggleCustomPanel(show) {
    if (customHwPanel) {
      customHwPanel.style.display = show ? 'block' : 'none';
    }
  }

  // 1. Populate 110+ Profiles into Dropdown
  function renderProfileOptions(filter = '') {
    if (!optProfile) return;
    const filterLower = filter.trim().toLowerCase();
    const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];

    optProfile.innerHTML = '';

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
    'audioNoiseEnabled', 'canvasNoiseEnabled', 'webrtcShieldEnabled', 'batteryMaskEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
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

    if (optAudio) optAudio.checked = res.audioNoiseEnabled !== false;
    if (optCanvas) optCanvas.checked = res.canvasNoiseEnabled !== false;
    if (optWebrtc) optWebrtc.checked = res.webrtcShieldEnabled !== false;
    if (optBattery) optBattery.checked = res.batteryMaskEnabled !== false;
    if (optDomjitter) optDomjitter.checked = res.domJitterEnabled !== false;
    if (optTimercoarse) optTimercoarse.checked = res.timerCoarseningEnabled !== false;
    if (optCleanurl) optCleanurl.checked = res.cleanUrlEnabled !== false;
    if (optRightclick) optRightclick.checked = res.rightClickEnabled !== false;
    if (optVideospeed) optVideospeed.checked = res.videoSpeedEnabled !== false;
    if (optAutoskip) optAutoskip.checked = res.autoSkipIntrosEnabled !== false;

    if (statTimeSaved) statTimeSaved.textContent = formatSeconds(res.timeSavedSeconds || 0);
    if (statTrapsDefused) statTrapsDefused.textContent = (res.trapsNeutralized || 0).toString();
    if (statLinksUnlocked) statLinksUnlocked.textContent = (res.directLinksUnlocked || 0).toString();

    if (res.lastSyncTime) {
      syncTime.textContent = 'Last checked: ' + new Date(res.lastSyncTime).toLocaleTimeString();
    }

    renderWhitelist(res.whitelist || []);
  });

  // 3. Storage Change Listener (Bidirectional Live Sync)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.masterEnabled !== undefined) {
        masterToggle.checked = changes.masterEnabled.newValue !== false;
        updateMasterStatus(masterToggle.checked);
      }
      if (changes.maskBraveApi !== undefined) optBrave.checked = changes.maskBraveApi.newValue !== false;
      if (changes.maskClientHints !== undefined) optHints.checked = changes.maskClientHints.newValue !== false;
      if (changes.unshortenerEnabled !== undefined) optUnshortener.checked = changes.unshortenerEnabled.newValue !== false;
      if (changes.autoBypassTimers !== undefined) optTimers.checked = changes.autoBypassTimers.newValue !== false;
      if (changes.paywallDefuserEnabled !== undefined) optPaywall.checked = changes.paywallDefuserEnabled.newValue !== false;
      if (changes.bypassAdblockDetection !== undefined) optAdblock.checked = changes.bypassAdblockDetection.newValue !== false;
      if (changes.youtubeAds !== undefined) optYoutube.checked = changes.youtubeAds.newValue !== false;
      if (changes.spotifyUnlocked !== undefined) optSpotify.checked = changes.spotifyUnlocked.newValue !== false;
      if (changes.twitchShieldEnabled !== undefined) optTwitch.checked = changes.twitchShieldEnabled.newValue !== false;

      if (changes.audioNoiseEnabled !== undefined && optAudio) optAudio.checked = changes.audioNoiseEnabled.newValue !== false;
      if (changes.canvasNoiseEnabled !== undefined && optCanvas) optCanvas.checked = changes.canvasNoiseEnabled.newValue !== false;
      if (changes.webrtcShieldEnabled !== undefined && optWebrtc) optWebrtc.checked = changes.webrtcShieldEnabled.newValue !== false;
      if (changes.batteryMaskEnabled !== undefined && optBattery) optBattery.checked = changes.batteryMaskEnabled.newValue !== false;
      if (changes.domJitterEnabled !== undefined && optDomjitter) optDomjitter.checked = changes.domJitterEnabled.newValue !== false;
      if (changes.timerCoarseningEnabled !== undefined && optTimercoarse) optTimercoarse.checked = changes.timerCoarseningEnabled.newValue !== false;
      if (changes.cleanUrlEnabled !== undefined && optCleanurl) optCleanurl.checked = changes.cleanUrlEnabled.newValue !== false;
      if (changes.rightClickEnabled !== undefined && optRightclick) optRightclick.checked = changes.rightClickEnabled.newValue !== false;
      if (changes.videoSpeedEnabled !== undefined && optVideospeed) optVideospeed.checked = changes.videoSpeedEnabled.newValue !== false;
      if (changes.autoSkipIntrosEnabled !== undefined && optAutoskip) optAutoskip.checked = changes.autoSkipIntrosEnabled.newValue !== false;

      if (changes.deviceProfile !== undefined) {
        selectedProfileId = changes.deviceProfile.newValue;
        if (optProfile) optProfile.value = selectedProfileId;
        toggleCustomPanel(selectedProfileId === 'custom');
      }
      if (changes.whitelist !== undefined) renderWhitelist(changes.whitelist.newValue || []);
      if (changes.timeSavedSeconds !== undefined && statTimeSaved) {
        statTimeSaved.textContent = formatSeconds(changes.timeSavedSeconds.newValue || 0);
      }
      if (changes.trapsNeutralized !== undefined && statTrapsDefused) {
        statTrapsDefused.textContent = (changes.trapsNeutralized.newValue || 0).toString();
      }
      if (changes.directLinksUnlocked !== undefined && statLinksUnlocked) {
        statLinksUnlocked.textContent = (changes.directLinksUnlocked.newValue || 0).toString();
      }
    }
  });

  // 4. Master Switch
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

  if (optAudio) optAudio.addEventListener('change', () => chrome.storage.local.set({ audioNoiseEnabled: optAudio.checked }));
  if (optCanvas) optCanvas.addEventListener('change', () => chrome.storage.local.set({ canvasNoiseEnabled: optCanvas.checked }));
  if (optWebrtc) optWebrtc.addEventListener('change', () => chrome.storage.local.set({ webrtcShieldEnabled: optWebrtc.checked }));
  if (optBattery) optBattery.addEventListener('change', () => chrome.storage.local.set({ batteryMaskEnabled: optBattery.checked }));
  if (optDomjitter) optDomjitter.addEventListener('change', () => chrome.storage.local.set({ domJitterEnabled: optDomjitter.checked }));
  if (optTimercoarse) optTimercoarse.addEventListener('change', () => chrome.storage.local.set({ timerCoarseningEnabled: optTimercoarse.checked }));
  if (optCleanurl) optCleanurl.addEventListener('change', () => chrome.storage.local.set({ cleanUrlEnabled: optCleanurl.checked }));
  if (optRightclick) optRightclick.addEventListener('change', () => chrome.storage.local.set({ rightClickEnabled: optRightclick.checked }));
  if (optVideospeed) optVideospeed.addEventListener('change', () => chrome.storage.local.set({ videoSpeedEnabled: optVideospeed.checked }));
  if (optAutoskip) optAutoskip.addEventListener('change', () => chrome.storage.local.set({ autoSkipIntrosEnabled: optAutoskip.checked }));

  // 5. JSON Backup Export & Import
  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', () => {
      chrome.storage.local.get(null, (allData) => {
        const jsonStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BraveShield-Backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        btnExportBackup.textContent = '✅ Backup Downloaded!';
        setTimeout(() => { btnExportBackup.textContent = '💾 Export Backup (JSON)'; }, 2000);
      });
    });
  }

  if (btnImportTrigger && fileImportBackup) {
    btnImportTrigger.addEventListener('click', () => fileImportBackup.click());

    fileImportBackup.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed && typeof parsed === 'object') {
            chrome.storage.local.set(parsed, () => {
              btnImportTrigger.textContent = '✅ Restored Successfully!';
              setTimeout(() => {
                btnImportTrigger.textContent = '📂 Restore Backup';
                window.location.reload();
              }, 1500);
            });
          }
        } catch (_) {
          btnImportTrigger.textContent = '❌ Invalid JSON File';
          setTimeout(() => { btnImportTrigger.textContent = '📂 Restore Backup'; }, 2000);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset Telemetry
  if (btnResetTelemetry) {
    btnResetTelemetry.addEventListener('click', () => {
      chrome.storage.local.set({ timeSavedSeconds: 0, trapsNeutralized: 0, directLinksUnlocked: 0 }, () => {
        if (statTimeSaved) statTimeSaved.textContent = '0s';
        if (statTrapsDefused) statTrapsDefused.textContent = '0';
        if (statLinksUnlocked) statLinksUnlocked.textContent = '0';
        btnResetTelemetry.textContent = 'Telemetry Reset!';
        setTimeout(() => { btnResetTelemetry.textContent = 'Reset Telemetry'; }, 2000);
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
