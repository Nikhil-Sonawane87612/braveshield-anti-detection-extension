/**
 * BraveShield Bypass Pro — Service Worker & Auto-Sync Engine
 * Version: synced from manifest.json (single source of truth)
 * Purpose: UA/session-rule synchronization, per-site identity overrides,
 *          auto-update checker, WebRTC privacy policy, and DNR routing.
 */

const GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/manifest.json';

// UA catalog (useragents.js) + resolver (shared/ua-resolve.js, unit-tested
// in tests/ua-resolve.test.mjs) power per-profile User-Agent resolution.
// DNR rule builders live in shared/dnr-rules.js (unit-tested in
// tests/dnr-rules.test.mjs): real Chrome / Firefox / Safari header parity,
// captcha-exclusion merge invariant, rule-ID layout.
try { importScripts('shared/ua-resolve.js'); } catch (_) {}
try { importScripts('shared/dnr-rules.js'); } catch (_) {}
try { importScripts('useragents.js'); } catch (_) {}
// Hardware catalog powers Identity Rotation (DOM-free, importScripts-safe)
try { importScripts('hardware-profiles.js'); } catch (_) {}

function bsRealChromeMajor() {
  try {
    const m = String(navigator.userAgent || '').match(/Chrome\/(\d+)/);
    return m ? m[1] : null;
  } catch (_) { return null; }
}

function bsResolveIdentity(platformKey, browserType) {
  try {
    if (typeof USER_AGENTS !== 'object' || !USER_AGENTS) return null;
    const realMajor = bsRealChromeMajor();
    const resolved = bsResolveUaFromCatalog(USER_AGENTS, platformKey, browserType, realMajor);
    return resolved ? bsResolveBrowserIdentity(browserType || 'brave', resolved) : null;
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Identity Rotation — deterministic per rotation window. The same window always
// yields the same profile (no random churn across service-worker restarts), and
// rotation stays WITHIN the same platform family (win/mac/linux/android/ios) so
// the UA string, Sec-CH-UA headers, platform and hardware remain coherent.
// ─────────────────────────────────────────────────────────────────────────────
function bsStrSeed(str) {
  try {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  } catch (_) { return 0; }
}

function bsRotationPeriodIndex(periodHours) {
  try {
    const h = Math.max(1, Math.min(720, parseInt(periodHours, 10) || 24));
    return Math.floor(Date.now() / (h * 3600000));
  } catch (_) { return 0; }
}

function bsPickRotatedProfile(baseId, periodIndex) {
  try {
    if (typeof HARDWARE_PROFILES_CATALOG === 'undefined' || !Array.isArray(HARDWARE_PROFILES_CATALOG)) return null;
    const fam = String(baseId || '').split('-')[0];
    if (!fam) return null;
    const pool = HARDWARE_PROFILES_CATALOG.filter(p => p && typeof p.id === 'string' && p.id.split('-')[0] === fam);
    if (pool.length === 0) return null;
    return pool[bsStrSeed(fam + ':' + periodIndex) % pool.length].id;
  } catch (_) { return null; }
}

// Keep the DNR session rules + stored resolvedUA maps in sync with the
// active profile and any per-site overrides.
async function bsApplyUASpoof() {
  try {
    const { uaSpoofingEnabled, deviceProfile, customHardwareProfile, browserType, siteProfiles, spoofLocale,
            identityRotationEnabled, identityRotationPeriodHours, rotatedPeriodIndex } =
      await chrome.storage.local.get(['uaSpoofingEnabled', 'deviceProfile', 'customHardwareProfile', 'browserType', 'siteProfiles', 'spoofLocale',
                                      'identityRotationEnabled', 'identityRotationPeriodHours', 'rotatedPeriodIndex']);

    const bt = browserType || 'brave';

    // Identity rotation: skipped for custom profiles; per-site overrides are
    // PINNED identities and never rotate. Content picks the rotated profile up
    // via rotatedDeviceProfile (no DNR change needed — same platform family).
    let effectiveProfile = deviceProfile;
    if (identityRotationEnabled === true && deviceProfile && deviceProfile !== 'custom') {
      const pIdx = bsRotationPeriodIndex(identityRotationPeriodHours);
      const rotated = bsPickRotatedProfile(deviceProfile, pIdx);
      if (rotated) {
        effectiveProfile = rotated;
        if (rotatedPeriodIndex !== pIdx) {
          try { await chrome.storage.local.set({ rotatedDeviceProfile: rotated, rotatedPeriodIndex: pIdx }); } catch (_) {}
        }
      }
    }

    const globalPlatform = bsPlatformKeyForProfile(effectiveProfile, customHardwareProfile);
    const globalResolved = uaSpoofingEnabled === false ? null : bsResolveIdentity(globalPlatform, bt);

    // Per-site overrides resolve their own identity from the override's
    // profile/browserType, falling back to the global settings.
    const bySite = {};
    const overrideRules = [];
    let ruleIdx = 1;
    const overrides = (siteProfiles && typeof siteProfiles === 'object' && !Array.isArray(siteProfiles)) ? siteProfiles : {};
    for (const [domain, prof] of Object.entries(overrides)) {
      try {
        if (domain === '__proto__' || domain === 'constructor' || domain === 'prototype') continue;
        if (!Object.prototype.hasOwnProperty.call(overrides, domain)) continue;
        if (!prof || typeof prof !== 'object') continue;
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(domain)) continue;
        const siteBt = prof.browserType || bt;
        const sitePlatform = prof.deviceProfile
          ? bsPlatformKeyForProfile(prof.deviceProfile, customHardwareProfile)
          : globalPlatform;
        const resolved = uaSpoofingEnabled === false ? null : bsResolveIdentity(sitePlatform, siteBt);
        if (!resolved) continue;
        bySite[domain] = resolved;
        overrideRules.push(bsBuildUaRule(BS_UA_RULE_ID + ruleIdx, 2, resolved, { initiatorDomains: [domain] }));
        ruleIdx++;
      } catch (_) {}
    }

    await chrome.storage.local.set({ resolvedUA: globalResolved, resolvedUABySite: bySite });

    try {
      if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateSessionRules) {
        const existing = await chrome.declarativeNetRequest.getSessionRules();
        const removeIds = existing
          .map(r => r.id)
          .filter(id => id >= BS_UA_RULE_ID && id < BS_UA_RULE_ID_MAX);
        const addRules = globalResolved
          ? [bsBuildUaRule(BS_UA_RULE_ID, 1, globalResolved)].concat(overrideRules)
          : overrideRules;
        const localeRule = spoofLocale && typeof spoofLocale === 'string'
          ? bsBuildLocaleRule(BS_UA_LOCALE_RULE_ID, spoofLocale)
          : null;
        if (localeRule) addRules.push(localeRule);
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: removeIds, addRules });
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

chrome.runtime.onInstalled.addListener((details) => {
  // First-run onboarding wizard
  try {
    if (details && details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }
  } catch (_) {}

  const currentVer = getLocalVersion();
  console.log(`[BraveShield] Service Worker initialized. Version: ${currentVer}`);
  
  chrome.storage.local.get(null, (existing) => {
    const defaults = {
      enabled: true,
      masterEnabled: true,
      unshortenerEnabled: true,
      autoBypassTimers: true,
      gentleTurboEnabled: true,
      turboAllSites: false,
      paywallDefuserEnabled: true,
      bypassAdblockDetection: true,
      domStructureDefuserEnabled: true,
      maskBraveApi: true,
      maskClientHints: true,
      gpcCloakEnabled: true,
      fontEnsembleEnabled: true,
      devtoolsDefuseEnabled: true,
      identityRotationEnabled: false,
      identityRotationPeriodHours: 24,
      reelDwellSeconds: 1,
      reelMaxAutoSeconds: 0,
      customResolvers: [],
      protectedSites: [],
      rotatedDeviceProfile: '',
      webglSpoofingEnabled: true,
      canvasNoiseEnabled: true,
      audioNoiseEnabled: true,
      clientHintsEnabled: true,
      webrtcShieldEnabled: true,
      uaSpoofingEnabled: true,
      browserType: 'brave',
      siteProfiles: {},
      resolvedUABySite: {},
      timezoneSpoofingEnabled: false,
      spoofTimezone: null,
      spoofLocale: null,
      domJitterEnabled: true,
      timerCoarseningEnabled: true,
      mediaDevicesSanitizeEnabled: true,
      speechVoicesSanitizeEnabled: true,
      networkInfoMaskEnabled: true,
      cleanUrlEnabled: true,
      rightClickEnabled: true,
      videoSpeedEnabled: true,
      autoSkipIntrosEnabled: true,
      youtubeAds: true,
      spotifyUnlocked: true,
      twitchShieldEnabled: true,
      instagramReelsAdsEnabled: true,
      instagramAutoScrollEnabled: false,
      youtubeShortsEnabled: true,
      youtubeShortsAutoScroll: false,
      facebookReelsEnabled: true,
      permissionAutoDenyEnabled: true,
      workerParityEnabled: false,
      moduleMatrixMode: 'global',
      deviceProfile: 'win-rtx4090',
      timeSavedSeconds: 0,
      trapsNeutralized: 0,
      directLinksUnlocked: 0,
      whitelist: [],
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

  // Context menu tree — rebuilt on every install/update event (merged here;
  // a second onInstalled listener duplicating this was removed).
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: BS_MENU_PARENT,
        title: 'BraveShield',
        contexts: ['page', 'link', 'video']
      });
      chrome.contextMenus.create({
        id: 'bs-toggle-whitelist',
        parentId: BS_MENU_PARENT,
        title: 'Toggle protection for this site',
        contexts: ['page', 'link', 'video']
      });
      chrome.contextMenus.create({
        id: 'bs-copy-clean-url',
        parentId: BS_MENU_PARENT,
        title: 'Copy cleaned URL (tracking params stripped)',
        contexts: ['page', 'link', 'video']
      });
    });
  } catch (_) {}

  // Setup periodic 6-hour auto-sync alarm + identity-rotation window watcher
  // (checks for a rotation-period rollover every 20 minutes)
  try {
    chrome.alarms.create('BRAVESHIELD_AUTO_SYNC', { periodInMinutes: 360 });
    chrome.alarms.create('BRAVESHIELD_IDENTITY_ROTATE', { periodInMinutes: 20 });
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
      changes.customHardwareProfile !== undefined ||
      changes.browserType !== undefined ||
      changes.spoofLocale !== undefined ||
      changes.identityRotationEnabled !== undefined ||
      changes.identityRotationPeriodHours !== undefined ||
      changes.siteProfiles !== undefined) {
    bsApplyUASpoof();
  }
});

// Periodic Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'BRAVESHIELD_AUTO_SYNC') {
    syncRemoteRulesAndCheckUpdates();
  }
  if (alarm.name === 'BRAVESHIELD_IDENTITY_ROTATE') {
    // Rotation re-resolution is cheap and deterministic: the window index is
    // recomputed; nothing churns unless the period actually rolled over.
    chrome.storage.local.get(['identityRotationEnabled'], (r) => {
      if (r && r.identityRotationEnabled === true) bsApplyUASpoof();
    });
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

// ─────────────────────────────────────────────────────────────────────────────
// Context Menu, Keyboard Shortcut & Per-Tab Badge States
// ─────────────────────────────────────────────────────────────────────────────
const BS_MENU_PARENT = 'bs-root';

function bsStripTracking(urlStr) {
  try {
    const u = new URL(urlStr);
    const params = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
      'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid',
      'mc_eid', 'igshid', 'msclkid', 'yclid'
    ];
    let touched = false;
    for (const p of params) {
      if (u.searchParams.has(p)) { u.searchParams.delete(p); touched = true; }
    }
    return touched ? u.toString() : urlStr;
  } catch (_) {
    return urlStr;
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (!tab || !tab.url) return;
    const hostname = new URL(tab.url).hostname;

    if (info.menuItemId === 'bs-toggle-whitelist') {
      const { whitelist } = await chrome.storage.local.get(['whitelist']);
      const list = Array.isArray(whitelist) ? [...whitelist] : [];
      const idx = list.indexOf(hostname);
      if (idx >= 0) list.splice(idx, 1); else list.push(hostname);
      await chrome.storage.local.set({ whitelist: list });
      bsUpdateTabBadge(tab.id);
    } else if (info.menuItemId === 'bs-copy-clean-url') {
      const cleaned = bsStripTracking(tab.url);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => navigator.clipboard.writeText(text),
        args: [cleaned]
      });
      try { chrome.action.setBadgeText({ tabId: tab.id, text: 'COPIED' }); } catch (_) {}
      setTimeout(() => { bsUpdateTabBadge(tab.id); }, 1200);
    }
  } catch (_) {}
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-master-shield') return;
  try {
    const { masterEnabled, enabled } = await chrome.storage.local.get(['masterEnabled', 'enabled']);
    const next = !(masterEnabled !== false && enabled !== false);
    await chrome.storage.local.set({ masterEnabled: next, enabled: next });
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) bsUpdateTabBadge(t.id);
  } catch (_) {}
});

async function bsUpdateTabBadge(tabId) {
  if (typeof tabId !== 'number' || tabId < 0) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || !/^https?:/i.test(tab.url)) return;
    const hostname = new URL(tab.url).hostname.toLowerCase();
    const { masterEnabled, whitelist } = await chrome.storage.local.get(['masterEnabled', 'whitelist']);
    const isWhitelisted = Array.isArray(whitelist) &&
      whitelist.some(d => hostname === d || hostname.endsWith('.' + d));

    if (masterEnabled === false) {
      await chrome.action.setBadgeText({ tabId, text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#ef4444' });
    } else if (isWhitelisted) {
      await chrome.action.setBadgeText({ tabId, text: 'WL' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#f59e0b' });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
    }
  } catch (_) {}
}

chrome.tabs.onActivated.addListener((info) => bsUpdateTabBadge(info.tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' || changeInfo.url) bsUpdateTabBadge(tabId);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.masterEnabled !== undefined || changes.whitelist !== undefined) {
    chrome.tabs.query({}, (tabs) => { for (const t of tabs) bsUpdateTabBadge(t.id); });
  }
});
