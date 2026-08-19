/**
 * BraveShield Bypass Pro — Content Script Bridge & HUD Controller
 * Version: 5.4.0
 * Execution World: ISOLATED (document_start)
 * Purpose: Fast DOM modal annihilation, button unlocking, storage synchronization,
 *          direct-link floating HUD bar, live telemetry tracking, and popup bridge.
 */

(() => {
  'use strict';

  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  if (
    host.includes('challenges.cloudflare.com') ||
    host.includes('recaptcha.net') ||
    host.includes('hcaptcha.com') ||
    host.includes('arkoselabs.com') ||
    host.includes('funcaptcha.com') ||
    host.includes('geetest.com') ||
    host.includes('awswaf.com') ||
    host.includes('mtcaptcha.com') ||
    host.includes('leminnow.com') ||
    host.includes('smartcaptcha.yandexcloud.net') ||
    host.includes('captcha-api.yandex.ru') ||
    host.includes('capy.me') ||
    host.includes('friendlycaptcha.com') ||
    host.includes('friendlycaptcha.eu') ||
    host.includes('captcha-delivery.com') ||
    host.includes('perimeterx.net') ||
    host.includes('kasada.io') ||
    (host.includes('google.com') && window.location.pathname.includes('/recaptcha/')) ||
    (host.includes('cloudflare.com') && window.location.pathname.includes('/cdn-cgi/challenge-platform/')) ||
    typeof window._cf_chl_opt !== 'undefined' ||
    typeof window._cf_chl_ctx !== 'undefined' ||
    document.getElementById('challenge-stage') ||
    document.getElementById('challenge-form') ||
    document.getElementById('challenge-running') ||
    document.getElementById('cf-wrapper') ||
    (document.title && /just a moment|security verification|attention required|checking your browser|cloudflare/i.test(document.title))
  ) {
    return;
  }

  // 1. Sync Settings & Device Profile into sessionStorage for MAIN world inject.js
  function syncSettingsToSession(res) {
    if (!res) return;
    try {
      const whitelist = Array.isArray(res.whitelist) ? res.whitelist : [];
      const isWhitelisted = whitelist.some(d => d && (host === d.toLowerCase() || host.endsWith('.' + d.toLowerCase())));

      if (res.masterEnabled === false || isWhitelisted) {
        sessionStorage.setItem('bs_master_disabled', 'true');
      } else {
        sessionStorage.removeItem('bs_master_disabled');
      }

      if (res.unshortenerEnabled === false) sessionStorage.setItem('bs_unshortener_disabled', 'true');
      else sessionStorage.removeItem('bs_unshortener_disabled');

      if (res.paywallDefuserEnabled === false) sessionStorage.setItem('bs_paywall_disabled', 'true');
      else sessionStorage.removeItem('bs_paywall_disabled');

      if (res.autoBypassTimers === false) sessionStorage.setItem('bs_timers_disabled', 'true');
      else sessionStorage.removeItem('bs_timers_disabled');

      if (res.bypassAdblockDetection === false) sessionStorage.setItem('bs_adblock_disabled', 'true');
      else sessionStorage.removeItem('bs_adblock_disabled');

      if (res.maskBraveApi === false) sessionStorage.setItem('bs_brave_disabled', 'true');
      else sessionStorage.removeItem('bs_brave_disabled');

      if (res.maskClientHints === false || res.clientHintsEnabled === false) sessionStorage.setItem('bs_hints_disabled', 'true');
      else sessionStorage.removeItem('bs_hints_disabled');

      if (res.webglSpoofingEnabled === false) sessionStorage.setItem('bs_webgl_disabled', 'true');
      else sessionStorage.removeItem('bs_webgl_disabled');

      if (res.domJitterEnabled === false) sessionStorage.setItem('bs_domjitter_disabled', 'true');
      else sessionStorage.removeItem('bs_domjitter_disabled');

      if (res.timerCoarseningEnabled === false) sessionStorage.setItem('bs_timercoarse_disabled', 'true');
      else sessionStorage.removeItem('bs_timercoarse_disabled');

      if (res.mediaDevicesSanitizeEnabled === false) sessionStorage.setItem('bs_mediadevices_disabled', 'true');
      else sessionStorage.removeItem('bs_mediadevices_disabled');

      if (res.speechVoicesSanitizeEnabled === false) sessionStorage.setItem('bs_speechvoices_disabled', 'true');
      else sessionStorage.removeItem('bs_speechvoices_disabled');

      if (res.spotifyUnlocked === false) sessionStorage.setItem('bs_spotify_disabled', 'true');
      else sessionStorage.removeItem('bs_spotify_disabled');

      if (res.youtubeAds === false) sessionStorage.setItem('bs_youtube_disabled', 'true');
      else sessionStorage.removeItem('bs_youtube_disabled');

      if (res.twitchShieldEnabled === false) sessionStorage.setItem('bs_twitch_disabled', 'true');
      else sessionStorage.removeItem('bs_twitch_disabled');

      if (res.audioNoiseEnabled === false) sessionStorage.setItem('bs_audio_disabled', 'true');
      else sessionStorage.removeItem('bs_audio_disabled');

      if (res.canvasNoiseEnabled === false) sessionStorage.setItem('bs_canvas_disabled', 'true');
      else sessionStorage.removeItem('bs_canvas_disabled');

      if (res.webrtcShieldEnabled === false) sessionStorage.setItem('bs_webrtc_disabled', 'true');
      else sessionStorage.removeItem('bs_webrtc_disabled');

      if (res.batteryMaskEnabled === false) sessionStorage.setItem('bs_battery_disabled', 'true');
      else sessionStorage.removeItem('bs_battery_disabled');

      if (res.rightClickEnabled === false) sessionStorage.setItem('bs_rightclick_disabled', 'true');
      else sessionStorage.removeItem('bs_rightclick_disabled');

      if (res.cleanUrlEnabled === false) sessionStorage.setItem('bs_cleanurl_disabled', 'true');
      else sessionStorage.removeItem('bs_cleanurl_disabled');

      if (res.videoSpeedEnabled === false) sessionStorage.setItem('bs_videospeed_disabled', 'true');
      else sessionStorage.removeItem('bs_videospeed_disabled');

      if (res.autoSkipIntrosEnabled === false) sessionStorage.setItem('bs_autoskip_disabled', 'true');
      else sessionStorage.removeItem('bs_autoskip_disabled');

      if (res.screenshotEvasionEnabled === false) sessionStorage.setItem('bs_screenshotevasion_disabled', 'true');
      else sessionStorage.removeItem('bs_screenshotevasion_disabled');

      if (res.mediaSnifferEnabled === false) sessionStorage.setItem('bs_mediasniffer_disabled', 'true');
      else sessionStorage.removeItem('bs_mediasniffer_disabled');

      if (res.deviceProfile) sessionStorage.setItem('bs_device_profile', res.deviceProfile);
      if (res.customHardwareProfile) sessionStorage.setItem('bs_custom_hardware', JSON.stringify(res.customHardwareProfile));
      if (res.webglVendor) sessionStorage.setItem('bs_webgl_vendor', res.webglVendor);
      if (res.webglRenderer) sessionStorage.setItem('bs_webgl_renderer', res.webglRenderer);
    } catch (_) {}
  }

  try {
    chrome.storage.local.get(null, (all) => {
      syncSettingsToSession(all);
    });
  } catch (_) {}

  // Live storage change listener for instant cross-world sync
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        chrome.storage.local.get(null, (all) => {
          syncSettingsToSession(all);
        });
      }
    });
  } catch (_) {}

  // 2. Feature D: Live Telemetry Event Listener & Incrementor
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'bs-telemetry-event') {
      const { stat, delta } = e.data;
      if (stat && typeof delta === 'number' && delta > 0) {
        try {
          chrome.storage.local.get(['timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked'], (res) => {
            const current = (res && res[stat]) ? res[stat] : 0;
            const update = {};
            update[stat] = current + delta;
            chrome.storage.local.set(update);
          });
        } catch (_) {}
      }
    } else if (e.data && e.data.type === 'bs-direct-link' && e.data.url) {
      renderDirectLinkHud(e.data.url);
    } else if (e.data && e.data.type === 'bs-media-sniffed' && e.data.url) {
      latestSniffedMediaUrl = e.data.url;
      sniffedMediaRegistry.add(e.data.url);
      mountVideoSnifferOverlays();
    }
  });

  // 3. Feature A: Floating Obsidian-Neon Direct Link HUD
  let hudRendered = false;
  let latestSniffedMediaUrl = '';
  const sniffedMediaRegistry = new Set();

  function renderDirectLinkHud(targetUrl) {
    if (hudRendered || !targetUrl) return;

    function mountHud() {
      const container = document.body || document.documentElement;
      if (!container || document.getElementById('bs-direct-link-bar')) return;
      hudRendered = true;

      try {
        const bar = document.createElement('div');
        bar.id = 'bs-direct-link-bar';
        bar.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:16px;">⚡</span>
            <span style="font-weight:700; color:#00ffcc; letter-spacing:0.5px;">Direct Link Detected:</span>
            <span style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#a0aec0; font-size:12px;">${targetUrl}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="bs-copy-hud" style="background:rgba(255,255,255,0.1); color:#00ffcc; border:1px solid rgba(0,255,204,0.3); font-weight:700; font-size:11px; padding:6px 10px; border-radius:6px; cursor:pointer; transition:all 0.2s ease;">📋 Copy</button>
            <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="background:linear-gradient(135deg, #00ffcc, #0077ff); color:#000; font-weight:800; font-size:12px; padding:6px 14px; border-radius:6px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 0 12px rgba(0,255,204,0.4); cursor:pointer;">Jump Directly ↗</a>
            <button id="bs-close-hud" style="background:transparent; border:none; color:#718096; font-size:16px; cursor:pointer; padding:2px 6px;">✕</button>
          </div>
        `;
        bar.style.cssText = `
          position: fixed !important;
          top: 14px !important;
          right: 14px !important;
          z-index: 2147483647 !important;
          background: rgba(10, 15, 25, 0.94) !important;
          border: 1px solid rgba(0, 255, 204, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 204, 0.2) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 10px !important;
          padding: 10px 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 16px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 13px !important;
          color: #fff !important;
          animation: bsSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        `;

        const style = document.createElement('style');
        style.textContent = `@keyframes bsSlideIn { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
        document.head ? document.head.appendChild(style) : container.appendChild(style);

        container.appendChild(bar);

        document.getElementById('bs-copy-hud')?.addEventListener('click', () => {
          try {
            navigator.clipboard.writeText(targetUrl);
            const btn = document.getElementById('bs-copy-hud');
            if (btn) {
              btn.textContent = '✅ Copied!';
              setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
            }
          } catch (_) {}
        });

        document.getElementById('bs-close-hud')?.addEventListener('click', () => bar.remove());
      } catch (_) {}
    }

    if (document.body || document.documentElement) {
      mountHud();
    } else {
      document.addEventListener('DOMContentLoaded', mountHud, { once: true });
    }
  }

  // 4. Message Listener from Extension Cockpit
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'get-audit') {
      sendResponse({ status: 'active', version: '5.4.0' });
    }
  });

  // 5. Universal Anti-Adblock Modal Annihilator & Captcha Protection Shield
  const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

  function isProtectedCaptchaOrAuth(el) {
    if (!el || !(el instanceof Element)) return false;
    const host = (window.location.hostname || '').toLowerCase();
    const href = (window.location.href || '').toLowerCase();

    // 1. Host-level Immunity for Captcha Providers & Auth Gateways
    if (
      host.includes('recaptcha') || host.includes('hcaptcha') || host.includes('turnstile') ||
      host.includes('challenges.cloudflare.com') || host.includes('recaptcha.net') ||
      host.includes('google.com') || host.includes('gstatic.com') ||
      host.includes('hcaptcha.com') || host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') ||
      host.includes('arkoselabs.com') || host.includes('funcaptcha.com') || host.includes('geetest.com') ||
      host.includes('awswaf.com') || host.includes('mtcaptcha.com') || host.includes('leminnow.com') ||
      host.includes('smartcaptcha.yandexcloud.net') || host.includes('captcha-api.yandex.ru') ||
      host.includes('capy.me') || host.includes('friendlycaptcha.com') || host.includes('friendlycaptcha.eu') ||
      host.includes('captcha-delivery.com') || host.includes('perimeterx.net') || host.includes('kasada.io') ||
      href.includes('/recaptcha/') || href.includes('recaptcha/api') || href.includes('/turnstile/') || href.includes('/hcaptcha/')
    ) return true;

    // 2. Comprehensive CSS Selector matching on el, its parents/ancestors, and descendants
    const CAPTCHA_SELECTORS = [
      'iframe[src*="recaptcha"]', 'iframe[src*="hcaptcha"]', 'iframe[src*="turnstile"]',
      'iframe[src*="cloudflare"]', 'iframe[src*="arkose"]', 'iframe[src*="funcaptcha"]',
      'iframe[src*="geetest"]', 'iframe[src*="awswaf"]', 'iframe[src*="mtcaptcha"]',
      'iframe[src*="lemin"]', 'iframe[src*="smartcaptcha"]', 'iframe[src*="capy"]',
      'iframe[src*="friendlycaptcha"]', 'iframe[src*="captcha-delivery"]',
      '.g-recaptcha', '.g-recaptcha-bubble', '.grecaptcha-badge', '.grecaptcha-logo',
      '.h-captcha', '.hcaptcha-box', '.cf-turnstile', '.geetest_holder', '#aws-waf-captcha',
      '.mtcaptcha', '#lemin-cropped-captcha', '.smart-captcha', '.frc-captcha',
      '#challenge-stage', '#cf-wrapper', '#g-recaptcha-response', '[name="g-recaptcha-response"]',
      '[name="h-captcha-response"]', '[name="cf-turnstile-response"]', '[data-sitekey]',
      '[class*="recaptcha"]', '[id*="recaptcha"]', '[class*="hcaptcha"]', '[id*="hcaptcha"]',
      '[class*="turnstile"]', '[id*="turnstile"]', '[class*="geetest"]', '[id*="geetest"]'
    ].join(', ');

    try {
      if (el.matches && el.matches(CAPTCHA_SELECTORS)) return true;
      if (el.closest && el.closest(CAPTCHA_SELECTORS)) return true;
      if (el.querySelector && el.querySelector(CAPTCHA_SELECTORS)) return true;
    } catch (_) {}

    // 3. String & Attribute inspection
    const htmlSnippet = (el.outerHTML || '').slice(0, 1500).toLowerCase();
    const textSnippet = (el.innerText || el.textContent || '').toLowerCase();

    if (
      htmlSnippet.includes('recaptcha') || htmlSnippet.includes('hcaptcha') ||
      htmlSnippet.includes('turnstile') || htmlSnippet.includes('cf-chl') ||
      htmlSnippet.includes('challenge-form') || htmlSnippet.includes('geetest') ||
      htmlSnippet.includes('arkose') || htmlSnippet.includes('funcaptcha') ||
      htmlSnippet.includes('g-recaptcha') || htmlSnippet.includes('h-captcha') ||
      htmlSnippet.includes('cf-turnstile') || htmlSnippet.includes('challenges.cloudflare') ||
      htmlSnippet.includes('awswaf') || htmlSnippet.includes('mtcaptcha') ||
      htmlSnippet.includes('lemin') || htmlSnippet.includes('smartcaptcha') ||
      htmlSnippet.includes('capy') || htmlSnippet.includes('friendlycaptcha') ||
      htmlSnippet.includes('captcha-delivery') || htmlSnippet.includes('perimeterx') ||
      htmlSnippet.includes('kasada') || htmlSnippet.includes('data-sitekey')
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

    return false;
  }

  function ensureCaptchasVisible() {
    try {
      // Only un-hide visible interactive captcha containers if hidden, never alter invisible badges/tokens
      const captchaNodes = document.querySelectorAll(
        '.g-recaptcha:not(.grecaptcha-badge), .h-captcha, .cf-turnstile, .geetest_holder, #aws-waf-captcha, .mtcaptcha, .frc-captcha'
      );
      for (const c of captchaNodes) {
        const style = window.getComputedStyle ? window.getComputedStyle(c) : null;
        if (style && style.display === 'none') {
          c.style.setProperty('display', 'block', 'important');
          c.style.setProperty('visibility', 'visible', 'important');
          c.style.setProperty('opacity', '1', 'important');
        }
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

        // Strictly ignore anything containing iframes, tokens, or form controls
        if (el.querySelector && el.querySelector('iframe, textarea, input, form, video, [data-sitekey], [class*="recaptcha"], [id*="recaptcha"]')) continue;

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

  // 7. Universal DOM Video HUD & Stream Sniffer Overlay (Shadow DOM)
  function mountVideoSnifferOverlays() {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_mediasniffer_disabled') === 'true') return;

      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (!video || video._bsSnifferMounted) return;
        const parent = video.parentElement || video.parentNode;
        if (!parent || parent.tagName === 'BODY' || parent.tagName === 'HTML') return;

        video._bsSnifferMounted = true;

        try {
          const pStyle = window.getComputedStyle(parent);
          if (pStyle && pStyle.position === 'static') {
            parent.style.position = 'relative';
          }

          const host = document.createElement('div');
          host.className = 'bs-sniffer-shadow-host';
          host.style.cssText = `
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 2147483647 !important;
            pointer-events: auto !important;
          `;

          const shadow = host.attachShadow({ mode: 'open' });
          shadow.innerHTML = `
            <style>
              .sniffer-pill {
                background: rgba(11, 15, 23, 0.88);
                border: 1px solid rgba(16, 185, 129, 0.45);
                border-radius: 20px;
                padding: 5px 12px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(16, 185, 129, 0.2);
                color: #f3f4f6;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 11.5px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
                line-height: 1.4;
              }
              .sniffer-pill:hover {
                background: rgba(17, 24, 39, 0.95);
                border-color: #10b981;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                transform: translateY(-1px);
              }
              .sniffer-icon {
                color: #10b981;
                font-size: 12px;
              }
              .copied {
                color: #10b981 !important;
                border-color: #10b981 !important;
              }
            </style>
            <div class="sniffer-pill" id="btn-copy" title="Click to copy stream URL (or Right-Click to open in new tab)">
              <span class="sniffer-icon">🔗</span>
              <span id="btn-text">Copy Stream</span>
            </div>
          `;

          const btn = shadow.getElementById('btn-copy');
          const btnText = shadow.getElementById('btn-text');

          function getTargetMediaUrl() {
            if (latestSniffedMediaUrl) return latestSniffedMediaUrl;
            if (video.currentSrc) return video.currentSrc;
            if (video.src) return video.src;
            const source = video.querySelector('source');
            if (source && source.src) return source.src;
            return '';
          }

          if (btn && btnText) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              const targetUrl = getTargetMediaUrl();
              if (targetUrl) {
                try {
                  navigator.clipboard.writeText(targetUrl).then(() => {
                    btnText.textContent = '✅ Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                      btnText.textContent = 'Copy Stream';
                      btn.classList.remove('copied');
                    }, 2000);
                  }).catch(() => {
                    btnText.textContent = '⚠️ Copied Link';
                  });
                } catch (_) {
                  btnText.textContent = '✅ Copied!';
                }
              } else {
                btnText.textContent = '⏳ Sniffing...';
                setTimeout(() => { btnText.textContent = 'Copy Stream'; }, 1500);
              }
            });

            btn.addEventListener('contextmenu', (e) => {
              e.stopPropagation();
              e.preventDefault();
              const targetUrl = getTargetMediaUrl();
              if (targetUrl) {
                window.open(targetUrl, '_blank');
              }
            });
          }

          parent.appendChild(host);
        } catch (_) {}
      });
    } catch (_) {}
  }

  let cScanTimer = null;
  function debouncedContentScan() {
    if (cScanTimer) return;
    cScanTimer = setTimeout(() => {
      annihilateAntiAdblockModals();
      purgeInvisibleOverlays();
      fastPassButtons();
      mountVideoSnifferOverlays();
      cScanTimer = null;
    }, 400);
  }

  // Run immediately and monitor DOM
  annihilateAntiAdblockModals();
  purgeInvisibleOverlays();
  fastPassButtons();
  mountVideoSnifferOverlays();
  const trapInterval = setInterval(debouncedContentScan, 800);
  setTimeout(() => clearInterval(trapInterval), 30000);

  const trapObserver = new MutationObserver(debouncedContentScan);
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
