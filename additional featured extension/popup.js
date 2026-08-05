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

  const toggles = {
    links: document.getElementById('toggle-links'),
    timers: document.getElementById('toggle-timers'),
    cookies: document.getElementById('toggle-cookies'),
    scroll: document.getElementById('toggle-scroll'),
    popunder: document.getElementById('toggle-popunder'),
    adblock: document.getElementById('toggle-adblock'),
    youtube: document.getElementById('toggle-youtube'),
    webr: document.getElementById('toggle-webr'),
    webrtc: document.getElementById('toggle-webrtc'),
    permissions: document.getElementById('toggle-permissions'),
    bait: document.getElementById('toggle-bait'),
    canvas: document.getElementById('toggle-canvas'),
    navigator: document.getElementById('toggle-navigator'),
    rightclick: document.getElementById('toggle-rightclick'),
    textsel: document.getElementById('toggle-textsel'),
    scrolllock: document.getElementById('toggle-scrolllock'),
    clipboard: document.getElementById('toggle-clipboard'),
    timezone: document.getElementById('toggle-timezone'),
    darkmode: document.getElementById('toggle-darkmode')
  };

  const storageKeys = {
    links: 'autoBypassLinks', timers: 'autoBypassTimers',
    cookies: 'autoDismissCookies', scroll: 'autoScroll',
    popunder: 'interceptPopunders', adblock: 'bypassAdblockDetection',
    youtube: 'blockYouTubeAds',
    webr: 'hideWebdriver', webrtc: 'preventWebRTC',
    permissions: 'autoDenyPermissions', bait: 'fakeNetworkBait',
    canvas: 'normalizeCanvas', navigator: 'spoofNavigator',
    rightclick: 'forceRightClick', textsel: 'forceTextSelect',
    scrolllock: 'antiScrollLock', clipboard: 'blockClipboardRead',
    timezone: 'timezoneSpoof', darkmode: 'forceDarkMode'
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

  chrome.storage.local.get([
    'enabled', 'blockedCounter', 'bypassedSites', 'currentTabBlocked',
    ...Object.values(storageKeys)
  ], (res) => {
    mainToggle.checked = res.enabled !== false;
    Object.keys(toggles).forEach(key => {
      if (toggles[key]) toggles[key].checked = res[storageKeys[key]] !== false;
    });
    if (res.blockedCounter) trapsVal.textContent = res.blockedCounter;
    if (res.bypassedSites) sitesBypassed.textContent = res.bypassedSites.length;
    updateUI(res.enabled !== false);
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

  Object.keys(toggles).forEach(key => {
    if (toggles[key]) {
      toggles[key].addEventListener('change', () => {
        chrome.storage.local.set({ [storageKeys[key]]: toggles[key].checked });
        chrome.runtime.sendMessage({ type: 'TOGGLE_MODULE', key: storageKeys[key], value: toggles[key].checked });
      });
    }
  });

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
