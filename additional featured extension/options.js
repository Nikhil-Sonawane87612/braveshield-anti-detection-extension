document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const saveBtn = document.getElementById('save-settings');
  const historyList = document.getElementById('history-list');
  const whitelistEl = document.getElementById('whitelist');
  const blacklistEl = document.getElementById('blacklist');

  function renderList(container, items, type) {
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-state">No ' + type + ' sites</div>';
      return;
    }
    container.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = '<span>' + item + '</span><span class="remove" data-type="' + type + '" data-site="' + item + '">Remove</span>';
      container.appendChild(div);
    });
    container.querySelectorAll('.remove').forEach(btn => {
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
          div.className = 'list-item';
          div.textContent = site;
          historyList.appendChild(div);
        });
      }
    });
  }
  loadLists();

  // Add whitelist/blacklist
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

  // Load saved settings
  const SETTINGS_MAP = {
    'mask-brave': 'maskBraveApi', 'bypass-traps': 'bypassShieldsTraps',
    'stub-vars': 'stubAnalytics', 'mask-brands': 'maskClientHints',
    'normalize-webgl': 'normalizeWebgl', 'fix-braveleak': 'fixBraveLeak',
    'fix-storageleak': 'fixStorageLeak', 'normalize-audio': 'normalizeAudio',
    'normalize-canvas': 'normalizeCanvas', 'auto-links': 'autoBypassLinks',
    'auto-timers': 'autoBypassTimers', 'auto-cookies': 'autoDismissCookies',
    'auto-scroll': 'autoScroll', 'auto-popunder': 'interceptPopunders',
    'fake-bait': 'fakeNetworkBait', 'hide-webdriver': 'hideWebdriver',
    'prevent-webrtc': 'preventWebRTC', 'deny-permissions': 'autoDenyPermissions',
    'clamp-timers': 'clampTimers', 'spoof-navigator': 'spoofNavigator',
    'screen-consistency': 'screenConsistency', 'spoof-fonts': 'spoofFonts',
    'clean-css': 'cleanCSS'
  };

  chrome.storage.local.get(Object.values(SETTINGS_MAP), (res) => {
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el && res[key] !== undefined) el.checked = res[key];
    });
  });

  saveBtn.addEventListener('click', () => {
    const settings = {};
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) settings[key] = el.checked;
    });
    settings.webglVendor = document.getElementById('webgl-vendor').value;
    settings.webglRenderer = document.getElementById('webgl-renderer').value;
    chrome.storage.local.set(settings, () => {
      toast.style.opacity = '1';
      setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    });
  });
});
