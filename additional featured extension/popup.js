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

const ALL_SETTING_IDS = Object.keys(SETTINGS_MAP);

document.addEventListener('DOMContentLoaded', () => {
  const mainToggle = document.getElementById('main-toggle');
  const statusBar = document.getElementById('status-bar');
  const statusLabel = document.getElementById('status-label');
  const statusSite = document.getElementById('status-site');
  const statusDot = document.getElementById('status-dot');
  const trapsVal = document.getElementById('traps-bypassed');
  const sitesBypassed = document.getElementById('sites-bypassed');
  const btnWhitelist = document.getElementById('btn-whitelist');
  const btnBlacklist = document.getElementById('btn-blacklist');
  const toggleAllOn = document.getElementById('popup-toggle-all-on');
  const toggleAllOff = document.getElementById('popup-toggle-all-off');

  // Map popup toggle IDs to setting IDs
  const POPUP_TOGGLE_MAP = {
    'toggle-links': 'auto-links',
    'toggle-timers': 'auto-timers',
    'toggle-cookies': 'auto-cookies',
    'toggle-scroll': 'auto-scroll',
    'toggle-popunder': 'auto-popunder',
    'toggle-adblock': 'adblock-detect',
    'toggle-youtube': 'yt-ads',
    'toggle-webr': 'hide-webdriver',
    'toggle-webrtc': 'prevent-webrtc',
    'toggle-permissions': 'deny-permissions',
    'toggle-bait': 'fake-bait',
    'toggle-canvas': 'normalize-canvas',
    'toggle-navigator': 'spoof-navigator',
    'toggle-rightclick': 'enable-rightclick',
    'toggle-textsel': 'enable-text-select',
    'toggle-scrolllock': 'anti-scroll-lock',
    'toggle-clipboard': 'anti-clipboard-read',
    'toggle-timezone': 'timezone-spoof'
  };

  const uaCategory = document.getElementById('ua-category');
  const uaStatus = document.getElementById('ua-status');

  const UA_LABELS = {
    'random': 'Random Chrome', 'chrome_win131': 'Chrome 131 (Win11)', 'chrome_win130': 'Chrome 130 (Win11)',
    'chrome_mac131': 'Chrome 131 (Mac)', 'chrome_lin131': 'Chrome 131 (Linux)',
    'chrome_win129': 'Chrome 129 (Win10)', 'chrome_win124': 'Chrome 124 (Win10)',
    'chrome_mac130': 'Chrome 130 (Mac)', 'chrome_mac129': 'Chrome 129 (Mac)',
    'chrome_mac124': 'Chrome 124 (Mac)', 'chrome_lin130': 'Chrome 130 (Linux)',
    'chrome_lin124': 'Chrome 124 (Linux)',
    'edge131': 'Edge 131 (Win11)', 'edge130': 'Edge 130 (Win11)',
    'edge129': 'Edge 129 (Win10)', 'edge124': 'Edge 124 (Win10)',
    'firefox133': 'Firefox 133 (Win)', 'firefox132': 'Firefox 132 (Win)',
    'firefox_mac133': 'Firefox 133 (Mac)',
    'safari18': 'Safari 18 (Mac)', 'safari17': 'Safari 17 (Mac)',
    'opera110': 'Opera 110 (Win)', 'opera108': 'Opera 108 (Win)',
    'mobile_chrome131': 'Chrome 131 (Android)', 'mobile_chrome130': 'Chrome 130 (Android)',
    'mobile_samsung28': 'Samsung 28 (Android)', 'mobile_firefox133': 'Firefox 133 (Android)',
    'safari_ios18': 'Safari 18 (iPhone)', 'safari_ios17': 'Safari 17 (iPhone)',
    'chrome_ios18': 'Chrome 131 (iPhone)',
    'ipad_os18': 'Safari 18 (iPad)', 'ipad_os17': 'Safari 17 (iPad)',
    'android_tab131': 'Chrome 131 (Android Tablet)'
  };

  chrome.storage.local.get(['selectedUA'], (res) => {
    if (res.selectedUA) {
      uaCategory.value = res.selectedUA;
      uaStatus.textContent = 'Spoofing as ' + (UA_LABELS[res.selectedUA] || 'Random Chrome');
    }
  });

  uaCategory.addEventListener('change', () => {
    const selected = uaCategory.value;
    chrome.storage.local.set({ selectedUA: selected });
    uaStatus.textContent = 'Spoofing as ' + (UA_LABELS[selected] || 'Random Chrome');
  });

  let currentHostname = '';

  const storageKeys = Object.values(SETTINGS_MAP);

  function loadAllSettings() {
    chrome.storage.local.get([
      'enabled', 'blockedCounter', 'bypassedSites', 'currentTabBlocked',
      ...storageKeys
    ], (res) => {
      mainToggle.checked = res.enabled !== false;
      Object.entries(POPUP_TOGGLE_MAP).forEach(([toggleId, settingId]) => {
        const key = SETTINGS_MAP[settingId];
        const el = document.getElementById(toggleId);
        if (el && key && res[key] !== undefined) {
          el.checked = res[key];
        }
      });
      if (res.blockedCounter) trapsVal.textContent = res.blockedCounter;
      if (res.bypassedSites) sitesBypassed.textContent = res.bypassedSites.length;
      updateUI(res.enabled !== false);
    });
  }

  loadAllSettings();

  // Listen for storage changes to sync with options page
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      Object.keys(changes).forEach(key => {
        // Find setting ID
        const settingId = Object.entries(SETTINGS_MAP).find(([, v]) => v === key);
        if (settingId) {
          const [id] = settingId;
          // Update popup toggle if exists
          const popupToggleId = Object.entries(POPUP_TOGGLE_MAP).find(([, v]) => v === id);
          if (popupToggleId) {
            const el = document.getElementById(popupToggleId[0]);
            if (el) el.checked = changes[key].newValue;
          }
        }
        if (key === 'enabled') {
          mainToggle.checked = changes[key].newValue !== false;
          updateUI(changes[key].newValue !== false);
        }
      });
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        statusSite.textContent = url.hostname;

        const SHORTENER_HOSTS = [
          'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
          'linkvertise.com', 'clk.sh', 'tp.st', 'lr.in', 'rekonise.com',
          'work.ink', 'exe.io', 'droplink.co', 'gplinks.co'
        ];
        if (SHORTENER_HOSTS.some(h => url.hostname.includes(h))) {
          statusLabel.textContent = 'BYPASSING';
          statusBar.className = 'sbar warn';
          statusDot.className = 'sdot';
        } else if (url.protocol === 'chrome:' || url.protocol === 'brave:') {
          statusLabel.textContent = 'SYSTEM PAGE';
          statusBar.className = 'sbar off';
          statusSite.textContent = '';
        }

        chrome.storage.local.get(['whitelist', 'blacklist'], (res) => {
          const bl = res.blacklist || [];
          const wl = res.whitelist || [];
          if (bl.some(b => url.hostname.includes(b))) {
            statusLabel.textContent = 'DISABLED - BLACKLISTED';
            statusBar.className = 'sbar off';
          } else if (wl.length > 0 && !wl.some(w => url.hostname.includes(w))) {
            statusLabel.textContent = 'NOT WHITELISTED';
            statusBar.className = 'sbar off';
          }
        });
      } catch (e) {
        statusSite.textContent = '';
      }
    }
  });

  function updateUI(enabled) {
    if (enabled) {
      statusLabel.textContent = 'SHIELDS ON - SAFE';
      statusBar.className = 'sbar';
    } else {
      statusLabel.textContent = 'DISABLED';
      statusBar.className = 'sbar off';
    }
  }

  mainToggle.addEventListener('change', () => {
    const isEnabled = mainToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled: isEnabled });
    updateUI(isEnabled);
  });

  Object.entries(POPUP_TOGGLE_MAP).forEach(([toggleId, settingId]) => {
    const el = document.getElementById(toggleId);
    const key = SETTINGS_MAP[settingId];
    if (el && key) {
      el.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: el.checked });
        chrome.runtime.sendMessage({ type: 'TOGGLE_MODULE', key, value: el.checked });
      });
    }
  });

  // Bulk actions
  function setAllModules(enabled) {
    const settings = {};
    Object.entries(SETTINGS_MAP).forEach(([id, key]) => {
      settings[key] = enabled;
      // Update popup toggles if they exist
      const popupToggleId = Object.entries(POPUP_TOGGLE_MAP).find(([, v]) => v === id);
      if (popupToggleId) {
        const el = document.getElementById(popupToggleId[0]);
        if (el) el.checked = enabled;
      }
    });
    chrome.storage.local.set(settings);
    chrome.runtime.sendMessage({ type: 'TOGGLE_ALL_MODULES', enabled });
  }

  toggleAllOn.addEventListener('click', () => setAllModules(true));
  toggleAllOff.addEventListener('click', () => setAllModules(false));

  btnWhitelist.addEventListener('click', () => {
    if (currentHostname) {
      chrome.runtime.sendMessage({ type: 'ADD_WHITELIST', site: currentHostname }, (res) => {
        if (res && res.success) {
          statusLabel.textContent = 'WHITELISTED';
          statusBar.className = 'sbar';
        }
      });
    }
  });

  btnBlacklist.addEventListener('click', () => {
    if (currentHostname) {
      chrome.runtime.sendMessage({ type: 'ADD_BLACKLIST', site: currentHostname }, (res) => {
        if (res && res.success) {
          statusLabel.textContent = 'DISABLED - BLACKLISTED';
          statusBar.className = 'sbar off';
        }
      });
    }
  });
});