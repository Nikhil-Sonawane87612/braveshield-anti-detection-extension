document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const saveBtn = document.getElementById('save-settings');
  const historyList = document.getElementById('history-list');
  const whitelistEl = document.getElementById('whitelist');
  const blacklistEl = document.getElementById('blacklist');

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

  const SETTINGS_MAP = {
    'mask-brave': 'maskBraveApi', 'bypass-traps': 'bypassShieldsTraps',
    'stub-vars': 'stubAnalytics', 'mask-brands': 'maskClientHints',
    'mask-gpc': 'maskGPC',
    'normalize-webgl': 'normalizeWebgl', 'fix-braveleak': 'fixBraveLeak',
    'fix-storageleak': 'fixStorageLeak', 'normalize-audio': 'normalizeAudio',
    'normalize-canvas': 'normalizeCanvas', 'auto-links': 'autoBypassLinks',
    'auto-timers': 'autoBypassTimers', 'click-wait': 'clickImageWait',
    'auto-cookies': 'autoDismissCookies', 'auto-scroll': 'autoScroll',
    'auto-redirects': 'autoRedirects',
    'auto-popunder': 'interceptPopunders',
    'adblock-detect': 'bypassAdblockDetection',
    'fake-bait': 'fakeNetworkBait', 'hide-webdriver': 'hideWebdriver',
    'prevent-webrtc': 'preventWebRTC', 'deny-permissions': 'autoDenyPermissions',
    'clamp-timers': 'clampTimers', 'spoof-navigator': 'spoofNavigator',
    'screen-consistency': 'screenConsistency', 'spoof-fonts': 'spoofFonts',
    'clean-css': 'cleanCSS', 'yt-ads': 'youtubeAds', 'yt-ads2': 'youtubeAds',
    'yt-sponsor': 'sponsorBlock', 'yt-sponsor2': 'sponsorBlock',
    'enable-rightclick': 'forceRightClick', 'enable-text-select': 'forceTextSelect',
    'anti-scroll-lock': 'antiScrollLock', 'auto-close-popups': 'autoClosePopups',
    'anti-clipboard-read': 'blockClipboardRead', 'anti-notification-spam': 'blockNotificationSpam',
    'timezone-spoof': 'timezoneSpoof', 'geolocation-spoof': 'geolocationSpoof',
    'dark-mode-force': 'forceDarkMode', 'reader-mode': 'readerMode',
    'anti-screenshot-detect': 'antiScreenshotDetect'
  };

  chrome.storage.local.get(Object.values(SETTINGS_MAP), (res) => {
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
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, 2000);
    });
  });
});
