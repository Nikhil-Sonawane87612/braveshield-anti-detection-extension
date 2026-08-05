document.addEventListener('DOMContentLoaded', () => {
  const mainToggle = document.getElementById('main-toggle');
  const domainStatus = document.getElementById('domain-status');
  const siteInfo = document.getElementById('site-info');
  const siteActions = document.getElementById('site-actions');
  const statusDot = document.getElementById('status-dot');
  const modeBadge = document.getElementById('mode-badge');
  const trapsVal = document.getElementById('traps-bypassed');
  const sitesBypassed = document.getElementById('sites-bypassed');
  const currentTabCount = document.getElementById('current-tab-count');
  const btnWhitelist = document.getElementById('btn-whitelist');
  const btnBlacklist = document.getElementById('btn-blacklist');

  const toggles = {
    links: document.getElementById('toggle-links'),
    timers: document.getElementById('toggle-timers'),
    cookies: document.getElementById('toggle-cookies'),
    scroll: document.getElementById('toggle-scroll'),
    popunder: document.getElementById('toggle-popunder'),
    braveleak: document.getElementById('toggle-braveleak'),
    storageleak: document.getElementById('toggle-storageleak'),
    audio: document.getElementById('toggle-audio'),
    canvas: document.getElementById('toggle-canvas'),
    webrtc: document.getElementById('toggle-webrtc'),
    permissions: document.getElementById('toggle-permissions'),
    bait: document.getElementById('toggle-bait'),
    navigator: document.getElementById('toggle-navigator')
  };

  const storageKeys = {
    links: 'autoBypassLinks', timers: 'autoBypassTimers',
    cookies: 'autoDismissCookies', scroll: 'autoScroll',
    popunder: 'interceptPopunders', braveleak: 'fixBraveLeak',
    storageleak: 'fixStorageLeak', audio: 'normalizeAudio',
    canvas: 'normalizeCanvas', webrtc: 'preventWebRTC',
    permissions: 'autoDenyPermissions',     bait: 'fakeNetworkBait',
    navigator: 'spoofNavigator',
    adblock: 'bypassAdblockDetection',
    youtube: 'blockYouTubeAds'
  };

  // User Agent selector
  const uaCategory = document.getElementById('ua-category');
  const uaStatus = document.getElementById('ua-status');

  const UA_MAP = {
    'random': { label: 'Random Chrome' },
    'chrome_win131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Chrome 131 (Win11)' },
    'chrome_win130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Chrome 130 (Win11)' },
    'chrome_win129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Chrome 129 (Win10)' },
    'chrome_win128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Chrome 128 (Win10)' },
    'chrome_win124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Chrome 124 (Win10)' },
    'chrome_mac131': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0', label: 'Chrome 131 (Mac)' },
    'chrome_mac130': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0', label: 'Chrome 130 (Mac)' },
    'chrome_mac129': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.0.0', label: 'Chrome 129 (Mac)' },
    'chrome_mac124': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'macOS', mobile: false, platformVersion: '14.4.0', label: 'Chrome 124 (Mac)' },
    'chrome_lin131': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0', label: 'Chrome 131 (Linux)' },
    'chrome_lin130': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0', label: 'Chrome 130 (Linux)' },
    'chrome_lin124': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Linux', mobile: false, platformVersion: '6.5.0', label: 'Chrome 124 (Linux)' },
    'edge131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Edge 131 (Win11)' },
    'edge130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Edge 130 (Win11)' },
    'edge129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Edge 129 (Win10)' },
    'edge128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Edge 128 (Win10)' },
    'edge124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Edge 124 (Win10)' },
    'firefox133': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Firefox 133 (Win)' },
    'firefox132': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Firefox 132 (Win)' },
    'firefox131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '10.0.0', label: 'Firefox 131 (Win)' },
    'firefox_mac133': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0', label: 'Firefox 133 (Mac)' },
    'firefox_mac132': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.0.0', label: 'Firefox 132 (Mac)' },
    'safari18': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0', label: 'Safari 18 (Mac)' },
    'safari17': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '14.6.0', label: 'Safari 17 (Mac)' },
    'safari16': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '13.6.0', label: 'Safari 16 (Mac)' },
    'opera110': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/110.0.0.0', brands: [{ brand: 'Opera', version: '110' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Opera 110 (Win)' },
    'opera108': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/108.0.0.0', brands: [{ brand: 'Opera', version: '108' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0', label: 'Opera 108 (Win)' },
    'mobile_chrome131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Chrome 131 (Android)' },
    'mobile_chrome130': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Chrome 130 (Android)' },
    'mobile_chrome124': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Chrome 124 (Android)' },
    'mobile_samsung28': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/125.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '28' }, { brand: 'Chromium', version: '125' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Samsung 28 (Android)' },
    'mobile_samsung25': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '25' }, { brand: 'Chromium', version: '121' }, { brand: 'Not_A Brand', version: '8' }], platform: 'Android', mobile: true, platformVersion: '13.0.0', label: 'Samsung 25 (Android)' },
    'mobile_firefox133': { ua: 'Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0', brands: [], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Firefox 133 (Android)' },
    'safari_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0', label: 'Safari 18 (iPhone)' },
    'safari_ios17': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0', label: 'Safari 17 (iPhone)' },
    'chrome_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'iOS', mobile: true, platformVersion: '18.0.0', label: 'Chrome 131 (iPhone)' },
    'ipad_os18': { ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0', label: 'Safari 18 (iPad)' },
    'ipad_os17': { ua: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0', label: 'Safari 17 (iPad)' },
    'android_tab131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0', label: 'Chrome 131 (Android Tablet)' }
  };

  // Load saved UA
  chrome.storage.local.get(['selectedUA'], (res) => {
    if (res.selectedUA) {
      uaCategory.value = res.selectedUA;
      const info = UA_MAP[res.selectedUA];
      if (info && info.label) uaStatus.textContent = 'Spoofing as ' + info.label;
    }
  });

  uaCategory.addEventListener('change', () => {
    const selected = uaCategory.value;
    chrome.storage.local.set({ selectedUA: selected });
    const info = UA_MAP[selected];
    if (info && info.label) {
      uaStatus.textContent = 'Spoofing as ' + info.label;
    } else {
      uaStatus.textContent = 'Spoofing as Random Chrome';
    }
  });

  let currentHostname = '';

  // Load settings
  chrome.storage.local.get([
    'enabled', 'blockedCounter', 'bypassedSites', 'currentTabBlocked',
    ...Object.values(storageKeys)
  ], (res) => {
    mainToggle.checked = res.enabled !== false;
    Object.keys(toggles).forEach(key => {
      toggles[key].checked = res[storageKeys[key]] !== false;
    });
    if (res.blockedCounter) trapsVal.textContent = res.blockedCounter;
    if (res.bypassedSites) sitesBypassed.textContent = res.bypassedSites.length;
    if (res.currentTabBlocked) currentTabCount.textContent = res.currentTabBlocked;
    updateUI(res.enabled !== false);
  });

  // Get current tab info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        domainStatus.textContent = 'Active on ' + url.hostname;

        const SHORTENER_HOSTS = [
          'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
          'linkvertise.com', 'clk.sh', 'tp.st', 'lr.in', 'rekonise.com',
          'work.ink', 'exe.io', 'droplink.co', 'gplinks.co'
        ];
        if (SHORTENER_HOSTS.some(h => url.hostname.includes(h))) {
          modeBadge.textContent = 'BYPASSING';
          modeBadge.className = 'badge bypass';
          siteInfo.style.display = 'block';
          siteInfo.textContent = 'Link shortener detected - auto-bypassing...';
          statusDot.className = 'dot warning';
        } else if (url.hostname === '' || url.protocol === 'chrome:' || url.protocol === 'brave:') {
          domainStatus.textContent = 'System page - extension inactive';
          siteActions.style.display = 'none';
          return;
        }

        // Show site actions for regular pages
        siteActions.style.display = 'flex';
        btnWhitelist.textContent = '+ Whitelist';
        btnBlacklist.textContent = '+ Blacklist';

        // Check whitelist/blacklist status
        chrome.storage.local.get(['whitelist', 'blacklist'], (res) => {
          const wl = res.whitelist || [];
          const bl = res.blacklist || [];
          if (bl.some(b => url.hostname.includes(b))) {
            modeBadge.textContent = 'DISABLED';
            modeBadge.className = 'badge off';
            siteInfo.style.display = 'block';
            siteInfo.textContent = 'This site is blacklisted';
            statusDot.className = 'dot off';
          } else if (wl.length > 0 && !wl.some(w => url.hostname.includes(w))) {
            modeBadge.textContent = 'NOT WHITELISTED';
            modeBadge.className = 'badge off';
            siteInfo.style.display = 'block';
            siteInfo.textContent = 'Whitelist is active - site not whitelisted';
          }
        });
      } catch (e) {
        domainStatus.textContent = 'System page';
      }
    }
  });

  // Check content script status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_STATUS' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
          const info = [];
          if (response.isLinkShortener) info.push('Link shortener bypass active');
          if (response.hasCookieConsent) info.push('Cookie consent dismissed');
          if (response.hasCountdown) info.push('Countdown timer accelerating');
          if (info.length > 0) {
            siteInfo.style.display = 'block';
            siteInfo.textContent = info.join(' | ');
          }
        }
      });
    }
  });

  function updateUI(enabled) {
    if (enabled) {
      modeBadge.textContent = 'SHIELDS ON SAFE';
      modeBadge.className = 'badge';
      statusDot.className = 'dot';
    } else {
      modeBadge.textContent = 'DISABLED';
      modeBadge.className = 'badge off';
      statusDot.className = 'dot off';
    }
  }

  mainToggle.addEventListener('change', () => {
    const isEnabled = mainToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled: isEnabled });
    updateUI(isEnabled);
  });

  Object.keys(toggles).forEach(key => {
    toggles[key].addEventListener('change', () => {
      chrome.storage.local.set({ [storageKeys[key]]: toggles[key].checked });
      chrome.runtime.sendMessage({ type: 'TOGGLE_MODULE', key: storageKeys[key], value: toggles[key].checked });
    });
  });

  // Whitelist/Blacklist buttons
  btnWhitelist.addEventListener('click', () => {
    if (currentHostname) {
      chrome.runtime.sendMessage({ type: 'ADD_WHITELIST', site: currentHostname }, (res) => {
        if (res && res.success) {
          siteInfo.style.display = 'block';
          siteInfo.textContent = 'Added to whitelist - ' + currentHostname;
        }
      });
    }
  });

  btnBlacklist.addEventListener('click', () => {
    if (currentHostname) {
      chrome.runtime.sendMessage({ type: 'ADD_BLACKLIST', site: currentHostname }, (res) => {
        if (res && res.success) {
          siteInfo.style.display = 'block';
          siteInfo.textContent = 'Added to blacklist - ' + currentHostname;
          modeBadge.textContent = 'DISABLED';
          modeBadge.className = 'badge off';
          statusDot.className = 'dot off';
        }
      });
    }
  });
});
