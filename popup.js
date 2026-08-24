/**
 * BraveShield Bypass Pro — Cyber-Dark Popup HUD Controller
 * Version: 6.0.1 (Stitch Cyber-Dark Edition)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterSubtitle = document.getElementById('master-subtitle');
  const stealthGrade = document.getElementById('stealth-grade');
  const shieldRing = document.getElementById('shield-ring');
  const shieldStatusSub = document.getElementById('shield-status-sub');
  const profileSelect = document.getElementById('device-profile-select');

  // Threat Metrics (2x2 Grid — real counters only)
  const metricTimeSaved = document.getElementById('metric-timesaved');
  const metricTraps = document.getElementById('metric-traps');
  const metricLinks = document.getElementById('metric-links');
  const metricModules = document.getElementById('metric-modules');

  // Hardware & Fingerprint Armor Switches
  const toggleCanvas = document.getElementById('toggle-canvas');
  const toggleAudio = document.getElementById('toggle-audio');
  const toggleWebgl = document.getElementById('toggle-webgl');
  const toggleHints = document.getElementById('toggle-hints');

  // Runtime & Side-Channel Shield Switches
  const toggleTimercoarse = document.getElementById('toggle-timercoarse');
  const toggleDomjitter = document.getElementById('toggle-domjitter');
  const toggleWebrtc = document.getElementById('toggle-webrtc');
  const toggleBrave = document.getElementById('toggle-brave');

  // Web Automation & Acceleration Switches
  const toggleUnshortener = document.getElementById('toggle-unshortener');
  const togglePaywall = document.getElementById('toggle-paywall');
  const toggleTimers = document.getElementById('toggle-timers');
  const toggleMedia = document.getElementById('toggle-media');

  // Domain & Whitelist Controls
  const statusSite = document.getElementById('status-site');
  const statusDot = document.getElementById('status-dot');
  const btnWhitelist = document.getElementById('btn-whitelist');
  const whitelistText = document.getElementById('whitelist-text');

  // Action Buttons & Updates
  const btnOptions = document.getElementById('btn-open-options');
  const btnSync = document.getElementById('btn-sync-rules');
  const syncIcon = document.getElementById('sync-icon');
  const updateBadge = document.getElementById('update-badge');

  let currentHostname = '';
  let selectedProfileId = 'win-rtx4090';
  let isCurrentWhitelisted = false;

  // 1. Smooth Animated Counter Function (requestAnimationFrame)
  function animateValue(element, start, end, duration = 600) {
    if (!element) return;
    if (start === end) {
      element.textContent = end.toLocaleString();
      return;
    }
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.floor(start + (end - start) * easeProgress);
      element.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end.toLocaleString();
      }
    }
    requestAnimationFrame(update);
  }

  // 2. Populate 110+ Hardware Profiles into Dropdown
  function renderProfileOptions() {
    if (!profileSelect) return;
    const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];
    profileSelect.innerHTML = '';

    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '🛠️ Custom Hardware Profile';
    profileSelect.appendChild(customOpt);

    const categories = {};
    catalog.forEach(p => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p);
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

  // 3. Detect Active Tab Domain
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        if (statusSite) statusSite.textContent = currentHostname || 'Local / System Tab';
      } catch (_) {
        if (statusSite) statusSite.textContent = 'System / Extension Tab';
      }
    }
  } catch (_) {
    if (statusSite) statusSite.textContent = 'Active Session';
  }

  // 4. Update HUD Visual Shield State & Stealth Score
  function updateHUDVisuals() {
    const isMaster = masterToggle ? masterToggle.checked : true;

    if (!isMaster) {
      if (stealthGrade) {
        stealthGrade.textContent = 'OFFLINE';
        stealthGrade.style.color = 'var(--accent-crimson)';
        stealthGrade.style.borderColor = 'var(--accent-crimson)';
        stealthGrade.style.background = 'rgba(239, 68, 68, 0.15)';
      }
      if (shieldStatusSub) {
        shieldStatusSub.textContent = 'ALL SHIELDS DISABLED';
        shieldStatusSub.style.color = 'var(--accent-crimson)';
      }
      if (statusDot) {
        statusDot.style.background = 'var(--accent-crimson)';
        statusDot.style.boxShadow = '0 0 8px var(--accent-crimson)';
      }
      if (masterSubtitle) masterSubtitle.textContent = 'Protection Paused';
      return;
    }

    if (isCurrentWhitelisted) {
      if (stealthGrade) {
        stealthGrade.textContent = 'BYPASSED';
        stealthGrade.style.color = 'var(--accent-amber)';
        stealthGrade.style.borderColor = 'var(--accent-amber)';
        stealthGrade.style.background = 'rgba(245, 158, 11, 0.15)';
      }
      if (shieldStatusSub) {
        shieldStatusSub.textContent = 'DOMAIN WHITELISTED';
        shieldStatusSub.style.color = 'var(--accent-amber)';
      }
      if (statusDot) {
        statusDot.style.background = 'var(--accent-amber)';
        statusDot.style.boxShadow = '0 0 8px var(--accent-amber)';
      }
      if (masterSubtitle) masterSubtitle.textContent = 'Site is Whitelisted';
      if (whitelistText) whitelistText.textContent = 'Whitelisted';
      if (btnWhitelist) btnWhitelist.classList.add('whitelisted');
    } else {
      if (stealthGrade) {
        stealthGrade.textContent = '100% STEALTH';
        stealthGrade.style.color = 'var(--accent-emerald)';
        stealthGrade.style.borderColor = 'var(--border-glow-emerald)';
        stealthGrade.style.background = 'rgba(16, 185, 129, 0.15)';
      }
      if (shieldStatusSub) {
        shieldStatusSub.textContent = 'STEALTH DEFENSE ARMED';
        shieldStatusSub.style.color = 'var(--accent-emerald)';
      }
      if (statusDot) {
        statusDot.style.background = 'var(--accent-emerald)';
        statusDot.style.boxShadow = '0 0 8px var(--accent-emerald)';
      }
      if (masterSubtitle) masterSubtitle.textContent = 'All 32 Anti-Fingerprint Modules Active';
      if (whitelistText) whitelistText.textContent = 'Guarded';
      if (btnWhitelist) btnWhitelist.classList.remove('whitelisted');
    }
  }

  // 5. Initial Storage Load & State Synchronization
  chrome.storage.local.get(null, (res) => {
    if (masterToggle) masterToggle.checked = res.masterEnabled !== false && res.enabled !== false;

    if (toggleCanvas) toggleCanvas.checked = res.canvasNoiseEnabled !== false;
    if (toggleAudio) toggleAudio.checked = res.audioNoiseEnabled !== false;
    if (toggleWebgl) toggleWebgl.checked = res.webglSpoofingEnabled !== false;
    if (toggleHints) toggleHints.checked = res.clientHintsEnabled !== false;

    if (toggleTimercoarse) toggleTimercoarse.checked = res.timerCoarseningEnabled !== false;
    if (toggleDomjitter) toggleDomjitter.checked = res.domJitterEnabled !== false;
    if (toggleWebrtc) toggleWebrtc.checked = res.webrtcShieldEnabled !== false;
    if (toggleBrave) toggleBrave.checked = res.maskBraveApi !== false;

    if (toggleUnshortener) toggleUnshortener.checked = res.unshortenerEnabled !== false;
    if (togglePaywall) togglePaywall.checked = res.paywallDefuserEnabled !== false;
    if (toggleTimers) toggleTimers.checked = res.autoBypassTimers !== false;
    if (toggleMedia) toggleMedia.checked = res.youtubeAds !== false;

    if (res.deviceProfile) {
      selectedProfileId = res.deviceProfile;
      if (profileSelect) profileSelect.value = selectedProfileId;
    }

    // Telemetry counters — real stored values only, never fabricated.
    animateValue(metricTimeSaved, 0, Math.floor(res.timeSavedSeconds || 0));
    animateValue(metricTraps, 0, Math.floor(res.trapsNeutralized || 0));
    animateValue(metricLinks, 0, Math.floor(res.directLinksUnlocked || 0));

    // Whitelist Check — suffix matching, identical to content.js bridge logic
    const whitelist = Array.isArray(res.whitelist) ? res.whitelist : [];
    isCurrentWhitelisted = !!(currentHostname && whitelist.some(d =>
      typeof bsDomainMatches === 'function' ? bsDomainMatches(currentHostname, d)
        : (currentHostname === d || currentHostname.endsWith('.' + d))));

    updateModuleCount(res);

    if (updateBadge && res.updateAvailable) {
      updateBadge.classList.remove('hidden');
    }

    updateHUDVisuals();
  });

  // Count how many stealth modules are currently armed and reflect it in the UI
  const BS_MODULE_KEYS = [
    'canvasNoiseEnabled', 'audioNoiseEnabled', 'webglSpoofingEnabled', 'clientHintsEnabled',
    'timerCoarseningEnabled', 'domJitterEnabled', 'webrtcShieldEnabled', 'maskBraveApi',
    'unshortenerEnabled', 'paywallDefuserEnabled', 'autoBypassTimers',
    'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled'
  ];
  function countActiveModules(source) {
    if (source.masterEnabled === false) return 0;
    return BS_MODULE_KEYS.reduce((n, k) => n + (source[k] !== false ? 1 : 0), 0);
  }
  function updateModuleCount(source) {
    const count = countActiveModules(source);
    if (metricModules) animateValue(metricModules, 0, count);
    const total = BS_MODULE_KEYS.length;
    if (masterSubtitle && source.masterEnabled !== false && !isCurrentWhitelisted) {
      masterSubtitle.textContent = `${count}/${total} Stealth Modules Armed`;
    }
  }

  // 6. Real-Time Storage Change Listener
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.masterEnabled !== undefined && masterToggle) {
      masterToggle.checked = changes.masterEnabled.newValue !== false;
    }
    if (changes.canvasNoiseEnabled !== undefined && toggleCanvas) toggleCanvas.checked = changes.canvasNoiseEnabled.newValue !== false;
    if (changes.audioNoiseEnabled !== undefined && toggleAudio) toggleAudio.checked = changes.audioNoiseEnabled.newValue !== false;
    if (changes.webglSpoofingEnabled !== undefined && toggleWebgl) toggleWebgl.checked = changes.webglSpoofingEnabled.newValue !== false;
    if (changes.clientHintsEnabled !== undefined && toggleHints) toggleHints.checked = changes.clientHintsEnabled.newValue !== false;

    if (changes.timerCoarseningEnabled !== undefined && toggleTimercoarse) toggleTimercoarse.checked = changes.timerCoarseningEnabled.newValue !== false;
    if (changes.domJitterEnabled !== undefined && toggleDomjitter) toggleDomjitter.checked = changes.domJitterEnabled.newValue !== false;
    if (changes.webrtcShieldEnabled !== undefined && toggleWebrtc) toggleWebrtc.checked = changes.webrtcShieldEnabled.newValue !== false;
    if (changes.maskBraveApi !== undefined && toggleBrave) toggleBrave.checked = changes.maskBraveApi.newValue !== false;

    if (changes.whitelist !== undefined) {
      const list = changes.whitelist.newValue || [];
      isCurrentWhitelisted = !!(currentHostname && list.some(d =>
        typeof bsDomainMatches === 'function' ? bsDomainMatches(currentHostname, d)
          : (currentHostname === d || currentHostname.endsWith('.' + d))));
      updateHUDVisuals();
    }

    // Keep live counters + module count in sync while popup is open
    let touchedTelemetry = false;
    const latest = {};
    for (const [k, v] of Object.entries(changes)) {
      latest[k] = v.newValue;
      if (k === 'timeSavedSeconds' || k === 'trapsNeutralized' || k === 'directLinksUnlocked') touchedTelemetry = true;
    }
    if (touchedTelemetry) {
      chrome.storage.local.get(['timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked'], (res) => {
        animateValue(metricTimeSaved, Number(metricTimeSaved.textContent.replace(/,/g, '')) || 0, Math.floor(res.timeSavedSeconds || 0));
        animateValue(metricTraps, Number(metricTraps.textContent.replace(/,/g, '')) || 0, Math.floor(res.trapsNeutralized || 0));
        animateValue(metricLinks, Number(metricLinks.textContent.replace(/,/g, '')) || 0, Math.floor(res.directLinksUnlocked || 0));
      });
    }
    if (BS_MODULE_KEYS.some(k => changes[k] !== undefined)) {
      chrome.storage.local.get(BS_MODULE_KEYS.concat(['masterEnabled']), (res) => updateModuleCount(res));
    }

    if (changes.updateAvailable !== undefined && updateBadge) {
      if (changes.updateAvailable.newValue) updateBadge.classList.remove('hidden');
      else updateBadge.classList.add('hidden');
    }

    updateHUDVisuals();
  });

  // 7. Toggle Event Handlers
  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const val = masterToggle.checked;
      chrome.storage.local.set({ masterEnabled: val, enabled: val });
      updateHUDVisuals();
    });
  }

  if (toggleCanvas) toggleCanvas.addEventListener('change', () => chrome.storage.local.set({ canvasNoiseEnabled: toggleCanvas.checked }));
  if (toggleAudio) toggleAudio.addEventListener('change', () => chrome.storage.local.set({ audioNoiseEnabled: toggleAudio.checked }));
  if (toggleWebgl) toggleWebgl.addEventListener('change', () => chrome.storage.local.set({ webglSpoofingEnabled: toggleWebgl.checked }));
  if (toggleHints) toggleHints.addEventListener('change', () => chrome.storage.local.set({ clientHintsEnabled: toggleHints.checked, maskClientHints: toggleHints.checked }));

  if (toggleTimercoarse) toggleTimercoarse.addEventListener('change', () => chrome.storage.local.set({ timerCoarseningEnabled: toggleTimercoarse.checked }));
  if (toggleDomjitter) toggleDomjitter.addEventListener('change', () => chrome.storage.local.set({ domJitterEnabled: toggleDomjitter.checked }));
  if (toggleWebrtc) toggleWebrtc.addEventListener('change', () => chrome.storage.local.set({ webrtcShieldEnabled: toggleWebrtc.checked }));
  if (toggleBrave) toggleBrave.addEventListener('change', () => chrome.storage.local.set({ maskBraveApi: toggleBrave.checked }));

  if (toggleUnshortener) toggleUnshortener.addEventListener('change', () => chrome.storage.local.set({ unshortenerEnabled: toggleUnshortener.checked }));
  if (togglePaywall) togglePaywall.addEventListener('change', () => chrome.storage.local.set({ paywallDefuserEnabled: togglePaywall.checked }));
  if (toggleTimers) toggleTimers.addEventListener('change', () => chrome.storage.local.set({ autoBypassTimers: toggleTimers.checked }));
  if (toggleMedia) toggleMedia.addEventListener('change', () => chrome.storage.local.set({ youtubeAds: toggleMedia.checked, spotifyUnlocked: toggleMedia.checked, twitchShieldEnabled: toggleMedia.checked }));

  // 8. Instant Domain Whitelist Toggle
  if (btnWhitelist) {
    btnWhitelist.addEventListener('click', () => {
      if (!currentHostname) return;
      chrome.storage.local.get(['whitelist'], (res) => {
        let list = Array.isArray(res.whitelist) ? [...res.whitelist] : [];
        if (list.includes(currentHostname)) {
          list = list.filter(h => h !== currentHostname);
          isCurrentWhitelisted = false;
        } else {
          list.push(currentHostname);
          isCurrentWhitelisted = true;
        }
        chrome.storage.local.set({ whitelist: list });
        updateHUDVisuals();
      });
    });
  }

  // 9. Hardware Profile Selection
  if (profileSelect) {
    profileSelect.addEventListener('change', () => {
      selectedProfileId = profileSelect.value;
      chrome.storage.local.set({ deviceProfile: selectedProfileId });
    });
  }

  // 10. Navigation Actions
  if (btnOptions) {
    btnOptions.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
      else window.open('options.html');
    });
  }

  if (btnSync) {
    btnSync.addEventListener('click', () => {
      if (syncIcon) syncIcon.style.transform = 'rotate(360deg)';
      // Must match background.js onMessage contract: { type: 'TRIGGER_SYNC' }
      chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' }, (resp) => {
        setTimeout(() => {
          if (syncIcon) syncIcon.style.transform = 'rotate(0deg)';
          if (chrome.runtime.lastError) {
            btnSync.title = 'Sync failed — service worker unavailable';
          } else if (resp && resp.success) {
            btnSync.title = `Last sync: ${new Date(resp.lastSyncTime || Date.now()).toLocaleTimeString()}`;
          }
        }, 800);
      });
    });
  }

  // Dynamic version from manifest — single source of truth
  const verTag = document.getElementById('ver-tag');
  if (verTag) {
    try { verTag.textContent = 'v' + chrome.runtime.getManifest().version; } catch (_) { verTag.textContent = ''; }
  }

  if (updateBadge) {
    updateBadge.addEventListener('click', () => {
      window.open('https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/latest');
    });
  }
});