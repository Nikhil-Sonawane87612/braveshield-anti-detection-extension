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
        <div class="card">
          <div class="card-t"><div class="ci">${cat.icon}</div><h3>${cat.label}</h3><span>${matchingSettings.length}</span></div>
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

      html += '</div>';
    });

    allModulesGrid.innerHTML = html;

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
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      settings[key] = enabled;
      const el = document.getElementById(id);
      if (el) el.checked = enabled;
    });
    chrome.storage.local.set(settings);
    showToast(enabled ? 'All modules enabled' : 'All modules disabled');
  }

  toggleAllOn.addEventListener('click', () => setAllModules(true));
  toggleAllOff.addEventListener('click', () => setAllModules(false));

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

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
  }
});