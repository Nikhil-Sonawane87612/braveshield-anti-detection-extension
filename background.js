/**
 * BraveShield Bypass Pro v5.1.0 - Service Worker
 * Master Kill Switch, Video Turbo Engine, Disposable Identity, Badge management.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Extension] BraveShield Bypass Pro v5.1.0 installed/updated.');
  chrome.storage.local.set({
    enabled: true,
    masterEnabled: true,
    autoBypassLinks: true,
    autoBypassTimers: true,
    clickImageWait: true,
    autoDismissCookies: true,
    autoScroll: true,
    autoRedirects: true,
    interceptPopunders: true,
    bypassAdblockDetection: true,
    fakeNetworkBait: true,
    maskBraveApi: true,
    maskClientHints: true,
    maskGPC: true,
    stubAnalytics: true,
    bypassShieldsTraps: true,
    normalizeWebgl: true,
    fixBraveLeak: true,
    fixStorageLeak: true,
    normalizeAudio: true,
    normalizeCanvas: true,
    hideWebdriver: true,
    preventWebRTC: true,
    autoDenyPermissions: true,
    clampTimers: true,
    spoofNavigator: true,
    screenConsistency: true,
    spoofFonts: true,
    cleanCSS: true,
    youtubeAds: true,
    sponsorBlock: true,
    devMode: false,
    videoTurboAdSpeed: true,
    videoTurboPip: true,
    videoTurboBgPlay: true,
    forceRightClick: true,
    forceTextSelect: true,
    antiScrollLock: true,
    autoClosePopups: true,
    blockClipboardRead: true,
    blockNotificationSpam: true,
    antiScreenshotDetect: true,
    timezoneSpoof: true,
    geolocationSpoof: true,
    selectedUA: 'random',
    webglProfile: 'nv_rtx3060',
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    blockedCounter: 0,
    bypassedSites: [],
    whitelist: [],
    blacklist: [],
    version: '5.1.0'
  });
});

const RANDOM_PROFILES = [
  {
    profile: 'nv_rtx4090',
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ua: 'chrome_win131'
  },
  {
    profile: 'nv_rtx3080',
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ua: 'edge131'
  },
  {
    profile: 'nv_rtx3060',
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ua: 'chrome_win131'
  },
  {
    profile: 'amd_rx7900',
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ua: 'chrome_lin131'
  },
  {
    profile: 'intel_iris_xe',
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ua: 'chrome_win131'
  },
  {
    profile: 'apple_m3_max',
    vendor: 'Apple Inc.',
    renderer: 'Apple M3 Max',
    ua: 'safari18'
  },
  {
    profile: 'apple_m2_pro',
    vendor: 'Apple Inc.',
    renderer: 'Apple M2 Pro',
    ua: 'chrome_mac131'
  }
];

function updateBadge(tabId, text, color) {
  if (!chrome.action) return;
  chrome.storage.local.get(['masterEnabled'], (res) => {
    if (res.masterEnabled === false) {
      chrome.action.setBadgeText({ tabId, text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#4B5563' });
    } else {
      chrome.action.setBadgeText({ tabId, text: text || 'ON' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: color || '#10B981' });
    }
  });
}

function setMasterState(enabled) {
  chrome.storage.local.set({ masterEnabled: enabled, enabled: enabled }, () => {
    if (chrome.declarativeNetRequest) {
      if (enabled) {
        chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ['ruleset_1'] });
      } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: ['ruleset_1'] });
      }
    }
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          updateBadge(tab.id, enabled ? 'ON' : 'OFF', enabled ? '#10B981' : '#4B5563');
          chrome.tabs.sendMessage(tab.id, { type: 'SET_MASTER_STATE', enabled }).catch(() => {});
        }
      });
    });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('brave://')) {
    chrome.storage.local.get(['blacklist', 'whitelist', 'masterEnabled'], (res) => {
      if (res.masterEnabled === false) {
        updateBadge(tabId, 'OFF', '#4B5563');
        return;
      }

      const blacklist = res.blacklist || [];
      const whitelist = res.whitelist || [];
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        if (blacklist.some(b => hostname.includes(b))) {
          updateBadge(tabId, 'OFF', '#EF4444');
          return;
        }

        if (whitelist.length > 0 && !whitelist.some(w => hostname.includes(w))) {
          updateBadge(tabId, '--', '#6B7280');
          return;
        }

        const SHORTENER_HOSTS = [
          'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
          'linkvertise.com', 'linkvertise.de', 'clk.sh', 'tp.st', 'lr.in',
          'rekonise.com', 'work.ink', 'lootlinks.co', 'megalink.pro',
          'linksfire.com', 'exe.io', 'droplink.co', 'gplinks.co',
          'xpshort.com', 'tnlink.in', 'za.gl', 'safelinku.com'
        ];
        if (SHORTENER_HOSTS.some(h => hostname.includes(h))) {
          updateBadge(tabId, '⚡', '#3B82F6');
          return;
        }

        if (hostname.includes('youtube.com')) {
          updateBadge(tabId, 'YT', '#EF4444');
          return;
        }

        updateBadge(tabId, 'ON', '#10B981');
      } catch(e) {
        updateBadge(tabId, 'ON', '#10B981');
      }
    });
  }
});

const requestCounts = {};
if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId > 0) {
        requestCounts[details.tabId] = (requestCounts[details.tabId] || 0) + 1;
      }
    },
    { urls: ['<all_urls>'] }
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TAB_STATS') {
    const tabId = message.tabId || sender.tab?.id;
    sendResponse({
      requestCount: requestCounts[tabId] || 0,
      tabId: tabId
    });
    return true;
  } else if (message.type === 'TOGGLE_MASTER') {
    setMasterState(Boolean(message.enabled));
    sendResponse({ success: true, masterEnabled: Boolean(message.enabled) });
    return true;
  } else if (message.type === 'NEW_IDENTITY') {
    // Pick random identity from pool
    const pick = RANDOM_PROFILES[Math.floor(Math.random() * RANDOM_PROFILES.length)];
    chrome.storage.local.set({
      webglProfile: pick.profile,
      webglVendor: pick.vendor,
      webglRenderer: pick.renderer,
      selectedUA: pick.ua,
      uaCategory: pick.ua
    }, () => {
      // Reload active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_SITE_STORAGE' }).catch(() => {});
          setTimeout(() => {
            chrome.tabs.reload(tabs[0].id);
          }, 150);
        }
      });
      sendResponse({ success: true, identity: pick });
    });
    return true;
  } else if (message.type === 'TOGGLE_PIP') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TRIGGER_PIP' }, (res) => {
          sendResponse(res || { success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  } else if (message.type === 'TOGGLE_DEV_MODE') {
    chrome.storage.local.set({ devMode: message.enabled }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_DEV_MODE',
            enabled: message.enabled
          }).catch(() => {});
        }
      });
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'ADD_WHITELIST') {
    chrome.storage.local.get(['whitelist'], (res) => {
      const list = res.whitelist || [];
      if (!list.includes(message.site)) {
        list.push(message.site);
        chrome.storage.local.set({ whitelist: list });
      }
      sendResponse({ success: true, whitelist: list });
    });
    return true;
  } else if (message.type === 'REMOVE_WHITELIST') {
    chrome.storage.local.get(['whitelist'], (res) => {
      const list = (res.whitelist || []).filter(s => s !== message.site);
      chrome.storage.local.set({ whitelist: list });
      sendResponse({ success: true, whitelist: list });
    });
    return true;
  } else if (message.type === 'ADD_BLACKLIST') {
    chrome.storage.local.get(['blacklist'], (res) => {
      const list = res.blacklist || [];
      if (!list.includes(message.site)) {
        list.push(message.site);
        chrome.storage.local.set({ blacklist: list });
      }
      sendResponse({ success: true, blacklist: list });
    });
    return true;
  } else if (message.type === 'REMOVE_BLACKLIST') {
    chrome.storage.local.get(['blacklist'], (res) => {
      const list = (res.blacklist || []).filter(s => s !== message.site);
      chrome.storage.local.set({ blacklist: list });
      sendResponse({ success: true, blacklist: list });
    });
    return true;
  } else if (message.type === 'GET_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] || null });
    });
    return true;
  } else if (message.type === 'BYPASS_COMPLETE') {
    chrome.storage.local.get(['bypassedSites'], (res) => {
      const sites = res.bypassedSites || [];
      if (!sites.includes(message.hostname)) {
        sites.push(message.hostname);
        if (sites.length > 200) sites.shift();
        chrome.storage.local.set({ bypassedSites: sites });
      }
    });
    sendResponse({ success: true });
    return true;
  } else if (message.type === 'INCREMENT_COUNTER') {
    chrome.storage.local.get(['blockedCounter'], (res) => {
      const count = (res.blockedCounter || 0) + 1;
      chrome.storage.local.set({ blockedCounter: count });
      sendResponse({ count });
    });
    return true;
  } else if (message.type === 'GET_SITE_STATUS') {
    chrome.storage.local.get(['blacklist', 'whitelist', 'masterEnabled'], (res) => {
      try {
        const url = new URL(message.url);
        const hostname = url.hostname;
        const blacklist = res.blacklist || [];
        const whitelist = res.whitelist || [];
        const isBlacklisted = blacklist.some(b => hostname.includes(b));
        const isWhitelisted = whitelist.some(w => hostname.includes(w));
        sendResponse({ isBlacklisted, isWhitelisted, hostname, masterEnabled: res.masterEnabled !== false });
      } catch(e) {
        sendResponse({ isBlacklisted: false, isWhitelisted: false, hostname: '', masterEnabled: true });
      }
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete requestCounts[tabId];
});
