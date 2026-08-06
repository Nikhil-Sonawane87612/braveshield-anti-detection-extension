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
  // SAFELIST: Never interfere with these host domains (AI, productivity, etc.)
  var SAFELIST_HOSTS = [
    'gemini.google.com', 'chatgpt.com', 'chat.openai.com', 'claude.ai',
    'google.com', 'googleapis.com', 'googleusercontent.com',
    'anthropic.com', 'deepseek.com', 'kagi.com', 'perplexity.ai',
    'bing.com', 'microsoft.com', 'office.com', 'notion.so', 'notion.com',
    'figma.com', 'canva.com', 'linear.app', 'slack.com', 'discord.com',
    'github.com', 'gitlab.com', 'stackoverflow.com'
  ];
  function isSafelistedHost() {
    var host = window.location.hostname || '';
    return SAFELIST_HOSTS.some(function(s) { return host.includes(s); });
  }

  // Modules to disable on safelisted hosts
  var SAFELIST_DISABLED_MODULES = ['bypass-traps', 'auto-timers', 'adblock-detect', 'click-wait', 'enable-text-select', 'anti-scroll-lock'];

  var AD_TRAP_PATTERNS = [
    /ad[s]?[-_]?google/i, /ad[-_]?banner/i, /ad[-_]?unit/i,
    /ad[-_]?container/i, /ad[-_]?wrapper/i, /adblock/i,
    /blockadblock/i, /fuckadblock/i, /taboola/i, /outbrain/i,
    /admiral/i, /ciduno/i, /prebid/i, /moat/i,
    /propeller/i, /hilltop/i, /diablo/i
  ];
  function isAdTrapElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (isSafelistedHost()) return false;
    var id = el.id || '';
    var className = typeof el.className === 'string' ? el.className : '';
    var src = el.getAttribute ? (el.getAttribute('src') || '') : '';
    return AD_TRAP_PATTERNS.some(function(p) {
      return p.test(id) || p.test(className) || p.test(src);
    });
  }
  const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  if (origOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: function() {
        if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('bypass-traps')) return origOffsetHeight.get.call(this);
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
        if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('bypass-traps')) return origOffsetWidth.get.call(this);
        const actual = origOffsetWidth.get.call(this);
        if (actual === 0 && isAdTrapElement(this)) return 300;
        return actual;
      }, configurable: true
    });
  }
  const origGetBCR = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function() {
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('bypass-traps')) return origGetBCR.call(this);
    const rect = origGetBCR.call(this);
    if (rect.width === 0 && rect.height === 0 && isAdTrapElement(this)) {
      return { top: 100, bottom: 350, left: 100, right: 400, width: 300, height: 250, x: 100, y: 100, toJSON() { return this; } };
    }
    return rect;
  };
  const origGCS = window.getComputedStyle;
  window.getComputedStyle = function(el, pseudoElt) {
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('bypass-traps')) return origGCS.call(this, el, pseudoElt);
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
  // 8. COUNTDOWN TIMER BYPASS
  // ==========================================
  // Speeds up countdown timers (10x faster) until 1-2 seconds remain,
  // then restores normal speed so the server gets the request at
  // natural timing. No auto-click — user clicks "Get Link" manually.
  function bypassCountdownTimers() {
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('auto-timers')) return;
    const COUNTDOWN_KEYWORDS = /countdown|timer|second|wait|delay|interval|tick|progress|clock|remaining|time/i;

    // === Speed up setInterval ===
    const origSetInterval = window.setInterval;
    window.setInterval = function(fn, delay, ...args) {
      if (delay >= 1000 && delay <= 120000) {
        const fnStr = (typeof fn === 'function') ? fn.toString() : String(fn);
        if (COUNTDOWN_KEYWORDS.test(fnStr)) {
          const newDelay = Math.max(100, Math.floor(delay / 10));
          console.log('[BraveShield Bypass] Speeding interval: ' + delay + 'ms -> ' + newDelay + 'ms');

          let elapsed = 0;
          const originalDelay = delay;
          const wrappedFn = function(...args) {
            elapsed += newDelay;
            const remaining = originalDelay - elapsed;
            if (remaining <= 2000 && remaining > 0) {
              return;
            }
            return fn.apply(this, args);
          };

          return origSetInterval.call(this, wrappedFn, newDelay, ...args);
        }
      }
      return origSetInterval.call(this, fn, delay, ...args);
    };

    // === Speed up setTimeout ===
    const origSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay, ...args) {
      if (delay >= 1000 && delay <= 120000) {
        const fnStr = (typeof fn === 'function') ? fn.toString() : String(fn);
        if (COUNTDOWN_KEYWORDS.test(fnStr)) {
          const newDelay = Math.max(100, Math.floor(delay / 10));
          console.log('[BraveShield Bypass] Speeding timeout: ' + delay + 'ms -> ' + newDelay + 'ms');
          return origSetTimeout.call(this, fn, newDelay, ...args);
        }
      }
      return origSetTimeout.call(this, fn, delay, ...args);
    };

    console.log('[BraveShield Bypass] Timer bypass active (10x speedup, normal at 2s remaining)');
  }

  // ==========================================
  // 9. COOKIE CONSENT AUTO-DISMISS
  // ==========================================
  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

function safeClick(el) {
    if (!el) return;
    // Only trigger navigation fallback on anchor/download-like elements.
    var isNavTarget = el.tagName === 'A' || (el.getAttribute && el.getAttribute('href')) ||
                      /download|get\s*link|continue|proceed|next/i.test((el.textContent || ''));

    // Capture the target href / location BEFORE clicking so we can fall back
    // to a direct navigation if the simulated click does not trigger a redirect.
    var targetHref = null;
    if (el.tagName === 'A') {
      targetHref = el.getAttribute('href');
    } else {
      var parentLink = el.closest ? el.closest('a[href]') : null;
      if (parentLink) targetHref = parentLink.getAttribute('href');
    }

    // Try simulating a click first (this fixes the "click animation but no
    // redirect" problem on TG mod APK download sites that rely on synthetic
    // clicks to open the download link).
    var clicked = false;
    if (el && typeof el.click === 'function') {
      el.click();
      clicked = true;
    } else if (el && el.dispatchEvent) {
      var evt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
      clicked = true;
    }

    // Fallback: if the element is a navigation target and the simulated click
    // did not cause navigation, force a reliable navigation.
    if (isNavTarget && targetHref && clicked) {
      setTimeout(function() {
        try {
          // If we're still on the same page after the click, trigger the
          // redirect manually via window.location.href.
          if (window.location.href.indexOf(targetHref) === -1) {
            if (/^(https?:|mailto:|tel:)/i.test(targetHref) || targetHref.indexOf('//') === 0) {
              window.location.href = targetHref;
            } else if (targetHref.charAt(0) === '/' || targetHref.indexOf('.') !== -1) {
              // Relative or extension-less URL: dispatch a fresh bubbling click
              // as a final fallback (some sites only listen to bubbles:true clicks).
              var evt2 = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
              el.dispatchEvent(evt2);
            }
          }
        } catch(e) {}
      }, isNavTarget && /download|get\s*link|continue|proceed|next/i.test((el.textContent || '')) ? 1200 : 400);
    }
  }

  function autoDismissCookieConsent() {
    if (isSafelistedHost()) return;
    const CONSENT_SELECTORS = [
      '#onetrust-accept-btn-handler', '.onetrust-accept-btn-handler',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '.cc-btn.cc-allow', '.cc-btn.cc-dismiss',
      '#accept-cookies', '#cookie-accept', '.cookie-consent-accept',
      '[data-testid="cookie-accept"]', 'button[data-cky-tag="accept-button"]',
      '.iubenda-cs-accept-btn', '#iubenda-cs-accept', '.cky-btn-accept',
      '.fc-cta-consent', '#cookieconsentaccept', '.cookiescript_accept',
      '#cookiescript_accept',
      '.cmpboxbtn.cmpboxbtnyes', '#cmpbntyestxt',
      '.qc-cmp2-summary-buttons button[mode="primary"]',
      '#qcCmpButtons button[onclick*="accept"]', '.evidon-banner-acceptbutton',
      '#evidon-acceptbutton', '#truste-consent-button', '.trustarc-agree-btn',
      '.ncmp__btn[data-gdpr-consent="accept"]', '#gdpr-banner button',
      '[class*="cookie"] button[id*="accept"]', '[class*="consent"] button[id*="accept"]'
    ];

    function tryDismiss() {
      if (isSafelistedHost()) return false;
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
          const parent = btn.closest('[class*="cookie"], [class*="consent"], [id*="cookie"], [id*="consent"], [class*="gdpr"], #onetrust, #CybotCookiebotDialog');
          if (parent) {
            safeClick(btn);
            return true;
          }
        }
      }
      // Hide overlays - only on non-safelisted hosts
      if (isSafelistedHost()) return false;
      document.querySelectorAll('[class*="cookie-banner"], [class*="cookie-notice"], [class*="consent-banner"], [id*="cookie-banner"], #onetrust-banner-sdk, #CybotCookiebotDialog').forEach(el => {
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
    if (isSafelistedHost()) return;
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
    if (isSafelistedHost()) return;
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
      // Null guard for document.createElement('a')
      if (!el) return el;
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
      // Override ONLY on Navigator.prototype (NOT the navigator instance).
      // Defining on both prototype AND instance causes YouTube to detect the
      // double override and break the header/search bar.
      const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
      if (desc && desc.get && desc.get.toString().includes('native')) {
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
    // Check if this is a YouTube API call and skip interception
    function isYouTubeAPI(url) {
      return /youtube\.com\/api\/|youtube\.com\/youtubei\/|youtube\.com\/embed\/|googlevideo\.com|ytimg\.com|youtube\.com\/player\//i.test(url);
    }

    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = (typeof input === 'string') ? input : (input instanceof Request ? input.url : '');
      if (isYouTubeAPI(url)) {
        return origFetch.call(this, input, init);
      }
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
      if (this._braveShieldUrl && isYouTubeAPI(this._braveShieldUrl)) {
        return origXHRSend.call(this, body);
      }
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
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('adblock-detect')) return;
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
    // IMPORTANT: Never intercept YouTube API calls (would break YouTube player).
    function isYouTubeAPI(url) {
      return /youtube\.com\/api\/|youtube\.com\/youtubei\/|youtube\.com\/embed\/|googlevideo\.com|ytimg\.com|youtube\.com\/player\//i.test(url);
    }

    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = (typeof input === 'string') ? input : (input instanceof Request ? input.url : '');
      if (isYouTubeAPI(url)) {
        return origFetch.call(this, input, init);
      }
      if (/\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem|advertising|\/ad-bait|\/bait|adblock-detect/i.test(url)) {
        console.log('[BraveShield Bypass] Faking ad-bait fetch: ' + url);
        return Promise.resolve(new Response('', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/gif', 'Content-Length': '43' } }));
      }
      return origFetch.call(this, input, init);
    };

    const origXHROpen2 = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._braveShieldAdBaitUrl = url || '';
      this._braveShieldAdBait = !isYouTubeAPI(this._braveShieldAdBaitUrl) && /\/ads\/|\/adserver\/|\/ad\/|\.gif\?|doubleclick|adsystem|advertising|\/ad-bait|\/bait|adblock-detect/i.test(this._braveShieldAdBaitUrl);
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
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('click-wait')) return;
    // Detect "click image" / "wait 10 seconds" text patterns
    const WAIT_PATTERNS = /click\s+(?:the\s+)?image|wait\s+\d+\s*sec|click\s+(?:on\s+)?(?:the\s+)?(?:image|photo|picture|ad)|wait\s+(?:for\s+)?\d+|despues\s+de\s+\d+|espera\s+\d+/i;

    function detectClickImageWait() {
      const bodyText = document.body ? document.body.innerText : '';
      return WAIT_PATTERNS.test(bodyText);
    }

    // Common ad/banner selectors that appear after clicking
    // NOTE: We do NOT blanket-remove all fixed/absolute z-index>100 elements
    // — that would hide legitimate download buttons on TG mod sites, etc.
    var AD_SELECTORS = [
      '[class*="banner"]', '[id*="banner"]',
      '[class*="interstitial"]', '[id*="interstitial"]',
      '[class*="ad-wrapper"]', '[class*="ad-container"]',
      '[class*="ad-block"]', '[id*="ad-block"]',
      '[class*="广告"]', '[id*="广告"]',
      'iframe[src*="ad"]', 'iframe[src*="banner"]',
      'iframe[src*="pop"]', 'iframe[src*="click"]',
      // Only remove fixed-position overlays with explicit ad-related class/id
      'div[class*="ad-overlay"]', 'div[id*="ad-overlay"]',
      'div[class*="ad-modal"]', 'div[id*="ad-modal"]',
      'div[class*="popunder"]', 'div[id*="popunder"]',
      'div[class*="clickunder"]', 'div[id*="clickunder"]'
    ];

    function hideClickImageAds() {
      AD_SELECTORS.forEach(function(sel) {
        try {
          document.querySelectorAll(sel).forEach(function(el) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.remove();
          });
        } catch(e) {}
      });

      // Also remove iframes that look like ads — only if src/class explicitly matches ad patterns
      document.querySelectorAll('iframe').forEach(function(iframe) {
        var src = (iframe.src || '').toLowerCase();
        var cls = (iframe.className || '').toLowerCase();
        if (/ad[s]?[-_]?/i.test(src + ' ' + cls) || /doubleclick|googlesyndication|googlead/i.test(src)) {
          iframe.remove();
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
  // 29. YOUTUBE AD BLOCKING + SPONSOR BLOCKING
  // ==========================================
  // Blocks YouTube video ads, display ads, and skips sponsored segments
  // using SponsorBlock API for crowd-sourced sponsor timestamps.
  function blockYouTubeAds() {
    if (!window.location.hostname.includes('youtube.com')) return;

    // === PART A: Block video ads by intercepting player API ===
    function hookYouTubePlayer() {
      // Override ytInitialPlayerResponse to remove ad info
      if (window.ytInitialPlayerResponse) {
        removeAdsFromPlayerResponse(window.ytInitialPlayerResponse);
      }

      // Hook into page to catch player updates
      const origDefineProperty = Object.defineProperty;
      const playerHooks = new Set();

      Object.defineProperty = function(obj, prop, descriptor) {
        if (obj === window && prop === 'ytInitialPlayerResponse') {
          const origSet = descriptor.set;
          descriptor.set = function(val) {
            if (val) removeAdsFromPlayerResponse(val);
            if (origSet) origSet.call(this, val);
          };
        }
        return origDefineProperty.call(this, obj, prop, descriptor);
      };
    }

    function removeAdsFromPlayerResponse(resp) {
      try {
        // Remove ad breaks
        if (resp.adPlacements) delete resp.adPlacements;
        if (resp.playerAds) delete resp.playerAds;
        if (resp.adSlots) delete resp.adSlots;

        // Remove ad-related fields from video details
        if (resp.videoDetails) {
          delete resp.videoDetails.isLiveContent;
        }

        // Clean up streaming data ads
        if (resp.streamingData) {
          delete resp.streamingData.serverAbrStreamingUrl;
        }
      } catch(e) {}
    }

    // === PART B: Auto-skip video ads ===
    function skipVideoAds() {
      // Skip ad by clicking skip button
      const skipBtn = document.querySelector(
        '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, ' +
        'button.ytp-ad-skip-button, button.ytp-ad-skip-button-modern, ' +
        '[class*="skip-ad"], [class*="ad-skip"], .skip-button'
      );
      if (skipBtn) {
        skipBtn.click();
        console.log('[BraveShield Bypass] Skipped YouTube ad');
      }

      // Close non-skippable ads by playing through
      const video = document.querySelector('video');
      if (video && video.duration && video.duration < 30) {
        // Check if we're in an ad
        const adContainer = document.querySelector(
          '.ad-container, .ytp-ad-player-overlay, .video-ads, ' +
          '[class*="ad-showing"], .ytp-ad-overlay-container'
        );
        if (adContainer && adContainer.offsetHeight > 0) {
          video.currentTime = video.duration;
          video.play();
        }
      }

      // Remove ad overlays
      document.querySelectorAll(
        '.ytp-ad-overlay-container, .ytp-ad-text-overlay, ' +
        '.ytp-ad-image-overlay, .video-ads, .ytp-ad-player-overlay, ' +
        'div[id*="player-ads"], .ytp-ad-module'
      ).forEach(el => {
        el.remove();
      });

      // Hide ad elements in sidebar
      document.querySelectorAll(
        'ytd-display-ad-renderer, ytd-promoted-sparkles-web-renderer, ' +
        'ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, ' +
        '[class*="ad-unit"], [class*="promoted"]'
      ).forEach(el => {
        el.style.display = 'none';
      });
    }

    // === PART C: SponsorBlock - Skip sponsored segments ===
    const sponsorCache = {};

    async function fetchSponsorSegments(videoId) {
      if (sponsorCache[videoId] !== undefined) return sponsorCache[videoId];

      try {
        const resp = await fetch(
          'https://sponsor.ajay.app/api/skipSegments?videoID=' + videoId,
          { headers: { 'Accept': 'application/json' } }
        );
        if (resp.ok) {
          const segments = await resp.json();
          sponsorCache[videoId] = segments;
          return segments;
        }
      } catch(e) {}

      sponsorCache[videoId] = [];
      return [];
    }

    function getVideoId() {
      const url = new URL(window.location.href);
      return url.searchParams.get('v');
    }

    async function skipSponsoredSegments() {
      const videoId = getVideoId();
      if (!videoId) return;

      const video = document.querySelector('video');
      if (!video || !video.duration) return;

      const segments = await fetchSponsorSegments(videoId);
      const currentTime = video.currentTime;

      for (const seg of segments) {
        const [start, end] = seg.segment;
        if (currentTime >= start && currentTime < end) {
          video.currentTime = end;
          console.log('[BraveShield Bypass] Skipped sponsor segment (' + (seg.category || 'sponsor') + ')');

          // Show notification
          showSponsorNotification(seg.category || 'sponsor');
          break;
        }
      }
    }

    function showSponsorNotification(category) {
      const existing = document.getElementById('brave-shield-sponsor-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'brave-shield-sponsor-toast';
      toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#1a1a2e;color:#00d4ff;padding:10px 16px;border-radius:8px;border:1px solid #333;font-size:13px;z-index:999999;font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.4);';
      toast.textContent = '⏭ Skipped: ' + category;
      if (document.body) document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    // === PART D: Block YouTube display/masthead ads ===
    function blockDisplayAds() {
      // Block ad frames
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = (iframe.src || '').toLowerCase();
        if (/doubleclick|googlesyndication|googleads|adservice|ad-click/i.test(src)) {
          iframe.remove();
        }
      });

      // Hide promoted content in feed
      document.querySelectorAll(
        'ytd-rich-item-renderer[is-ad], ytd-video-renderer[is-ad], ' +
        'ytd-ad-slot-renderer, ytd-display-ad-renderer'
      ).forEach(el => {
        el.style.display = 'none';
      });
    }

// === Run all YouTube ad blocking ===
    // SponsorBlock (skipSponsoredSegments) is deferred until the video element
    // actually initializes (readyState >= 1) to avoid slowing down YouTube
    // startup. This is the key performance fix for slow video loads when both
    // the Adblocker (27) and SponsorBlock (29) modules are active.
    function runYouTubeAdBlock() {
      skipVideoAds();
      blockDisplayAds();
    }

    // Hook player on page load
    hookYouTubePlayer();

    // Run on a slower, debounced interval (every 2s instead of 1s) to reduce
    // DOM mutation churn and CPU usage during startup.
    const ytInterval = setInterval(() => {
      runYouTubeAdBlock();
      const video = document.querySelector('video');
      if (video && video.readyState >= 1) {
        skipSponsoredSegments();
      }
    }, 2000);

    // Watch for SPA navigation (YouTube is a SPA) — debounced to batch DOM
    // mutations and avoid running heavy scans on every single mutation.
    let ytDebounceTimer = null;
    const ytObserver = new MutationObserver(() => {
      if (ytDebounceTimer) return;
      ytDebounceTimer = setTimeout(() => {
        ytDebounceTimer = null;
        runYouTubeAdBlock();
        const video = document.querySelector('video');
        if (video && video.readyState >= 1) {
          skipSponsoredSegments();
        }
      }, 800);
    });

    if (document.body) {
      ytObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Hook the video 'timeupdate' event for SponsorBlock so we only check
    // sponsor segments while the video is actually playing.
    document.addEventListener('timeupdate', (e) => {
      if (e && e.target && e.target.tagName === 'VIDEO' && e.target.readyState >= 1) {
        skipSponsoredSegments();
      }
    }, true);

    // Stop after 2 hours
    setTimeout(() => clearInterval(ytInterval), 7200000);

    console.log('[BraveShield Bypass] YouTube ad blocking + SponsorBlock active (deferred sponsor hooks)');
  }

  // ==========================================
  // 30. FORCE ENABLE RIGHT-CLICK
  // ==========================================
  function forceEnableRightClick() {
    document.addEventListener('contextmenu', e => e.stopImmediatePropagation(), true);
    document.addEventListener('mousedown', e => {
      if (e.button === 2) e.stopImmediatePropagation();
    }, true);
    document.addEventListener('keydown', e => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.stopImmediatePropagation();
      }
    }, true);
    console.log('[BraveShield Bypass] Right-click force enabled');
  }

  // ==========================================
  // 31. FORCE ENABLE TEXT SELECTION
  // ==========================================
  function forceEnableTextSelect() {
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('enable-text-select')) return;
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `;
    const parent = document.head || document.documentElement;
    if (parent) parent.appendChild(style);

    document.addEventListener('selectstart', e => e.stopImmediatePropagation(), true);
    document.addEventListener('copy', e => e.stopImmediatePropagation(), true);
    document.addEventListener('cut', e => e.stopImmediatePropagation(), true);
    console.log('[BraveShield Bypass] Text selection force enabled');
  }

  // ==========================================
  // 32. ANTI-SCROLL LOCK
  // ==========================================
  function antiScrollLock() {
    if (isSafelistedHost() || SAFELIST_DISABLED_MODULES.includes('anti-scroll-lock')) return;
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        overflow: auto !important;
        overflow-x: auto !important;
        overflow-y: auto !important;
      }
      body {
        position: static !important;
        width: auto !important;
        height: auto !important;
      }
    `;
    const parent = document.head || document.documentElement;
    if (parent) parent.appendChild(style);
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    console.log('[BraveShield Bypass] Anti-scroll lock active');
  }

  // ==========================================
  // 33. AUTO-CLOSE POPUPS
  // ==========================================
  function autoClosePopups() {
    if (isSafelistedHost()) return;
    const origOpen = window.open;
    window.open = function(url, target, features) {
      console.log('[BraveShield Bypass] Blocked popup: ' + url);
      return null;
    };

    // Close existing popups - only target obvious ad/spam popups, not app modals
    const closePopups = () => {
      document.querySelectorAll(
        'div[class*="popup"][class*="ad"], div[class*="modal"][class*="ad"], ' +
        'div[id*="popup"][class*="ad"], div[id*="modal"][class*="ad"], ' +
        'div[class*="popunder"], div[class*="clickunder"]'
      ).forEach(el => {
        const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
        if (z > 1000) el.remove();
      });
    };

    closePopups();
    setTimeout(closePopups, 1000);
    console.log('[BraveShield Bypass] Auto-close popups active');
  }

  // ==========================================
  // 34. BLOCK CLIPBOARD READ
  // ==========================================
  function blockClipboardRead() {
    navigator.clipboard.readText = async () => {
      console.log('[BraveShield Bypass] Blocked clipboard read');
      return '';
    };
    navigator.clipboard.read = async () => {
      console.log('[BraveShield Bypass] Blocked clipboard read');
      return new ClipboardItem();
    };
    console.log('[BraveShield Bypass] Clipboard read blocked');
  }

  // ==========================================
  // 35. BLOCK NOTIFICATION SPAM
  // ==========================================
  function blockNotificationSpam() {
    if (Notification && Notification.permission) {
      Object.defineProperty(Notification, 'permission', { get: () => 'denied' });
    }
    if (navigator.permissions) {
      const origQuery = navigator.permissions.query;
      navigator.permissions.query = (desc) => {
        if (desc && desc.name === 'notifications') {
          return Promise.resolve({ state: 'denied', onchange: null });
        }
        return origQuery.call(navigator.permissions, desc);
      };
    }
    console.log('[BraveShield Bypass] Notification spam blocked');
  }

  // ==========================================
  // 36. TIMEZONE SPOOFING
  // ==========================================
  function timezoneSpoof() {
    const UA_TIMEZONES = {
      'Windows': 'America/New_York',
      'macOS': 'America/Los_Angeles',
      'Linux': 'Europe/London',
      'Android': 'Asia/Tokyo',
      'iOS': 'America/Chicago'
    };

    const stored = localStorage.getItem('braveshield_ua');
    if (stored) {
      try {
        const ua = JSON.parse(stored);
        const tz = UA_TIMEZONES[ua.platform] || 'UTC';
        const origDateTimeFormat = Intl.DateTimeFormat;
        const handler = {
          apply: function(target, thisArg, args) {
            if (args.length > 1 && typeof args[1] === 'object') {
              args[1].timeZone = tz;
            } else {
              args[1] = { timeZone: tz };
            }
            return Reflect.apply(target, thisArg, args);
          }
        };
        window.Intl.DateTimeFormat = new Proxy(origDateTimeFormat, handler);
        console.log('[BraveShield Bypass] Timezone spoofed to: ' + tz);
      } catch(e) {}
    }
  }

  // ==========================================
  // 37. GEOLOCATION SPOOFING
  // ==========================================
  function geolocationSpoof() {
    const GEO_POSITION = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };

    navigator.geolocation.getCurrentPosition = (success) => {
      console.log('[BraveShield Bypass] Geolocation spoofed');
      success(GEO_POSITION);
    };

    navigator.geolocation.watchPosition = (success) => {
      success(GEO_POSITION);
      return 0;
    };

    console.log('[BraveShield Bypass] Geolocation spoofing active');
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
    ['Module 28: Click Image Wait Bypass', bypassClickImageWait],
    ['Module 29: YouTube Ad Block + SponsorBlock', blockYouTubeAds],
    ['Module 30: Force Right-Click', forceEnableRightClick],
    ['Module 31: Force Text Selection', forceEnableTextSelect],
    ['Module 32: Anti-Scroll Lock', antiScrollLock],
    ['Module 33: Auto-Close Popups', autoClosePopups],
    ['Module 34: Block Clipboard Read', blockClipboardRead],
    ['Module 35: Block Notification Spam', blockNotificationSpam],
    ['Module 36: Timezone Spoofing', timezoneSpoof],
    ['Module 37: Geolocation Spoofing', geolocationSpoof]
  ];

  modules.forEach(([name, fn]) => {
    try { fn(); } catch(e) { console.debug('[BraveShield Bypass] ' + name + ' error:', e); }
  });

  console.log('[BraveShield Bypass] v4.0 - All ' + modules.length + ' modules initialized.');
})();
