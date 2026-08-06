/**
 * BraveShield Bypass Pro v4.0 - Service Worker
 * Badge management, storage, messaging, tab tracking, per-site whitelist.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[BraveShield Bypass] v4.0 installed/updated.');
  chrome.storage.local.set({
    enabled: true,
    bypassShieldsTraps: true,
    maskBraveApi: true,
    spoofChromeUA: true,
    autoBypassLinks: true,
    autoDismissCookies: true,
    autoScroll: true,
    interceptPopunders: true,
    fixBraveLeak: true,
    fixStorageLeak: true,
    normalizeAudio: true,
    normalizeCanvas: true,
    hideWebdriver: true,
    preventWebRTC: true,
    autoDenyPermissions: true,
    fakeNetworkBait: true,
    clampTimers: true,
    spoofNavigator: true,
    screenConsistency: true,
    blockedCounter: 0,
    bypassedSites: [],
    whitelist: [],
    blacklist: [],
    version: '4.0.0'
  });
});

function updateBadge(tabId, text, color) {
  if (chrome.action) {
    chrome.action.setBadgeText({ tabId, text: text || 'ON' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: color || '#10B981' });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('brave://')) {
    // Check if site is blacklisted
    chrome.storage.local.get(['blacklist', 'whitelist'], (res) => {
      const blacklist = res.blacklist || [];
      const whitelist = res.whitelist || [];
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        // Check blacklist
        const isBlacklisted = blacklist.some(b => hostname.includes(b));
        if (isBlacklisted) {
          updateBadge(tabId, 'OFF', '#EF4444');
          return;
        }

        // Check whitelist (if whitelist is not empty, only work on whitelisted sites)
        if (whitelist.length > 0) {
          const isWhitelisted = whitelist.some(w => hostname.includes(w));
          if (!isWhitelisted) {
            updateBadge(tabId, '--', '#6B7280');
            return;
          }
        }

        // Check link shortener
        const SHORTENER_HOSTS = [
          'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
          'linkvertise.com', 'clk.sh', 'tp.st', 'lr.in', 'rekonise.com',
          'work.ink', 'lootlinks.co', 'megalink.pro', 'linksfire.com',
          'exe.io', 'droplink.co', 'gplinks.co', 'xpshort.com'
        ];
        const isShortener = SHORTENER_HOSTS.some(h => hostname.includes(h));
        if (isShortener) {
          updateBadge(tabId, 'BYPASS', '#F59E0B');
        } else {
          updateBadge(tabId);
        }
      } catch(e) {
        updateBadge(tabId);
      }
    });
  }
});

// Track blocked requests
let requestCounts = {};

if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId >= 0) {
        if (!requestCounts[details.tabId]) requestCounts[details.tabId] = 0;
        requestCounts[details.tabId]++;
      }
    },
    { urls: ['<all_urls>'] }
  );
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get([
      'enabled', 'blockedCounter', 'bypassedSites', 'whitelist', 'blacklist',
      'autoBypassLinks', 'autoDismissCookies', 'autoScroll', 'interceptPopunders',
      'fixBraveLeak', 'fixStorageLeak', 'normalizeAudio', 'normalizeCanvas',
      'hideWebdriver', 'preventWebRTC', 'autoDenyPermissions', 'fakeNetworkBait',
      'clampTimers', 'spoofNavigator', 'screenConsistency'
    ], (res) => {
      res.currentTabBlocked = (sender.tab && requestCounts[sender.tab.id]) || 0;
      sendResponse(res);
    });
    return true;
} else if (message.type === 'TOGGLE_ENABLED') {
    chrome.storage.local.set({ enabled: message.enabled }, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'TOGGLE_ALL_MODULES') {
    // Persist all module settings to true/false in one shot.
    const allSettings = {};
    Object.keys(message.enabledMap || {}).forEach((key) => {
      allSettings[key] = message.enabled;
    });
    chrome.storage.local.set(allSettings, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'TOGGLE_CATEGORY_MODULES') {
    // Persist a category batch of module settings.
    const catSettings = {};
    Object.keys(message.modules || {}).forEach((key) => {
      catSettings[key] = message.modules[key];
    });
    chrome.storage.local.set(catSettings, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'TOGGLE_MODULE') {
    chrome.storage.local.set({ [message.key]: message.value }, () => {
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
    chrome.storage.local.get(['blacklist', 'whitelist'], (res) => {
      try {
        const url = new URL(message.url);
        const hostname = url.hostname;
        const blacklist = res.blacklist || [];
        const whitelist = res.whitelist || [];
        const isBlacklisted = blacklist.some(b => hostname.includes(b));
        const isWhitelisted = whitelist.some(w => hostname.includes(w));
        sendResponse({ isBlacklisted, isWhitelisted, hostname });
      } catch(e) {
        sendResponse({ isBlacklisted: false, isWhitelisted: false, hostname: '' });
      }
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete requestCounts[tabId];
});
