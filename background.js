/**
 * BraveShield Bypass Pro — Service Worker & Auto-Sync Engine
 * Version: 6.0.1
 * Purpose: Dynamic rule synchronization, auto-update checker, WebRTC privacy policy, and DNR routing.
 */

const GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/manifest.json';

// UA catalog (useragents.js) powers per-profile User-Agent resolution
try { importScripts('useragents.js'); } catch (_) {}

const BS_UA_RULE_ID = 424242;
const BS_UA_PLATFORM_BUCKETS = {
  win32: 'win', macintel: 'mac', 'linux x86_64': 'linux',
  'linux armv81': 'android', iphone: 'iphone', ipad: 'android_tablet'
};

function bsRealChromeMajor() {
  try {
    const m = /Chrome\/(\d+)/.exec(navigator.userAgent || '');
    return m ? m[1] : null;
  } catch (_) { return null; }
}

function bsResolveUA(platformKey) {
  try {
    if (typeof USER_AGENTS !== 'object' || !USER_AGENTS) return null;
    const bucket = BS_UA_PLATFORM_BUCKETS[String(platformKey || 'win32').toLowerCase()] || 'win';
    const prefix = 'chrome_' + bucket;
    let best = null;
    let bestVer = -1;
    for (const [key, val] of Object.entries(USER_AGENTS)) {
      if (!key.startsWith(prefix)) continue;
      const ver = parseInt(key.slice(prefix.length + 1, key.indexOf('_', prefix.length + 1)), 10);
      const v = Number.isFinite(ver) ? ver : parseInt(key.split('_')[1], 10);
      if (Number.isFinite(v) && v > bestVer) { bestVer = v; best = val; }
    }
    if (!best) return null;

    // Re-base the spoofed UA onto the REAL engine major so JS/TLS behavior
    // matches what servers can measure — a stale spoofed major is itself a tell.
    const realMajor = bsRealChromeMajor();
    let ua = best.ua;
    if (realMajor) {
      ua = ua.replace(/Chrome\/\d+(\.\d+\.\d+\.\d+)?/, `Chrome/${realMajor}.0.0.0`);
      if (Array.isArray(best.brands)) {
        best.brands = best.brands.map(b => (b.brand === 'Google Chrome' || b.brand === 'Chromium')
          ? { brand: b.brand, version: String(realMajor) } : b);
      }
    }
    return { ua, brands: best.brands || [], platform: best.platform, mobile: !!best.mobile, platformVersion: best.platformVersion || '' };
  } catch (_) {
    return null;
  }
}

// Keep the DNR session rule + stored resolvedUA in sync with the active profile
async function bsApplyUASpoof() {
  try {
    const { uaSpoofingEnabled, deviceProfile, customHardwareProfile } =
      await chrome.storage.local.get(['uaSpoofingEnabled', 'deviceProfile', 'customHardwareProfile']);

    let platformKey = deviceProfile === 'custom'
      ? (customHardwareProfile && customHardwareProfile.platform) || 'Win32'
      : null;

    // Derive platform from the profile id prefix
    if (!platformKey) {
      const id = String(deviceProfile || '');
      if (id.startsWith('win-')) platformKey = 'Win32';
      else if (id.startsWith('mac-')) platformKey = 'MacIntel';
      else if (id.startsWith('linux-')) platformKey = 'Linux x86_64';
      else if (id.startsWith('android-') || id.startsWith('pixel-')) platformKey = 'Linux armv81';
      else if (id.startsWith('ios-') || id.startsWith('ipad-')) platformKey = 'iPhone';
      else platformKey = 'Win32';
    }

    const resolved = uaSpoofingEnabled === false ? null : bsResolveUA(platformKey);
    await chrome.storage.local.set({ resolvedUA: resolved });

    try {
      if (resolved && chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateSessionRules) {
        await chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [BS_UA_RULE_ID],
          addRules: [{
            id: BS_UA_RULE_ID,
            priority: 1,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                { header: 'User-Agent', operation: 'set', value: resolved.ua },
                { header: 'Sec-CH-UA', operation: 'set', value: JSON.stringify(resolved.brands) },
                { header: 'Sec-CH-UA-Mobile', operation: 'set', value: resolved.mobile ? '?1' : '?0' },
                { header: 'Sec-CH-UA-Platform', operation: 'set', value: `"${resolved.platform}"` }
              ]
            },
            condition: {
              urlFilter: '*',
              resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'stylesheet', 'image', 'font', 'media', 'websocket', 'other']
            }
          }]
        });
      } else if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateSessionRules) {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [BS_UA_RULE_ID], addRules: [] });
      }
    } catch (_) {}
  } catch (_) {}
}

function getLocalVersion() {
  try {
    return chrome.runtime.getManifest().version || 'unknown';
  } catch (_) {
    return 'unknown';
  }
}

// Configure WebRTC IP policy
function enforceWebRTCPrivacy(enabled) {
  try {
    if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
      const policy = enabled ? 'disable_non_proxied_udp' : 'default';
      chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: policy });
    }
  } catch (_) {}
}

chrome.runtime.onInstalled.addListener(() => {
  const currentVer = getLocalVersion();
  console.log(`[BraveShield] Service Worker initialized. Version: ${currentVer}`);
  
  chrome.storage.local.get(null, (existing) => {
    const defaults = {
      enabled: true,
      masterEnabled: true,
      autoBypassLinks: true,
      unshortenerEnabled: true,
      autoBypassTimers: true,
      turboAllSites: false,
      paywallDefuserEnabled: true,
      bypassAdblockDetection: true,
      maskBraveApi: true,
      maskClientHints: true,
      normalizeWebgl: true,
      canvasNoiseEnabled: true,
      audioNoiseEnabled: true,
      webglSpoofingEnabled: true,
      clientHintsEnabled: true,
      webrtcShieldEnabled: true,
      uaSpoofingEnabled: true,
      timezoneSpoofingEnabled: false,
      spoofTimezone: null,
      spoofLocale: null,
      domJitterEnabled: true,
      timerCoarseningEnabled: true,
      mediaDevicesSanitizeEnabled: true,
      speechVoicesSanitizeEnabled: true,
      cleanUrlEnabled: true,
      rightClickEnabled: true,
      videoSpeedEnabled: true,
      autoSkipIntrosEnabled: true,
      youtubeAds: true,
      spotifyUnlocked: true,
      twitchShieldEnabled: true,
      deviceProfile: 'win-rtx4090',
      timeSavedSeconds: 0,
      trapsNeutralized: 0,
      directLinksUnlocked: 0,
      whitelist: [],
      blacklist: [],
      version: currentVer,
      lastSyncTime: Date.now(),
      remoteSyncStatus: 'synced',
      updateAvailable: false,
      remoteVersion: currentVer
    };

    const toSet = {};
    for (const [k, v] of Object.entries(defaults)) {
      if (existing[k] === undefined) {
        toSet[k] = v;
      }
    }
    toSet.version = currentVer;

    chrome.storage.local.set(toSet, () => {
      enforceWebRTCPrivacy(existing.webrtcShieldEnabled !== false);
      bsApplyUASpoof();
    });
  });

  // Setup periodic 6-hour auto-sync alarm
  try {
    chrome.alarms.create('BRAVESHIELD_AUTO_SYNC', { periodInMinutes: 360 });
  } catch (_) {}

  // Run initial sync and update check
  syncRemoteRulesAndCheckUpdates();
});

// Re-assert UA spoofing session rules after browser restarts
chrome.runtime.onStartup.addListener(() => {
  bsApplyUASpoof();
});

// Watch storage changes to apply WebRTC policy dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.webrtcShieldEnabled !== undefined) {
    enforceWebRTCPrivacy(changes.webrtcShieldEnabled.newValue !== false);
  }
  if (changes.uaSpoofingEnabled !== undefined ||
      changes.deviceProfile !== undefined ||
      changes.customHardwareProfile !== undefined) {
    bsApplyUASpoof();
  }
});

// Periodic Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'BRAVESHIELD_AUTO_SYNC') {
    syncRemoteRulesAndCheckUpdates();
  }
});

// Message Listener for Popup/Options Actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRIGGER_SYNC') {
    syncRemoteRulesAndCheckUpdates().then((result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Notify-only update checker.
// Chrome Web Store remote-hosted-code compliance: NO rules or code are ever
// fetched at runtime. DNR rules ship statically via rules.json; this only
// compares the published manifest version and badges the toolbar.
async function syncRemoteRulesAndCheckUpdates() {
  try {
    const currentVer = getLocalVersion();
    let updateFound = false;
    let remoteVer = currentVer;

    try {
      const manifestRes = await fetch(GITHUB_MANIFEST_URL, { cache: 'no-cache' });
      if (manifestRes && manifestRes.ok) {
        const manifest = await manifestRes.json();
        if (manifest.version) {
          remoteVer = manifest.version;
          if (isNewerVersion(remoteVer, currentVer)) {
            updateFound = true;
            try {
              chrome.action.setBadgeText({ text: 'NEW' });
              chrome.action.setBadgeBackgroundColor({ color: '#00f076' });
            } catch (_) {}
          } else {
            try { chrome.action.setBadgeText({ text: '' }); } catch (_) {}
          }
        }
      }
    } catch (_) {}

    const syncData = {
      lastSyncTime: Date.now(),
      remoteSyncStatus: 'synced',
      remoteVersion: remoteVer,
      updateAvailable: updateFound,
      version: currentVer
    };
    await chrome.storage.local.set(syncData);
    return { success: true, ...syncData };
  } catch (err) {
    console.warn('[BraveShield] Update check error:', err);
    await chrome.storage.local.set({ remoteSyncStatus: 'offline' });
    return { success: false, error: err.message };
  }
}

function isNewerVersion(remote, local) {
  const rParts = (remote || '').split('.').map(Number);
  const lParts = (local || '').split('.').map(Number);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}
