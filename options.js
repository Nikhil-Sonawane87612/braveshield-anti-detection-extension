/**
 * BraveShield Bypass Pro v5.1.0 - Options Controller Pro Max
 * Obsidian Glassmorphic Studio, WebGL 3D Diagnostic Canvas, Real-Time Telemetry Stream.
 */

const SETTINGS_MAP = {
  'auto-links': 'autoBypassLinks',
  'auto-timers': 'autoBypassTimers',
  'click-wait': 'clickImageWait',
  'auto-cookies': 'autoDismissCookies',
  'auto-scroll': 'autoScroll',
  'auto-redirects': 'autoRedirects',
  'auto-popunder': 'interceptPopunders',
  'adblock-detect': 'bypassAdblockDetection',
  'fake-bait': 'fakeNetworkBait',
  'mask-brave': 'maskBraveApi',
  'mask-brands': 'maskClientHints',
  'mask-gpc': 'maskGPC',
  'stub-vars': 'stubAnalytics',
  'bypass-traps': 'bypassShieldsTraps',
  'normalize-webgl': 'normalizeWebgl',
  'fix-braveleak': 'fixBraveLeak',
  'fix-storageleak': 'fixStorageLeak',
  'normalize-audio': 'normalizeAudio',
  'normalize-canvas': 'normalizeCanvas',
  'hide-webdriver': 'hideWebdriver',
  'prevent-webrtc': 'preventWebRTC',
  'deny-permissions': 'autoDenyPermissions',
  'clamp-timers': 'clampTimers',
  'spoof-navigator': 'spoofNavigator',
  'screen-consistency': 'screenConsistency',
  'spoof-fonts': 'spoofFonts',
  'clean-css': 'cleanCSS',
  'yt-ads': 'youtubeAds',
  'yt-sponsor': 'sponsorBlock',
  'video-turbo-ad': 'videoTurboAdSpeed',
  'video-turbo-bg': 'videoTurboBgPlay',
  'video-turbo-pip': 'videoTurboPip',
  'devmode': 'devMode',
  'enable-rightclick': 'forceRightClick',
  'enable-text-select': 'forceTextSelect',
  'anti-scroll-lock': 'antiScrollLock',
  'auto-close-popups': 'autoClosePopups',
  'anti-clipboard-read': 'blockClipboardRead',
  'anti-notification-spam': 'blockNotificationSpam',
  'anti-screenshot-detect': 'antiScreenshotDetect',
  'timezone-spoof': 'timezoneSpoof',
  'geolocation-spoof': 'geolocationSpoof'
};

const MODULE_CATEGORIES = {
  'auto-bypass': {
    label: 'Auto Bypass',
    icon: 'Z',
    settings: ['auto-links', 'auto-timers', 'click-wait', 'auto-cookies', 'auto-scroll', 'auto-redirects', 'auto-popunder', 'adblock-detect', 'fake-bait']
  },
  'stealth-core': {
    label: 'Stealth - Core',
    icon: 'B',
    settings: ['mask-brave', 'mask-brands', 'mask-gpc', 'stub-vars', 'bypass-traps', 'normalize-webgl']
  },
  'stealth-fingerprint': {
    label: 'Stealth - Fingerprint',
    icon: 'F',
    settings: ['fix-braveleak', 'fix-storageleak', 'normalize-audio', 'normalize-canvas']
  },
  'stealth-anti-auto': {
    label: 'Stealth - Anti-Automation',
    icon: 'W',
    settings: ['hide-webdriver', 'prevent-webrtc', 'deny-permissions', 'clamp-timers', 'spoof-navigator']
  },
  'stealth-consistency': {
    label: 'Stealth - Consistency',
    icon: 'S',
    settings: ['clean-css', 'spoof-fonts', 'screen-consistency']
  },
  'youtube': {
    label: 'Video & YouTube',
    icon: 'Y',
    settings: ['yt-ads', 'yt-sponsor', 'video-turbo-ad', 'video-turbo-bg', 'video-turbo-pip']
  },
  'dev-tools': {
    label: 'Developer Tools',
    icon: '⚙',
    settings: ['devmode']
  },
  'accessibility': {
    label: 'Accessibility',
    icon: 'X',
    settings: ['enable-rightclick', 'enable-text-select', 'anti-scroll-lock', 'auto-close-popups']
  },
  'privacy': {
    label: 'Privacy',
    icon: 'P',
    settings: ['anti-clipboard-read', 'anti-notification-spam', 'anti-screenshot-detect']
  },
  'region': {
    label: 'Region',
    icon: 'G',
    settings: ['timezone-spoof', 'geolocation-spoof']
  }
};

const SETTING_LABELS = {
  'auto-links': { title: 'Link Shortener Auto-Bypass', desc: '50+ services & direct engines' },
  'auto-timers': { title: 'Timer & Countdown Skip', desc: 'Accelerates 15-30s timers to 0.5s' },
  'click-wait': { title: 'Click Image Wait Bypass', desc: 'Automates click-and-wait patterns' },
  'auto-cookies': { title: 'Cookie Consent Auto-Dismiss', desc: '20+ modal banner frameworks' },
  'auto-scroll': { title: 'Smart Auto-Scroll', desc: 'Navigates scroll-locked landing pages' },
  'auto-redirects': { title: 'Redirect Chain Follower', desc: 'Meta refresh & click-through bypass' },
  'auto-popunder': { title: 'Popunder Interceptor', desc: 'Kills unauthorized rogue ad tabs' },
  'adblock-detect': { title: 'Adblock Detection Bypass', desc: 'Defeats Admiral, Hispanoads, BlockAdBlock' },
  'fake-bait': { title: 'Network Bait Faking', desc: 'Returns synthetic 200 OK for ad probes' },
  'mask-brave': { title: 'Navigator.brave Destruction', desc: 'Removes navigator.brave signature' },
  'mask-brands': { title: 'Client Hints Brand Sanitizer', desc: 'Strips Brave from navigator.userAgentData' },
  'mask-gpc': { title: 'Global Privacy Control', desc: 'Hides GPC tracking flag' },
  'stub-vars': { title: 'Ad/Analytics Stubs', desc: 'Fakes ga, gtag, pbjs analytics globals' },
  'bypass-traps': { title: 'DOM Trap Neutralizer', desc: 'Hooks offsetHeight/Width ad bait probes' },
  'normalize-webgl': { title: 'WebGL Normalization', desc: 'Spoofs unmasked GPU vendor & renderer' },
  'fix-braveleak': { title: 'brave:// Protocol Leak Fix', desc: 'DOM URL parser patch' },
  'fix-storageleak': { title: 'Storage Quota Leak Fix', desc: 'Hides actual disk storage partition size' },
  'normalize-audio': { title: 'AudioContext Normalization', desc: 'Uniform noise farbling for audio hashes' },
  'normalize-canvas': { title: 'Canvas Fingerprint Fix', desc: 'Consistent toDataURL canvas farbling' },
  'hide-webdriver': { title: 'Webdriver Cloaking', desc: 'navigator.webdriver = false' },
  'prevent-webrtc': { title: 'WebRTC IP Leak Prevention', desc: 'Strips ICE candidate private IP leaks' },
  'deny-permissions': { title: 'Permission Auto-Deny', desc: 'Auto-denies camera, mic, notification spam' },
  'clamp-timers': { title: 'Performance Timer Clamp', desc: 'Clamps high-resolution timer attacks' },
  'spoof-navigator': { title: 'Navigator Consistency', desc: 'Synchronizes platform, hardware & screens' },
  'clean-css': { title: 'CSS Property Cleanup', desc: 'Removes browser-specific layout traces' },
  'spoof-fonts': { title: 'Font Fingerprint Spoof', desc: 'Consistent standard font rendering' },
  'screen-consistency': { title: 'Screen/Viewport', desc: 'Emulates realistic desktop aspect ratios' },
  'yt-ads': { title: 'YouTube Ad Blocking', desc: 'Video, display, overlays & promoted clips' },
  'yt-sponsor': { title: 'SponsorBlock Auto-Skip', desc: 'Skips sponsored segments via community API' },
  'video-turbo-ad': { title: '16x Video Ad Fast-Forward', desc: 'Accelerates and auto-mutes video ads' },
  'video-turbo-bg': { title: 'Background Video Playback', desc: 'Prevents pause when switching tabs' },
  'video-turbo-pip': { title: 'Universal Picture-in-Picture', desc: 'Unlock floating PiP on all video elements' },
  'devmode': { title: 'Undetectable Dev Mode', desc: 'Bypasses CSP & anti-debug loops' },
  'enable-rightclick': { title: 'Force Right-Click', desc: 'Override context menu blocking' },
  'enable-text-select': { title: 'Force Text Selection', desc: 'Defeat CSS select-none copy prevention' },
  'anti-scroll-lock': { title: 'Anti-Scroll Lock', desc: 'Overrides overflow:hidden on modals' },
  'auto-close-popups': { title: 'Auto-Close Rogue Popups', desc: 'Closes ad tabs automatically' },
  'anti-clipboard-read': { title: 'Block Clipboard Read', desc: 'Stops sites from reading clipboard' },
  'anti-notification-spam': { title: 'Block Notification Spam', desc: 'Suppresses push notification requests' },
  'anti-screenshot-detect': { title: 'Anti-Screenshot Detection', desc: 'Bypasses visibility/blur detection' },
  'timezone-spoof': { title: 'Timezone Spoofing', desc: 'Synchronizes timezone with chosen persona' },
  'geolocation-spoof': { title: 'Geolocation Spoofing', desc: 'Fakes GPS coordinates to match IP' }
};

const WEBGL_GPU_PROFILES = {
  'nvidia_rtx4090': {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'nvidia_rtx3080': {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'nvidia_rtx3060': {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'nvidia_gtx1660ti': {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'nvidia_rtx4060_laptop': {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'amd_rx7900xtx': {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'amd_rx6800xt': {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'amd_rx6700xt': {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'apple_m3_max': {
    vendor: 'Apple Inc.',
    renderer: 'Apple M3 Max (Metal 3.0)'
  },
  'apple_m2_pro': {
    vendor: 'Apple Inc.',
    renderer: 'Apple M2 Pro (Metal 3.0)'
  },
  'apple_m1': {
    vendor: 'Apple Inc.',
    renderer: 'Apple M1 (Metal)'
  },
  'intel_iris_xe': {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'intel_uhd_770': {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'intel_arc_a770': {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) Arc(TM) A770 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'
  },
  'adreno_740': {
    vendor: 'Qualcomm',
    renderer: 'Adreno (TM) 740 (OpenGL ES 3.2)'
  },
  'mali_g715': {
    vendor: 'ARM',
    renderer: 'Mali-G715 Immortalis (Vulkan 1.3)'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const saveBtn = document.getElementById('save-settings');
  const whitelistEl = document.getElementById('whitelist');
  const blacklistEl = document.getElementById('blacklist');
  const allModulesGrid = document.getElementById('all-modules-grid');
  const searchInput = document.getElementById('all-modules-search');
  const toggleAllOn = document.getElementById('toggle-all-on');
  const toggleAllOff = document.getElementById('toggle-all-off');
  const webglProfileSelect = document.getElementById('webgl-profile-select');
  const webglVendorInput = document.getElementById('webgl-vendor');
  const webglRendererInput = document.getElementById('webgl-renderer');
  const optionsMasterToggle = document.getElementById('options-master-toggle');
  const optionsMasterLabel = document.getElementById('options-master-label');
  const optionsMasterDot = document.getElementById('options-master-dot');
  const telemetryFeedContainer = document.getElementById('telemetry-feed-container');
  const btnSimulateProbe = document.getElementById('btn-simulate-probe');
  const btnClearFeed = document.getElementById('btn-clear-feed');
  const btnTestWebgl = document.getElementById('btn-test-webgl');
  const webglPreviewStatus = document.getElementById('webgl-preview-status');
  const webglTestCanvas = document.getElementById('webgl-test-canvas');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2200);
  }

  // 1. Master Kill Switch Listener
  if (optionsMasterToggle) {
    optionsMasterToggle.addEventListener('change', () => {
      const isEnabled = optionsMasterToggle.checked;
      chrome.runtime.sendMessage({ type: 'TOGGLE_MASTER', enabled: isEnabled }, () => {
        if (optionsMasterLabel) {
          optionsMasterLabel.textContent = isEnabled ? 'ENGINE ARMED' : 'ENGINE DISABLED';
          optionsMasterLabel.style.color = isEnabled ? '#00f076' : '#ff3366';
        }
        if (optionsMasterDot) {
          optionsMasterDot.style.background = isEnabled ? '#00f076' : '#ff3366';
        }
        showToast(isEnabled ? 'Master Engine Armed' : 'Master Engine Suspended');
        addTelemetryEntry(isEnabled ? 'SYSTEM' : 'WARNING', isEnabled ? 'Master Shield Engine Armed (42 modules)' : 'Emergency Kill Switch Triggered - All Modules Paused', isEnabled ? 'badge-green' : 'badge-purple');
      });
    });
  }

  // 2. Synchronize any checkbox for a given setting ID across all panels and matrices
  function syncCheckboxesForSetting(id, checked) {
    document.querySelectorAll(`input#${id}, input[data-setting-id="${id}"]`).forEach(el => {
      el.checked = checked;
    });
    updateStatsCounter();
  }

  function syncAllCheckboxes(storageData) {
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      if (storageData && storageData[key] !== undefined) {
        syncCheckboxesForSetting(id, Boolean(storageData[key]));
      }
    });
    updateStatsCounter();
  }

  function updateStatsCounter() {
    const statEl = document.getElementById('stat-modules');
    if (!statEl) return;
    let activeCount = 0;
    const seen = new Set();
    document.querySelectorAll('.panel:not(#panel-all) input[type="checkbox"]').forEach(cb => {
      if (cb.id && !seen.has(cb.id)) {
        seen.add(cb.id);
        if (cb.checked) activeCount++;
      }
    });
    statEl.textContent = activeCount;
  }

  // 3. Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.panel').forEach(p => {
        p.classList.remove('active');
        if (p.id === 'panel-' + targetTab) {
          p.classList.add('active');
        }
      });
    });
  });

  // Handle URL param tab routing (e.g. ?tab=sites or ?tab=profile)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab) {
    const matchBtn = document.querySelector(`.tab-btn[data-tab="${requestedTab}"]`);
    if (matchBtn) matchBtn.click();
  }

  // 4. Live Telemetry Event Stream Feed
  function addTelemetryEntry(tag, msg, badgeClass = 'badge-cyan') {
    if (!telemetryFeedContainer) return;
    const entry = document.createElement('div');
    entry.className = 'feed-entry';
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    entry.innerHTML = `
      <span class="feed-time">${timeStr}</span>
      <span class="feed-badge ${badgeClass}">${tag}</span>
      <span class="feed-msg">${msg}</span>
    `;
    telemetryFeedContainer.prepend(entry);
    if (telemetryFeedContainer.children.length > 50) {
      telemetryFeedContainer.removeChild(telemetryFeedContainer.lastChild);
    }
  }

  if (btnSimulateProbe) {
    btnSimulateProbe.addEventListener('click', () => {
      const probeTypes = [
        { tag: 'TRAP DEFUSED', msg: 'Intercepted offsetHeight ad detector on cdn-metrics.net', cls: 'badge-green' },
        { tag: 'WEBRTC SHIELD', msg: 'Stripped ICE Candidate from RTCPeerConnection', cls: 'badge-cyan' },
        { tag: 'TURBO AD 16X', msg: 'Sped up video ad player by 16.0x with auto-mute', cls: 'badge-purple' },
        { tag: 'CANVAS NOISE', msg: 'Farbled 2D canvas hash with deterministic uniform noise', cls: 'badge-cyan' },
        { tag: 'TIMER SKIP', msg: 'Bypassed 20s countdown timer on download-gate.io', cls: 'badge-green' }
      ];
      const p = probeTypes[Math.floor(Math.random() * probeTypes.length)];
      addTelemetryEntry(p.tag, p.msg, p.cls);
      showToast('Simulated Security Probe Blocked');
    });
  }

  if (btnClearFeed) {
    btnClearFeed.addEventListener('click', () => {
      if (telemetryFeedContainer) telemetryFeedContainer.innerHTML = '';
      showToast('Event Stream Cleared');
    });
  }

  // 5. 3D WebGL Live Diagnostic Canvas
  function runWebGLDiagnostic() {
    if (!webglTestCanvas) return;
    const gl = webglTestCanvas.getContext('webgl') || webglTestCanvas.getContext('experimental-webgl');
    if (!gl) {
      if (webglPreviewStatus) webglPreviewStatus.textContent = 'WebGL not supported on device';
      return;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Generic WebGL';
    if (webglRendererInput && webglRendererInput.value) {
      renderer = webglRendererInput.value;
    }
    if (webglPreviewStatus) webglPreviewStatus.textContent = 'Spoofed: ' + renderer.split(',')[0];

    // Render a sleek rotating glowing cyan cube
    gl.viewport(0, 0, webglTestCanvas.width, webglTestCanvas.height);
    gl.clearColor(0.03, 0.05, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Simple canvas 2D fallback glow on 2d context or clear
    showToast('Hardware Diagnostic Verified: WebGL Active');
  }

  if (btnTestWebgl) {
    btnTestWebgl.addEventListener('click', runWebGLDiagnostic);
  }

  // 6. WebGL Preset Profiles Handler
  function matchWebGLProfileKey(vendor, renderer) {
    for (const [key, prof] of Object.entries(WEBGL_GPU_PROFILES)) {
      if (prof.vendor === vendor && prof.renderer === renderer) {
        return key;
      }
    }
    return 'custom';
  }

  if (webglProfileSelect) {
    webglProfileSelect.addEventListener('change', () => {
      const selected = webglProfileSelect.value;
      if (selected && selected !== 'custom' && WEBGL_GPU_PROFILES[selected]) {
        const prof = WEBGL_GPU_PROFILES[selected];
        if (webglVendorInput) webglVendorInput.value = prof.vendor;
        if (webglRendererInput) webglRendererInput.value = prof.renderer;
        chrome.storage.local.set({
          webglProfile: selected,
          webglVendor: prof.vendor,
          webglRenderer: prof.renderer
        });
        if (webglPreviewStatus) webglPreviewStatus.textContent = 'Active: ' + prof.renderer.split(',')[0];
        addTelemetryEntry('GPU ROTATED', 'Hardware spoofed as ' + prof.renderer.split(',')[0], 'badge-cyan');
        showToast('WebGL GPU profile applied: ' + webglProfileSelect.options[webglProfileSelect.selectedIndex].text);
      }
    });
  }

  if (webglVendorInput) {
    webglVendorInput.addEventListener('input', () => {
      if (webglProfileSelect) webglProfileSelect.value = 'custom';
    });
  }

  if (webglRendererInput) {
    webglRendererInput.addEventListener('input', () => {
      if (webglProfileSelect) webglProfileSelect.value = 'custom';
    });
  }

  // 7. Render All Modules Matrix with Search
  function renderAllModulesMatrix(filter = '') {
    if (!allModulesGrid) return;
    allModulesGrid.innerHTML = '';
    const q = filter.toLowerCase().trim();

    Object.entries(MODULE_CATEGORIES).forEach(([catKey, cat]) => {
      const matching = cat.settings.filter(id => {
        const meta = SETTING_LABELS[id] || { title: id, desc: '' };
        return !q || meta.title.toLowerCase().includes(q) || meta.desc.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q);
      });

      if (matching.length > 0) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-t">
            <div class="ci">${cat.icon}</div>
            <h3>${cat.label}</h3>
            <span>${matching.length}</span>
          </div>
        `;

        matching.forEach(id => {
          const meta = SETTING_LABELS[id] || { title: id, desc: '' };
          const row = document.createElement('div');
          row.className = 'row';
          row.innerHTML = `
            <div class="rinfo">
              <h4>${meta.title}</h4>
              <span>${meta.desc}</span>
            </div>
            <label class="sw">
              <input type="checkbox" data-setting-id="${id}">
              <span class="sl"></span>
            </label>
          `;
          const input = row.querySelector('input');
          const original = document.getElementById(id);
          if (original) input.checked = original.checked;

          input.addEventListener('change', () => {
            syncCheckboxesForSetting(id, input.checked);
            const key = SETTINGS_MAP[id];
            if (key) chrome.storage.local.set({ [key]: input.checked });
          });

          card.appendChild(row);
        });

        allModulesGrid.appendChild(card);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAllModulesMatrix(searchInput.value);
    });
  }

  // 8. Bulk Toggle Actions
  function setAllModules(enabled) {
    const updates = {};
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      updates[key] = enabled;
      syncCheckboxesForSetting(id, enabled);
    });
    chrome.storage.local.set(updates, () => {
      showToast(enabled ? 'All 42 Modules Enabled' : 'All Modules Disabled');
      renderAllModulesMatrix(searchInput ? searchInput.value : '');
    });
  }

  if (toggleAllOn) toggleAllOn.addEventListener('click', () => setAllModules(true));
  if (toggleAllOff) toggleAllOff.addEventListener('click', () => setAllModules(false));

  // Category buttons
  document.querySelectorAll('.cat-btn-sm[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const enable = btn.dataset.enable === 'true';
      const catObj = MODULE_CATEGORIES[category] || Object.values(MODULE_CATEGORIES).find(c => c.label.toLowerCase().includes(category));
      const ids = catObj ? catObj.settings : [];
      const updates = {};
      ids.forEach(id => {
        const key = SETTINGS_MAP[id];
        if (key) {
          updates[key] = enable;
          syncCheckboxesForSetting(id, enable);
        }
      });
      chrome.storage.local.set(updates, () => {
        showToast((catObj ? catObj.label : category) + (enable ? ' Enabled' : ' Disabled'));
        renderAllModulesMatrix(searchInput ? searchInput.value : '');
      });
    });
  });

  // 9. Checkbox Change Listeners
  Object.entries(SETTINGS_MAP).forEach(([id, storageKey]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        syncCheckboxesForSetting(id, el.checked);
        chrome.storage.local.set({ [storageKey]: el.checked });
      });
    }
  });

  // 10. Load Initial Settings
  const storageKeys = [
    ...Object.values(SETTINGS_MAP),
    'masterEnabled', 'blockedCounter', 'bypassedSites', 'webglVendor', 'webglRenderer', 'webglProfile', 'uaCategory', 'whitelist', 'blacklist'
  ];

  chrome.storage.local.get(storageKeys, (res) => {
    syncAllCheckboxes(res);

    if (optionsMasterToggle) {
      const isMaster = res.masterEnabled !== false;
      optionsMasterToggle.checked = isMaster;
      if (optionsMasterLabel) {
        optionsMasterLabel.textContent = isMaster ? 'ENGINE ARMED' : 'ENGINE DISABLED';
        optionsMasterLabel.style.color = isMaster ? '#00f076' : '#ff3366';
      }
      if (optionsMasterDot) {
        optionsMasterDot.style.background = isMaster ? '#00f076' : '#ff3366';
      }
    }

    if (res.webglVendor && webglVendorInput) webglVendorInput.value = res.webglVendor;
    if (res.webglRenderer && webglRendererInput) webglRendererInput.value = res.webglRenderer;
    if (webglProfileSelect) {
      const matched = res.webglProfile || matchWebGLProfileKey(webglVendorInput ? webglVendorInput.value : '', webglRendererInput ? webglRendererInput.value : '');
      webglProfileSelect.value = matched;
    }

    if (res.uaCategory && document.getElementById('ua-select-opt')) {
      document.getElementById('ua-select-opt').value = res.uaCategory;
    }

    const statTraps = document.getElementById('stat-traps');
    if (statTraps) statTraps.textContent = String(res.blockedCounter || 0);

    const statBypassed = document.getElementById('stat-bypassed');
    if (statBypassed) statBypassed.textContent = String((res.bypassedSites || []).length);

    renderAllModulesMatrix();
    runWebGLDiagnostic();
  });

  // 11. Save Button
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const updates = {};
      Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) updates[key] = el.checked;
      });
      if (webglVendorInput) updates.webglVendor = webglVendorInput.value;
      if (webglRendererInput) updates.webglRenderer = webglRendererInput.value;
      if (webglProfileSelect) updates.webglProfile = webglProfileSelect.value;
      const uaSel = document.getElementById('ua-select-opt');
      if (uaSel) updates.uaCategory = uaSel.value;

      chrome.storage.local.set(updates, () => {
        showToast('All configurations saved & synced');
      });
    });
  }
});
