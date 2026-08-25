/**
 * BraveShield Bypass Pro — Content Script Bridge & HUD Controller
 * Version: synced from manifest at runtime
 * Execution World: ISOLATED (document_start)
 * Purpose: LIVE CONFIG BRIDGE to the MAIN world (instant kill-switch/toggle
 *          application without reload), fast DOM modal annihilation, button
 *          unlocking, direct-link floating HUD bar, live telemetry tracking,
 *          and popup bridge.
 */

(() => {
  'use strict';

  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  const path = (window.location && window.location.pathname) ? window.location.pathname : '';

  if (
    (typeof bsIsCaptchaHost === 'function' && bsIsCaptchaHost(host, path)) ||
    typeof window._cf_chl_opt !== 'undefined' ||
    typeof window._cf_chl_ctx !== 'undefined'
  ) {
    return;
  }

  // Domain whitelist uses suffix matching (example.com covers sub.example.com)
  function bsIsWhitelisted(hostname, whitelist) {
    if (!Array.isArray(whitelist) || !hostname) return false;
    return whitelist.some(d => d && typeof bsDomainMatches === 'function'
      ? bsDomainMatches(hostname, d)
      : (hostname === d || hostname.endsWith('.' + d)));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LIVE CONFIG BRIDGE — push effective per-site config into the MAIN world.
  // Replaces the old one-way sessionStorage mirror which raced document_start
  // and required a page reload before any toggle took effect.
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_SYNC_KEYS = [
    'masterEnabled', 'enabled',
    'unshortenerEnabled', 'autoBypassLinks', 'autoBypassTimers', 'turboAllSites',
    'paywallDefuserEnabled', 'bypassAdblockDetection',
    'maskBraveApi', 'clientHintsEnabled', 'maskClientHints', 'normalizeWebgl',
    'webglSpoofingEnabled', 'canvasNoiseEnabled', 'audioNoiseEnabled',
    'webrtcShieldEnabled', 'domJitterEnabled', 'timerCoarseningEnabled',
    'mediaDevicesSanitizeEnabled', 'speechVoicesSanitizeEnabled',
    'batteryMaskEnabled', 'screenNormalizationEnabled',
    'uaSpoofingEnabled', 'timezoneSpoofingEnabled', 'webgpuMaskingEnabled', 'fontEnumMaskingEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled',
    'deviceProfile', 'customHardwareProfile', 'resolvedUA', 'spoofTimezone', 'spoofLocale'
  ];

  let lastPushedJson = '';
  function pushConfigToMainWorld() {
    try {
      chrome.storage.local.get(null, (res) => {
        if (!res || chrome.runtime.lastError) return;
        try {
          const siteDisabled = res.masterEnabled === false ||
                               res.enabled === false ||
                               bsIsWhitelisted(host, res.whitelist);

          const config = {};
          for (const k of BS_SYNC_KEYS) {
            if (res[k] !== undefined) config[k] = res[k];
          }
          config.masterEnabled = res.masterEnabled !== false;

          // Serialize only for change-detection; post the OBJECT so the MAIN
          // world receives e.data.config directly.
          const fingerprint = JSON.stringify({ s: siteDisabled, c: config });
          if (fingerprint !== lastPushedJson) {
            lastPushedJson = fingerprint;
            window.postMessage({ type: 'bs-config-sync', siteDisabled, config }, '*');
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  pushConfigToMainWorld();
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') pushConfigToMainWorld();
    });
  } catch (_) {}


  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Live Telemetry Event Listener & Incrementor
  // Security: only accept same-frame messages from the MAIN world, restrict
  // counters to a known key set and clamp deltas so hostile pages cannot
  // forge or flood stats.
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_VALID_STATS = new Set(['timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked']);

  window.addEventListener('message', (e) => {
    try {
      if (e.source !== window || !e.data || typeof e.data !== 'object') return;

      if (e.data.type === 'bs-telemetry-event') {
        const { stat, delta } = e.data;
        if (!BS_VALID_STATS.has(stat)) return;
        const inc = Math.floor(Number(delta));
        if (!Number.isFinite(inc) || inc <= 0 || inc > 50) return;
        chrome.storage.local.get([stat], (res) => {
          const current = (res && typeof res[stat] === 'number') ? res[stat] : 0;
          chrome.storage.local.set({ [stat]: Math.min(9_999_999, current + inc) });
        });
      } else if (e.data.type === 'bs-direct-link' && typeof e.data.url === 'string') {
        renderDirectLinkHud(e.data.url);
      }
    } catch (_) {}
  });

  // Only absolute http(s) URLs may ever reach the HUD renderer.
  function bsSafeHudUrl(raw) {
    if (typeof raw !== 'string' || raw.length > 2048) return null;
    try {
      const u = new URL(raw);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : null;
    } catch (_) {
      return null;
    }
  }

  // 3. Feature A: Floating Obsidian-Neon Direct Link HUD
  // Built exclusively with DOM APIs + textContent — the target URL is never
  // interpolated into markup, so hostile pages cannot inject HTML.
  let hudRendered = false;
  function renderDirectLinkHud(targetUrl) {
    const safeUrl = bsSafeHudUrl(targetUrl);
    if (hudRendered || !safeUrl) return;

    function mountHud() {
      const container = document.body || document.documentElement;
      if (!container || document.getElementById('bs-direct-link-bar')) return;
      hudRendered = true;

      try {
        const bar = document.createElement('div');
        bar.id = 'bs-direct-link-bar';
        bar.style.cssText = `
          position: fixed !important; top: 14px !important; right: 14px !important;
          z-index: 2147483647 !important; background: rgba(10, 15, 25, 0.94) !important;
          border: 1px solid rgba(0, 255, 204, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 204, 0.2) !important;
          backdrop-filter: blur(12px) !important; border-radius: 10px !important;
          padding: 10px 16px !important; display: flex !important; align-items: center !important;
          justify-content: space-between !important; gap: 16px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 13px !important; color: #fff !important;
        `;

        const left = document.createElement('div');
        left.style.cssText = 'display:flex; align-items:center; gap:10px;';
        const glyph = document.createElement('span');
        glyph.textContent = '⚡';
        glyph.style.fontSize = '16px';
        const label = document.createElement('span');
        label.textContent = 'Direct Link Detected:';
        label.style.cssText = 'font-weight:700; color:#00ffcc; letter-spacing:0.5px;';
        const urlSpan = document.createElement('span');
        urlSpan.textContent = safeUrl;
        urlSpan.title = safeUrl;
        urlSpan.style.cssText = 'max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#a0aec0; font-size:12px;';
        left.append(glyph, label, urlSpan);

        const right = document.createElement('div');
        right.style.cssText = 'display:flex; align-items:center; gap:8px;';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy';
        copyBtn.style.cssText = 'background:rgba(255,255,255,0.1); color:#00ffcc; border:1px solid rgba(0,255,204,0.3); font-weight:700; font-size:11px; padding:6px 10px; border-radius:6px; cursor:pointer; transition:all 0.2s ease;';
        copyBtn.addEventListener('click', () => {
          try {
            navigator.clipboard.writeText(safeUrl);
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
          } catch (_) {}
        });

        const jump = document.createElement('a');
        jump.href = safeUrl;
        jump.target = '_blank';
        jump.rel = 'noopener noreferrer';
        jump.textContent = 'Jump Directly ↗';
        jump.style.cssText = 'background:linear-gradient(135deg, #00ffcc, #0077ff); color:#000; font-weight:800; font-size:12px; padding:6px 14px; border-radius:6px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 0 12px rgba(0,255,204,0.4);';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Dismiss direct link bar');
        closeBtn.style.cssText = 'background:transparent; border:none; color:#718096; font-size:16px; cursor:pointer; padding:2px 6px;';
        closeBtn.addEventListener('click', () => bar.remove());

        right.append(copyBtn, jump, closeBtn);
        bar.append(left, right);
        container.appendChild(bar);

        const style = document.createElement('style');
        style.textContent = '@keyframes bsSlideIn { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }';
        (document.head || container).appendChild(style);
        bar.style.animation = 'bsSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      } catch (_) {}
    }

    if (document.body || document.documentElement) {
      mountHud();
    } else {
      document.addEventListener('DOMContentLoaded', mountHud, { once: true });
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'get-audit') {
      let ver = 'unknown';
      try { ver = chrome.runtime.getManifest().version; } catch (_) {}
      sendResponse({ status: 'active', version: ver });
    }
  });

  // 5. Universal Anti-Adblock Modal Annihilator & Captcha Protection Shield
  const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

  function isProtectedCaptchaOrAuth(el) {
    if (!el) return false;
    const host = (window.location.hostname || '').toLowerCase();
    if (
      host.includes('challenges.cloudflare.com') || host.includes('recaptcha.net') || host.includes('google.com') ||
      host.includes('hcaptcha.com') || host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') ||
      host.includes('arkoselabs.com') || host.includes('funcaptcha.com') || host.includes('geetest.com') ||
      host.includes('awswaf.com') || host.includes('mtcaptcha.com') || host.includes('leminnow.com') ||
      host.includes('smartcaptcha.yandexcloud.net') || host.includes('captcha-api.yandex.ru') ||
      host.includes('capy.me') || host.includes('friendlycaptcha.com') || host.includes('friendlycaptcha.eu') ||
      host.includes('captcha-delivery.com') || host.includes('perimeterx.net') || host.includes('kasada.io')
    ) return true;

    const htmlSnippet = (el.outerHTML || '').slice(0, 1200).toLowerCase();
    const textSnippet = (el.innerText || el.textContent || '').toLowerCase();

    // Check for all 14 known industry Captcha & verification systems
    if (
      htmlSnippet.includes('arkose') || htmlSnippet.includes('funcaptcha') ||
      htmlSnippet.includes('recaptcha') || htmlSnippet.includes('hcaptcha') ||
      htmlSnippet.includes('turnstile') || htmlSnippet.includes('cf-chl') ||
      htmlSnippet.includes('challenge-form') || htmlSnippet.includes('geetest') ||
      htmlSnippet.includes('g-recaptcha') || htmlSnippet.includes('h-captcha') ||
      htmlSnippet.includes('cf-turnstile') || htmlSnippet.includes('challenges.cloudflare') ||
      htmlSnippet.includes('awswaf') || htmlSnippet.includes('mtcaptcha') ||
      htmlSnippet.includes('lemin') || htmlSnippet.includes('smartcaptcha') ||
      htmlSnippet.includes('capy') || htmlSnippet.includes('friendlycaptcha') ||
      htmlSnippet.includes('captcha-delivery') || htmlSnippet.includes('perimeterx') ||
      htmlSnippet.includes('kasada')
    ) return true;

    if (
      textSnippet.includes("make sure that you're a human") ||
      textSnippet.includes('verify you are human') ||
      textSnippet.includes('security check') ||
      textSnippet.includes('verify you are a human') ||
      textSnippet.includes('i am not a robot') ||
      textSnippet.includes("i'm not a robot") ||
      textSnippet.includes('cf-turnstile') ||
      textSnippet.includes('security verification') ||
      textSnippet.includes('verifying you are human')
    ) return true;

    if (el.querySelector && el.querySelector('iframe[src*="arkose"], iframe[src*="funcaptcha"], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], iframe[src*="cloudflare"], iframe[src*="geetest"], iframe[src*="awswaf"], iframe[src*="mtcaptcha"], iframe[src*="lemin"], iframe[src*="smartcaptcha"], iframe[src*="capy"], iframe[src*="friendlycaptcha"], iframe[src*="captcha-delivery"], .g-recaptcha, .h-captcha, .cf-turnstile, .geetest_holder, #aws-waf-captcha, .mtcaptcha, #lemin-cropped-captcha, .smart-captcha, .frc-captcha, #challenge-stage, #cf-wrapper, [data-sitekey]')) return true;

    return false;
  }

  function ensureCaptchasVisible() {
    try {
      const captchaNodes = document.querySelectorAll(
        '.g-recaptcha, .h-captcha, .cf-turnstile, .geetest_holder, #aws-waf-captcha, .mtcaptcha, #lemin-cropped-captcha, .smart-captcha, .frc-captcha, [data-sitekey], ' +
        'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], iframe[src*="cloudflare"], iframe[src*="arkose"], iframe[src*="funcaptcha"], iframe[src*="geetest"], iframe[src*="awswaf"], iframe[src*="mtcaptcha"], iframe[src*="lemin"], iframe[src*="smartcaptcha"], iframe[src*="capy"], iframe[src*="friendlycaptcha"], iframe[src*="captcha-delivery"], ' +
        '#challenge-stage, #cf-wrapper, div[class*="recaptcha"], div[class*="hcaptcha"], div[class*="turnstile"], div[class*="geetest"], ' +
        '#imnotrobot, #btn6, #btn-captcha, .btn-captcha, #captcha-btn'
      );
      for (const c of captchaNodes) {
        c.style.setProperty('display', 'inline-block', 'important');
        c.style.setProperty('visibility', 'visible', 'important');
        c.style.setProperty('opacity', '1', 'important');
        c.style.setProperty('pointer-events', 'auto', 'important');
        c.style.setProperty('z-index', '2147483647', 'important');
        c.style.setProperty('position', 'relative', 'important');
      }
    } catch (_) {}
  }

  // Feature B: Universal Paywall & Blur-Filter Defuser in Content Script
  function defusePaywallsAndBlur() {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_paywall_disabled') === 'true') return;

      const blurredElements = document.querySelectorAll('.paywall-blur, .content-gate, .quora-blur');
      for (const el of blurredElements) {
        if (!isProtectedCaptchaOrAuth(el)) {
          el.style.setProperty('filter', 'none', 'important');
          el.style.setProperty('-webkit-filter', 'none', 'important');
          el.style.setProperty('user-select', 'text', 'important');
          el.style.setProperty('-webkit-user-select', 'text', 'important');
        }
      }
    } catch (_) {}
  }

  function annihilateAntiAdblockModals() {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_adblock_disabled') === 'true') return;

      ensureCaptchasVisible();
      defusePaywallsAndBlur();

      const candidates = document.querySelectorAll('.modal, .swal2-container, .sweet-alert, [role="alertdialog"], [class*="adblock"], [id*="adblock"]');
      for (const el of candidates) {
        if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
        if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    } catch (_) {}
  }

  // 6. Shortener & Download Button Unlocker
  function purgeInvisibleOverlays() {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 800;
      const vh = window.innerHeight || document.documentElement.clientHeight || 600;
      const candidates = document.querySelectorAll('div, a, span, section, iframe');

      for (const el of candidates) {
        if (!el || el._bsContentOverlayNeutralized || isProtectedCaptchaOrAuth(el)) continue;
        if (el === document.body || el === document.documentElement || el.id?.startsWith('bs-')) continue;

        const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (!style) continue;

        const isFixed = style.position === 'fixed' || style.position === 'absolute';
        const zIndex = parseInt(style.zIndex, 10) || 0;
        const opacity = parseFloat(style.opacity);
        const isTransparent = opacity === 0 || style.visibility === 'hidden' || style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)';

        const rect = el.getBoundingClientRect();
        const coversFullViewport = rect.width >= (vw * 0.75) && rect.height >= (vh * 0.75);

        if (isFixed && zIndex >= 50 && (isTransparent || opacity < 0.1) && coversFullViewport) {
          const hasVisibleText = el.innerText && el.innerText.trim().length > 0;
          const hasInputs = el.querySelector('input, form, video, button, select');

          if (!hasVisibleText && !hasInputs) {
            el._bsContentOverlayNeutralized = true;
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            el.style.setProperty('z-index', '-9999', 'important');
            if (el.tagName === 'A' && el.parentNode) {
              el.remove();
            }
          }
        }
      }
    } catch (_) {}
  }

  function fastPassButtons() {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_timers_disabled') === 'true') return;

      const btnSelectors = [
        'button', 'a.btn', 'a[class*="download"]', 'a[class*="button"]', 'div[class*="download"]',
        'a[href*="download"]', 'a[href*="server"]', 'a[href*="drive"]', 'a[href*="mega"]',
        '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download', '.get-link',
        '.download-btn', '.btn-download', '#wpsafe-generate', '#continue-btn', '#btn-continue',
        '#imnotrobot', '#btn6', '#btn-captcha', '.btn-captcha', '#openInChrome', '.btn-open-chrome',
        '.download-box a', '.download-box button', 'a[onclick*="download"]'
      ];

      const btns = document.querySelectorAll(btnSelectors.join(', '));
      for (const btn of btns) {
        if (!btn) continue;
        const txt = (btn.innerText || btn.textContent || '').trim().toLowerCase();
        const isDownloadTarget = txt.includes('download') || txt.includes('server') || txt.includes('get link') || txt.includes('continue') || txt.includes('tutorial') || txt.includes('watch') || txt.includes('final');

        if (isDownloadTarget || btn.classList.contains('btn') || btn.id?.includes('download') || btn.className?.includes('download') || btn.className?.includes('server')) {
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
          if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.style.setProperty('opacity', '1', 'important');
          btn.style.setProperty('cursor', 'pointer', 'important');
          btn.style.setProperty('position', 'relative', 'important');
          btn.style.setProperty('z-index', '9999', 'important');
        }
      }
    } catch (_) {}
  }

  let cScanTimer = null;
  function debouncedContentScan() {
    if (cScanTimer) return;
    cScanTimer = setTimeout(() => {
      annihilateAntiAdblockModals();
      purgeInvisibleOverlays();
      fastPassButtons();
      cScanTimer = null;
    }, 400);
  }

  // Run immediately and monitor DOM
  annihilateAntiAdblockModals();
  purgeInvisibleOverlays();
  fastPassButtons();
  const trapInterval = setInterval(debouncedContentScan, 800);
  setTimeout(() => clearInterval(trapInterval), 30000);

  const trapObserver = new MutationObserver(debouncedContentScan);
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
