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
    permissions: 'autoDenyPermissions', bait: 'fakeNetworkBait',
    navigator: 'spoofNavigator'
  };

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
