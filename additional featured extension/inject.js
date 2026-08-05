/**
 * BraveShield Bypass Pro v4.0 - Complete Stealth Engine
 * 20+ Modules: Navigator, Client Hints, GPC, Ad Stubs, DOM Traps, WebGL,
 * Link Shortener Bypass, Cookie Consent, Timer Auto-Click, Auto-Scroll,
 * Redirect Chain Follow, Popunder Interceptor, brave:// Leak Fix,
 * Storage Leak Fix, AudioContext Normalization, Canvas Normalization,
 * navigator.webdriver Hide, WebRTC Leak Prevention, Permission Auto-Deny,
 * Network Bait Faking, Performance Timer Clamp.
 */
(function() {
  'use strict';

  if (window.__brave_shield_bypass_active) return;
  window.__brave_shield_bypass_active = true;

  console.log('[BraveShield Bypass] v4.0 - Injecting 20+ stealth modules into MAIN world...');

  // ==========================================
  // 1. NEUTRALIZE NAVIGATOR.BRAVE
  // ==========================================
  try {
    if ('brave' in Navigator.prototype) {
      delete Navigator.prototype.brave;
    }
    if ('brave' in navigator) {
      Object.defineProperty(navigator, 'brave', {
        get: function() { return undefined; },
        configurable: true,
        enumerable: false
      });
    }
    // Also override isBrave()
    if (Navigator.prototype.isBrave) {
      Navigator.prototype.isBrave = function() { return Promise.resolve(false); };
    }
  } catch (e) {}

  // ==========================================
  // 2. MASK USER AGENT BRANDS (CLIENT HINTS)
  // ==========================================
  try {
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      const cleanBrands = navigator.userAgentData.brands
        .filter(b => !b.brand.toLowerCase().includes('brave'))
        .concat([
          { brand: 'Google Chrome', version: '124' },
          { brand: 'Chromium', version: '124' },
          { brand: 'Not-A.Brand', version: '99' }
        ]);
      const uniqueBrands = Array.from(new Set(cleanBrands.map(b => b.brand)))
        .map(brand => cleanBrands.find(b => b.brand === brand));
      Object.defineProperty(navigator.userAgentData, 'brands', {
        get: () => uniqueBrands, configurable: true
      });
      if (navigator.userAgentData.getHighEntropyValues) {
        const origGetHigh = navigator.userAgentData.getHighEntropyValues;
        navigator.userAgentData.getHighEntropyValues = function(hints) {
          return origGetHigh.call(this, hints).then(res => {
            if (res.brands) res.brands = res.brands.filter(b => !b.brand.toLowerCase().includes('brave'));
            return res;
          });
        };
      }
    }
  } catch (e) {}

  // ==========================================
  // 3. MASK GLOBAL PRIVACY CONTROL (GPC)
  // ==========================================
  try {
    if ('globalPrivacyControl' in navigator) {
      Object.defineProperty(navigator, 'globalPrivacyControl', {
        get: function() { return undefined; },
        configurable: true, enumerable: false
      });
    }
  } catch (e) {}

  // ==========================================
  // 4. AD/ANALYTICS VARIABLE STUBS
  // ==========================================
  if (!window.adsbygoogle) {
    const fakeAdsArray = [];
    fakeAdsArray.push = function(arg) {
      if (typeof arg === 'object' && arg && arg.onload) {
        try { arg.onload(); } catch(e) {}
      }
      return Array.prototype.push.apply(this, arguments);
    };
    fakeAdsArray.loaded = true;
    Object.defineProperty(window, 'adsbygoogle', {
      get: () => fakeAdsArray, set: (v) => {}, configurable: true
    });
  }
  if (!window.ga) {
    const fakeGa = function() {
      const lastArg = arguments[arguments.length - 1];
      if (typeof lastArg === 'function') { try { lastArg(); } catch(e) {} }
      else if (typeof lastArg === 'object' && lastArg && typeof lastArg.hitCallback === 'function') {
        try { lastArg.hitCallback(); } catch(e) {}
      }
    };
    fakeGa.q = []; fakeGa.l = Date.now(); fakeGa.loaded = true;
    window.ga = fakeGa;
  }
  if (!window.gtag) window.gtag = function() {};
  if (!window.googletag) {
    const fakePubAds = {
      addEventListener: () => fakePubAds, clear: () => true,
      enableSingleRequest: () => fakePubAds, enableServices: () => fakePubAds,
      refresh: () => fakePubAds, setTargeting: () => fakePubAds,
      collapseEmptyDivs: () => fakePubAds,
      definePassback: () => ({ display: () => {} }), getSlots: () => []
    };
    window.googletag = {
      cmd: [], display: () => {}, enableServices: () => {},
      pubads: () => fakePubAds,
      defineSlot: () => ({
        addService: () => ({ setTargeting: () => ({ addModule: () => {} }) }),
        setTargeting: () => {}, setCollapseEmptyDIV: () => {}
      }),
      apiReady: true
    };
    setInterval(() => {
      if (window.googletag && Array.isArray(window.googletag.cmd)) {
        while (window.googletag.cmd.length > 0) {
          const fn = window.googletag.cmd.shift();
          if (typeof fn === 'function') { try { fn(); } catch(e) {} }
        }
      }
    }, 50);
  }
  if (!window.pbjs) {
    window.pbjs = {
      que: [], addAdUnits: () => {},
      requestBids: (cfg) => { if (cfg && typeof cfg.bidsBackHandler === 'function') setTimeout(cfg.bidsBackHandler, 10); },
      setTargetingForGPT: () => {}
    };
  }

  // ==========================================
  // 5. DOM TRAP NEUTRALIZATION
  // ==========================================
  const AD_TRAP_PATTERNS = [
    /ad[s]?[-_]?google/i, /ad[-_]?banner/i, /ad[-_]?unit/i,
    /ad[-_]?container/i, /ad[-_]?wrapper/i, /adblock/i,
    /blockadblock/i, /fuckadblock/i, /sponsor/i,
    /taboola/i, /outbrain/i, /admiral/i, /ciduno/i,
    /prebid/i, /moat/i, /intent/i, /adskeeper/i,
    /propeller/i, /hilltop/i, /diablo/i
  ];
  function isAdTrapElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    const id = el.id || '';
    const className = typeof el.className === 'string' ? el.className : '';
    const src = el.getAttribute ? (el.getAttribute('src') || '') : '';
    return AD_TRAP_PATTERNS.some(p => p.test(id) || p.test(className) || p.test(src));
  }
  const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  if (origOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: function() {
        const actual = origOffsetHeight.get.call(this);
        if (actual === 0 && isAdTrapElement(this)) return 250;
        return actual;
      }, configurable: true
    });
  }
  const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  if (origOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      get: function() {
        const actual = origOffsetWidth.get.call(this);
        if (actual === 0 && isAdTrapElement(this)) return 300;
        return actual;
      }, configurable: true
    });
  }
  const origGetBCR = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function() {
    const rect = origGetBCR.call(this);
    if (rect.width === 0 && rect.height === 0 && isAdTrapElement(this)) {
      return { top: 100, bottom: 350, left: 100, right: 400, width: 300, height: 250, x: 100, y: 100, toJSON() { return this; } };
    }
    return rect;
  };
  const origGCS = window.getComputedStyle;
  window.getComputedStyle = function(el, pseudoElt) {
    const style = origGCS.call(this, el, pseudoElt);
    if (isAdTrapElement(el)) {
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'display' && target.display === 'none') return 'block';
          if (prop === 'visibility' && target.visibility === 'hidden') return 'visible';
          if (prop === 'opacity' && target.opacity === '0') return '1';
          const val = Reflect.get(target, prop);
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });
    }
    return style;
  };

  // ==========================================
  // 6. WEBGL FARBLING NORMALIZATION
  // ==========================================
  try {
    const SPOOF_VENDOR = "Google Inc. (NVIDIA)";
    const SPOOF_RENDERER = "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";
    if (window.WebGLRenderingContext) {
      const origGP = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return SPOOF_VENDOR;
        if (parameter === 37446) return SPOOF_RENDERER;
        if (parameter === 0x1F01) return "WebGL 1.0 (OpenGL ES 2.0 Chromium)"; // GL_VERSION
        if (parameter === 0x1F00) return "WebKit"; // GL_VENDOR fallback
        return origGP.call(this, parameter);
      };
    }
    if (window.WebGL2RenderingContext) {
      const origGP2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return SPOOF_VENDOR;
        if (parameter === 37446) return SPOOF_RENDERER;
        return origGP2.call(this, parameter);
      };
    }
  } catch (e) {}

  // ==========================================
  // 7. LINK SHORTENER AUTO-BYPASS (ENHANCED)
  // ==========================================
  const SHORTENER_HOSTS = [
    'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
    'linkvertise.com', 'clk.sh', 'tp.st', 'lr.in', 'rekonise.com',
    'work.ink', 'lootlinks.co', 'megalink.pro', 'linksfire.com',
    'cutt.ly', 'bit.ly', 'tinyurl.com', 'shorturl.at', 'za.uy',
    'adfoc.us', 'cutt.us', 'gsul.me', 'dulink.in', 'safelinku.com',
    'tn.id', 'shorturl.at', 'rb.gy', 'is.gd', 'v.gd',
    't.co', 'goo.gl', 'linkfly.ga', 'urls.short', 'lootlinks.co',
    'linkbucks.com', 'adcash.com', 'propellerads.com', 'clk.sh',
    'ouo.press', 'ouo.fyi', 'ouoxxx.com', 'shrinke.me', 'exe.io',
    'gyanilinks.com', 'tnvalue.in', 'srt.am', 'droplink.co',
    'za.gl', 'tnlink.in', 'xpshort.com', 'adpaytm.com',
    'gplinks.co', 'mplaylink.com', 'earnl.xyz', 'tnmechi.info'
  ];

  function isLinkShortener() {
    const h = window.location.hostname;
    return SHORTENER_HOSTS.some(s => h.includes(s));
  }

  // ==========================================
  // 8. COUNTDOWN TIMER BYPASS (DOM-ONLY APPROACH)
  // ==========================================
  // Does NOT touch setInterval/setTimeout/eval at all.
  // Only manipulates the DOM: sets countdown text to 0, enables
  // disabled buttons, and auto-clicks download buttons.
  // This avoids "bad request" errors because server-side timers
  // are never interfered with.
  function bypassCountdownTimers() {
    // === PART A: Find and neutralize countdown elements in DOM ===
    const COUNTDOWN_SELECTORS = [
      '.countdown', '.timer', '#timer', '#countdown',
      '[class*="countdown"]', '[class*="timer"]', '[class*="wait"]',
      '[id*="countdown"]', '[id*="timer"]', '[id*="wait"]',
      '[data-countdown]', '[data-timer]',
      '.seconds', '.seconds-count', '.count-down',
      '[class*="seconds"]', '[class*="count-down"]'
    ];

    const COUNTDOWN_TEXT = /^\s*\d+\s*(?:seconds?|sec|s)?\s*$/i;
    const COUNTDOWN_NUM = /^\s*\d+\s*$/;

    function neutralizeCountdownElements() {
      COUNTDOWN_SELECTORS.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => {
            const text = (el.textContent || '').trim();
            // If it shows a number like "15" or "15 seconds", force to 0
            if (COUNTDOWN_TEXT.test(text) || COUNTDOWN_NUM.test(text)) {
              el.textContent = '0';
              el.setAttribute('data-brave-shield', 'countdown-neutralized');
            }
          });
        } catch(e) {}
      });
    }

    // === PART B: Find and enable disabled download/get-link buttons ===
    const BUTTON_DISABLE_SELECTORS = [
      'a[disabled]', 'button[disabled]',
      'a.btn-primary[disabled]', 'button.btn-primary[disabled]',
      'a.get-link[disabled]', 'button.get-link[disabled]',
      'a.download[disabled]', 'button.download[disabled]',
      'a[href="#"]', 'a[href=""]', 'a[href="javascript:void(0)"]',
      '[class*="disabled"][href*="download"]',
      '[class*="disabled"][href*="get-link"]',
      '[class*="disabled"][href*="generar"]',
      '[class*="disabled"][href*="continue"]'
    ];

    function enableDisabledButtons() {
      BUTTON_DISABLE_SELECTORS.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => {
            // Enable the button
            el.removeAttribute('disabled');
            el.removeAttribute('aria-disabled');
            el.classList.remove('disabled', 'btn-disabled', 'is-disabled');
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
          });
        } catch(e) {}
      });

      // Also scan for buttons with "wait" or disabled-like styles
      document.querySelectorAll('a, button').forEach(el => {
        const text = (el.textContent || '').trim().toLowerCase();
        const cls = (el.className || '').toLowerCase();
        const style = window.getComputedStyle(el);

        if (/^(wait|generating|loading|processing|\.\.\.)\s*\.{0,3}$/i.test(text) ||
            /disabled|waiting|generating/i.test(cls) ||
            style.pointerEvents === 'none' || style.opacity === '0.5') {
          el.removeAttribute('disabled');
          el.removeAttribute('aria-disabled');
          el.classList.remove('disabled', 'btn-disabled', 'is-disabled', 'waiting');
          el.style.pointerEvents = 'auto';
          el.style.opacity = '1';
          el.style.cursor = 'pointer';
        }
      });
    }

    // === PART C: Auto-click download buttons when ready ===
    const DOWNLOAD_SELECTORS = [
      'a[href*="download"]', 'a[href*="get-link"]', 'a[href*="generar"]',
      'a[href*="continue"]', 'a[href*="proceed"]',
      'button.download', 'button.get-link', 'button.continue',
      '.download-btn', '.get-link-btn', '.continue-btn',
      '#download-btn', '#get-link-btn', '#continue-btn',
      '[class*="download"]', '[class*="get-link"]', '[class*="generar"]',
      '[id*="download"]', '[id*="get-link"]', '[id*="generar"]',
      'a.btn-primary', 'a.btn-download', 'button.btn-primary',
      'a[onclick*="download"]', 'a[onclick*="link"]',
      'a[data-download]', 'a[data-link]'
    ];

    const LINK_PATTERNS = /download|get-link|generar|continue|proceed|descargar|bajar|obtener/i;

    function findAndClickDownloadButton() {
      for (const selector of DOWNLOAD_SELECTORS) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            if (el.offsetParent !== null && el.offsetWidth > 0 && el.offsetHeight > 0) {
              const text = (el.textContent || '').trim();
              const href = el.getAttribute('href') || '';
              const onclick = el.getAttribute('onclick') || '';
              const cls = (el.className || '').toLowerCase();

              // Skip if button is still disabled/waiting
              if (/disabled|waiting|generating/i.test(cls)) continue;
              if (el.hasAttribute('disabled')) continue;
              if (el.style.pointerEvents === 'none') continue;

              if (LINK_PATTERNS.test(text + ' ' + href + ' ' + onclick) && text.length < 50) {
                console.log('[BraveShield Bypass] Found download button: ' + text.substring(0, 30));
                el.click();
                return true;
              }
            }
          }
        } catch(e) {}
      }
      return false;
    }

    // === Run all parts on DOM changes ===
    function runAll() {
      neutralizeCountdownElements();
      enableDisabledButtons();
      findAndClickDownloadButton();
    }

    const observer = new MutationObserver(() => {
      setTimeout(runAll, 200);
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }

    // Run immediately and at intervals
    runAll();
    setTimeout(runAll, 1000);
    setTimeout(runAll, 3000);
    setTimeout(runAll, 5000);
    setTimeout(runAll, 8000);
    setTimeout(runAll, 12000);

    console.log('[BraveShield Bypass] DOM-only timer bypass active (no JS timer interference)');
  }

  // ==========================================
  // 9. COOKIE CONSENT AUTO-DISMISS
  // ==========================================
  function autoDismissCookieConsent() {
    const CONSENT_SELECTORS = [
      '#onetrust-accept-btn-handler', '.onetrust-accept-btn-handler',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '.cc-btn.cc-allow', '.cc-btn.cc-dismiss',
      '#accept-cookies', '#cookie-accept', '.cookie-consent-accept',
      '[data-testid="cookie-accept"]', 'button[data-cky-tag="accept-button"]',
      '.iubenda-cs-accept-btn', '#iubenda-cs-accept', '.cky-btn-accept',
      '.fc-cta-consent', '#cookieconsentaccept', '.cookiescript_accept',
      '#cookiescript_accept', 'button[class*="accept"]', 'a[class*="accept"]',
      '.cmpboxbtn.cmpboxbtnyes', '#cmpbntyestxt',
      '.qc-cmp2-summary-buttons button[mode="primary"]',
      '#qcCmpButtons button[onclick*="accept"]', '.evidon-banner-acceptbutton',
      '#evidon-acceptbutton', '#truste-consent-button', '.trustarc-agree-btn',
      '.ncmp__btn[data-gdpr-consent="accept"]', '#gdpr-banner button',
      '[class*="cookie"] button[class*="accept"]', '[class*="consent"] button:first-child',
      '.modal-footer .btn-primary', '.modal .btn-success'
    ];

    function tryDismiss() {
      for (const sel of CONSENT_SELECTORS) {
        const btn = document.querySelector(sel);
        if (btn && isVisible(btn)) {
          console.log('[BraveShield Bypass] Dismissing cookie consent: ' + sel);
          safeClick(btn);
          return true;
        }
      }
      const CONSENT_TEXT = [/^accept all$/i, /^accept cookies$/i, /^i agree$/i, /^agree$/i,
        /^got it$/i, /^allow all$/i, /^allow cookies$/i, /^yes$/i, /^close$/i,
        /^understood$/i, /^ok$/i, /^dismiss$/i];
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      for (const btn of buttons) {
        const text = (btn.textContent || '').trim().toLowerCase();
        if (CONSENT_TEXT.some(p => p.test(text)) && isVisible(btn)) {
          const parent = btn.closest('[class*="cookie"], [class*="consent"], [id*="cookie"], [id*="consent"], [class*="gdpr"]');
          if (parent) {
            safeClick(btn);
            return true;
          }
        }
      }
      // Hide overlays
      document.querySelectorAll('[class*="cookie-banner"], [class*="cookie-notice"], [class*="consent-banner"], [id*="cookie-banner"], [class*="gdpr"]').forEach(el => {
        if (isVisible(el)) el.style.display = 'none';
      });
      return false;
    }

    tryDismiss();
    setTimeout(tryDismiss, 1000);
    setTimeout(tryDismiss, 3000);
    setTimeout(tryDismiss, 5000);
    const obs = new MutationObserver(() => { tryDismiss(); });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }

  // ==========================================
  // 10. SMART AUTO-SCROLL
  // ==========================================
  function enableAutoScroll() {
    let scrollAttempts = 0;
    function smartScroll() {
      if (scrollAttempts > 15) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      if (scrolled + clientHeight < scrollHeight - 100) {
        window.scrollBy({ top: Math.min(300, (scrollHeight - clientHeight - scrolled) / 2), behavior: 'smooth' });
        scrollAttempts++;
      }
    }
    const bodyText = document.body ? document.body.innerText : '';
    if (/scroll\s+to\s+(the\s+)?bottom/i.test(bodyText) || /scroll\s+down/i.test(bodyText)) {
      setInterval(smartScroll, 800);
    }
  }

  // ==========================================
  // 11. REDIRECT CHAIN FOLLOWER
  // ==========================================
  function followRedirects() {
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
    if (metaRefresh) {
      const content = metaRefresh.getAttribute('content') || '';
      const match = content.match(/url=(.+)/i);
      if (match) {
        const redirectUrl = match[1].trim();
        if (!redirectUrl.startsWith('javascript:')) {
          console.log('[BraveShield Bypass] Following meta refresh: ' + redirectUrl);
          setTimeout(() => {
            if (window.location.href !== redirectUrl) window.location.href = redirectUrl;
          }, 5000);
        }
      }
    }
  }

  // ==========================================
  // 12. POPUNDER INTERCEPTOR
  // ==========================================
  function interceptPopunders() {
    const origOpen = window.open;
    window.open = function(url, target, features) {
      const urlStr = (typeof url === 'string') ? url : (url ? url.toString() : '');
      if (/doubleclick|adserver|adsystem|advertising|pop(?:under|up)|click(?:under|tracker)/i.test(urlStr)) {
        console.log('[BraveShield Bypass] Blocked popunder: ' + urlStr);
        return null;
      }
      return origOpen.call(this, url, target, features);
    };
  }

  // ==========================================
  // 13. BRAVE:// PROTOCOL LEAK FIX
  // ==========================================
  function fixBraveProtocolLeak() {
    // Override HTMLAnchorElement to return chrome: for brave: schemes
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function(tag) {
      const el = origCreateElement(tag);
      if (tag.toLowerCase() === 'a') {
        const origHref = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
        if (origHref) {
          Object.defineProperty(el, 'href', {
            get: function() {
              const val = origHref.get.call(this);
              return val.replace(/^brave:/, 'chrome:');
            },
            set: function(val) {
              return origHref.set.call(this, val);
            },
            configurable: true
          });
        }
      }
      return el;
    };
  }

  // ==========================================
  // 14. STORAGE QUOTA LEAK FIX
  // ==========================================
  function fixStorageQuotaLeak() {
    // Patch webkitTemporaryStorage.queryUsageAndQuota
    if (navigator.webkitTemporaryStorage && navigator.webkitTemporaryStorage.queryUsageAndQuota) {
      const origQuery = navigator.webkitTemporaryStorage.queryUsageAndQuota.bind(navigator.webkitTemporaryStorage);
      navigator.webkitTemporaryStorage.queryUsageAndQuota = function(successCb, errorCb) {
        return origQuery(
          function(usage, quota) {
            // Return fake 2GB quota instead of real disk size
            if (typeof successCb === 'function') successCb(usage, 2147483648);
          },
          errorCb
        );
      };
    }
    // Also patch webkitPersistentStorage if present
    if (navigator.webkitPersistentStorage && navigator.webkitPersistentStorage.queryUsageAndQuota) {
      const origQuery2 = navigator.webkitPersistentStorage.queryUsageAndQuota.bind(navigator.webkitPersistentStorage);
      navigator.webkitPersistentStorage.queryUsageAndQuota = function(successCb, errorCb) {
        return origQuery2(
          function(usage, quota) {
            if (typeof successCb === 'function') successCb(usage, 2147483648);
          },
          errorCb
        );
      };
    }
  }

  // ==========================================
  // 15. AUDIOCONTEXT FINGERPRINT NORMALIZATION
  // ==========================================
  function normalizeAudioContext() {
    try {
      const origOfflineAudioContext = window.OfflineAudioContext;
      if (origOfflineAudioContext) {
        const OrigConstructor = origOfflineAudioContext;
        window.OfflineAudioContext = function(channels, length, sampleRate) {
          const ctx = new OrigConstructor(channels, length, sampleRate);
          const origStartRendering = ctx.startRendering.bind(ctx);
          ctx.startRendering = function() {
            return origStartRendering().then(function(buffer) {
              // Add subtle consistent noise to prevent audio fingerprinting
              const data = buffer.getChannelData(0);
              const seed = 12345;
              for (let i = 0; i < data.length; i++) {
                data[i] += (Math.sin(seed + i * 0.0001) * 0.0000001);
              }
              return buffer;
            });
          };
          return ctx;
        };
        window.OfflineAudioContext.prototype = OrigConstructor.prototype;
      }
    } catch(e) {}
  }

  // ==========================================
  // 16. CANVAS FINGERPRINT NORMALIZATION
  // ==========================================
  function normalizeCanvas() {
    try {
      const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
        const ctx = this.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, this.width, this.height);
          const data = imageData.data;
          // Add consistent micro-noise to prevent canvas fingerprinting
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] ^ 1;     // R
            data[i+1] = data[i+1] ^ 1; // G
            data[i+2] = data[i+2] ^ 1; // B
          }
          ctx.putImageData(imageData, 0, 0);
        }
        return origToDataURL.call(this, type, quality);
      };

      const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
        const imageData = origGetImageData.call(this, sx, sy, sw, sh);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] ^ 1;
          data[i+1] = data[i+1] ^ 1;
          data[i+2] = data[i+2] ^ 1;
        }
        return imageData;
      };
    } catch(e) {}
  }

  // ==========================================
  // 17. NAVIGATOR.WEBDRIVER HIDE
  // ==========================================
  function hideWebdriver() {
    try {
      Object.defineProperty(navigator, 'webdriver', {
        get: function() { return false; },
        configurable: true
      });
      // Also remove from prototype
      if (Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver')) {
        Object.defineProperty(Navigator.prototype, 'webdriver', {
          get: function() { return false; },
          configurable: true
        });
      }
    } catch(e) {}
  }

  // ==========================================
  // 18. WEBRTC IP LEAK PREVENTION
  // ==========================================
  function preventWebRTCLeak() {
    try {
      const origRTCPeerConnection = window.RTCPeerConnection;
      if (origRTCPeerConnection) {
        window.RTCPeerConnection = function(config, constraints) {
          // Strip ICE servers that could leak local IPs
          if (config && config.iceServers) {
            config.iceServers = [];
          }
          return new origRTCPeerConnection(config, constraints);
        };
        window.RTCPeerConnection.prototype = origRTCPeerConnection.prototype;

        // Also override webkitRTCPeerConnection if present
        if (window.webkitRTCPeerConnection) {
          window.webkitRTCPeerConnection = window.RTCPeerConnection;
        }
      }
    } catch(e) {}
  }

  // ==========================================
  // 19. PERMISSION AUTO-DENY
  // ==========================================
  function autoDenyPermissions() {
    // Auto-deny notification permission
    if (Notification && Notification.permission) {
      Object.defineProperty(Notification, 'permission', { get: function() { return 'denied'; } });
      const origRequest = Notification.requestPermission;
      Notification.requestPermission = function() { return Promise.resolve('denied'); };
    }

    // Auto-deny geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition = function(success, error) {
        if (error) error({ code: 1, message: 'User denied geolocation' });
      };
      navigator.geolocation.watchPosition = navigator.geolocation.getCurrentPosition;
    }

    // Auto-deny clipboard read
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText = function() { return Promise.reject(new Error('Permission denied')); };
    }

    // Auto-deny camera/mic
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function() { return Promise.reject(new Error('Permission denied')); };
    }

    // Auto-deny idle detection
    if (window.IdleDetector) {
      window.IdleDetector.prototype.start = function() { return Promise.reject(new Error('Permission denied')); };
    }
  }

  // ==========================================
  // 20. NETWORK BAIT RESPONSE FAKING
  // ==========================================
  function fakeNetworkBait() {
    // Override fetch to handle ad-bait requests
    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = (typeof input === 'string') ? input : (input instanceof Request ? input.url : '');
      // Check if it's an ad-bait request
      if (/\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem|advertising/i.test(url)) {
        console.log('[BraveShield Bypass] Faking ad-bait response: ' + url);
        return Promise.resolve(new Response('', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/gif' } }));
      }
      return origFetch.call(this, input, init);
    };

    // Override XMLHttpRequest for ad-bait
    const origXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._braveShieldUrl = url;
      return origXHROpen.call(this, method, url, ...args);
    };
    const origXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      if (this._braveShieldUrl && /\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem/i.test(this._braveShieldUrl)) {
        console.log('[BraveShield Bypass] Faking XHR ad-bait: ' + this._braveShieldUrl);
        Object.defineProperty(this, 'status', { value: 200 });
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'responseText', { value: '' });
        setTimeout(() => {
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
        }, 50);
        return;
      }
      return origXHRSend.call(this, body);
    };
  }

  // ==========================================
  // 21. PERFORMANCE TIMER CLAMP
  // ==========================================
  function clampPerformanceTimer() {
    try {
      const origNow = performance.now.bind(performance);
      let lastTime = 0;
      performance.now = function() {
        const t = origNow();
        // Clamp to prevent high-precision timing attacks
        const clamped = Math.round(t * 100) / 100; // 0.01ms precision
        if (clamped === lastTime) return clamped;
        lastTime = clamped;
        return clamped;
      };
    } catch(e) {}
  }

  // ==========================================
  // 22. NAVIGATOR CONSISTENCY SPOOFING
  // ==========================================
  function spoofNavigatorConsistency() {
    try {
      // Ensure consistent productSub
      Object.defineProperty(navigator, 'productSub', { get: function() { return '20030107'; }, configurable: true });
      // Ensure consistent platform
      if (!navigator.platform || navigator.platform === '') {
        Object.defineProperty(navigator, 'platform', { get: function() { return 'Win32'; }, configurable: true });
      }
      // Ensure consistent languages
      if (!navigator.languages || navigator.languages.length === 0) {
        Object.defineProperty(navigator, 'languages', { get: function() { return ['en-US', 'en']; }, configurable: true });
      }
      // Hardware concurrency spoofing (return 8 cores)
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: function() { return 8; }, configurable: true });
      // Device memory spoofing (return 8GB)
      Object.defineProperty(navigator, 'deviceMemory', { get: function() { return 8; }, configurable: true });
    } catch(e) {}
  }

  // ==========================================
  // 23. CSS CUSTOM PROPERTY CLEANUP
  // ==========================================
  function cleanCSSProperties() {
    try {
      // Remove Arc browser's injected CSS variables
      const root = document.documentElement;
      const style = root.style;
      if (style) {
        for (let i = style.length - 1; i >= 0; i--) {
          const prop = style[i];
          if (prop.startsWith('--arc-') || prop.startsWith('--brave-')) {
            style.removeProperty(prop);
          }
        }
      }
    } catch(e) {}
  }

  // ==========================================
  // 24. FONT FINGERPRINT SPOOFING
  // ==========================================
  function spoofFontFingerprint() {
    try {
      // Override document.fonts.check to return consistent results
      if (document.fonts && document.fonts.check) {
        const origCheck = document.fonts.check.bind(document.fonts);
        document.fonts.check = function(font, text) {
          // Return true for common fonts, false for uncommon
          const commonFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New',
            'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
            'Impact', 'Lucida Console', 'Tahoma', 'Trebuchet MS', 'MS Sans Serif'];
          const fontName = font.split(' ').pop().replace(/['"]/g, '');
          return commonFonts.some(f => f.toLowerCase() === fontName.toLowerCase()) ? true : origCheck(font, text);
        };
      }
    } catch(e) {}
  }

  // ==========================================
  // 25. SCREEN/VIEWPORT CONSISTENCY
  // ==========================================
  function ensureScreenConsistency() {
    try {
      // Ensure screen dimensions are realistic
      if (screen.availWidth === 0 || screen.availHeight === 0) {
        Object.defineProperty(screen, 'availWidth', { get: function() { return 1920; } });
        Object.defineProperty(screen, 'availHeight', { get: function() { return 1040; } });
        Object.defineProperty(screen, 'width', { get: function() { return 1920; } });
        Object.defineProperty(screen, 'height', { get: function() { return 1080; } });
      }
      // Ensure outerWidth/outerHeight are realistic
      if (window.outerWidth === 0) {
        Object.defineProperty(window, 'outerWidth', { get: function() { return 1920; } });
        Object.defineProperty(window, 'outerHeight', { get: function() { return 1080; } });
      }
    } catch(e) {}
  }

  // ==========================================
  // 26. USER AGENT SPOOFING (170+ UAs)
  // ==========================================
  function spoofUserAgent() {
    try {
      // Get selected UA from storage (default: random Chrome)
      let selectedUA = null;
      try {
        // Try chrome.storage first (via message), fallback to localStorage
        const savedUA = localStorage.getItem('braveshield_ua');
        if (savedUA && savedUA !== 'random' && savedUA !== 'default') {
          selectedUA = JSON.parse(savedUA);
        }
      } catch(e) {}

      // If no specific UA selected, pick a random Chrome desktop
      if (!selectedUA) {
        const desktopChrome = [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        ];
        selectedUA = {
          ua: desktopChrome[Math.floor(Math.random() * desktopChrome.length)],
          brands: [{ brand: "Google Chrome", version: "131" }, { brand: "Chromium", version: "131" }, { brand: "Not_A Brand", version: "24" }],
          platform: "Windows",
          mobile: false,
          platformVersion: "15.0.0"
        };
      }

      // Override navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        get: function() { return selectedUA.ua; },
        configurable: true
      });

      // Override navigator.appVersion
      Object.defineProperty(navigator, 'appVersion', {
        get: function() { return selectedUA.ua.substring(8); },
        configurable: true
      });

      // Override navigator.platform
      if (selectedUA.platform) {
        const platformMap = {
          'Windows': 'Win32',
          'macOS': 'MacIntel',
          'Linux': 'Linux x86_64',
          'Android': 'Linux armv81',
          'iOS': 'iPhone'
        };
        Object.defineProperty(navigator, 'platform', {
          get: function() { return platformMap[selectedUA.platform] || selectedUA.platform; },
          configurable: true
        });
      }

      // Override navigator.userAgentData (Chromium only)
      if (navigator.userAgentData && selectedUA.brands && selectedUA.brands.length > 0) {
        Object.defineProperty(navigator.userAgentData, 'brands', {
          get: function() { return selectedUA.brands; },
          configurable: true
        });
        Object.defineProperty(navigator.userAgentData, 'mobile', {
          get: function() { return selectedUA.mobile || false; },
          configurable: true
        });
        Object.defineProperty(navigator.userAgentData, 'platform', {
          get: function() { return selectedUA.platform || 'Windows'; },
          configurable: true
        });

        // Override getHighEntropyValues
        if (navigator.userAgentData.getHighEntropyValues) {
          const origGetHigh = navigator.userAgentData.getHighEntropyValues;
          navigator.userAgentData.getHighEntropyValues = function(hints) {
            return origGetHigh.call(this, hints).then(res => {
              res.brands = selectedUA.brands;
              res.mobile = selectedUA.mobile || false;
              res.platform = selectedUA.platform || 'Windows';
              if (selectedUA.platformVersion) res.platformVersion = selectedUA.platformVersion;
              return res;
            });
          };
        }
      }

      // Override navigator.oscpu (Firefox-style)
      if (selectedUA.oscpu) {
        Object.defineProperty(navigator, 'oscpu', {
          get: function() { return selectedUA.oscpu; },
          configurable: true
        });
      }

      // Override navigator.product (Firefox returns "Gecko", Chrome returns "Gecko" too)
      Object.defineProperty(navigator, 'product', {
        get: function() { return 'Gecko'; },
        configurable: true
      });

      // Override navigator.vendor (Chrome returns "Google Inc.", Safari returns "Apple Computer, Inc.")
      if (selectedUA.ua.includes('Chrome') && !selectedUA.ua.includes('Edg/')) {
        Object.defineProperty(navigator, 'vendor', {
          get: function() { return 'Google Inc.'; },
          configurable: true
        });
      } else if (selectedUA.ua.includes('Edg/')) {
        Object.defineProperty(navigator, 'vendor', {
          get: function() { return 'Google Inc.'; },
          configurable: true
        });
      } else if (selectedUA.ua.includes('Safari/') && !selectedUA.ua.includes('Chrome/')) {
        Object.defineProperty(navigator, 'vendor', {
          get: function() { return 'Apple Computer, Inc.'; },
          configurable: true
        });
      }

      // Override navigator.connection (Network Information)
      if (navigator.connection) {
        Object.defineProperty(navigator.connection, 'effectiveType', {
          get: function() { return '4g'; },
          configurable: true
        });
        Object.defineProperty(navigator.connection, 'rtt', {
          get: function() { return 50; },
          configurable: true
        });
        Object.defineProperty(navigator.connection, 'downlink', {
          get: function() { return 10; },
          configurable: true
        });
      }

      // Store current UA info for other modules
      window.__braveshield_currentUA = selectedUA;

      console.log('[BraveShield Bypass] User Agent spoofed: ' + selectedUA.ua.substring(0, 60) + '...');
    } catch(e) {
      console.debug('[BraveShield Bypass] UA spoofing error:', e);
    }
  }

  // ==========================================
  // 27. ADBLOCKER DETECTION BYPASS
  // ==========================================
  // Bypasses common adblock detection scripts (hispanoads, Admiral, BlockAdBlock, etc.)
  function bypassAdblockDetection() {
    // Pattern 1: Override common adblock detection variables
    const DETECTION_VARS = [
      'adBlockDetected', 'adblock', 'adBlockEnabled', 'isAdBlockActive',
      'blockAdBlock', 'BlockAdBlock', 'fuckAdBlock', 'FuckAdBlock',
      'adsbygoogle', '__google_ads', '__gads',
      'canRunAds', 'canShowAds', 'adsLoaded', 'adblockDetected',
      'adblock_active', 'adblocker', 'adBlocker',
      'isAdBlockerActive', 'adBlockStatus', 'adBlockCheck'
    ];

    DETECTION_VARS.forEach(varName => {
      if (!(varName in window)) {
        Object.defineProperty(window, varName, {
          get: function() {
            // Return "no adblock" values
            if (varName.toLowerCase().includes('detect') || varName.toLowerCase().includes('check') || varName.toLowerCase().includes('status')) {
              return false;
            }
            if (varName === 'adsbygoogle') return window.adsbygoogle || [];
            return false;
          },
          set: function() {},
          configurable: true
        });
      }
    });

    // Pattern 2: Override common adblock detection functions
    const DETECTION_FUNCTIONS = [
      'checkAdBlock', 'detectAdBlock', 'isAdBlockEnabled', 'checkAdblock',
      'detectAdblock', 'checkAdblockers', 'detectAdblockers',
      'adBlockCheck', 'adblockCheck', 'checkBlockAdBlock', 'checkFuckAdBlock',
      'initAdBlock', 'initFuckAdBlock', 'initBlockAdBlock'
    ];

    DETECTION_FUNCTIONS.forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        window[funcName] = function() { return false; };
      }
    });

    // Pattern 3: Override common adblock detection class constructors
    if (typeof window.BlockAdBlock !== 'undefined') {
      const origBlockAdBlock = window.BlockAdBlock;
      window.BlockAdBlock = function() {
        this.check = function(cb) { if (cb) cb(false); return false; };
        this.onDetected = function(cb) { return this; };
        this.onNotDetected = function(cb) { if (cb) cb(); return this; };
        this.setDebug = function() { return this; };
      };
    }

    if (typeof window.FuckAdBlock !== 'undefined') {
      const origFuckAdBlock = window.FuckAdBlock;
      window.FuckAdBlock = function() {
        this.check = function(cb) { if (cb) cb(false); return false; };
        this.onDetected = function(cb) { return this; };
        this.onNotDetected = function(cb) { if (cb) cb(); return this; };
        this.setDebug = function() { return this; };
      };
    }

    // Pattern 4: Override MutationObserver to prevent ad-detection scripts from monitoring DOM
    const origMutationObserver = window.MutationObserver;
    window.MutationObserver = function(callback) {
      const wrappedCallback = function(mutations, observer) {
        // Filter out mutations that look like ad-detection
        const filteredMutations = mutations.filter(m => {
          if (m.type === 'childList') {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                const id = (node.id || '').toLowerCase();
                const cls = (node.className && typeof node.className === 'string') ? node.className.toLowerCase() : '';
                const src = (node.getAttribute && node.getAttribute('src') || '').toLowerCase();
                // Check if this looks like an ad-bait element
                if (/ad[s]?[-_]?google|ad[-_]?banner|ad[-_]?unit|ad[-_]?container|adblock|blockadblock|fuckadblock|sponsor|taboola|outbrain|admiral/i.test(id + cls + src)) {
                  return false; // Filter out ad-bait mutations
                }
              }
            }
          }
          return true;
        });
        if (filteredMutations.length > 0) {
          callback(filteredMutations, observer);
        }
      };
      return new origMutationObserver(wrappedCallback);
    };
    window.MutationObserver.prototype = origMutationObserver.prototype;

    // Pattern 5: Override document.createElement to prevent bait element creation detection
    const origCreateElement = document.createElement.bind(document);
    document.createElement = function(tag) {
      const el = origCreateElement(tag);
      // If it's a script element, make it look like it loaded successfully
      if (tag.toLowerCase() === 'script') {
        const origSetAttribute = el.setAttribute.bind(el);
        el.setAttribute = function(name, value) {
          if (name === 'src' && /\/ads\/|\/adserver\/|\/ad\/|doubleclick|adsystem|advertising/i.test(value)) {
            console.log('[BraveShield Bypass] Neutralized ad-bait script creation: ' + value);
            // Make the script appear to load successfully
            setTimeout(() => {
              el.dispatchEvent(new Event('load'));
            }, 10);
          }
          return origSetAttribute(name, value);
        };
      }
      return el;
    };

    // Pattern 6: Override fetch/XHR to handle ad-bait probe requests
    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = (typeof input === 'string') ? input : (input instanceof Request ? input.url : '');
      if (/\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem|advertising|\/ad-bait|\/bait|adblock-detect/i.test(url)) {
        console.log('[BraveShield Bypass] Faking ad-bait fetch: ' + url);
        return Promise.resolve(new Response('', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/gif', 'Content-Length': '43' } }));
      }
      return origFetch.call(this, input, init);
    };

    const origXHROpen2 = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._braveShieldAdBait = /\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem|advertising|\/ad-bait|\/bait|adblock-detect/i.test(url);
      return origXHROpen2.call(this, method, url, ...args);
    };

    const origXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      if (this._braveShieldAdBait) {
        console.log('[BraveShield Bypass] Faking ad-bait XHR');
        Object.defineProperty(this, 'status', { value: 200, writable: false });
        Object.defineProperty(this, 'readyState', { value: 4, writable: false });
        Object.defineProperty(this, 'responseText', { value: '', writable: false });
        Object.defineProperty(this, 'response', { value: '', writable: false });
        setTimeout(() => {
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
        }, 10);
        return;
      }
      return origXHRSend.call(this, body);
    };

    // Pattern 7: Override common anti-adblock modal/overlay detection
    // Some sites show a modal when adblock is detected
    const MODAL_SELECTORS = [
      '[class*="adblock-modal"]', '[id*="adblock-modal"]',
      '[class*="adblock-overlay"]', '[id*="adblock-overlay"]',
      '[class*="adblock-detect"]', '[id*="adblock-detect"]',
      '[class*="adblock-warning"]', '[id*="adblock-warning"]',
      '[class*="adblock-message"]', '[id*="adblock-message"]',
      '[class*="blockadblock"]', '[id*="blockadblock"]',
      '[class*="fuckadblock"]', '[id*="fuckadblock"]',
      '[class*="ad-blocker"]', '[id*="ad-blocker"]',
      '[class*="disable-adblock"]', '[id*="disable-adblock"]',
      '[class*="adblock-detected"]', '[id*="adblock-detected"]',
      '.modal[class*="ad"]', '.overlay[class*="ad"]'
    ];

    function hideAdblockModals() {
      MODAL_SELECTORS.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.remove();
        });
      });
    }

    hideAdblockModals();
    setTimeout(hideAdblockModals, 1000);
    setTimeout(hideAdblockModals, 3000);

    // MutationObserver to catch dynamically injected adblock modals
    const modalObserver = new MutationObserver(() => { hideAdblockModals(); });
    if (document.body) {
      modalObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Pattern 8: Override common adblock detection APIs
    // Some sites use specific APIs to detect adblock
    if (window.adsense) {
      Object.defineProperty(window, 'adsense', { get: function() { return { loaded: true }; } });
    }

    // Pattern 9: Override document.domain checks used by adblock detectors
    const origDomain = Object.getOwnPropertyDescriptor(document, 'domain');
    if (origDomain) {
      Object.defineProperty(document, 'domain', {
        get: function() { return origDomain.get.call(this); },
        configurable: true
      });
    }

    console.log('[BraveShield Bypass] Adblock detection bypass active');
  }

  // ==========================================
  // 28. CLICK IMAGE WAIT PATTERN BYPASS
  // ==========================================
  // Handles "CLICK IMAGE WAIT 10 SECOND" patterns where ads appear
  // after clicking an image and can only be removed after 10-15 seconds.
  function bypassClickImageWait() {
    // Detect "click image" / "wait 10 seconds" text patterns
    const WAIT_PATTERNS = /click\s+(?:the\s+)?image|wait\s+\d+\s*sec|click\s+(?:on\s+)?(?:the\s+)?(?:image|photo|picture|ad)|wait\s+(?:for\s+)?\d+|despues\s+de\s+\d+|espera\s+\d+/i;

    function detectClickImageWait() {
      const bodyText = document.body ? document.body.innerText : '';
      return WAIT_PATTERNS.test(bodyText);
    }

    // Common ad/banner selectors that appear after clicking
    const AD_SELECTORS = [
      '[class*="banner"]', '[id*="banner"]',
      '[class*="popup"]', '[id*="popup"]',
      '[class*="modal"]', '[id*="modal"]',
      '[class*="overlay"]', '[id*="overlay"]',
      '[class*="interstitial"]', '[id*="interstitial"]',
      '[class*="ad-wrapper"]', '[class*="ad-container"]',
      '[class*="ad-block"]', '[id*="ad-block"]',
      '[class*="广告"]', '[id*="广告"]',
      'iframe[src*="ad"]', 'iframe[src*="banner"]',
      'iframe[src*="pop"]', 'iframe[src*="click"]',
      '[style*="position: fixed"]',
      '[style*="position:fixed"]',
      'div[style*="z-index: 999"]',
      'div[style*="z-index:999"]',
      'div[style*="z-index: 9999"]',
      'div[style*="z-index:9999"]',
      'div[style*="z-index: 99999"]',
      'div[style*="z-index:99999"]'
    ];

    function hideClickImageAds() {
      AD_SELECTORS.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => {
            const style = window.getComputedStyle(el);
            const zIndex = parseInt(style.zIndex) || 0;
            const pos = style.position;
            // Only remove if it's a fixed/absolute overlay with high z-index
            if ((pos === 'fixed' || pos === 'absolute') && zIndex > 100) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.remove();
            }
          });
        } catch(e) {}
      });

      // Also remove iframes that look like ads
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = (iframe.src || '').toLowerCase();
        const cls = (iframe.className || '').toLowerCase();
        if (/ad|banner|pop|click|interstitial/i.test(src + ' ' + cls)) {
          const style = window.getComputedStyle(iframe);
          const zIndex = parseInt(style.zIndex) || 0;
          if (zIndex > 100 || style.position === 'fixed') {
            iframe.remove();
          }
        }
      });
    }

    // Watch for dynamically injected ads
    const adObserver = new MutationObserver(() => {
      hideClickImageAds();
    });

    if (document.body) {
      adObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Initial cleanup
    hideClickImageAds();
    setTimeout(hideClickImageAds, 1000);
    setTimeout(hideClickImageAds, 3000);
    setTimeout(hideClickImageAds, 5000);

    if (detectClickImageWait()) {
      console.log('[BraveShield Bypass] Click Image Wait pattern detected - hiding ads');
    }
  }

  // ==========================================
  // RUN ALL MODULES
  // ==========================================
  const modules = [
    ['Module 1: Navigator.brave', () => {}], // Already ran above
    ['Module 2: Client Hints', () => {}],
    ['Module 3: GPC', () => {}],
    ['Module 4: Ad Stubs', () => {}],
    ['Module 5: DOM Traps', () => {}],
    ['Module 6: WebGL', () => {}],
    ['Module 7: Link Shortener', () => {}],
    ['Module 8: Countdown Timer Bypass', bypassCountdownTimers],
    ['Module 9: Cookie Consent', autoDismissCookieConsent],
    ['Module 10: Auto-Scroll', enableAutoScroll],
    ['Module 11: Redirect Follower', followRedirects],
    ['Module 12: Popunder Interceptor', interceptPopunders],
    ['Module 13: brave:// Protocol Leak', fixBraveProtocolLeak],
    ['Module 14: Storage Quota Leak', fixStorageQuotaLeak],
    ['Module 15: AudioContext Normalization', normalizeAudioContext],
    ['Module 16: Canvas Normalization', normalizeCanvas],
    ['Module 17: navigator.webdriver', hideWebdriver],
    ['Module 18: WebRTC Leak Prevention', preventWebRTCLeak],
    ['Module 19: Permission Auto-Deny', autoDenyPermissions],
    ['Module 20: Network Bait Faking', fakeNetworkBait],
    ['Module 21: Performance Timer Clamp', clampPerformanceTimer],
    ['Module 22: Navigator Consistency', spoofNavigatorConsistency],
    ['Module 23: CSS Property Cleanup', cleanCSSProperties],
    ['Module 24: Font Fingerprint', spoofFontFingerprint],
    ['Module 25: Screen Consistency', ensureScreenConsistency],
    ['Module 26: User Agent Spoofing', spoofUserAgent],
    ['Module 27: Adblock Detection Bypass', bypassAdblockDetection],
    ['Module 28: Click Image Wait Bypass', bypassClickImageWait]
  ];

  modules.forEach(([name, fn]) => {
    try { fn(); } catch(e) { console.debug('[BraveShield Bypass] ' + name + ' error:', e); }
  });

  console.log('[BraveShield Bypass] v4.0 - All ' + modules.length + ' modules initialized.');
})();
