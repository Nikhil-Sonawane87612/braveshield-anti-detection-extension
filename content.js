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
      if (res.masterEnabled === false) sessionStorage.setItem('bs_master_disabled', 'true');
      else sessionStorage.removeItem('bs_master_disabled');

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

      if (res.maskClientHints === false) sessionStorage.setItem('bs_hints_disabled', 'true');
      else sessionStorage.removeItem('bs_hints_disabled');

      if (res.spotifyUnlocked === false) sessionStorage.setItem('bs_spotify_disabled', 'true');
      else sessionStorage.removeItem('bs_spotify_disabled');

      if (res.youtubeAds === false) sessionStorage.setItem('bs_youtube_disabled', 'true');
      else sessionStorage.removeItem('bs_youtube_disabled');

      if (res.twitchShieldEnabled === false) sessionStorage.setItem('bs_twitch_disabled', 'true');
      else sessionStorage.removeItem('bs_twitch_disabled');

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
    }
  });

  // 3. Feature A: Floating Obsidian-Neon Direct Link HUD
  let hudRendered = false;
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
            <span style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#a0aec0; font-size:12px;">${targetUrl}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
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
        '#imnotrobot, #btn6, #btn-captcha, .btn-captcha, #captcha-btn, button[id*="robot" i], input[value*="ROBOT" i], input[value*="Robot" i], [onclick*="robot" i]'
      );
      for (const c of captchaNodes) {
        c.style.setProperty('display', 'inline-block', 'important');
        c.style.setProperty('visibility', 'visible', 'important');
        c.style.setProperty('opacity', '1', 'important');
        c.style.setProperty('pointer-events', 'auto', 'important');
        c.style.setProperty('z-index', '2147483647', 'important');
        c.style.setProperty('position', 'relative', 'important');
        let p = c.parentElement;
        let depth = 0;
        while (p && p !== document.body && depth < 6) {
          p.style.setProperty('visibility', 'visible', 'important');
          if (p.style.display === 'none') p.style.setProperty('display', 'block', 'important');
          if (p.style.opacity === '0') p.style.setProperty('opacity', '1', 'important');
          p.style.setProperty('pointer-events', 'auto', 'important');
          p.style.setProperty('z-index', '2147483647', 'important');
          p = p.parentElement;
          depth++;
        }
      }

      // Neutralize click-blocker overlays & ad-hijack backdrops covering the viewport
      const clickBlockers = document.querySelectorAll(
        '.modal-backdrop, .swal2-backdrop, .overlay-backdrop, [class*="backdrop"], .sk-overlay, #sk-overlay, [class*="adb-overlay"], #adb-overlay, ' +
        'div[style*="position: fixed"], div[style*="position: absolute"], ' +
        '.overlay, #overlay, .popup-overlay, #popup-overlay, .fade.show'
      );
      for (const b of clickBlockers) {
        if (b && !isProtectedCaptchaOrAuth(b) && !b.querySelector('h1, h2, form, video, article, .video-list, [data-sitekey], iframe, #imnotrobot, #btn6, .btn-captcha')) {
          const rect = b.getBoundingClientRect();
          if (rect.width >= window.innerWidth * 0.7 && rect.height >= window.innerHeight * 0.7) {
            try { b.remove(); } catch (_) { b.style.display = 'none'; b.style.pointerEvents = 'none'; }
          }
        }
      }
    } catch (_) {}
  }

  // Feature B: Universal Paywall & Blur-Filter Defuser in Content Script
  function defusePaywallsAndBlur() {
    try {
      const blurredElements = document.querySelectorAll('[style*="filter"], [style*="blur"], .blurred, .blur, .paywall-blur, .content-gate, .quora-blur');
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
      ensureCaptchasVisible();
      defusePaywallsAndBlur();

      const candidates = document.querySelectorAll('div, section, dialog, [role="dialog"], [role="alertdialog"], .modal, .swal2-container, .sweet-alert, .overlay, .popup, [class*="modal"], [class*="overlay"], [class*="popup"], [id*="modal"], [id*="overlay"], [id*="adblock"]');
      
      for (const el of candidates) {
        if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
        
        if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
          let target = el;
          let parent = el.parentElement;
          while (parent && parent !== document.body && parent !== document.documentElement) {
            if (isProtectedCaptchaOrAuth(parent)) {
              target = null;
              break;
            }
            const style = window.getComputedStyle(parent);
            if (style.position === 'fixed' || style.position === 'absolute' || parent.classList.contains('modal') || parent.classList.contains('overlay') || parent.classList.contains('swal2-container')) {
              target = parent;
            }
            parent = parent.parentElement;
          }

          if (!target || isProtectedCaptchaOrAuth(target)) continue;

          try {
            target.remove();
          } catch (_) {
            target.style.setProperty('display', 'none', 'important');
            target.style.setProperty('visibility', 'hidden', 'important');
          }
        }
      }

      // Sweep dark/invisible backdrops
      const backdropSelectors = [
        '.modal-backdrop', '.swal2-backdrop', '.swal2-container', '.overlay-backdrop',
        '[class*="backdrop"]', '[class*="overlay"]', '#overlay', '.overlay',
        '.popup-overlay', '#popup-overlay', '.fade.show', '.sk-overlay', '#sk-overlay',
        '[class*="adb-overlay"]', '#adb-overlay'
      ];
      for (const sel of backdropSelectors) {
        document.querySelectorAll(sel).forEach(b => {
          if (b && !isProtectedCaptchaOrAuth(b) && !b.querySelector('h1, h2, form, video, article, .video-list, [data-sitekey], iframe, #imnotrobot, #btn6, .btn-captcha')) {
            try { b.remove(); } catch (_) { b.style.display = 'none'; b.style.pointerEvents = 'none'; }
          }
        });
      }

      // Restore Page Scrolling & Interaction
      if (document.body) {
        document.body.style.setProperty('overflow', 'auto', 'important');
        document.body.style.setProperty('filter', 'none', 'important');
        document.body.style.setProperty('opacity', '1', 'important');
        document.body.style.setProperty('pointer-events', 'auto', 'important');
      }
      if (document.documentElement) {
        document.documentElement.style.setProperty('overflow', 'auto', 'important');
        document.documentElement.style.setProperty('filter', 'none', 'important');
        document.documentElement.style.setProperty('opacity', '1', 'important');
      }
    } catch (_) {}
  }

  // 6. Shortener Button Unlocker (Arm buttons without auto-clicking)
  function fastPassButtons() {
    try {
      function isPagination(el) {
        if (!el) return true;
        const href = (el.getAttribute('href') || '').toLowerCase();
        return /reverse-paginate|updated-max|max-results|blog-pager|pagination/i.test(href);
      }

      // Arm buttons (remove disabled, show button, set pointer-events: auto, elevate z-index)
      const btns = document.querySelectorAll('#btn-main, #get-link, #getlink, #download-btn, #btn-download', '.get-link, .download-btn, .btn-download, #wpsafe-generate, #continue-btn, #btn-continue, #imnotrobot, #btn6, #btn-captcha, .btn-captcha, #openInChrome, .btn-open-chrome, a.btn, button.btn, [class*="btn"], button, input[type="button"], input[type="submit"]');
      for (const btn of btns) {
        if (btn && !isPagination(btn)) {
          const txt = (btn.innerText || btn.value || btn.textContent || '').trim();
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
          if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.style.setProperty('opacity', '1', 'important');
          btn.style.setProperty('display', 'inline-block', 'important');
          btn.style.setProperty('cursor', 'pointer', 'important');
          btn.style.setProperty('z-index', '2147483647', 'important');
          btn.style.setProperty('position', 'relative', 'important');
          if (btn.parentElement) {
            btn.parentElement.style.setProperty('pointer-events', 'auto', 'important');
            btn.parentElement.style.setProperty('visibility', 'visible', 'important');
          }
          if (/getting\s+link|generating/i.test(txt)) {
            btn.innerText = 'GET LINK';
            btn.textContent = 'GET LINK';
          }
        }
      }
    } catch (_) {}
  }

  let cScanTimer = null;
  function debouncedContentScan() {
    if (cScanTimer) return;
    cScanTimer = setTimeout(() => {
      annihilateAntiAdblockModals();
      fastPassButtons();
      cScanTimer = null;
    }, 500);
  }

  // Run immediately and monitor DOM
  annihilateAntiAdblockModals();
  fastPassButtons();
  const trapInterval = setInterval(debouncedContentScan, 1000);
  setTimeout(() => clearInterval(trapInterval), 15000);

  const trapObserver = new MutationObserver(debouncedContentScan);
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
