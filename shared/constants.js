/**
 * BraveShield Bypass Pro — Shared Constants & Helpers
 * Loaded into BOTH worlds (MAIN + ISOLATED) and all extension pages.
 * Pure data + pure functions only: no chrome.* APIs, no DOM writes.
 */

'use strict';

// ── Host suffixes that must receive ZERO interference (captcha / challenge frames)
const BS_CAPTCHA_HOSTS = [
  'challenges.cloudflare.com', 'recaptcha.net', 'www.recaptcha.net', 'recaptcha.google.com',
  'hcaptcha.com', 'arkoselabs.com', 'funcaptcha.com', 'geetest.com', 'awswaf.com',
  'mtcaptcha.com', 'leminnow.com', 'smartcaptcha.yandexcloud.net',
  'captcha-api.yandex.ru', 'capy.me', 'friendlycaptcha.com',
  'friendlycaptcha.eu', 'captcha-delivery.com', 'perimeterx.net', 'kasada.io',
  'gstatic.com', 'googleusercontent.com'
];

// ── URL shortener / link-locker hosts (used to scope countdown acceleration)
const BS_SHORTENER_HOSTS = [
  'ouo.io', 'ouo.press', 'linkvertise.com', 'link-to.net', 'shorte.st',
  'adf.ly', 'adfoc.us', 'bc.vc', 'shrinkme.io', 'exe.io', 'exey.io',
  'za.gl', 'gslink.co', 'mitly.us', 'wikitrik.com', 'pastescript.com',
  'mega-guy.com', 'sfile.mobi', 'modsbase.com', 'filedm.com',
  // extended — common image hosts / wait-link shorteners reported by users
  // (HispanoADS, image-viewer helpers, misc link lockers)
  'hispano.link', 'hispano-ads.com', 'hispanoads.com', 'upfiles.app',
  'imgair.xyz', 'pixhost.to', 'imagebam.com', 'imgchili.com', 'imgdrive.net',
  'postimages.org', 'imgbox.com', 'turboimagehost.com',
  'fastpic.org', 'radikal.ru', 'keepshare.net', 'gofile.io', '1fichier.com',
  'mediafire.com', 'workupload.com', 'anonfiles.com', 'bayfiles.com',
  'letsupload.io', 'uploadhaven.com', 'megaup.net', 'linkshrink.net',
  'shorten.sh', 'cuty.io', 'slink.pro', 'clk.sh', 'bluemediafiles.com',
  'linkvertise.net', 'filecrypt.co', 'filecrypt.cc'
];

// ── Tracking query parameters stripped by Clean URL module + DNR rules
const BS_TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid',
  'mc_eid', 'igshid', 'msclkid', 'yclid', 'ref_src'
];

// ── Trusted app hosts where automation (button unlock / countdown / overlay purge / turbo)
// must NEVER touch DOM. These are full web-apps (AI studios, mail, docs, banking) where
// forcing display/position/z-index on generic <button> breaks layout.
// Stealth (canvas/WebGL/UA) still applies — only automation is paused.
const BS_NO_AUTOMATION_HOSTS = [
  'meta.ai', 'imagine.meta.ai', 'messenger.com', 'whatsapp.com',
  'openai.com', 'chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com', 'bard.google.com',
  'copilot.microsoft.com', 'copilot.cloud.microsoft', 'perplexity.ai', 'grok.com', 'x.ai',
  'midjourney.com', 'leonardo.ai', 'runwayml.com', 'pika.art', 'stability.ai',
  'mail.google.com', 'outlook.live.com', 'outlook.office.com', 'docs.google.com', 'drive.google.com',
  'github.com', 'gitlab.com', 'stackoverflow.com', 'notion.so', 'figma.com',
  'youtube.com', 'youtu.be', 'twitch.tv', 'spotify.com', 'open.spotify.com',
  'amazon.com', 'paypal.com', 'stripe.com', 'mybank', 'banking'
];

function bsIsNoAutomationHost(hostname) {
  try {
    const h = String(hostname || '').toLowerCase();
    if (!h) return false;
    for (const d of BS_NO_AUTOMATION_HOSTS) {
      if (h === d || h.endsWith('.' + d)) return true;
    }
    return false;
  } catch (_) { return false; }
}

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
  // Google reCAPTCHA served from google.com / gstatic.com / recaptcha.net
  if (bsDomainMatches(host, 'google.com') && path.includes('/recaptcha/')) return true;
  if (bsDomainMatches(host, 'gstatic.com') && path.includes('/recaptcha/')) return true;
  if (bsDomainMatches(host, 'recaptcha.net') && path.includes('/recaptcha/')) return true;
  if (host.includes('recaptcha')) return true; // fallback for www.recaptcha.net, recaptcha.google.com
  if (bsDomainMatches(host, 'cloudflare.com') && path.includes('/cdn-cgi/challenge-platform/')) return true;
  return false;
}

// Node test hook (browser-safe: `module` is undefined in content scripts/pages)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BS_CAPTCHA_HOSTS, BS_SHORTENER_HOSTS, BS_TRACKING_PARAMS, BS_NO_AUTOMATION_HOSTS, bsDomainMatches, bsIsCaptchaHost, bsIsNoAutomationHost };
}
