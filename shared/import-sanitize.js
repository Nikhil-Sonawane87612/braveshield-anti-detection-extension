/**
 * BraveShield Bypass Pro — Backup Import Sanitizer (shared)
 * Loaded by the options page (classic <script>) and node:test.
 * Pure functions only: no chrome.* APIs.
 *
 * Threat model: the imported backup JSON is fully attacker-controlled (a
 * hostile backup can be crafted by any web page that gets the user to hit
 * "Import"). Everything passes through strict key/type allowlists, domain
 * validation, length caps and clamps. Unknown keys are dropped entirely —
 * storage is only ever written with values this module produced.
 *
 * `bsSanitizeImport(parsed, matrixKeys)` — matrixKeys is the per-site module
 * allowlist (Set or array); it is injected by the caller so the list of
 * module keys stays single-sourced (options.js BS_MATRIX_MODULES) instead of
 * drifting with a third copy here. Omit it and siteProfiles module matrices
 * are rejected wholesale (safe default).
 */

'use strict';

// deviceProfile intentionally NOT here: it has its own stricter ≤64 rule below.
const BS_IMPORT_STRINGS = new Set(['spoofTimezone', 'spoofLocale', 'browserType']);
const BS_IMPORT_BOOLEANS = new Set([
  'enabled', 'masterEnabled', 'autoBypassTimers', 'gentleTurboEnabled', 'turboAllSites',
  'unshortenerEnabled', 'paywallDefuserEnabled', 'bypassAdblockDetection', 'workerParityEnabled',
  'maskBraveApi', 'maskClientHints', 'clientHintsEnabled',
  'webglSpoofingEnabled', 'canvasNoiseEnabled', 'audioNoiseEnabled',
  'webrtcShieldEnabled', 'domJitterEnabled', 'timerCoarseningEnabled',
  'mediaDevicesSanitizeEnabled', 'speechVoicesSanitizeEnabled', 'batteryMaskEnabled',
  'networkInfoMaskEnabled', 'screenNormalizationEnabled', 'uaSpoofingEnabled', 'timezoneSpoofingEnabled',
  'webgpuMaskingEnabled', 'fontEnumMaskingEnabled', 'cleanUrlEnabled',
  'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
  'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled',
  'gpcCloakEnabled', 'domStructureDefuserEnabled',
  'instagramReelsAdsEnabled', 'instagramAutoScrollEnabled',
  'youtubeShortsEnabled', 'youtubeShortsAutoScroll', 'facebookReelsEnabled',
  'permissionAutoDenyEnabled', 'fontEnsembleEnabled', 'identityRotationEnabled',
  'devtoolsDefuseEnabled'
]);
const BS_IMPORT_NUMBERS = new Set(['timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked']);
// Live-behavior numeric settings carry much stricter ranges than telemetry
// counters — an imported backup must not smuggle absurd values into gates.
const BS_IMPORT_CLAMPED_NUMBERS = {
  reelDwellSeconds: [0, 10],
  reelMaxAutoSeconds: [0, 86400],
  identityRotationPeriodHours: [1, 720]
};
const BS_IMPORT_BROWSERTYPES = ['brave', 'chrome', 'firefox', 'safari'];
const BS_IMPORT_RESOLVER_ACTIONS = ['click', 'redirect', 'turbo'];

// Deliberately self-contained (matches options.js bsIsValidDomain): this
// module must stay independent of every consumer's closures.
const BS_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

function bsIsValidImportDomain(val) {
  return typeof val === 'string' && val.length <= 253 && BS_DOMAIN_RE.test(val);
}

// One user-authored resolver rule: { pattern, action, value, enabled? }
function bsSanitizeResolverRule(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const pattern = typeof raw.pattern === 'string' ? raw.pattern.trim().toLowerCase().slice(0, 200) : '';
  // Missing value is fine (turbo needs none); a NON-STRING value is malformed
  // attacker-controlled input → the whole rule is dropped.
  let value = '';
  if (typeof raw.value === 'string') value = raw.value.trim().slice(0, 300);
  else if (raw.value !== undefined && raw.value !== null) return null;
  if (!pattern || !BS_IMPORT_RESOLVER_ACTIONS.includes(raw.action)) return null;
  const rule = { pattern, action: raw.action, value };
  if (raw.enabled === false) rule.enabled = false;
  return rule;
}

function bsSanitizeImport(parsed, matrixKeys) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const clean = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    if (BS_IMPORT_STRINGS.has(k) && typeof v === 'string' && v.length <= 128) clean[k] = v;
    else if (BS_IMPORT_BOOLEANS.has(k) && typeof v === 'boolean') clean[k] = v;
    else if (BS_IMPORT_NUMBERS.has(k) && typeof v === 'number' && Number.isFinite(v)) {
      clean[k] = Math.max(0, Math.min(9_999_999, Math.floor(v)));
    }
    else if (Object.prototype.hasOwnProperty.call(BS_IMPORT_CLAMPED_NUMBERS, k) &&
             typeof v === 'number' && Number.isFinite(v)) {
      const [lo, hi] = BS_IMPORT_CLAMPED_NUMBERS[k];
      clean[k] = Math.max(lo, Math.min(hi, Math.floor(v)));
    }
  }
  if (clean.browserType && !BS_IMPORT_BROWSERTYPES.includes(clean.browserType)) {
    delete clean.browserType;
  }
  if (typeof parsed.deviceProfile === 'string' && parsed.deviceProfile.length <= 64) {
    clean.deviceProfile = parsed.deviceProfile;
  }
  if (Array.isArray(parsed.whitelist)) {
    clean.whitelist = [...new Set(parsed.whitelist.filter(bsIsValidImportDomain))].slice(0, 500);
  }
  // Protected Sites: validated domain list (deny-list, never bypass these).
  if (Array.isArray(parsed.protectedSites)) {
    clean.protectedSites = [...new Set(parsed.protectedSites.filter(bsIsValidImportDomain))].slice(0, 300);
  }
  // Custom Resolver Rules: shape-checked host/action/value triples.
  if (Array.isArray(parsed.customResolvers)) {
    const rules = [];
    for (const raw of parsed.customResolvers.slice(0, 20)) {
      const r = bsSanitizeResolverRule(raw);
      if (r) rules.push(r);
    }
    clean.customResolvers = rules;
  }
  // Per-site overrides: validated domain keys with whitelisted sub-shapes.
  // The `modules` matrix must survive restore — matrixKeys injects the
  // allowlist so module keys never drift from the options-page list.
  if (parsed.siteProfiles && typeof parsed.siteProfiles === 'object' && !Array.isArray(parsed.siteProfiles)) {
    const allowed = (matrixKeys instanceof Set) ? matrixKeys : new Set(Array.isArray(matrixKeys) ? matrixKeys : []);
    const cleanSites = {};
    for (const [domain, prof] of Object.entries(parsed.siteProfiles).slice(0, 500)) {
      if (domain === '__proto__' || domain === 'constructor' || domain === 'prototype') continue;
      if (!bsIsValidImportDomain(domain) || !prof || typeof prof !== 'object' || Array.isArray(prof)) continue;
      const entry = {};
      if (typeof prof.deviceProfile === 'string' && prof.deviceProfile.length <= 64) entry.deviceProfile = prof.deviceProfile;
      if (BS_IMPORT_BROWSERTYPES.includes(prof.browserType)) entry.browserType = prof.browserType;
      if (prof.modules && typeof prof.modules === 'object' && !Array.isArray(prof.modules)) {
        const mods = {};
        for (const [mk, mv] of Object.entries(prof.modules).slice(0, 64)) {
          if (allowed.has(mk) && typeof mv === 'boolean') mods[mk] = mv;
        }
        if (Object.keys(mods).length > 0) entry.modules = mods;
      }
      // A modules-only entry is still a valid override (matrix-only sites).
      if (Object.keys(entry).length > 0) cleanSites[domain] = entry;
    }
    clean.siteProfiles = cleanSites;
  }
  if (parsed.customHardwareProfile && typeof parsed.customHardwareProfile === 'object' && !Array.isArray(parsed.customHardwareProfile)) {
    const c = parsed.customHardwareProfile;
    try {
      clean.customHardwareProfile = {
        platform: String(c.platform ?? 'Win32').slice(0, 32),
        vendor: String(c.vendor ?? '').slice(0, 128),
        renderer: String(c.renderer ?? '').slice(0, 256),
        concurrency: Math.max(1, Math.min(256, parseInt(c.concurrency, 10) || 16)),
        memory: Math.max(1, Math.min(8, parseInt(c.memory, 10) || 8)),
        devicePixelRatio: Math.max(1, Math.min(4, parseFloat(c.devicePixelRatio) || 1)),
        screen: {
          width: Math.max(320, Math.min(7680, parseInt(c.screen?.width, 10) || 1920)),
          height: Math.max(240, Math.min(4320, parseInt(c.screen?.height, 10) || 1080)),
          colorDepth: Math.max(16, Math.min(30, parseInt(c.screen?.colorDepth, 10) || 24))
        }
      };
    } catch (_) { /* malformed custom profile never blocks the rest */ }
  }
  return clean;
}

// Node test hook (browser-safe: `module` is undefined in classic page scripts)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BS_IMPORT_STRINGS,
    BS_IMPORT_BOOLEANS,
    BS_IMPORT_NUMBERS,
    BS_IMPORT_CLAMPED_NUMBERS,
    BS_IMPORT_BROWSERTYPES,
    BS_IMPORT_RESOLVER_ACTIONS,
    bsIsValidImportDomain,
    bsSanitizeResolverRule,
    bsSanitizeImport
  };
}
