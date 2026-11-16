/**
 * BraveShield Bypass Pro — UA Catalog Resolver & Browser Identity (shared)
 * Loaded by the background service worker (importScripts) and node:test.
 * Pure data + pure functions only: no chrome.* APIs.
 *
 * Catalog key format: "chrome_<version>_<bucket>" (e.g. chrome_131_win,
 * chrome_120_android_tablet). The old resolver prefix-matched
 * "chrome_<bucket>" and never matched anything, silently disabling UA
 * spoofing end-to-end — keep bsParseUaCatalogKey covered by tests.
 */

'use strict';

// platformKey (from device profile) → UA catalog bucket
const BS_UA_PLATFORM_BUCKETS = {
  win32: 'win', macintel: 'mac', 'linux x86_64': 'linux',
  'linux armv81': 'android', iphone: 'iphone', ipad: 'android_tablet'
};

// Non-Chrome identity UA templates per bucket. Safari is only valid on
// Apple buckets; other buckets fall back to mac.
const BS_UA_TEMPLATES = {
  firefox: {
    win:     { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0', platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
    mac:     { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0', platform: 'macOS', mobile: false, platformVersion: '10.15.7' },
    linux:   { ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0', platform: 'Linux', mobile: false, platformVersion: '6.5.0' },
    android: { ua: 'Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/20100101 Firefox/128.0', platform: 'Android', mobile: true, platformVersion: '14.0.0' }
  },
  safari: {
    mac:    { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', platform: 'macOS', mobile: false, platformVersion: '13.6.1' },
    iphone: { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iOS', mobile: true, platformVersion: '17.0' },
    ipad:   { ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPadOS', mobile: true, platformVersion: '17.0' }
  }
};

const BS_BROWSER_IDENTITIES = {
  brave:   { vendor: 'Google Inc.', hasChrome: true,  uaBrand: 'Google Chrome', stripBrave: true },
  chrome:  { vendor: 'Google Inc.', hasChrome: true,  uaBrand: 'Google Chrome', stripBrave: false },
  firefox: { vendor: '',             hasChrome: false, uaBrand: 'Firefox',       stripBrave: false },
  safari:  { vendor: 'Apple Computer, Inc.', hasChrome: false, uaBrand: 'Safari', stripBrave: false }
};

/** Parse "chrome_<version>_<bucket>" — bucket itself may contain underscores. */
function bsParseUaCatalogKey(key) {
  if (typeof key !== 'string' || !key.startsWith('chrome_')) return null;
  const rest = key.slice('chrome_'.length);
  const us = rest.indexOf('_');
  if (us <= 0) return null;
  const version = parseInt(rest.slice(0, us), 10);
  if (!Number.isFinite(version)) return null;
  return { version, bucket: rest.slice(us + 1) };
}

/**
 * Derive Sec-CH-UA-Model from the UA string itself — guarantees header/UA
 * coherence by construction (no per-entry data drift). Returns '' when the
 * device withholds its model (generic "K" Form, Firefox-on-Android) or on
 * desktop, in which case the DNR layer must REMOVE the Model header — an
 * empty value is not a valid model.
 */
function bsDeriveUaModel(ua, platform) {
  try {
    const s = String(ua || '');
    const plat = String(platform || '');
    if (plat === 'iOS' || plat === 'iPadOS') {
      if (/iPhone/i.test(s)) return 'iPhone';
      if (/iPad/i.test(s)) return 'iPad';
      return '';
    }
    if (plat === 'Android') {
      // Model is the third parenthesis component: "(Linux; Android 15; Pixel 9 Pro)"
      const m = s.match(/\((?:Linux; )?Android [^;)]+; ?([^;)]+)\)/);
      if (!m) return '';
      const model = m[1].trim();
      if (!model || model === 'K' || /^wv$/i.test(model)) return '';
      return model;
    }
    return '';
  } catch (_) {
    return '';
  }
}

/** Pick the highest-version catalog entry for a bucket. */
function bsPickLatestUa(catalog, bucket) {
  let best = null;
  let bestVer = -1;
  for (const [key, val] of Object.entries(catalog || {})) {
    const parsed = bsParseUaCatalogKey(key);
    if (!parsed || parsed.bucket !== bucket) continue;
    if (parsed.version > bestVer) { bestVer = parsed.version; best = val; }
  }
  return best;
}

/** Map a device profile id / custom platform to a UA catalog bucket key. */
function bsPlatformKeyForProfile(deviceProfile, customProfile) {
  if (deviceProfile === 'custom') {
    const raw = customProfile && customProfile.platform ? String(customProfile.platform).trim() : '';
    const allowed = ['Win32', 'MacIntel', 'Linux x86_64', 'Linux armv81', 'iPhone', 'iPad'];
    if (allowed.includes(raw)) return raw;
    // Normalize common variants (e.g. "win32 ", "Linux aarch64")
    const lower = raw.toLowerCase();
    if (lower === 'win32') return 'Win32';
    if (lower === 'macintel') return 'MacIntel';
    if (lower === 'linux x86_64') return 'Linux x86_64';
    if (lower === 'linux armv81' || lower === 'linux aarch64') return 'Linux armv81';
    if (lower === 'iphone') return 'iPhone';
    if (lower === 'ipad') return 'iPad';
    return 'Win32';
  }
  const id = String(deviceProfile || '');
  if (id.startsWith('win-')) return 'Win32';
  if (id.startsWith('mac-')) return 'MacIntel';
  if (id.startsWith('linux-')) return 'Linux x86_64';
  if (id.startsWith('android-') || id.startsWith('pixel-')) return 'Linux armv81';
  if (id.startsWith('ios-') || id.startsWith('ipad-')) return 'iPhone';
  return 'Win32';
}

/**
 * Resolve a full UA descriptor from the catalog.
 * realMajor re-bases the spoofed Chrome major onto the real engine major so
 * JS/TLS behavior matches what servers can measure. Returns null when the
 * catalog has no entry for the bucket.
 */
function bsResolveUaFromCatalog(catalog, platformKey, browserType, realMajor) {
  try {
    if (!catalog || typeof catalog !== 'object') return null;
    const bucket = BS_UA_PLATFORM_BUCKETS[String(platformKey || 'win32').trim().toLowerCase()] || 'win';
    const best = bsPickLatestUa(catalog, bucket);
    if (!best) return null;

    // Copy brands so the shared catalog object is never mutated.
    let ua = best.ua;
    let brands = Array.isArray(best.brands)
      ? best.brands.map(b => ({ brand: b.brand, version: b.version }))
      : [];

    if (realMajor) {
      ua = ua.replace(/Chrome\/\d+(\.\d+\.\d+\.\d+)?/, `Chrome/${realMajor}.0.0.0`);
      brands = brands.map(b => (b.brand === 'Google Chrome' || b.brand === 'Chromium')
        ? { brand: b.brand, version: String(realMajor) } : b);
    }

    // Browser-type UA override (Firefox/Safari use non-Chrome UA strings)
    const bt = browserType || 'brave';
    if ((bt === 'firefox' || bt === 'safari') && BS_UA_TEMPLATES[bt]) {
      let pk = bucket;
      // iPad hardware profiles map to the 'android_tablet' bucket; Safari has
      // no such template, so route it to the dedicated iPad one instead of
      // silently falling all the way back to the Mac template.
      if (bt === 'safari' && !(pk in BS_UA_TEMPLATES.safari)) {
        pk = (pk === 'android_tablet' && 'ipad' in BS_UA_TEMPLATES.safari) ? 'ipad' : 'mac';
      } else if (bt === 'firefox' && !(pk in BS_UA_TEMPLATES.firefox)) {
        pk = 'mac';
      }
      const tpl = BS_UA_TEMPLATES[bt][pk];
      if (tpl) {
        ua = tpl.ua;
        brands = [];
        return { ua, brands, platform: tpl.platform, mobile: !!tpl.mobile, platformVersion: tpl.platformVersion || '', model: bsDeriveUaModel(ua, tpl.platform) };
      }
    }

    return { ua, brands, platform: best.platform, mobile: !!best.mobile, platformVersion: best.platformVersion || '', model: (typeof best.model === 'string') ? best.model : bsDeriveUaModel(ua, best.platform) };
  } catch (_) {
    return null;
  }
}

/** Re-base brands/vendor onto the selected browser identity. */
function bsResolveBrowserIdentity(browserType, resolvedUA) {
  const id = BS_BROWSER_IDENTITIES[browserType] || BS_BROWSER_IDENTITIES.brave;
  const out = Object.assign({}, resolvedUA);
  if (Array.isArray(out.brands)) {
    out.brands = out.brands.map(b => {
      if (b.brand === 'Google Chrome' || b.brand === 'Chromium' || b.brand === 'Brave') {
        return { brand: id.uaBrand, version: b.version };
      }
      return b;
    });
  }
  out.vendor = id.vendor;
  out.hasChrome = id.hasChrome;
  out.stripBrave = id.stripBrave;
  // Chrome-like identities send Client Hints; Firefox/Safari never do.
  out.chromeLike = id.hasChrome;
  return out;
}

// Node test hook (browser-safe: `module` is undefined in the service worker)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BS_UA_PLATFORM_BUCKETS,
    BS_UA_TEMPLATES,
    BS_BROWSER_IDENTITIES,
    bsParseUaCatalogKey,
    bsPickLatestUa,
    bsPlatformKeyForProfile,
    bsResolveUaFromCatalog,
    bsResolveBrowserIdentity,
    bsDeriveUaModel
  };
}
