/**
 * BraveShield Bypass Pro v5.1.0 - Content Script Bridge
 * Master Kill Switch, Video Turbo, Live Privacy Audit, Disposable Identity bridge.
 */

(function() {
  'use strict';

  // Sync WebGL profile strings into sessionStorage/localStorage for inject.js
  try {
    chrome.storage.local.get(['webglVendor', 'webglRenderer', 'masterEnabled'], (res) => {
      if (res && res.webglVendor) sessionStorage.setItem('bs_webgl_vendor', res.webglVendor);
      if (res && res.webglRenderer) sessionStorage.setItem('bs_webgl_renderer', res.webglRenderer);
      if (res && res.masterEnabled === false) {
        sessionStorage.setItem('bs_master_disabled', 'true');
      } else {
        sessionStorage.removeItem('bs_master_disabled');
      }
    });
  } catch (_) {}

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STATUS') {
      sendResponse({
        status: 'active',
        domain: window.location.hostname,
        timestamp: Date.now(),
        isLinkShortener: detectLinkShortener(),
        hasCookieConsent: detectCookieConsent(),
        hasCountdown: detectCountdown()
      });
    } else if (request.type === 'PING') {
      sendResponse({ pong: true });
    } else if (request.type === 'SET_MASTER_STATE') {
      window.postMessage({
        type: 'bs-set-master-state',
        enabled: request.enabled
      }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.type === 'TRIGGER_PIP') {
      window.postMessage({ type: 'bs-trigger-pip' }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.type === 'CLEAR_SITE_STORAGE') {
      window.postMessage({ type: 'bs-clear-storage' }, '*');
      sendResponse({ status: 'ok' });
    } else if (request.type === 'TOGGLE_DEV_MODE') {
      window.postMessage({
        type: 'bs-toggle-dev-mode',
        enabled: request.enabled
      }, '*');
      sendResponse({ status: 'ok' });
    }
    return true;
  });

  function detectLinkShortener() {
    const HOSTS = [
      'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
      'linkvertise.com', 'linkvertise.de', 'clk.sh', 'tp.st', 'lr.in',
      'rekonise.com', 'work.ink', 'lootlinks.co', 'megalink.pro',
      'linksfire.com', 'cutt.ly', 'bit.ly', 'tinyurl.com', 'exe.io',
      'droplink.co', 'gplinks.co', 'xpshort.com', 'tnlink.in', 'za.gl',
      'safelinku.com', 'shrink.to', 'shrink.gg', 'shrink.fun',
      'shorturl.at', 'vipergirls.tk', 'ultralink.me', 'link.short',
      'go.kg', 'go2l.ink', 'anylinks.xyz', 'linktr.ee', 'linkhub.cc',
      'linkhub.lol', 'sk8.sh', 'shorturl.co', 's-url.site'
    ];
    return HOSTS.some(h => window.location.hostname.includes(h));
  }

  function detectCookieConsent() {
    const IDS = [
      'onetrust-banner-sdk', 'CybotCookiebotDialog', 'cookieconsent',
      'cookie-banner', 'gdpr-banner', 'eu-cookie-banner',
      'privacy-settings', 'cookieWall', 'cookie-wall',
      'ot-sdk-container', 'optanon-cookie-policy', 'osano-cookie-box',
      'CookieDeclaration', 'cookieconsent:dialog', 'ccpa-consent',
      'cookie-settings', 'accept-cookies-button', 'cookieChoice',
      'wpgdprc-consent', 'complianz-consent', 'borlabs-cookie',
      'cookieyes', 'cookieyes-banner', 'tarteaucitron',
      'tarteaucitron-alert', 'wp-cookie-consent', 'cookie-banner-container'
    ];
    return IDS.some(id => document.getElementById(id) !== null);
  }

  function detectCountdown() {
    const SELECTORS = [
      '.countdown', '.timer', '#timer', '[class*="countdown"]',
      '[class*="timer"]', '[data-countdown]', '[data-timer]',
      '.countdown-timer', '.redirect-timer', '.wait-timer',
      '.loading-timer', '.progress-timer', '.waittime',
      '.time-remaining', '.time-left', '.timeleft',
      '.cd-timer', '.clock-timer', '.countdown-clock',
      '.redirect-countdown', '.link-countdown', '.ad-timer',
      '[id*="countdown"]', '[id*="timer"]', '[id*="wait"]',
      '[id*="loading"]', '.wait-screen', '.skip-ad-timer'
    ];
    for (const sel of SELECTORS) {
      if (document.querySelector(sel)) return true;
    }
    const bodyText = document.body ? document.body.innerText : '';
    return /wait\s+(?:for\s+)?\d+\s*(?:seconds?|sec)/i.test(bodyText) ||
           /your\s+link\s+(?:is\s+)?(?:almost\s+)?ready/i.test(bodyText);
  }

  // Anti-detection CSS obfuscation (no extension-identifiable IDs/classes)
  const style = document.createElement('style');
  style.textContent = `
    [data-adblock-trap] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .bs-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0f172a;
      color: #38bdf8;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #334155;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: bs-slide-in 0.3s ease-out;
    }
    .bs-toast .dot {
      width: 8px; height: 8px; background: #34d399; border-radius: 50%; flex-shrink: 0;
    }
    .bs-toast.warning .dot { background: #F59E0B; }
    .bs-toast.hiding {
      animation: bs-slide-out 0.3s ease-in forwards;
    }
    @keyframes bs-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes bs-slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  try { (document.head || document.documentElement).appendChild(style); } catch (_) {}

  // ─────────────────────────────────────────────────────
  // Universal Disclaimer, Terms & Compliance Fast-Pass Engine
  // ─────────────────────────────────────────────────────
  const AGE_GATE_TEXT_REGEX = /18\s*(?:\+|years|or\s+older|and\s+older)|over\s*18|compliance\s+gate|verification|confirm\s+entry|disclaimer/i;
  const AGE_AGREE_BTN_REGEX = /18\s*(?:\+|plus|years|or\s+older|and\s+older)|i\s*agree|enter\s*(?:site)?|agree|confirm|accept\s*(?:&|and)?\s*enter|continue\s*to\s*site|proceed|yes(?:,\s*i\s*am)?|je\s*suis\s*majeur|soy\s*mayor|ich\s*bin\s*vollj|同意进入|입장/i;
  const AGE_DECLINE_BTN_REGEX = /leave|exit|no|decline|cancel|disagree|non/i;

  function autoBypassAgeAndConsent() {
    try {
      // 1. Pre-seed compliance & disclaimer cookies / localStorage
      const AGE_COOKIES = [
        'age_verified=1', 'has_accepted_18=1', 'disclaimer=1',
        'accessAgeDisclaimer=true', 'over18=1', 'age_gate=1', 'age_confirmed=1',
        'warning=1', 'modal_closed=1', 'agree=1', 'terms_agreed=1',
        'legal_age=1', 'has_entered=1', 'age_gate_passed=1', 'compliance_passed=1',
        'disclaimer_accepted=1'
      ];
      AGE_COOKIES.forEach(c => {
        try { document.cookie = c + '; path=/; max-age=31536000; SameSite=Lax'; } catch (_) {}
      });

      try {
        localStorage.setItem('age_verified', 'true');
        localStorage.setItem('has_accepted_18', 'true');
        localStorage.setItem('ageVerified', '1');
        localStorage.setItem('accessAgeDisclaimer', 'true');
        localStorage.setItem('legal_age_confirmed', 'true');
        localStorage.setItem('age_gate_passed', 'true');
        localStorage.setItem('disclaimer_accepted', 'true');
        sessionStorage.setItem('age_verified', 'true');
      } catch (_) {}

      // 2. Scan & auto-click age verification buttons
      const ageButtonSelectors = [
        '#enter-button', '.btn-enter', '.enter-btn', '#btn-enter', '#age-verification-yes',
        '.age-gate-btn', '#confirm-age', '#agree-button', '.agree-btn', '#over18',
        '.btn-agree', '#btn-agree', '.modal-agree', '[data-action="enter"]', '[data-action="agree"]',
        '#btn-18plus', '.btn-over-18', '#btn-over-18', '.disclaimer-agree',
        '#disclaimer-agree', '.age-consent-agree', 'button[class*="enter"]', 'a[class*="enter"]',
        'button[id*="enter"]', 'a[id*="enter"]', 'button[class*="agree"]', 'button[id*="agree"]',
        '.age-disclaimer-btn', '#age-disclaimer-btn', '.agree-disclaimer', '#agree-disclaimer', '.btn-accept-age'
      ];

      for (const sel of ageButtonSelectors) {
        document.querySelectorAll(sel).forEach(btn => {
          if (btn && !btn._bsAgeClicked && !isProtectedCaptchaOrAuth(btn)) {
            btn._bsAgeClicked = true;
            try { btn.click(); } catch (_) {}
            try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch (_) {}
          }
        });
      }

      // 3. Scan modal containers with 18+ text and click the affirmative button
      document.querySelectorAll('div, section, dialog, [role="dialog"], .modal, [class*="modal"], [class*="disclaimer"], [id*="disclaimer"], [class*="age-gate"], [id*="age-gate"]').forEach(modal => {
        if (!modal || isProtectedCaptchaOrAuth(modal)) return;
        const text = (modal.innerText || '').toLowerCase();
        if (AGE_GATE_TEXT_REGEX.test(text)) {
          const buttons = modal.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
          for (const btn of buttons) {
            const btnText = (btn.innerText || btn.value || '').trim();
            if (btnText && AGE_AGREE_BTN_REGEX.test(btnText) && !AGE_DECLINE_BTN_REGEX.test(btnText)) {
              if (!btn._bsAgeClicked) {
                btn._bsAgeClicked = true;
                try { btn.click(); } catch (_) {}
                try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch (_) {}
              }
            }
          }
        }
      });

      // 4. Force unhide hidden page wrappers/content
      const contentSelectors = [
        '#main', '#content', '.main-content', '#primary', '.video-list', '.videos',
        '.gallery', '[class*="video-list"]', '[class*="main-content"]', '[id*="main-content"]',
        '.page-wrapper', '#page-content', '.site-content', '#site-content'
      ];
      for (const cSel of contentSelectors) {
        document.querySelectorAll(cSel).forEach(cEl => {
          if (cEl && cEl.style) {
            if (cEl.style.display === 'none') cEl.style.setProperty('display', 'block', 'important');
            if (cEl.style.visibility === 'hidden') cEl.style.setProperty('visibility', 'visible', 'important');
            if (cEl.style.opacity === '0') cEl.style.setProperty('opacity', '1', 'important');
            if (cEl.style.filter && cEl.style.filter.includes('blur')) cEl.style.setProperty('filter', 'none', 'important');
          }
        });
      }
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────
  // Universal Anti-Adblock Modal Annihilator & Scroll Unlocker
  // ─────────────────────────────────────────────────────
  const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ads\s+help\s+us\s+keep|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

  function isProtectedCaptchaOrAuth(el) {
    if (!el) return false;
    const host = (window.location.hostname || '').toLowerCase();
    if (host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') || host.includes('arkoselabs.com')) {
      return true;
    }
    const htmlSnippet = (el.outerHTML || '').slice(0, 800).toLowerCase();
    const textSnippet = (el.innerText || '').toLowerCase();
    if (htmlSnippet.includes('arkose') || htmlSnippet.includes('funcaptcha') || htmlSnippet.includes('recaptcha') || htmlSnippet.includes('hcaptcha') || htmlSnippet.includes('turnstile') || htmlSnippet.includes('cf-chl') || htmlSnippet.includes('challenge-form') || htmlSnippet.includes('arkoselabs')) {
      return true;
    }
    if (textSnippet.includes("make sure that you're a human") || textSnippet.includes('verify you are human') || textSnippet.includes('security check') || textSnippet.includes('please verify')) {
      return true;
    }
    if (el.querySelector && el.querySelector('iframe[src*="arkose"], iframe[src*="arkoselabs"], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], iframe[src*="cloudflare"], #challenge-stage, .arkose-container')) {
      return true;
    }
    return false;
  }

  function annihilateAntiAdblockModals() {
    try {
      // First pass: auto-bypass compliance and disclaimer gates cleanly
      autoBypassAgeAndConsent();

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

          // Auto-click "I've Disabled AdBlocker" button or close button
          const buttons = target.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
          for (const btn of buttons) {
            if (/disabled\s+adblocker|i've\s+disabled|close|ok|dismiss|i\s+understand/i.test(btn.innerText || btn.value || '')) {
              try { btn.click(); } catch (_) {}
            }
          }

          // Annihilate the modal
          try {
            target.remove();
          } catch (_) {
            target.style.setProperty('display', 'none', 'important');
            target.style.setProperty('visibility', 'hidden', 'important');
            target.style.setProperty('opacity', '0', 'important');
            target.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      }

      // Clean up dark backdrops and dimmed overlays (only if not holding main content or forms)
      const backdropSelectors = [
        '.modal-backdrop', '.swal2-backdrop', '.swal2-container', '.overlay-backdrop',
        '[class*="backdrop"]', '[class*="overlay"]', '#overlay', '.overlay',
        '.popup-overlay', '#popup-overlay', '.fade.show', '.sk-overlay', '#sk-overlay',
        '[class*="adb-overlay"]', '#adb-overlay'
      ];
      
      for (const sel of backdropSelectors) {
        document.querySelectorAll(sel).forEach(b => {
          if (b && !isProtectedCaptchaOrAuth(b) && !b.querySelector('h1, h2, form, video, article, #stat-modules, .video-list, [class*="video"]')) {
            try { b.remove(); } catch (_) { b.style.display = 'none'; }
          }
        });
      }

      // Remove fixed fullscreen dark dimmers
      document.querySelectorAll('div, section').forEach(el => {
        try {
          if (isProtectedCaptchaOrAuth(el)) return;
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute') {
            const zIndex = parseInt(style.zIndex, 10) || 0;
            const rect = el.getBoundingClientRect();
            const isFullscreen = rect.width >= (window.innerWidth * 0.85) && rect.height >= (window.innerHeight * 0.85);
            if (isFullscreen && zIndex >= 10 && !el.querySelector('header, nav, main, article, footer, video, form, h1, h2, .video-list, [class*="video"]')) {
              const bg = style.backgroundColor;
              if (bg && (bg.includes('rgba') || bg.includes('rgb(0, 0, 0)') || bg.includes('rgb(30,') || bg.includes('#000'))) {
                try { el.remove(); } catch (_) { el.style.display = 'none'; }
              }
            }
          }
        } catch (_) {}
      });

      // Restore Page Scrolling & Interactivity
      document.body.style.setProperty('overflow', 'auto', 'important');
      document.body.style.setProperty('position', 'static', 'important');
      document.body.style.setProperty('filter', 'none', 'important');
      document.body.style.setProperty('opacity', '1', 'important');
      document.body.style.setProperty('pointer-events', 'auto', 'important');
      document.documentElement.style.setProperty('overflow', 'auto', 'important');
      document.documentElement.style.setProperty('filter', 'none', 'important');
      document.documentElement.style.setProperty('opacity', '1', 'important');
      document.documentElement.style.setProperty('pointer-events', 'auto', 'important');

      // Remove blur, dimming, and display:none from main content
      document.querySelectorAll('main, #main, .container, .card, body > div, [class*="content"], [id*="content"]').forEach(node => {
        if (node.style) {
          if (node.style.filter && (node.style.filter.includes('blur') || node.style.filter.includes('brightness'))) {
            node.style.setProperty('filter', 'none', 'important');
          }
          if (node.style.backdropFilter) {
            node.style.setProperty('backdrop-filter', 'none', 'important');
          }
          if (node.style.opacity && parseFloat(node.style.opacity) < 0.9 && !node.id.includes('stat-')) {
            node.style.setProperty('opacity', '1', 'important');
          }
          if (node.style.pointerEvents === 'none') {
            node.style.setProperty('pointer-events', 'auto', 'important');
          }
          if (node.style.display === 'none' && !node.classList.contains('modal') && !node.classList.contains('overlay') && !node.id.includes('stat-')) {
            node.style.setProperty('display', 'block', 'important');
          }
        }
      });
    } catch (_) {}
  }
  }

  // ─────────────────────────────────────────────────────
  // Active DOM Countdown & Button Unlocker (ISOLATED World Fallback)
  // ─────────────────────────────────────────────────────
  function fastPassDOMTimersAndButtons() {
    try {
      const host = (window.location.hostname || '').toLowerCase();
      if (host.includes('spotify.com') || host.includes('youtube.com') || host.includes('netflix.com')) return;

      // Zero out countdown numbers displayed in DOM
      const timerEls = document.querySelectorAll('.timer, #timer, .countdown, #countdown, #wpsafe-time, #time, #seconds, [data-timer], [data-countdown], .wait-time');
      for (const tEl of timerEls) {
        if (tEl && tEl.innerText && /\d+\s*s?/i.test(tEl.innerText)) {
          const num = parseInt(tEl.innerText, 10);
          if (num > 0) {
            tEl.innerText = '0';
            tEl.textContent = '0';
            try { tEl.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
          }
        }
      }

      // Unlock and auto-click ready download/link buttons
      const btns = document.querySelectorAll('#btn-main, #get-link, #getlink, #download-btn, #btn-download, .get-link, .download-btn, .btn-download, #wpsafe-generate, #wpsafe-snp, #tp-snp2');
      for (const btn of btns) {
        if (btn) {
          const txt = (btn.innerText || btn.value || '').trim();
          if (/getting\s+link|please\s+wait|loading|generating/i.test(txt)) continue;
          
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
          if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.style.setProperty('opacity', '1', 'important');
          btn.style.setProperty('display', 'inline-block', 'important');

          if (!btn._bsAutoFastClicked && (/^(get\s+link|download|continue|next|download\s+now|direct\s+download)$/i.test(txt) || btn.id === 'wpsafe-generate')) {
            btn._bsAutoFastClicked = true;
            setTimeout(() => {
              try { btn.click(); } catch (_) {}
              try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch (_) {}
            }, 300);
          }
        }
      }
    } catch (_) {}
  }

  // Run immediately and monitor DOM
  annihilateAntiAdblockModals();
  fastPassDOMTimersAndButtons();
  const trapInterval = setInterval(() => {
    annihilateAntiAdblockModals();
    fastPassDOMTimersAndButtons();
  }, 250);
  setTimeout(() => clearInterval(trapInterval), 15000);

  const trapObserver = new MutationObserver(() => {
    annihilateAntiAdblockModals();
    fastPassDOMTimersAndButtons();
  });
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function showBypassToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'bs-toast' + (type === 'warning' ? ' warning' : '');
    toast.innerHTML = '<span class="dot"></span><span>' + message + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // "Click On Ads To Get Download Link" Universal Fast-Pass Engine
  function bypassClickOnAdsPattern() {
    try {
      let targetDownloadUrl = '';
      const allAnchors = document.querySelectorAll('a[href]');
      for (const a of allAnchors) {
        const h = a.href || '';
        if (h && (h.includes('dupload.net') || h.includes('drive.google') || h.includes('mega.nz') || h.includes('mediafire') || h.includes('pixeldrain') || h.includes('gofile') || h.includes('1fichier') || h.includes('apkadmin') || h.includes('uploadrar') || h.includes('/go/') || h.includes('/links/'))) {
          targetDownloadUrl = h;
          break;
        }
      }

      const AD_CLICK_TEXT_REGEX = /click\s+(?:on\s+)?ads?\s+(?:to\s+get|and\s+wait|\&amp;\s+wait|\&\s+wait)|click\s+on\s+ad\s+to\s+get\s+download|click\s+any\s+ad\s+to\s+unlock|click\s+an\s+ad\s+to\s+continue|click\s+on\s+banner\s+to\s+get\s+link|verify\s+ad\s+click|click\s+ad\s+to\s+download/i;

      const candidates = document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"], a.btn, a.button');
      for (const el of candidates) {
        if (!el || !el.innerText) continue;
        const txt = el.innerText.trim();

        if (AD_CLICK_TEXT_REGEX.test(txt)) {
          el.removeAttribute('disabled');
          el.removeAttribute('aria-disabled');
          el.style.setProperty('pointer-events', 'auto', 'important');
          el.style.setProperty('cursor', 'pointer', 'important');
          el.style.setProperty('opacity', '1', 'important');

          if (!el._bsRewired) {
            el._bsRewired = true;
            el.onclick = function(e) {
              if (targetDownloadUrl) {
                e.preventDefault();
                e.stopPropagation();
                window.open(targetDownloadUrl, '_blank');
              }
            };
          }
        }
      }

      // Auto-scroll to the action button on long blog posts
      const actionButton = document.querySelector('#wpsafe-link a, #wpsafe-generate, #btn-main, a[href*="dupload.net"], .get-link, .download-btn');
      if (actionButton && !window._bsScrolled) {
        window._bsScrolled = true;
        try {
          actionButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Force Navigation on Safelink / Download Links (excluding pagination)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (href && (href.startsWith('http') || href.startsWith('//')) && !href.startsWith('javascript:')) {
      if (!/reverse-paginate|updated-max|max-results|blog-pager|pagination/i.test(href)) {
        setTimeout(() => {
          if (e.defaultPrevented) {
            window.open(href, anchor.target || '_blank');
          }
        }, 50);
      }
    }
  }, true);

  setInterval(bypassClickOnAdsPattern, 400);

  // Notify on link shortener detection
  if (detectLinkShortener()) {
    showBypassToast('Redirect detected - proceeding...');
    chrome.runtime.sendMessage({ type: 'BYPASS_COMPLETE', hostname: window.location.hostname });
  }

  // Notify on countdown detection
  if (detectCountdown()) {
    showBypassToast('Processing - please wait...', 'warning');
  }

  // Pass selected UA to inject.js via custom event (generic event name)
  chrome.storage.local.get(['selectedUA'], (res) => {
    if (res.selectedUA && res.selectedUA !== 'random') {
      const UA_MAP = {
        'chrome_win131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'chrome_win130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'chrome_win129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_win128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_win124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_mac131': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'chrome_mac130': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'chrome_mac129': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.0.0' },
        'chrome_mac124': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'macOS', mobile: false, platformVersion: '14.4.0' },
        'chrome_lin131': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0' },
        'chrome_lin130': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0' },
        'chrome_lin124': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Linux', mobile: false, platformVersion: '6.5.0' },
        'edge131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'edge130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'edge129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'edge128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'edge124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'firefox133': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'firefox132': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'firefox131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'firefox_mac133': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'firefox_mac132': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.0.0' },
        'safari18': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'safari17': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '14.6.0' },
        'safari16': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '13.6.0' },
        'opera110': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/110.0.0.0', brands: [{ brand: 'Opera', version: '110' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'opera108': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/108.0.0.0', brands: [{ brand: 'Opera', version: '108' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'mobile_chrome131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_chrome130': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_chrome124': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_samsung28': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/125.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '28' }, { brand: 'Chromium', version: '125' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_samsung25': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '25' }, { brand: 'Chromium', version: '121' }, { brand: 'Not_A Brand', version: '8' }], platform: 'Android', mobile: true, platformVersion: '13.0.0' },
        'mobile_firefox133': { ua: 'Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0', brands: [], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'safari_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'safari_ios17': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0' },
        'chrome_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'ipad_os18': { ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'ipad_os17': { ua: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0' },
        'android_tab131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' }
      };
      const uaData = UA_MAP[res.selectedUA];
      if (uaData) {
        localStorage.setItem('bs_ua', JSON.stringify(uaData));
        window.dispatchEvent(new CustomEvent('bs_ua_update', { detail: uaData }));
      }
    }
  });

  console.log('[Content] Active on ' + window.location.hostname);
})();
