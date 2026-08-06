// Shared Settings Data - Inlined for browser compatibility
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
    label: 'YouTube',
    icon: 'Y',
    settings: ['yt-ads', 'yt-sponsor']
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
  'auto-links': { title: 'Link Shortener Auto-Bypass', desc: '50+ services' },
  'auto-timers': { title: 'Timer / Countdown Bypass', desc: 'Auto-clicks when ready' },
  'click-wait': { title: 'Click Image Wait Bypass', desc: 'Ad click-and-wait patterns' },
  'auto-cookies': { title: 'Cookie Consent Auto-Dismiss', desc: '20+ frameworks' },
  'auto-scroll': { title: 'Smart Auto-Scroll', desc: 'Scroll-lock pages' },
  'auto-redirects': { title: 'Redirect Chain Follower', desc: 'Meta refresh + click-throughs' },
  'auto-popunder': { title: 'Popunder Interceptor', desc: 'Blocks ad windows' },
  'adblock-detect': { title: 'Adblock Detection Bypass', desc: 'Hispanoads, Admiral, BlockAdBlock' },
  'fake-bait': { title: 'Network Bait Faking', desc: '200 OK for ad probes' },
  'mask-brave': { title: 'Navigator.brave Destruction', desc: 'Removes navigator.brave' },
  'mask-brands': { title: 'Client Hints Brand Sanitizer', desc: 'Strips Brave from brands' },
  'mask-gpc': { title: 'Global Privacy Control', desc: 'Hides GPC flag' },
  'stub-vars': { title: 'Ad/Analytics Stubs', desc: 'Fakes ga, gtag, pbjs' },
  'bypass-traps': { title: 'DOM Trap Neutralizer', desc: 'Hooks offsetHeight/Width' },
  'normalize-webgl': { title: 'WebGL Normalization', desc: 'GPU vendor/renderer strings' },
  'fix-braveleak': { title: 'brave:// Protocol Leak Fix', desc: 'DOM URL parser patch' },
  'fix-storageleak': { title: 'Storage Quota Leak Fix', desc: 'Hides real disk size' },
  'normalize-audio': { title: 'AudioContext Normalization', desc: 'Consistent output' },
  'normalize-canvas': { title: 'Canvas Fingerprint Fix', desc: 'Consistent toDataURL' },
  'hide-webdriver': { title: 'webdriver Hide', desc: 'Returns false' },
  'prevent-webrtc': { title: 'WebRTC IP Leak Prevention', desc: 'Strips ICE servers' },
  'deny-permissions': { title: 'Permission Auto-Deny', desc: 'Camera, mic, notifs' },
  'clamp-timers': { title: 'Performance Timer Clamp', desc: 'Prevents timing attacks' },
  'spoof-navigator': { title: 'Navigator Consistency', desc: 'Platform, HW, screen' },
  'clean-css': { title: 'CSS Property Cleanup', desc: 'Removes browser vars' },
  'spoof-fonts': { title: 'Font Fingerprint Spoof', desc: 'Consistent font check' },
  'screen-consistency': { title: 'Screen/Viewport', desc: 'Realistic dimensions' },
  'yt-ads': { title: 'YouTube Ad Blocking', desc: 'Video, display, overlays, promoted' },
  'yt-sponsor': { title: 'SponsorBlock', desc: 'Skip sponsored segments' },
  'enable-rightclick': { title: 'Force Right-Click', desc: 'Override site blocks' },
  'enable-text-select': { title: 'Force Text Selection', desc: 'Override copy blocks' },
  'anti-scroll-lock': { title: 'Anti-Scroll Lock', desc: 'overflow:hidden override' },
  'auto-close-popups': { title: 'Auto-Close Popups', desc: 'Close ad windows' },
  'anti-clipboard-read': { title: 'Block Clipboard Read', desc: 'Prevent site access' },
  'anti-notification-spam': { title: 'Block Notification Spam', desc: 'Auto-deny requests' },
  'anti-screenshot-detect': { title: 'Anti-Screenshot Detection', desc: 'Block detection' },
  'timezone-spoof': { title: 'Timezone Spoofing', desc: 'Match UA region' },
  'geolocation-spoof': { title: 'Geolocation Spoofing', desc: 'Fake GPS coordinates' }
};

const ALL_SETTING_IDS = Object.keys(SETTINGS_MAP);

// User-level presets: which modules are enabled for each profile tier.
const USER_PRESETS = {
  'normal': {
    label: 'Normal',
    desc: 'Balanced protection for everyday browsing',
    settings: {
      autoBypassLinks: true, autoBypassTimers: true, clickImageWait: true,
      autoDismissCookies: true, autoScroll: true, autoRedirects: true,
      interceptPopunders: true, bypassAdblockDetection: true, fakeNetworkBait: true,
      maskBraveApi: true, maskClientHints: true, maskGPC: true, stubAnalytics: true,
      bypassShieldsTraps: true, fixBraveLeak: true, fixStorageLeak: true,
      hideWebdriver: true, preventWebRTC: true, autoDenyPermissions: true,
      spoofNavigator: true, forceRightClick: true, forceTextSelect: true,
      antiScrollLock: true, blockClipboardRead: true, blockNotificationSpam: true,
      youtubeAds: true,
      normalizeWebgl: false, normalizeAudio: false, normalizeCanvas: false,
      clampTimers: false, cleanCSS: false, spoofFonts: false, screenConsistency: false,
      sponsorBlock: false, autoClosePopups: false,
      antiScreenshotDetect: false, timezoneSpoof: false, geolocationSpoof: false
    }
  },
  'moderate': {
    label: 'Pro',
    desc: 'Strong anti-detection with system consistency',
    settings: {
      autoBypassLinks: true, autoBypassTimers: true, clickImageWait: true,
      autoDismissCookies: true, autoScroll: true, autoRedirects: true,
      interceptPopunders: true, bypassAdblockDetection: true, fakeNetworkBait: true,
      maskBraveApi: true, maskClientHints: true, maskGPC: true, stubAnalytics: true,
      bypassShieldsTraps: true, normalizeWebgl: true, fixBraveLeak: true,
      fixStorageLeak: true, normalizeAudio: true, normalizeCanvas: true,
      hideWebdriver: true, preventWebRTC: true, autoDenyPermissions: true,
      clampTimers: true, spoofNavigator: true, cleanCSS: true, spoofFonts: true,
      youtubeAds: true, sponsorBlock: true, forceRightClick: true,
      forceTextSelect: true, antiScrollLock: true, autoClosePopups: true,
      blockClipboardRead: true, blockNotificationSpam: true,
      screenConsistency: false, antiScreenshotDetect: false,
      timezoneSpoof: false, geolocationSpoof: false
    }
  },
  'pro': {
    label: 'Maximum',
    desc: 'Aggressive anti-detection for maximum stealth',
    settings: {
      autoBypassLinks: true, autoBypassTimers: true, clickImageWait: true,
      autoDismissCookies: true, autoScroll: true, autoRedirects: true,
      interceptPopunders: true, bypassAdblockDetection: true, fakeNetworkBait: true,
      maskBraveApi: true, maskClientHints: true, maskGPC: true, stubAnalytics: true,
      bypassShieldsTraps: true, normalizeWebgl: true, fixBraveLeak: true,
      fixStorageLeak: true, normalizeAudio: true, normalizeCanvas: true,
      hideWebdriver: true, preventWebRTC: true, autoDenyPermissions: true,
      clampTimers: true, spoofNavigator: true, cleanCSS: true, spoofFonts: true,
      screenConsistency: true, youtubeAds: true, sponsorBlock: true,
      forceRightClick: true, forceTextSelect: true, antiScrollLock: true,
      autoClosePopups: true, blockClipboardRead: true, blockNotificationSpam: true,
      antiScreenshotDetect: true, timezoneSpoof: true, geolocationSpoof: true
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const saveBtn = document.getElementById('save-settings');
  const historyList = document.getElementById('history-list');
  const whitelistEl = document.getElementById('whitelist');
  const blacklistEl = document.getElementById('blacklist');
  const allModulesGrid = document.getElementById('all-modules-grid');
  const searchInput = document.getElementById('all-modules-search');
  const toggleAllOn = document.getElementById('toggle-all-on');
  const toggleAllOff = document.getElementById('toggle-all-off');

  // Tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  function renderList(container, items, type) {
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty">No ' + type + ' sites</div>';
      return;
    }
    container.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'litem';
      div.innerHTML = '<span>' + item + '</span><span class="rm" data-type="' + type + '" data-site="' + item + '">Remove</span>';
      container.appendChild(div);
    });
    container.querySelectorAll('.rm').forEach(btn => {
      btn.addEventListener('click', () => {
        const site = btn.dataset.site;
        const type = btn.dataset.type;
        chrome.storage.local.get([type], (res) => {
          const list = (res[type] || []).filter(s => s !== site);
          chrome.storage.local.set({ [type]: list }, () => loadLists());
        });
      });
    });
  }

  function loadLists() {
    chrome.storage.local.get(['whitelist', 'blacklist', 'bypassedSites'], (res) => {
      renderList(whitelistEl, res.whitelist || [], 'whitelist');
      renderList(blacklistEl, res.blacklist || [], 'blacklist');
      if (res.bypassedSites && res.bypassedSites.length > 0) {
        historyList.innerHTML = '';
        res.bypassedSites.slice(-50).reverse().forEach(site => {
          const div = document.createElement('div');
          div.className = 'litem';
          div.textContent = site;
          historyList.appendChild(div);
        });
      }
    });
  }
  loadLists();

  document.getElementById('btn-add-wl').addEventListener('click', () => {
    const input = document.getElementById('add-whitelist');
    const site = input.value.trim();
    if (site) {
      chrome.storage.local.get(['whitelist'], (res) => {
        const list = res.whitelist || [];
        if (!list.includes(site)) {
          list.push(site);
          chrome.storage.local.set({ whitelist: list }, () => { loadLists(); input.value = ''; });
        }
      });
    }
  });

  document.getElementById('btn-add-bl').addEventListener('click', () => {
    const input = document.getElementById('add-blacklist');
    const site = input.value.trim();
    if (site) {
      chrome.storage.local.get(['blacklist'], (res) => {
        const list = res.blacklist || [];
        if (!list.includes(site)) {
          list.push(site);
          chrome.storage.local.set({ blacklist: list }, () => { loadLists(); input.value = ''; });
        }
      });
    }
  });

  // Build All Modules grid
  function buildAllModulesGrid(filter = '') {
    const lowerFilter = filter.toLowerCase();
    let html = '';

    Object.entries(MODULE_CATEGORIES).forEach(([catId, cat]) => {
      const matchingSettings = cat.settings.filter(id => {
        const label = SETTING_LABELS[id];
        if (!label) return false;
        const searchText = (label.title + ' ' + label.desc).toLowerCase();
        return searchText.includes(lowerFilter);
      });

      if (matchingSettings.length === 0) return;

      html += `
        <div class="card cat-acc">
          <button type="button" class="card-t cat-acc-head" data-cat="${catId}" aria-expanded="true">
            <div class="ci">${cat.icon}</div><h3>${cat.label}</h3><span>${matchingSettings.length}</span>
          </button>
          <div class="cat-acc-body">
      `;

      matchingSettings.forEach(id => {
        const label = SETTING_LABELS[id];
        html += `
          <div class="row" data-setting="${id}">
            <div class="rinfo"><h4>${label.title}</h4><span>${label.desc}</span></div>
            <label class="sw"><input type="checkbox" id="${id}"> <span class="sl"></span></label>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    allModulesGrid.innerHTML = html;

    // Accordion: click a category header to collapse/expand its modules
    allModulesGrid.querySelectorAll('.cat-acc-head').forEach(head => {
      head.addEventListener('click', () => {
        const collapsed = head.classList.toggle('collapsed');
        head.setAttribute('aria-expanded', String(!collapsed));
        const body = head.nextElementSibling;
        if (body) body.style.display = collapsed ? 'none' : '';
      });
    });

    // Attach change listeners
    allModulesGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const key = SETTINGS_MAP[cb.id];
        if (key) {
          chrome.storage.local.set({ [key]: cb.checked });
          // Sync with other checkboxes with same ID
          document.querySelectorAll('#' + cb.id).forEach(other => {
            if (other !== cb) other.checked = cb.checked;
          });
        }
      });
    });

    // Load current values
    const storageKeys = Object.values(SETTINGS_MAP);
    chrome.storage.local.get(storageKeys, (res) => {
      Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && res[key] !== undefined) el.checked = res[key];
      });
    });
  }

  // Initial build
  buildAllModulesGrid();

  // Search handler
  let searchDebounce;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      buildAllModulesGrid(e.target.value);
    }, 150);
  });

// Bulk actions
  function setAllModules(enabled) {
    const settings = {};
    const enabledMap = {};
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      settings[key] = enabled;
      enabledMap[key] = enabled;
      const el = document.getElementById(id);
      if (el) el.checked = enabled;
    });
    chrome.storage.local.set(settings);
    chrome.runtime.sendMessage({ type: 'TOGGLE_ALL_MODULES', enabled, enabledMap });
    showToast(enabled ? 'All modules enabled' : 'All modules disabled');
  }

  toggleAllOn.addEventListener('click', () => setAllModules(true));
  toggleAllOff.addEventListener('click', () => setAllModules(false));

  // Per-category Enable All / Disable All buttons
  function setCategoryModules(category, enabled) {
    const settingIds = MODULE_CATEGORIES_FLAT[category] || [];
    if (settingIds.length === 0) {
      showToast('This tab has no module toggles');
      return;
    }
    const settings = {};
    const modulesPayload = {};
    settingIds.forEach(id => {
      const key = SETTINGS_MAP[id];
      if (key) {
        settings[key] = enabled;
        modulesPayload[key] = enabled;
        document.querySelectorAll('#' + id).forEach(el => { el.checked = enabled; });
      }
    });
    chrome.storage.local.set(settings);
    chrome.runtime.sendMessage({ type: 'TOGGLE_CATEGORY_MODULES', category, enabled, modules: modulesPayload });
    showToast(category + ' ' + (enabled ? 'enabled' : 'disabled'));
  }

  // Flat category map for options page (uses MODULE_CATEGORIES keys which are more granular)
  const MODULE_CATEGORIES_FLAT = {};
  Object.entries(MODULE_CATEGORIES).forEach(([catId, cat]) => {
    MODULE_CATEGORIES_FLAT[catId] = cat.settings;
  });

  // Extra category aliases referenced by options.html card/panel bulk buttons
  MODULE_CATEGORIES_FLAT['page-auto'] = ['auto-cookies', 'auto-scroll', 'auto-redirects', 'auto-popunder'];
  MODULE_CATEGORIES_FLAT['adblock-det'] = ['adblock-detect', 'fake-bait'];
  MODULE_CATEGORIES_FLAT['youtube-bypass'] = ['yt-ads', 'yt-sponsor'];
  MODULE_CATEGORIES_FLAT['auto-bypass'] = MODULE_CATEGORIES['auto-bypass'].settings;
  MODULE_CATEGORIES_FLAT['stealth'] = Object.values(MODULE_CATEGORIES).filter(c => ['stealth-core','stealth-fingerprint','stealth-anti-auto','stealth-consistency'].includes(Object.keys(MODULE_CATEGORIES).find(k => MODULE_CATEGORIES[k] === c))).flatMap(c => c.settings);
  MODULE_CATEGORIES_FLAT['extra'] = [...MODULE_CATEGORIES['accessibility'].settings, ...MODULE_CATEGORIES['privacy'].settings];
  MODULE_CATEGORIES_FLAT['stealth-core'] = MODULE_CATEGORIES['stealth-core'].settings;
  MODULE_CATEGORIES_FLAT['stealth-fingerprint'] = MODULE_CATEGORIES['stealth-fingerprint'].settings;
  MODULE_CATEGORIES_FLAT['stealth-anti-auto'] = MODULE_CATEGORIES['stealth-anti-auto'].settings;
  MODULE_CATEGORIES_FLAT['stealth-consistency'] = MODULE_CATEGORIES['stealth-consistency'].settings;
  MODULE_CATEGORIES_FLAT['accessibility'] = MODULE_CATEGORIES['accessibility'].settings;
  MODULE_CATEGORIES_FLAT['privacy'] = MODULE_CATEGORIES['privacy'].settings;
  MODULE_CATEGORIES_FLAT['youtube'] = MODULE_CATEGORIES['youtube'].settings;
  MODULE_CATEGORIES_FLAT['region'] = MODULE_CATEGORIES['region'].settings;
  // Non-module tabs (Sites, Profile) have no module toggles
  MODULE_CATEGORIES_FLAT['sites'] = [];
  MODULE_CATEGORIES_FLAT['profile'] = [];

  // Wire up cat-btn-sm buttons (both mini card buttons and panel bulk buttons)
  document.querySelectorAll('.cat-btn-sm[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const enable = btn.dataset.enable === 'true';
      setCategoryModules(category, enable);
    });
  });

  // Load all settings
  const storageKeys = Object.values(SETTINGS_MAP);
  chrome.storage.local.get(storageKeys, (res) => {
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el && res[key] !== undefined) el.checked = res[key];
    });
  });

  saveBtn.addEventListener('click', () => {
    const settings = {};
    const seen = new Set();
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      if (seen.has(key)) return;
      seen.add(key);
      const el = document.getElementById(id);
      if (el) settings[key] = el.checked;
    });
    settings.webglVendor = document.getElementById('webgl-vendor').value;
    settings.webglRenderer = document.getElementById('webgl-renderer').value;
    chrome.storage.local.set(settings, () => {
      showToast('Saved');
    });
  });

// === Export / Import settings as JSON ===
  const exportBtn = document.getElementById('btn-export');
  const importBtn = document.getElementById('btn-import');
  const importFile = document.getElementById('import-file');

  function gatherAllSettings(cb) {
    chrome.storage.local.get(Object.values(SETTINGS_MAP), (res) => {
      const data = { version: chrome.runtime.getManifest ? chrome.runtime.getManifest().version : '4.6.0', exportedAt: new Date().toISOString(), settings: res };
      cb(data);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      gatherAllSettings((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'braveshield-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Settings exported');
      });
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const settings = parsed.settings || parsed;
          // Only import known keys
          const clean = {};
          Object.values(SETTINGS_MAP).forEach(key => {
            if (settings[key] !== undefined) clean[key] = !!settings[key];
          });
          if (settings.webglVendor) clean.webglVendor = settings.webglVendor;
          if (settings.webglRenderer) clean.webglRenderer = settings.webglRenderer;
          chrome.storage.local.set(clean, () => {
            // Refresh checkboxes
            Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
              const el = document.getElementById(id);
              if (el && clean[key] !== undefined) el.checked = clean[key];
            });
            const wv = document.getElementById('webgl-vendor');
            const wr = document.getElementById('webgl-renderer');
            if (wv && clean.webglVendor) wv.value = clean.webglVendor;
            if (wr && clean.webglRenderer) wr.value = clean.webglRenderer;
            buildAllModulesGrid();
            showToast('Settings imported');
          });
        } catch(err) {
          showToast('Import failed: invalid JSON');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  // === Stats Dashboard ===
  function loadStats() {
    const storageKeys = Object.values(SETTINGS_MAP);
    chrome.storage.local.get(['blockedCounter', 'bypassedSites', 'sessionStart', ...storageKeys], (res) => {
      const statModules = document.getElementById('stat-modules');
      const statBypassed = document.getElementById('stat-bypassed');
      const statTraps = document.getElementById('stat-traps');
      const statTime = document.getElementById('stat-time');

      if (statModules) {
        const active = storageKeys.filter(k => res[k] === true).length;
        statModules.textContent = active;
      }
      if (statBypassed) statBypassed.textContent = (res.bypassedSites || []).length;
      if (statTraps) statTraps.textContent = res.blockedCounter || 0;

      // Session time tracking
      let sessionStart = res.sessionStart;
      if (!sessionStart) {
        sessionStart = Date.now();
        chrome.storage.local.set({ sessionStart });
      } else {
        const elapsed = Math.floor((Date.now() - sessionStart) / 60000);
        if (statTime) statTime.textContent = elapsed + 'm';
      }
    });
  }
  loadStats();

  // === Profile Presets (per site) ===
  const presetSiteInput = document.getElementById('preset-site');
  const presetList = document.getElementById('preset-list');
  const btnSavePreset = document.getElementById('btn-save-preset');

  function renderPresets() {
    if (!presetList) return;
    chrome.storage.local.get(['presets'], (res) => {
      const presets = res.presets || {};
      const entries = Object.keys(presets);
      if (entries.length === 0) {
        presetList.innerHTML = '<div class="empty">No presets saved</div>';
        return;
      }
      presetList.innerHTML = '';
      entries.forEach(site => {
        const div = document.createElement('div');
        div.className = 'litem';
        const applied = Object.values(presets[site]).filter(v => v === true).length;
        div.innerHTML = '<span>' + site + ' (' + applied + ' on)</span><span class="rm" data-site="' + site + '">Remove</span>';
        presetList.appendChild(div);
        // Click to apply
        div.addEventListener('click', (e) => {
          if (e.target.className === 'rm') return;
          const config = presets[site];
          chrome.storage.local.set(config, () => {
            Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
              const el = document.getElementById(id);
              if (el && config[key] !== undefined) el.checked = config[key];
            });
            buildAllModulesGrid();
            loadStats();
            showToast('Preset applied: ' + site);
          });
        });
      });
      presetList.querySelectorAll('.rm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const site = btn.dataset.site;
          chrome.storage.local.get(['presets'], (res) => {
            const presets = res.presets || {};
            delete presets[site];
            chrome.storage.local.set({ presets }, () => renderPresets());
          });
        });
      });
    });
  }
  renderPresets();

if (btnSavePreset && presetSiteInput) {
    btnSavePreset.addEventListener('click', () => {
      const site = presetSiteInput.value.trim();
      if (!site) { showToast('Enter a site'); return; }
      gatherAllSettings((data) => {
        chrome.storage.local.get(['presets'], (res) => {
          const presets = res.presets || {};
          presets[site] = data.settings;
          chrome.storage.local.set({ presets }, () => {
            presetSiteInput.value = '';
            renderPresets();
            showToast('Preset saved: ' + site);
          });
        });
      });
    });
  }

  // === User-Level Quick Presets (Normal / Pro / Maximum) ===
  const presetSelect = document.getElementById('preset-select');
  const btnApplyPreset = document.getElementById('btn-apply-preset');
  const presetDesc = document.getElementById('preset-desc');

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = USER_PRESETS[presetSelect.value];
      if (presetDesc) {
        presetDesc.textContent = preset ? (preset.label + ' - ' + preset.desc) : 'Choose a preset to instantly configure all modules for your needs.';
      }
    });
  }

  if (btnApplyPreset) {
    btnApplyPreset.addEventListener('click', () => {
      const presetKey = presetSelect ? presetSelect.value : '';
      const preset = USER_PRESETS[presetKey];
      if (!preset) { showToast('Select a preset first'); return; }

      // Apply preset settings to storage
      chrome.storage.local.set(preset.settings, () => {
        // Update all checkboxes in the UI
        Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
          if (preset.settings[key] !== undefined) {
            document.querySelectorAll('#' + id).forEach(el => { el.checked = preset.settings[key]; });
          }
        });
        buildAllModulesGrid();
        loadStats();
        showToast('Preset applied: ' + preset.label);
      });
    });
  }

  // === Keyboard Shortcuts ===
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+E -> Enable all
    if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      setAllModules(true);
    }
    // Ctrl+Shift+D -> Disable all
    else if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      setAllModules(false);
    }
    // Ctrl+Shift+F -> focus search
    else if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // === Real-time sync ===
  // Reflect changes made in the popup (or any other context) immediately.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      if (changes[key] && changes[key].newValue !== undefined) {
        const el = document.getElementById(id);
        if (el) el.checked = !!changes[key].newValue;
      }
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
  }
});
