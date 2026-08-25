/**
 * BraveShield Bypass Pro — Shared Constants & Helpers
 * Loaded into BOTH worlds (MAIN + ISOLATED) and all extension pages.
 * Pure data + pure functions only: no chrome.* APIs, no DOM writes.
 */

'use strict';

// ── Host suffixes that must receive ZERO interference (captcha / challenge frames)
const BS_CAPTCHA_HOSTS = [
  'challenges.cloudflare.com', 'recaptcha.net', 'hcaptcha.com',
  'arkoselabs.com', 'funcaptcha.com', 'geetest.com', 'awswaf.com',
  'mtcaptcha.com', 'leminnow.com', 'smartcaptcha.yandexcloud.net',
  'captcha-api.yandex.ru', 'capy.me', 'friendlycaptcha.com',
  'friendlycaptcha.eu', 'captcha-delivery.com', 'perimeterx.net', 'kasada.io'
];

// ── URL shortener / link-locker hosts (used to scope countdown acceleration)
const BS_SHORTENER_HOSTS = [
  'ouo.io', 'ouo.press', 'linkvertise.com', 'link-to.net', 'shorte.st',
  'adf.ly', 'adfoc.us', 'bc.vc', 'shrinkme.io', 'exe.io', 'exey.io',
  'za.gl', 'gslink.co', 'mitly.us', 'wikitrik.com', 'pastescript.com',
  'mega-guy.com', 'sfile.mobi', 'modsbase.com', 'filedm.com'
];

// ── Tracking query parameters stripped by Clean URL module + DNR rules
const BS_TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid',
  'mc_eid', 'igshid', 'msclkid', 'yclid', 'ref_src'
];

// ── Suffix-match a hostname against a domain (example.com matches sub.example.com)
function bsDomainMatches(host, domain) {
  if (!host || !domain) return false;
  const h = String(host).toLowerCase();
  const d = String(domain).toLowerCase().replace(/^www\./, '');
  return h === d || h.endsWith('.' + d);
}

// ── Captcha/challenge detection using suffix matching only.
// NOTE: DOM/title probes are intentionally absent — this runs at document_start.
function bsIsCaptchaHost(hostname, pathname) {
  const host = String(hostname || '').toLowerCase();
  const path = String(pathname || '');
  for (const c of BS_CAPTCHA_HOSTS) {
    if (host === c || host.endsWith('.' + c)) return true;
  }
  if (bsDomainMatches(host, 'google.com') && path.includes('/recaptcha/')) return true;
  if (bsDomainMatches(host, 'cloudflare.com') && path.includes('/cdn-cgi/challenge-platform/')) return true;
  return false;
}

// Node test hook (browser-safe: `module` is undefined in content scripts/pages)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BS_CAPTCHA_HOSTS, BS_SHORTENER_HOSTS, BS_TRACKING_PARAMS, bsDomainMatches, bsIsCaptchaHost };
}
