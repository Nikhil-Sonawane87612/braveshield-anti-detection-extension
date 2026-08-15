/**
 * BraveShield Bypass Pro — Service Worker & Auto-Sync Engine
 * Version: 5.3.0
 * Purpose: Dynamic rule synchronization from GitHub, auto-update checker, and DeclarativeNetRequest routing.
 */

const GITHUB_RULES_URL = 'https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/rules.json';
const GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/manifest.json';
const CURRENT_VERSION = '5.3.0';

chrome.runtime.onInstalled.addListener(() => {
  console.log(`[BraveShield] Service Worker initialized. Version: ${CURRENT_VERSION}`);
  
  chrome.storage.local.set({
    enabled: true,
    masterEnabled: true,
    autoBypassLinks: true,
    autoBypassTimers: true,
    bypassAdblockDetection: true,
    maskBraveApi: true,
    maskClientHints: true,
    normalizeWebgl: true,
    normalizeCanvas: true,
    normalizeAudio: true,
    hideWebdriver: true,
    preventWebRTC: true,
    autoDenyPermissions: true,
    clampTimers: true,
    youtubeAds: true,
    spotifyUnlocked: true,
    videoTurboAdSpeed: true,
    blockedCounter: 0,
    whitelist: [],
    blacklist: [],
    version: CURRENT_VERSION,
    lastSyncTime: Date.now(),
    remoteSyncStatus: 'synced',
    updateAvailable: false,
    remoteVersion: CURRENT_VERSION
  });

  // Setup periodic 6-hour auto-sync alarm
  try {
    chrome.alarms.create('BRAVESHIELD_AUTO_SYNC', { periodInMinutes: 360 });
  } catch (_) {}

  // Run initial sync and update check
  syncRemoteRulesAndCheckUpdates();
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

// Auto-Sync and Auto-Update Function
async function syncRemoteRulesAndCheckUpdates() {
  try {
    const [rulesRes, manifestRes] = await Promise.all([
      fetch(GITHUB_RULES_URL, { cache: 'no-cache' }).catch(() => null),
      fetch(GITHUB_MANIFEST_URL, { cache: 'no-cache' }).catch(() => null)
    ]);

    let updateFound = false;
    let remoteVer = CURRENT_VERSION;

    if (manifestRes && manifestRes.ok) {
      const manifest = await manifestRes.json();
      if (manifest.version) {
        remoteVer = manifest.version;
        if (isNewerVersion(remoteVer, CURRENT_VERSION)) {
          updateFound = true;
          chrome.action.setBadgeText({ text: 'NEW' });
          chrome.action.setBadgeBackgroundColor({ color: '#00f076' });
        }
      }
    }

    if (rulesRes && rulesRes.ok) {
      const rules = await rulesRes.json();
      if (Array.isArray(rules) && rules.length > 0 && chrome.declarativeNetRequest) {
        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = oldRules.map(r => r.id);
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
          addRules: rules
        });
      }
    }

    const syncData = {
      lastSyncTime: Date.now(),
      remoteSyncStatus: 'synced',
      remoteVersion: remoteVer,
      updateAvailable: updateFound
    };
    await chrome.storage.local.set(syncData);
    return { success: true, ...syncData };
  } catch (err) {
    console.warn('[BraveShield] Sync error:', err);
    await chrome.storage.local.set({ remoteSyncStatus: 'offline' });
    return { success: false, error: err.message };
  }
}

function isNewerVersion(remote, local) {
  const rParts = remote.split('.').map(Number);
  const lParts = local.split('.').map(Number);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}
