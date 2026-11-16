/**
 * BraveShield Bypass Pro — DNR Rule Builders (shared)
 * Loaded by the background service worker (importScripts) and node:test.
 * Pure data + pure functions only: no chrome.* APIs — callers pass rule IDs
 * and receive declarativeNetRequest rule objects.
 *
 * Invariants (see tests/dnr-rules.test.mjs):
 *  - Base session-rule IDs start at 424242; the locale rule lives at
 *    BASE + 900, clear of the per-site override range (≥500 override rules).
 *  - Captcha hosts must NEVER have headers touched — reCAPTCHA fails with
 *    "Could not connect" if UA is spoofed inside its frame. Builders merge
 *    (never replace) the captcha exclusions so an override condition cannot
 *    drop them.
 *  - Firefox/Safari identities remove all Client Hints instead of forging
 *    flavor values, and never get a Sec-CH-UA-Model header.
 */

'use strict';

const BS_UA_RULE_ID = 424242;
const BS_UA_RULE_ID_MAX = BS_UA_RULE_ID + 1000;
// Locale rule slot kept clear of the override range (≥500 per-site rules).
const BS_UA_LOCALE_RULE_ID = BS_UA_RULE_ID + 900;
const BS_UA_RESOURCE_TYPES = ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'stylesheet', 'image', 'font', 'media', 'websocket', 'other'];

// Captcha hosts must NEVER have headers touched — reCAPTCHA fails with "Could not connect" if UA is spoofed inside its frame
const BS_CAPTCHA_EXCLUDED_INITIATORS = [
  'recaptcha.net', 'recaptcha.google.com', 'www.recaptcha.net',
  'gstatic.com', 'google.com', 'challenges.cloudflare.com',
  'hcaptcha.com', 'arkoselabs.com', 'geetest.com'
];
const BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS = [
  'recaptcha.net', 'gstatic.com', 'google.com', 'challenges.cloudflare.com'
];

function bsBuildUaRule(id, priority, resolved, extraCondition) {
  const requestHeaders = [{ header: 'User-Agent', operation: 'set', value: resolved.ua }];
  if (resolved.chromeLike !== false) {
    const chUaValue = Array.isArray(resolved.brands) && resolved.brands.length
      ? resolved.brands.map(b => `"${String(b.brand).replace(/"/g, '')}";v="${String(b.version).replace(/"/g,'')}"`).join(', ')
      : '"Chromium";v="131", "Not_A Brand";v="99"';
    // Full-Version-List mirrors the brands list with full x.y.z.w versions.
    // Real Chrome ALWAYS sends it — a missing header is detectable — and the
    // platform version must match what getHighEntropyValues('platformVersion')
    // reports in the page (inject.js serves the same resolved value).
    const chFullList = Array.isArray(resolved.brands) && resolved.brands.length
      ? resolved.brands.map(b => `"${String(b.brand).replace(/"/g, '')}";v="${String(b.version).replace(/"/g, '').split('.')[0]}.0.0.0"`).join(', ')
      : '"Chromium";v="131.0.0.0", "Not_A Brand";v="99.0.0.0"';
    const chPlatformVersion = String(resolved.platformVersion || '10.0.0');
    // Sec-CH-UA-Model: real Chrome sends it for phones/tablets with the device
    // model (derived from the UA for coherence) and does NOT send it on
    // desktop. An Android "K" device withholds its model → header removed.
    const chModel = String(resolved.model || '').trim();
    if (resolved.mobile === true && chModel) {
      requestHeaders.push({ header: 'Sec-CH-UA-Model', operation: 'set', value: chModel });
    } else {
      requestHeaders.push({ header: 'Sec-CH-UA-Model', operation: 'remove' });
    }
    requestHeaders.push(
      { header: 'Sec-CH-UA', operation: 'set', value: chUaValue },
      { header: 'Sec-CH-UA-Mobile', operation: 'set', value: resolved.mobile ? '?1' : '?0' },
      { header: 'Sec-CH-UA-Platform', operation: 'set', value: `"${resolved.platform}"` },
      { header: 'Sec-CH-UA-Full-Version-List', operation: 'set', value: chFullList },
      { header: 'Sec-CH-UA-Platform-Version', operation: 'set', value: chPlatformVersion }
    );
  } else {
    // Firefox/Safari don't send Client Hints — remove them so no Brave/Chrome
    // hints forged by other tools (or the real browser) leak through.
    for (const h of ['Sec-CH-UA', 'Sec-CH-UA-Mobile', 'Sec-CH-UA-Platform', 'Sec-CH-UA-Model', 'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List', 'Sec-CH-UA-Platform-Version']) {
      requestHeaders.push({ header: h, operation: 'remove' });
    }
  }
  const baseCondition = { urlFilter: '*', resourceTypes: BS_UA_RESOURCE_TYPES.slice(), excludedInitiatorDomains: BS_CAPTCHA_EXCLUDED_INITIATORS.slice(), excludedRequestDomains: BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS.slice() };
  // Merge (never replace) the captcha exclusions — a per-site override must not
  // be able to drop them, otherwise reCAPTCHA inside that site gets spoofed
  // headers and fails with "Could not connect to the reCAPTCHA service".
  const extra = extraCondition || {};
  const condition = Object.assign({}, baseCondition, extra, {
    excludedInitiatorDomains: BS_CAPTCHA_EXCLUDED_INITIATORS.concat(extra.excludedInitiatorDomains || []),
    excludedRequestDomains: BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS.concat(extra.excludedRequestDomains || [])
  });
  return { id, priority, action: { type: 'modifyHeaders', requestHeaders }, condition };
}

// Accept-Language parity: spoofed Chrome UA + real "en-US" is fine, but a
// spoofed Firefox identity or a different locale must not leak mismatched
// Accept-Language headers (BabelFS/AcceptLanguage leak detectors check this).
function bsBuildLocaleRule(id, locale) {
  const loc = String(locale).trim();
  if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(loc)) return null;
  const base = loc.split('-')[0];
  return {
    id,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{ header: 'Accept-Language', operation: 'set', value: `${loc},${base};q=0.8,en;q=0.7` }]
    },
    condition: {
      urlFilter: '*',
      resourceTypes: BS_UA_RESOURCE_TYPES.slice(),
      excludedInitiatorDomains: BS_CAPTCHA_EXCLUDED_INITIATORS.slice(),
      excludedRequestDomains: BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS.slice()
    }
  };
}

// Node test hook (browser-safe: `module` is undefined in the service worker)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BS_UA_RULE_ID,
    BS_UA_RULE_ID_MAX,
    BS_UA_LOCALE_RULE_ID,
    BS_UA_RESOURCE_TYPES,
    BS_CAPTCHA_EXCLUDED_INITIATORS,
    BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS,
    bsBuildUaRule,
    bsBuildLocaleRule
  };
}
