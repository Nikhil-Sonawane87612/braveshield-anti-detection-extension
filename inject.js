/**
 * BraveShield Bypass Pro — Enterprise Stealth & Anti-Fingerprinting Engine
 * Version: synced from manifest at runtime (see bsVersion below)
 * Execution World: MAIN (True document_start)
 * Purpose: Complete Google Chrome & Multi-Device Profile parity, deep Brave cloaking,
 *          Unforgeable native function proxies, Reflect.apply/construct transparency,
 *          Error stack extension path masking, High-res timer coarsening (Spectre defense),
 *          Screen geometry normalization, Session-seeded mathematical canvas/audio noise,
 *          WebGL/WebGPU masking, Client Hints (UA-CH) sync, DOM measurement jitter,
 *          Media device & Speech synthesis sanitization, Instant URL Unshortener,
 *          Paywall/Blur Defuser, Live Telemetry, 100% Captcha passing.
 * Architecture: LIVE CONFIG BRIDGE — every hook consults BS_CONFIG at call-time.
 *          content.js pushes config the instant chrome.storage loads/changes, so the
 *          master kill switch, whitelisting and every module toggle apply WITHOUT a
 *          page reload (fixes the document_start race).
 */

(() => {
  'use strict';

  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  const path = (window.location && window.location.pathname) ? window.location.pathname : '';
  const bsVersion = (() => {
    try { return (window.chrome && chrome.runtime && chrome.runtime.id)
      ? 'main-world' /* real version arrives via config bridge */ : 'main-world'; } catch (_) { return 'main-world'; }
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // ZERO-TOUCH PASSTHROUGH FOR ALL INDUSTRY CAPTCHA PROVIDERS & INTERSTITIALS
  // Suffix matching only — DOM/title probes are meaningless at document_start.
  // ─────────────────────────────────────────────────────────────────────────────
  const isCaptchaHost = (typeof bsIsCaptchaHost === 'function')
    ? bsIsCaptchaHost(host, path)
    : false;

  // If inside ANY Captcha iframe or security challenge interstitial, exit immediately with 100% zero-touch!
  if (isCaptchaHost) {
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. LIVE CONFIG BRIDGE (Kill-Switch Race Fix)
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_CONFIG = {
    masterEnabled: true,
    enabled: true,
    unshortenerEnabled: true,
    autoBypassLinks: true,
    autoBypassTimers: true,
    turboAllSites: false,
    paywallDefuserEnabled: true,
    bypassAdblockDetection: true,
    maskBraveApi: true,
    clientHintsEnabled: true,
    maskClientHints: true,
    normalizeWebgl: true,
    webglSpoofingEnabled: true,
    canvasNoiseEnabled: true,
    audioNoiseEnabled: true,
    webrtcShieldEnabled: true,
    domJitterEnabled: true,
    timerCoarseningEnabled: true,
    mediaDevicesSanitizeEnabled: true,
    speechVoicesSanitizeEnabled: true,
    batteryMaskEnabled: true,
    screenNormalizationEnabled: true,
    uaSpoofingEnabled: true,
    timezoneSpoofingEnabled: false,
    webgpuMaskingEnabled: true,
    fontEnumMaskingEnabled: true,
    cleanUrlEnabled: true,
    rightClickEnabled: true,
    videoSpeedEnabled: true,
    autoSkipIntrosEnabled: true,
    youtubeAds: true,
    spotifyUnlocked: true,
    twitchShieldEnabled: true,
    deviceProfile: 'win-rtx4090',
    customHardwareProfile: null,
    resolvedUA: null,
    spoofTimezone: null,
    spoofLocale: null
  };

  let bsSiteDisabled = false;   // master off OR domain whitelisted
  let bsConfigReady = false;
  const bsReadyQueue = [];

  /** Default-on module gate */
  function bsOn(key) {
    if (bsSiteDisabled) return false;
    return BS_CONFIG[key] !== false;
  }

  /** Opt-in module gate (default OFF) */
  function bsOptIn(key) {
    if (bsSiteDisabled) return false;
    return BS_CONFIG[key] === true;
  }

  /** Run fn once the first real config snapshot has arrived */
  function bsOnConfigReady(fn) {
    if (bsConfigReady) { try { fn(); } catch (_) {} }
    else bsReadyQueue.push(fn);
  }

  window.addEventListener('message', (e) => {
    try {
      if (e.source !== window) return;
      const d = e.data;
      if (!d || d.type !== 'bs-config-sync' || typeof d.config !== 'object' || d.config === null) return;
      if (Object.prototype.hasOwnProperty.call(d, 'siteDisabled')) {
        bsSiteDisabled = d.siteDisabled === true;
      }
      Object.assign(BS_CONFIG, d.config);
      const firstSync = !bsConfigReady;
      bsConfigReady = true;
      if (typeof bsResolveHardware === 'function') bsResolveHardware();
      if (firstSync) {
        while (bsReadyQueue.length) {
          const fn = bsReadyQueue.shift();
          try { fn(); } catch (_) {}
        }
      }
    } catch (_) {}
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. UNFORGEABLE NATIVE FUNCTION PROXY ARCHITECTURE (The CreepJS Fix)
  // ─────────────────────────────────────────────────────────────────────────────
  const nativeHookedMap = new WeakMap();
  const originalToString = Function.prototype.toString;
  const originalReflectApply = Reflect.apply;
  const originalReflectConstruct = Reflect.construct;

  function makeNative(fn, name, length) {
    if (typeof fn !== 'function') return fn;
    const fnName = name || fn.name || '';
    nativeHookedMap.set(fn, fnName);
    try {
      Object.defineProperty(fn, 'name', { value: fnName, configurable: true });
    } catch (_) {}
    if (typeof length === 'number') {
      try {
        Object.defineProperty(fn, 'length', { value: length, configurable: true });
      } catch (_) {}
    }
    return fn;
  }

  const nativeToString = function toString() {
    if (typeof this === 'function') {
      if (nativeHookedMap.has(this)) {
        const fnName = nativeHookedMap.get(this) || this.name || '';
        return `function ${fnName}() { [native code] }`;
      }
    }
    return originalToString.apply(this, arguments);
  };
  makeNative(nativeToString, 'toString', 0);

  try {
    Object.defineProperty(Function.prototype, 'toString', {
      value: nativeToString,
      writable: true,
      configurable: true,
      enumerable: false
    });
  } catch (_) {}

  // Intercept Reflect.apply and Reflect.construct to pass deep Javascript validation checks
  try {
    Reflect.apply = makeNative(function(target, thisArg, argsList) {
      return originalReflectApply.apply(Reflect, arguments);
    }, 'apply', 3);

    Reflect.construct = makeNative(function(target, argsList, newTarget) {
      return originalReflectConstruct.apply(Reflect, arguments);
    }, 'construct', 2);
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ERROR STACK EXTENSION PATH MASKING (Defeats Extension Detection)
  // ─────────────────────────────────────────────────────────────────────────────
  const cleanStackString = (stack) => {
    if (typeof stack !== 'string') return stack;
    return stack.split('\n').filter(line => {
      return !line.includes('chrome-extension://') &&
             !line.includes('moz-extension://') &&
             !line.includes('inject.js') &&
             !line.includes('content.js') &&
             !line.includes('braveshield');
    }).join('\n');
  };

  try {
    const origErrorStackDesc = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
    if (origErrorStackDesc && origErrorStackDesc.get) {
      Object.defineProperty(Error.prototype, 'stack', {
        get: makeNative(function() {
          const s = origErrorStackDesc.get.call(this);
          return cleanStackString(s);
        }, 'get stack', 0),
        set: origErrorStackDesc.set ? makeNative(function(val) {
          return origErrorStackDesc.set.call(this, cleanStackString(val));
        }, 'set stack', 1) : undefined,
        configurable: true,
        enumerable: false
      });
    }

    if (typeof Error.captureStackTrace === 'function') {
      const origCapture = Error.captureStackTrace;
      Error.captureStackTrace = makeNative(function(targetObj, constructorOpt) {
        origCapture.apply(Error, arguments);
        if (targetObj && targetObj.stack) {
          targetObj.stack = cleanStackString(targetObj.stack);
        }
      }, 'captureStackTrace', 2);
    }
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.5. MOCK COMMON LINK-SHORTENER TRACKING & AD GLOBALS (Prevents Button Lockup)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    window.ga = window.ga || makeNative(function() {
      (window.ga.q = window.ga.q || []).push(arguments);
    }, 'ga', 0);
    window.ga.l = window.ga.l || Date.now();

    window.gtag = window.gtag || makeNative(function() {
      (window.dataLayer = window.dataLayer || []).push(arguments);
    }, 'gtag', 0);
    window.dataLayer = window.dataLayer || [];

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.loaded = true;
    if (!window.adsbygoogle.push || window.adsbygoogle.push === Array.prototype.push) {
      window.adsbygoogle.push = makeNative(function(arg) {
        return Array.prototype.push.call(this, arg);
      }, 'push', 1);
    }

    window.canRunAds = true;
    window.isAdBlockActive = false;
    window.adblock = false;
    window.google_ad_client = 'ca-pub-9999999999999999';
    window.google_ad_status = 1;
    window._pop = window._pop || [];
    window.popns = window.popns || {};
    window.AdServer = window.AdServer || {};
    window.fba = window.fba || makeNative(function() {}, 'fba', 0);
    window.fbq = window.fbq || makeNative(function() {}, 'fbq', 0);
    window.pys = window.pys || {};

    if (!window.googletag) {
      window.googletag = {
        cmd: [],
        display: makeNative(function() {}, 'display', 1),
        enableServices: makeNative(function() {}, 'enableServices', 0),
        pubads: makeNative(function() {
          return {
            addEventListener: makeNative(function() {}, 'addEventListener', 2),
            enableSingleRequest: makeNative(function() {}, 'enableSingleRequest', 0),
            setTargeting: makeNative(function() {}, 'setTargeting', 2),
            refresh: makeNative(function() {}, 'refresh', 0),
            clear: makeNative(function() {}, 'clear', 0),
            collapseEmptyDivs: makeNative(function() {}, 'collapseEmptyDivs', 0)
          };
        }, 'pubads', 0)
      };
      window.googletag.cmd.push = makeNative(function(fn) {
        if (typeof fn === 'function') {
          try { fn(); } catch (_) {}
        }
        return Array.prototype.push.apply(this, arguments);
      }, 'push', 1);
    }

    // Hook window.open safely to prevent ad popunders while allowing genuine download actions
    const origWindowOpen = window.open;
    window.open = makeNative(function(url, target, features) {
      if (bsOn('bypassAdblockDetection') && !isCaptchaHost && url && typeof url === 'string') {
        const isAdUrl = /(popcash|popads|adsterra|propellerads|exoclick|bet365|1xbet|clickadu|trafficjunky|adkeeper|syndication)/i.test(url);
        if (isAdUrl) {
          reportTelemetry('trapsNeutralized', 1);
          return { closed: false, focus: () => {}, blur: () => {}, close: () => {}, location: { href: url } };
        }
      }
      return origWindowOpen.apply(window, arguments);
    }, 'open', 3);
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.6. BRAVE SCHEME CLOAKING & AD PROBE MOCKING (fetch & XMLHttpRequest)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const AD_SCRIPT_PROBE_REGEX = /pagead2\.googlesyndication\.com|adservice\.google\.com|securepubads\.g\.doubleclick\.net|adnxs\.com|prebid\.js|\/ads?\.js|\/adframe\.js|\/adbanner\.js|\/adsbygoogle\.js|adblockdetector/i;

    if (typeof window.fetch === 'function') {
      const origFetch = window.fetch;
      window.fetch = makeNative(function(input, init) {
        try {
          if (bsOn('bypassAdblockDetection')) {
            const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input?.url);
            if (url && typeof url === 'string') {
              if (/^brave:\/\//i.test(url) && bsOn('maskBraveApi')) {
                return Promise.resolve(new Response('', { status: 404, statusText: 'Not Found' }));
              }
              if (AD_SCRIPT_PROBE_REGEX.test(url)) {
                return Promise.resolve(new Response('window.canRunAds=true;window.isAdBlockActive=false;window.adblock=false;', {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/javascript' }
                }));
              }
            }
          }
        } catch (_) {}
        return origFetch.apply(window, arguments);
      }, 'fetch', 1);
    }

    if (typeof XMLHttpRequest !== 'undefined') {
      const origXHROpen = XMLHttpRequest.prototype.open;
      const origXHRSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = makeNative(function(method, url, ...rest) {
        if (bsOn('bypassAdblockDetection') && typeof url === 'string') {
          if (/^brave:\/\//i.test(url) && bsOn('maskBraveApi')) {
            this._braveShieldBypass = true;
          } else if (AD_SCRIPT_PROBE_REGEX.test(url)) {
            this._adScriptMock = true;
          }
        }
        return origXHROpen.apply(this, [method, url, ...rest]);
      }, 'open', 2);

      XMLHttpRequest.prototype.send = makeNative(function(...args) {
        if (this._braveShieldBypass) {
          setTimeout(() => {
            try { this.dispatchEvent(new Event('error')); } catch (_) {}
          }, 0);
          return;
        }
        if (this._adScriptMock) {
          try {
            Object.defineProperty(this, 'status', { get: () => 200, configurable: true });
            Object.defineProperty(this, 'statusText', { get: () => 'OK', configurable: true });
            Object.defineProperty(this, 'responseText', { get: () => 'window.canRunAds=true;window.isAdBlockActive=false;window.adblock=false;', configurable: true });
            Object.defineProperty(this, 'readyState', { get: () => 4, configurable: true });
            setTimeout(() => {
              try { this.dispatchEvent(new Event('readystatechange')); } catch (_) {}
              try { this.dispatchEvent(new Event('load')); } catch (_) {}
            }, 0);
          } catch (_) {}
          return;
        }
        return origXHRSend.apply(this, args);
      }, 'send', 1);
    }
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.7. DOM BAIT TRAP DEFUSAL & COMPUTEDSTYLE HOOK (Defeats Bait-Element Probes)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const AD_BAIT_REGEX = /ad[s_-]?box|ad[s_-]?banner|ad[s_-]?unit|ad[s_-]?container|ad[s_-]?wrapper|adsbygoogle|pub_300|banner-ad|ad-zone|ad_slot|sponsor|advertisement|textads|carbonads|ad-detector|ad-test/i;

    function isBaitElement(el) {
      if (!el || !(el instanceof Element)) return false;
      const idOrClass = (el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '') + ' ' + (el.getAttribute ? (el.getAttribute('data-ad') || '') : '');
      return AD_BAIT_REGEX.test(idOrClass);
    }

    if (typeof window.getComputedStyle === 'function') {
      const origGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = makeNative(function(el, pseudo) {
        const style = origGetComputedStyle.call(window, el, pseudo);
        if (bsOn('bypassAdblockDetection') && isBaitElement(el) && style) {
          return new Proxy(style, {
            get(target, prop) {
              if (prop === 'display') return 'block';
              if (prop === 'visibility') return 'visible';
              if (prop === 'opacity') return '1';
              if (prop === 'height') return '250px';
              if (prop === 'width') return '300px';
              if (prop === 'getPropertyValue') {
                return function(name) {
                  if (name === 'display') return 'block';
                  if (name === 'visibility') return 'visible';
                  if (name === 'opacity') return '1';
                  if (name === 'height') return '250px';
                  if (name === 'width') return '300px';
                  return target.getPropertyValue(name);
                };
              }
              const val = target[prop];
              return typeof val === 'function' ? val.bind(target) : val;
            }
          });
        }
        return style;
      }, 'getComputedStyle', 1);
    }

    // Global Error Suppressor for Blocked Ad/Tracker Network Requests (Brave Shields Passthrough)
    window.addEventListener('error', function(e) {
      try {
        if (!bsOn('bypassAdblockDetection')) return;
        const target = e.target;
        if (target && (target.tagName === 'SCRIPT' || target.tagName === 'IMG' || target.tagName === 'LINK')) {
          const src = (target.src || target.href || '').toLowerCase();
          if (/pagead|googlesyndication|doubleclick|adservice|adnxs|prebid|\/ads?\.js|adblock|carbonads|amazon-adsystem|brave/i.test(src)) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }
      } catch (_) {}
    }, true);

    // Script Element Ad-Loader Simulator: Dispatch synthetic load event for ad scripts
    if (typeof HTMLScriptElement !== 'undefined') {
      const origScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      if (origScriptSrc) {
        Object.defineProperty(HTMLScriptElement.prototype, 'src', {
          set: makeNative(function(val) {
            if (bsOn('bypassAdblockDetection') && typeof val === 'string' && /pagead|googlesyndication|doubleclick|adservice|adnxs|prebid|\/ads?\.js|adblockdetector/i.test(val)) {
              setTimeout(() => {
                try {
                  if (typeof this.onload === 'function') this.onload(new Event('load'));
                  this.dispatchEvent(new Event('load'));
                } catch (_) {}
              }, 15);
            }
            return origScriptSrc.set.call(this, val);
          }, 'set src', 1),
          get: makeNative(function() {
            return origScriptSrc.get.call(this);
          }, 'get src', 0),
          configurable: true
        });
      }
    }

    if (typeof HTMLElement !== 'undefined') {
      const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
      const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
      const origClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
      const origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
      const origOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');

      if (origOffsetHeight && origOffsetHeight.get) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
          get: makeNative(function() {
            const real = origOffsetHeight.get.call(this);
            if (bsOn('bypassAdblockDetection') && real === 0 && isBaitElement(this)) return 250;
            return real;
          }, 'get offsetHeight', 0),
          configurable: true,
          enumerable: true
        });
      }

      if (origOffsetWidth && origOffsetWidth.get) {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
          get: makeNative(function() {
            const real = origOffsetWidth.get.call(this);
            if (bsOn('bypassAdblockDetection') && real === 0 && isBaitElement(this)) return 300;
            return real;
          }, 'get offsetWidth', 0),
          configurable: true,
          enumerable: true
        });
      }

      if (origClientHeight && origClientHeight.get) {
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
          get: makeNative(function() {
            const real = origClientHeight.get.call(this);
            if (bsOn('bypassAdblockDetection') && real === 0 && isBaitElement(this)) return 250;
            return real;
          }, 'get clientHeight', 0),
          configurable: true,
          enumerable: true
        });
      }

      if (origClientWidth && origClientWidth.get) {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
          get: makeNative(function() {
            const real = origClientWidth.get.call(this);
            if (bsOn('bypassAdblockDetection') && real === 0 && isBaitElement(this)) return 300;
            return real;
          }, 'get clientWidth', 0),
          configurable: true,
          enumerable: true
        });
      }

      if (origOffsetParent && origOffsetParent.get) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
          get: makeNative(function() {
            const real = origOffsetParent.get.call(this);
            if (bsOn('bypassAdblockDetection') && !real && isBaitElement(this)) return document.body || this.parentElement;
            return real;
          }, 'get offsetParent', 0),
          configurable: true,
          enumerable: true
        });
      }
    }
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. DETERMINISTIC SESSION-SEEDED PRNG (Mulberry32)
  // ─────────────────────────────────────────────────────────────────────────────
  let sessionSeed = 1337;
  try {
    let storedSeed = sessionStorage.getItem('bs_prng_seed');
    if (!storedSeed) {
      storedSeed = Math.floor(Math.random() * 2147483647).toString();
      sessionStorage.setItem('bs_prng_seed', storedSeed);
    }
    sessionSeed = parseInt(storedSeed, 10);
    for (let i = 0; i < host.length; i++) {
      sessionSeed = (sessionSeed ^ (host.charCodeAt(i) * 31)) >>> 0;
    }
  } catch (_) {}

  function createPrng(offset = 0) {
    let s = (sessionSeed + offset) >>> 0;
    return function() {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const prng = createPrng();

  function reportTelemetry(stat, delta = 1) {
    try {
      window.postMessage({ type: 'bs-telemetry-event', stat, delta }, '*');
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1: Deep Brave Identity Purge & Multi-Device Hardware Profiles
  // Every spoof below is LIVE-GATED: it consults BS_CONFIG at call time so the
  // kill switch / whitelist / toggles take effect instantly without reload.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (typeof navigator === 'undefined') return;

      // ── Mutable hardware identity, re-resolved on every config sync ──
      let bsHardware = null;
      const BS_HW_FALLBACK = {
        platform: 'Win32',
        vendor: 'Google Inc. (NVIDIA)',
        renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        concurrency: 16,
        memory: 16,
        devicePixelRatio: 1,
        screen: { width: 1920, height: 1080, colorDepth: 24 }
      };

      window.bsResolveHardware = function() {
        try {
          const selectedId = BS_CONFIG.deviceProfile || 'win-rtx4090';
          const customJson = BS_CONFIG.customHardwareProfile;

          if (selectedId === 'custom' && customJson && typeof customJson === 'object') {
            bsHardware = {
              platform: customJson.platform || 'Win32',
              vendor: customJson.vendor || BS_HW_FALLBACK.vendor,
              renderer: customJson.renderer || BS_HW_FALLBACK.renderer,
              concurrency: parseInt(customJson.concurrency, 10) || 16,
              memory: parseInt(customJson.memory, 10) || 8,
              devicePixelRatio: parseFloat(customJson.devicePixelRatio) || 1,
              screen: customJson.screen || { width: 2560, height: 1440, colorDepth: 24 }
            };
            return;
          }
          if (typeof HARDWARE_PROFILES_CATALOG !== 'undefined' && Array.isArray(HARDWARE_PROFILES_CATALOG)) {
            const matched = HARDWARE_PROFILES_CATALOG.find(p => p.id === selectedId);
            if (matched) {
              bsHardware = {
                platform: matched.platform,
                vendor: matched.vendor,
                renderer: matched.renderer,
                concurrency: matched.concurrency,
                memory: matched.memory,
                devicePixelRatio: matched.devicePixelRatio,
                screen: matched.screen
              };
              return;
            }
          }
        } catch (_) {}
        bsHardware = BS_HW_FALLBACK;
      };
      bsResolveHardware();

      // ── 1. navigator.brave neutralization (LIVE-GATED, original preserved) ──
      const nativeBraveValue = ('brave' in navigator) ? navigator.brave : undefined;
      const braveGetter = function() {
        return bsOn('maskBraveApi') ? undefined : nativeBraveValue;
      };
      try { Object.defineProperty(Navigator.prototype, 'brave', { get: braveGetter, set: () => {}, configurable: true, enumerable: false }); } catch (_) {}
      try { Object.defineProperty(navigator, 'brave', { get: braveGetter, set: () => {}, configurable: true, enumerable: false }); } catch (_) {}

      // ── 2. Web3 Brave Wallet identifiers (applied once config confirms active) ──
      bsOnConfigReady(() => {
        if (!bsOn('maskBraveApi')) return;
        try {
          delete window.braveSolana;
          delete window.solanaBrave;
          window.braveSolana = undefined;
          window.solanaBrave = undefined;
        } catch (_) {}
        if (window.ethereum) {
          try {
            delete window.ethereum.isBraveWallet;
            window.ethereum.isBraveWallet = false;
          } catch (_) {}
        }
        if (window.solana) {
          try {
            delete window.solana.isBraveWallet;
            window.solana.isBraveWallet = false;
          } catch (_) {}
        }
      });

      // ── 3. webdriver (LIVE-GATED, Safe for Cloudflare Turnstile) ──
      const origWebdriverDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
      try {
        Object.defineProperty(Navigator.prototype, 'webdriver', {
          get: function() {
            if (bsOn('hideWebdriver')) return false;
            return origWebdriverDesc && origWebdriverDesc.get ? origWebdriverDesc.get.call(this) : false;
          },
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      // ── 4. Live Platform / CPU / RAM spoofing (reads current bsHardware) ──
      const platformGetter = function() { return bsHardware.platform; };
      try { Object.defineProperty(Navigator.prototype, 'platform', { get: makeNative(platformGetter, 'get platform', 0), configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'platform', { get: makeNative(platformGetter, 'get platform', 0), configurable: true }); } catch (_) {}

      const concurrencyGetter = function() { return bsHardware.concurrency || 16; };
      try { Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: makeNative(concurrencyGetter, 'get hardwareConcurrency', 0), configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'hardwareConcurrency', { get: makeNative(concurrencyGetter, 'get hardwareConcurrency', 0), configurable: true }); } catch (_) {}

      // deviceMemory is spec-clamped to 8 GB max — clamp spoofed values too
      const memoryGetter = function() { return Math.min(8, Math.max(0.25, bsHardware.memory || 8)); };
      try { Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: makeNative(memoryGetter, 'get deviceMemory', 0), configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'deviceMemory', { get: makeNative(memoryGetter, 'get deviceMemory', 0), configurable: true }); } catch (_) {}

      // ── 5. Live Screen & Monitor Geometry Normalization (originals preserved) ──
      const SCREEN_KEYS = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth', 'availLeft', 'availTop'];
      const origScreenDesc = {};
      if (typeof Screen !== 'undefined' && Screen.prototype) {
        for (const k of SCREEN_KEYS) {
          origScreenDesc[k] = Object.getOwnPropertyDescriptor(Screen.prototype, k);
        }
      }
      const screenValue = (key) => {
        const s = bsHardware.screen || BS_HW_FALLBACK.screen;
        switch (key) {
          case 'width': case 'availWidth': return s.width;
          case 'height': return s.height;
          case 'availHeight': return Math.max(600, s.height - 40);
          case 'colorDepth': case 'pixelDepth': return s.colorDepth || 24;
          default: return 0;
        }
      };
      const makeScreenGetter = (key, origDesc) => makeNative(function() {
        if (!bsOn('screenNormalizationEnabled')) {
          return origDesc && origDesc.get ? origDesc.get.call(this) : undefined;
        }
        return screenValue(key);
      }, `get ${key}`, 0);

      for (const k of SCREEN_KEYS) {
        try {
          if (typeof Screen !== 'undefined' && Screen.prototype) {
            Object.defineProperty(Screen.prototype, k, { get: makeScreenGetter(k, origScreenDesc[k]), configurable: true, enumerable: true });
          }
        } catch (_) {}
        try {
          if (window.screen) {
            Object.defineProperty(window.screen, k, { get: () => screenValue(k), configurable: true, enumerable: true });
          }
        } catch (_) {}
      }

      // devicePixelRatio / outer dimensions (LIVE-GATED)
      const origDprDesc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      try {
        Object.defineProperty(window, 'devicePixelRatio', {
          get: makeNative(function() {
            if (!bsOn('screenNormalizationEnabled')) {
              return origDprDesc && origDprDesc.get ? origDprDesc.get.call(this) : (origDprDesc ? origDprDesc.value : 1);
            }
            return bsHardware.devicePixelRatio || 1;
          }, 'get devicePixelRatio', 0),
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      const realOuterWidth = window.outerWidth;
      const realOuterHeight = window.outerHeight;
      try {
        Object.defineProperty(window, 'outerWidth', {
          get: makeNative(() => bsOn('screenNormalizationEnabled') ? (bsHardware.screen || BS_HW_FALLBACK.screen).width : realOuterWidth, 'get outerWidth', 0),
          configurable: true,
          enumerable: true
        });
        Object.defineProperty(window, 'outerHeight', {
          get: makeNative(() => bsOn('screenNormalizationEnabled') ? (bsHardware.screen || BS_HW_FALLBACK.screen).height : realOuterHeight, 'get outerHeight', 0),
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      // ── 6. WebGL Hardware Vendor & GPU Renderer Spoofing (LIVE-GATED) ──
      const hookWebGL = (proto) => {
        if (!proto || !proto.getParameter) return;
        const origGetParameter = proto.getParameter;
        proto.getParameter = makeNative(function(pname) {
          if (!isCaptchaHost && bsOn('webglSpoofingEnabled')) {
            if (pname === 0x9245) return bsHardware.vendor;   // UNMASKED_VENDOR_WEBGL
            if (pname === 0x9246) return bsHardware.renderer; // UNMASKED_RENDERER_WEBGL
            if (pname === 0x1F00) return 'WebKit';            // VENDOR
            if (pname === 0x1F01) return 'WebKit WebGL';      // RENDERER
          }
          return origGetParameter.apply(this, arguments);
        }, 'getParameter', 1);

          if (proto.getExtension) {
            const origGetExtension = proto.getExtension;
            proto.getExtension = makeNative(function(name) {
              const ext = origGetExtension.apply(this, arguments);
              if (name === 'WEBGL_debug_renderer_info' && ext) {
                return {
                  UNMASKED_VENDOR_WEBGL: 0x9245,
                  UNMASKED_RENDERER_WEBGL: 0x9246
                };
              }
              return ext;
            }, 'getExtension', 1);
          }

          if (proto.getShaderPrecisionFormat) {
            const origShaderPrec = proto.getShaderPrecisionFormat;
            proto.getShaderPrecisionFormat = makeNative(function(shaderType, precisionType) {
              const res = origShaderPrec.apply(this, arguments);
              if (res) {
                return {
                  rangeMin: res.rangeMin,
                  rangeMax: res.rangeMax,
                  precision: res.precision
                };
              }
              return res;
            }, 'getShaderPrecisionFormat', 2);
          }
      };

      if (typeof WebGLRenderingContext !== 'undefined') hookWebGL(WebGLRenderingContext.prototype);
      if (typeof WebGL2RenderingContext !== 'undefined') hookWebGL(WebGL2RenderingContext.prototype);

      // ── 7. Client Hints (UA-CH) Consistency on NavigatorUAData Prototype (LIVE-GATED) ──
      {
        if (typeof NavigatorUAData !== 'undefined' && NavigatorUAData.prototype) {
          try {
            const uaPlatformName = () => {
              const p = bsHardware.platform || 'Win32';
              if (p.includes('Win')) return 'Windows';
              if (p.includes('Mac') || p === 'iPhone' || p === 'iPad') return 'macOS';
              if (p.includes('Android') || p.includes('arm')) return 'Android';
              return 'Linux';
            };
            const chromeBrandify = (list) => (BS_CONFIG.resolvedUA && Array.isArray(BS_CONFIG.resolvedUA.brands))
              ? BS_CONFIG.resolvedUA.brands
              : (list || []).map(b => (b.brand === 'Brave' ? { brand: 'Google Chrome', version: b.version } : b));

            const origBrands = Object.getOwnPropertyDescriptor(NavigatorUAData.prototype, 'brands');
            if (origBrands && origBrands.get) {
              Object.defineProperty(NavigatorUAData.prototype, 'brands', {
                get: function() {
                  if (!bsOn('clientHintsEnabled')) return origBrands.get.call(this) || [];
                  return chromeBrandify(origBrands.get.call(this));
                },
                configurable: true,
                enumerable: true
              });
            }

            const origUaDataPlatformDesc = Object.getOwnPropertyDescriptor(NavigatorUAData.prototype, 'platform');
            const origPlatformValue = (() => {
              try {
                if (origUaDataPlatformDesc && origUaDataPlatformDesc.get) return origUaDataPlatformDesc.get.call(navigator.userAgentData);
                if (origUaDataPlatformDesc && 'value' in origUaDataPlatformDesc) return origUaDataPlatformDesc.value;
              } catch (_) {}
              return 'Windows';
            })();
            Object.defineProperty(NavigatorUAData.prototype, 'platform', {
              get: () => bsOn('clientHintsEnabled') ? uaPlatformName() : origPlatformValue,
              configurable: true,
              enumerable: true
            });

            if (NavigatorUAData.prototype.getHighEntropyValues) {
              const origHighEntropy = NavigatorUAData.prototype.getHighEntropyValues;
              NavigatorUAData.prototype.getHighEntropyValues = makeNative(function(hints) {
                return origHighEntropy.apply(this, arguments).then(res => {
                  if (!res || !bsOn('clientHintsEnabled')) return res;
                  res.platform = uaPlatformName();
                  res.architecture = (bsHardware.platform || '').includes('arm') ? 'arm' : 'x86';
                  res.bitness = '64';
                  res.model = '';
                  res.wow64 = false;
                  if (Array.isArray(res.brands)) {
                    res.brands = chromeBrandify(res.brands);
                  }
                  if (Array.isArray(res.fullVersionList)) {
                    res.fullVersionList = chromeBrandify(res.fullVersionList);
                  }
                  if (BS_CONFIG.resolvedUA) {
                    if (BS_CONFIG.resolvedUA.platformVersion && (!hints || hints.includes('platformVersion'))) {
                      res.platformVersion = BS_CONFIG.resolvedUA.platformVersion;
                    }
                    if (BS_CONFIG.resolvedUA.mobile !== undefined) {
                      res.mobile = BS_CONFIG.resolvedUA.mobile;
                    }
                  }
                  return res;
                });
              }, 'getHighEntropyValues', 1);
            }
          } catch (_) {}
        }
      }

      // 6. Authentic window.chrome API Stubs
      if (!window.chrome) window.chrome = {};
      window.chrome.app = window.chrome.app || {
        isInstalled: false,
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
        getDetails: function() { return null; },
        getIsInstalled: function() { return false; },
        runningState: function() { return 'cannot_run'; }
      };

      window.chrome.runtime = window.chrome.runtime || {
        OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
        OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
        PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
        RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' }
      };

      window.chrome.csi = window.chrome.csi || function() {
        return {
          startE: performance.timing?.navigationStart || Date.now(),
          onloadT: performance.timing?.loadEventEnd || Date.now(),
          pageT: performance.now(),
          tran: 15
        };
      };

      window.chrome.loadTimes = window.chrome.loadTimes || function() {
        return {
          requestTime: performance.now() / 1000,
          startLoadTime: performance.now() / 1000,
          commitLoadTime: performance.now() / 1000,
          finishDocumentLoadTime: performance.now() / 1000,
          finishLoadTime: performance.now() / 1000,
          firstPaintTime: performance.now() / 1000,
          firstPaintAfterLoadTime: 0,
          navigationType: 'Other',
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true,
          npnNegotiatedProtocol: 'h2',
          wasAlternateProtocolAvailable: false,
          connectionInfo: 'h2'
        };
      };

      // ── 8. Battery & Network Information Cloaking (LIVE-GATED) ──
      try {
        const origGetBattery = navigator.getBattery;
        if (origGetBattery) {
          const mockBattery = {
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 1.0,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          };
          navigator.getBattery = makeNative(function() {
            return bsOn('batteryMaskEnabled') ? Promise.resolve(mockBattery) : origGetBattery.apply(this, arguments);
          }, 'getBattery', 0);
        }

        if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
          const mockConnection = {
            downlink: 10,
            effectiveType: '4g',
            rtt: 50,
            saveData: false,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          };
          const connectionGetter = function() {
            return bsOn('batteryMaskEnabled') ? mockConnection : undefined;
          };
          try { Object.defineProperty(Navigator.prototype, 'connection', { get: makeNative(connectionGetter, 'get connection', 0), configurable: true }); } catch (_) {}
          try { Object.defineProperty(navigator, 'connection', { get: makeNative(connectionGetter, 'get connection', 0), configurable: true }); } catch (_) {}
        }
      } catch (_) {}

      // ── 9. High-Precision Audio Noise (LIVE-GATED, non-compounding) ──
      // getChannelData returns the LIVE backing store — mutating it compounds on
      // every call. We cache a per-buffer/channel noisy COPY instead, so repeated
      // probes hash identically within a session and the real buffer is untouched.
      try {
        const audioCopyCache = new WeakMap();

        const perturbCopy = (data, offsetSeed) => {
          const audioPrng = createPrng(offsetSeed);
          for (let i = 0; i < Math.min(data.length, 128); i += 4) {
            data[i] += (audioPrng() - 0.5) * 2e-7;
          }
          return data;
        };

        if (typeof AudioBuffer !== 'undefined' && AudioBuffer.prototype.getChannelData) {
          const origGetChannelData = AudioBuffer.prototype.getChannelData;
          AudioBuffer.prototype.getChannelData = makeNative(function(channel) {
            const data = origGetChannelData.apply(this, arguments);
            if (!isCaptchaHost && bsOn('audioNoiseEnabled') && data && data.length > 10) {
              let perBuffer = audioCopyCache.get(this);
              if (!perBuffer || !perBuffer[channel]) {
                perBuffer = perBuffer || {};
                perBuffer[channel] = perturbCopy(new Float32Array(data), channel + 7);
                audioCopyCache.set(this, perBuffer);
              }
              return perBuffer[channel];
            }
            return data;
          }, 'getChannelData', 1);

          if (AudioBuffer.prototype.copyFromChannel) {
            const origCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
            AudioBuffer.prototype.copyFromChannel = makeNative(function(dest, channelNumber, startInChannel) {
              origCopyFromChannel.apply(this, arguments);
              if (!isCaptchaHost && bsOn('audioNoiseEnabled') && dest && dest.length > 10) {
                perturbCopy(dest, channelNumber + 13);
              }
            }, 'copyFromChannel', 2);
          }
        }

        // Analyser arrays are caller-owned scratch buffers that get refilled with
        // fresh raw data every call — we apply FRESH multiplicative variance each
        // call so noise never accumulates across invocations.
        if (typeof AnalyserNode !== 'undefined' && AnalyserNode.prototype.getFloatFrequencyData) {
          const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
          AnalyserNode.prototype.getFloatFrequencyData = makeNative(function(array) {
            origGetFloatFreq.apply(this, arguments);
            if (!isCaptchaHost && bsOn('audioNoiseEnabled') && array && array.length > 0) {
              const audioPrng = createPrng(29);
              for (let i = 0; i < Math.min(array.length, 32); i++) {
                array[i] = array[i] * (1 + (audioPrng() - 0.5) * 2e-7);
              }
            }
          }, 'getFloatFrequencyData', 1);

          if (AnalyserNode.prototype.getByteFrequencyData) {
            const origGetByteFreq = AnalyserNode.prototype.getByteFrequencyData;
            AnalyserNode.prototype.getByteFrequencyData = makeNative(function(array) {
              origGetByteFreq.apply(this, arguments);
              if (!isCaptchaHost && bsOn('audioNoiseEnabled') && array && array.length > 0) {
                const audioPrng = createPrng(41);
                if (audioPrng() > 0.5) array[0] = Math.min(255, Math.max(0, array[0] + (audioPrng() > 0.5 ? 1 : -1)));
              }
            }, 'getByteFrequencyData', 1);
          }
        }

        if (typeof OfflineAudioContext !== 'undefined' && OfflineAudioContext.prototype.startRendering) {
          const origStartRendering = OfflineAudioContext.prototype.startRendering;
          OfflineAudioContext.prototype.startRendering = makeNative(function() {
            return origStartRendering.apply(this, arguments).then(audioBuffer => {
              if (!isCaptchaHost && bsOn('audioNoiseEnabled') && audioBuffer && audioBuffer.numberOfChannels) {
                const oPrng = createPrng(53);
                for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
                  const data = audioBuffer.getChannelData(c);
                  for (let i = 0; i < Math.min(data.length, 128); i += 4) {
                    data[i] += (oPrng() - 0.5) * 2e-7;
                  }
                }
              }
              return audioBuffer;
            });
          }, 'startRendering', 0);
        }
      } catch (_) {}

      // ── 10. Session-Seeded Canvas Spoofing (LIVE-GATED, truly non-destructive) ──
      // The old implementation wrote noisy pixels BACK onto the live canvas via
      // putImageData — permanently altering visible content and compounding noise
      // on every call. We now encode from a perturbed OFFSCREEN copy instead.
      if (typeof CanvasRenderingContext2D !== 'undefined' || typeof HTMLCanvasElement !== 'undefined') {
        try {
          const applyCanvasNoise = (imageData) => {
            if (!imageData || !imageData.data || imageData.data.length < 4) return imageData;
            const cPrng = createPrng(71);
            const len = imageData.data.length;
            const step = Math.max(4, Math.floor(len / 128));
            for (let i = 0; i < len; i += step) {
              const shift = cPrng() > 0.5 ? 1 : -1;
              imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + shift));
            }
            return imageData;
          };

          // Render this canvas into an offscreen copy and return the copy.
          // Returns null if the canvas cannot be safely copied.
          const makeNoisyCopy = (canvas) => {
            if (!canvas || !canvas.width || !canvas.height || canvas.width > 512 || canvas.height > 512) return null;
            const copy = document.createElement('canvas');
            copy.width = canvas.width;
            copy.height = canvas.height;
            const cctx = copy.getContext('2d');
            if (!cctx) return null;
            cctx.drawImage(canvas, 0, 0);
            const img = cctx.getImageData(0, 0, copy.width, copy.height);
            applyCanvasNoise(img);
            cctx.putImageData(img, 0, 0);
            return copy;
          };

          if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.getImageData) {
            const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = makeNative(function(sx, sy, sw, sh) {
              const imgData = origGetImageData.apply(this, arguments);
              // getImageData already returns an isolated copy — perturbing the
              // returned object never touches the live canvas.
              if (!isCaptchaHost && bsOn('canvasNoiseEnabled')) {
                applyCanvasNoise(imgData);
              }
              return imgData;
            }, 'getImageData', 4);
          }

          if (typeof HTMLCanvasElement !== 'undefined') {
            if (HTMLCanvasElement.prototype.toDataURL) {
              const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
              HTMLCanvasElement.prototype.toDataURL = makeNative(function() {
                if (!isCaptchaHost && bsOn('canvasNoiseEnabled')) {
                  try {
                    const copy = makeNoisyCopy(this);
                    if (copy) return origToDataURL.apply(copy, arguments);
                  } catch (_) {}
                }
                return origToDataURL.apply(this, arguments);
              }, 'toDataURL', 0);
            }

            if (HTMLCanvasElement.prototype.toBlob) {
              const origToBlob = HTMLCanvasElement.prototype.toBlob;
              HTMLCanvasElement.prototype.toBlob = makeNative(function(callback, type, quality) {
                if (!isCaptchaHost && bsOn('canvasNoiseEnabled')) {
                  try {
                    const copy = makeNoisyCopy(this);
                    if (copy) return origToBlob.apply(copy, arguments);
                  } catch (_) {}
                }
                return origToBlob.apply(this, arguments);
              }, 'toBlob', 1);
            }
          }
        } catch (_) {}
      }

      // ── 11. WebRTC Local IP Leak Protection (LIVE-GATED) ──
      try {
        if (typeof RTCPeerConnection !== 'undefined') {
          const filterSdp = (sdp) => {
            if (typeof sdp !== 'string') return sdp;
            return sdp.replace(/(\r\n|\n)?a=candidate:.*?(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|\.local).*/gi, '');
          };

          const origCreateOffer = RTCPeerConnection.prototype.createOffer;
          RTCPeerConnection.prototype.createOffer = makeNative(function(options) {
            return origCreateOffer.apply(this, arguments).then(offer => {
              if (bsOn('webrtcShieldEnabled') && offer && offer.sdp) {
                offer.sdp = filterSdp(offer.sdp);
              }
              return offer;
            });
          }, 'createOffer', 0);

          if (RTCPeerConnection.prototype.createAnswer) {
            const origCreateAnswer = RTCPeerConnection.prototype.createAnswer;
            RTCPeerConnection.prototype.createAnswer = makeNative(function(options) {
              return origCreateAnswer.apply(this, arguments).then(answer => {
                if (bsOn('webrtcShieldEnabled') && answer && answer.sdp) {
                  answer.sdp = filterSdp(answer.sdp);
                }
                return answer;
              });
            }, 'createAnswer', 0);
          }

          if (RTCPeerConnection.prototype.setLocalDescription) {
            const origSetLocalDesc = RTCPeerConnection.prototype.setLocalDescription;
            RTCPeerConnection.prototype.setLocalDescription = makeNative(function(desc) {
              if (bsOn('webrtcShieldEnabled') && desc && desc.sdp) {
                desc.sdp = filterSdp(desc.sdp);
              }
              return origSetLocalDesc.apply(this, arguments);
            }, 'setLocalDescription', 1);
          }
        }
      } catch (_) {}

      // ── 12. DOM Measurement Micro-Jitter (LIVE-GATED) ──
      try {
        if (typeof Element !== 'undefined' && Element.prototype.getBoundingClientRect) {
          const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
          Element.prototype.getBoundingClientRect = makeNative(function() {
            const rect = origGetBoundingClientRect.apply(this, arguments);
            if (!isCaptchaHost && bsOn('domJitterEnabled') && rect) {
              const jPrng = createPrng(rect.width + rect.height);
              const jitter = (jPrng() - 0.5) * 0.002;
              return new DOMRect(
                rect.x + jitter,
                rect.y + jitter,
                rect.width + jitter,
                rect.height + jitter
              );
            }
            return rect;
          }, 'getBoundingClientRect', 0);
        }
      } catch (_) {}

      // ── 13. High-Resolution Timer Coarsening (LIVE-GATED Spectre defense) ──
      try {
        if (typeof performance !== 'undefined' && performance.now) {
          const origNow = performance.now;
          performance.now = makeNative(function() {
            const t = origNow.apply(performance, arguments);
            if (!bsOn('timerCoarseningEnabled')) return t;
            // Coarsen resolution to nearest 20ms to destroy CPU cache benchmarking
            return Math.floor(t / 20) * 20;
          }, 'now', 0);
        }

        const origDateNow = Date.now;
        Date.now = makeNative(function() {
          const d = origDateNow.apply(Date, arguments);
          if (!bsOn('timerCoarseningEnabled')) return d;
          return Math.floor(d / 20) * 20;
        }, 'now', 0);

        if (typeof Event !== 'undefined' && Event.prototype) {
          const origTimeStamp = Object.getOwnPropertyDescriptor(Event.prototype, 'timeStamp');
          if (origTimeStamp && origTimeStamp.get) {
            Object.defineProperty(Event.prototype, 'timeStamp', {
              get: makeNative(function() {
                const ts = origTimeStamp.get.call(this);
                if (!bsOn('timerCoarseningEnabled')) return ts;
                return Math.floor(ts / 20) * 20;
              }, 'get timeStamp', 0),
              configurable: true,
              enumerable: true
            });
          }
        }
      } catch (_) {}

      // ── 14. Media Devices & Speech Synthesis Sanitization (LIVE-GATED) ──
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const origEnumerateDevices = navigator.mediaDevices.enumerateDevices;
          const mockDevices = [
            { deviceId: 'default', kind: 'audioinput', label: 'Default Audio Device', groupId: 'group_default' },
            { deviceId: 'default', kind: 'audiooutput', label: 'Default Speaker', groupId: 'group_default' },
            { deviceId: 'default', kind: 'videoinput', label: 'Integrated HD Camera', groupId: 'group_default' }
          ];
          navigator.mediaDevices.enumerateDevices = makeNative(function() {
            return bsOn('mediaDevicesSanitizeEnabled') ? Promise.resolve(mockDevices) : origEnumerateDevices.apply(this, arguments);
          }, 'enumerateDevices', 0);
        }
      } catch (_) {}

      try {
        if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.getVoices) {
          const origGetVoices = window.speechSynthesis.getVoices;
          const mockVoices = [
            { voiceURI: 'Google US English', name: 'Google US English', lang: 'en-US', localService: false, default: true },
            { voiceURI: 'Google UK English Female', name: 'Google UK English Female', lang: 'en-GB', localService: false, default: false },
            { voiceURI: 'Google UK English Male', name: 'Google UK English Male', lang: 'en-GB', localService: false, default: false }
          ];
          window.speechSynthesis.getVoices = makeNative(function() {
            return bsOn('speechVoicesSanitizeEnabled') ? mockVoices : origGetVoices.apply(this, arguments);
          }, 'getVoices', 0);
        }
      } catch (_) {}

    } catch (_) {}
  })();

  const isMediaPlatform = host.includes('spotify.com') || host.includes('youtube.com') || host.includes('youtu.be') || host.includes('netflix.com') || host.includes('twitch.tv') || host.includes('reddit.com');

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 2: Feature A — Instant URL Unshortener & Direct Link Resolvers
  // (LIVE-GATED: sweep checks config every pass, so toggles apply instantly)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const UNPACK_SELECTORS = [
        'a[href*="ouo.io/go/"]', 'a[href*="ouo.press/go/"]',
        'a[href*="linkvertise.com/download/"]',
        'a[href*="/safelink/"]', 'a[href*="url="]', 'a[href*="dest="]',
        'a[href*="redirect="]', 'a[href*="target="]', 'a[href*="link="]'
      ];

      function decodeQueryTarget(urlStr) {
        try {
          const u = new URL(urlStr, window.location.href);
          const keys = ['dest', 'target', 'url', 'link', 'redirect', 'r', 'destination', 'go', 'to'];
          for (const k of keys) {
            const v = u.searchParams.get(k);
            if (v && (v.startsWith('http://') || v.startsWith('https://'))) {
              return decodeURIComponent(v);
            }
            if (v && /^[a-zA-Z0-9+/=]{16,}$/.test(v)) {
              try {
                const b64 = atob(v);
                if (b64.startsWith('http://') || b64.startsWith('https://')) return b64;
              } catch (_) {}
            }
          }
        } catch (_) {}
        return null;
      }

      function sweepUnshortenLinks() {
        if (!bsOn('unshortenerEnabled')) return;
        const anchors = document.querySelectorAll(UNPACK_SELECTORS.join(', '));
        anchors.forEach(a => {
          if (a._bsResolved) return;
          const target = decodeQueryTarget(a.href);
          if (target && target !== a.href) {
            a._bsResolved = true;
            a.href = target;
            a.title = '⚡ Direct link unlocked by BraveShield: ' + target;
            reportTelemetry('directLinksUnlocked', 1);
          }
        });
      }

      setInterval(sweepUnshortenLinks, 1200);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 3: 50x Safe Countdown Acceleration (MAIN-world timer hooks only)
  // NOTE: DOM overlay purging / button unlocking lives exclusively in content.js
  // now — the duplicated MAIN-world copy was removed.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const origSetTimeout = window.setTimeout;
      const origSetInterval = window.setInterval;

      window.setTimeout = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && bsOn('autoBypassTimers') && typeof delay === 'number' && delay > 100 && delay < 120000) {
          const fastDelay = Math.max(10, Math.floor(delay / 50));
          return origSetTimeout.call(this, fn, fastDelay, ...args);
        }
        return origSetTimeout.apply(this, arguments);
      }, 'setTimeout', 2);

      window.setInterval = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && bsOn('autoBypassTimers') && typeof delay === 'number' && delay >= 1000 && delay < 60000) {
          const fastDelay = Math.max(50, Math.floor(delay / 50));
          return origSetInterval.call(this, fn, fastDelay, ...args);
        }
        return origSetInterval.apply(this, arguments);
      }, 'setInterval', 2);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 4: Feature B — Universal Paywall & Blur Defuser (LIVE-GATED)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const PAYWALL_PATTERNS = [
      '.paywall', '.modal-backdrop', '.blur-overlay',
      '.tp-backdrop', '.tp-modal', '#gateway-content',
      '.fc-ab-root', '.adblock-overlay', '.gate-overlay',
      'div[id*="paywall"]', 'div[class*="paywall"]',
      'div[class*="gate_overlay"]', 'div[class*="blurred_answer"]'
    ];

    function defusePaywallAndBlur() {
      try {
        if (!bsOn('paywallDefuserEnabled')) return;
        if (document.documentElement) {
          document.documentElement.style.setProperty('overflow', 'auto', 'important');
        }
        if (document.body) {
          document.body.style.setProperty('overflow', 'auto', 'important');
          document.body.style.setProperty('filter', 'none', 'important');
          document.body.style.setProperty('position', 'static', 'important');
        }

        PAYWALL_PATTERNS.forEach(sel => {
          const elms = document.querySelectorAll(sel);
          elms.forEach(el => {
            if (el && !el._bsDefused) {
              el._bsDefused = true;
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('opacity', '0', 'important');
              el.style.setProperty('pointer-events', 'none', 'important');
              reportTelemetry('trapsNeutralized', 1);
            }
          });
        });

        const blurred = document.querySelectorAll('[style*="filter: blur"], [style*="filter:blur"]');
        blurred.forEach(el => {
          el.style.setProperty('filter', 'none', 'important');
          el.style.setProperty('user-select', 'text', 'important');
        });
      } catch (_) {}
    }

    setInterval(defusePaywallAndBlur, 1000);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 5: Feature C — AdBlock Trap Defuser (LIVE-GATED)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const ADBLOCK_MODAL_TEXT_REGEX = /(disable\s+your\s+ad\s?blocker|ad\s?block\s+detected|turn\s+off\s+adblock|we\s+notice\s+you\s+are\s+using\s+an\s+ad\s?blocker|ad\s?blocking\s+software)/i;

    function neutralizeAdBlockTraps() {
      try {
        if (!bsOn('bypassAdblockDetection')) return;
        const potentialModals = document.querySelectorAll('div[class*="modal"], div[class*="popup"], div[class*="dialog"], div[id*="adblock"], div[class*="adblock"]');
        potentialModals.forEach(m => {
          if (m && !m._bsAdblockDefused && ADBLOCK_MODAL_TEXT_REGEX.test(m.innerText || '')) {
            m._bsAdblockDefused = true;
            m.style.setProperty('display', 'none', 'important');
            m.style.setProperty('pointer-events', 'none', 'important');
            reportTelemetry('trapsNeutralized', 1);
          }
        });
      } catch (_) {}
    }

    setInterval(neutralizeAdBlockTraps, 1000);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 6: Feature D — YouTube Turbo 16x Skip
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) return;

    function speedupYouTubeAds() {
      try {
        if (!bsOn('youtubeAds')) return;

        const video = document.querySelector('video');
        const adContainer = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay');
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');

        if (adContainer && video) {
          video.playbackRate = 16.0;
          video.muted = true;
          if (video.duration && isFinite(video.duration)) {
            video.currentTime = video.duration;
          }
        }

        if (skipBtn && typeof skipBtn.click === 'function') {
          skipBtn.click();
          reportTelemetry('trapsNeutralized', 1);
        }
      } catch (_) {}
    }

    setInterval(speedupYouTubeAds, 500);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 7: Feature E — Twitch & Streaming Media Ad Shield
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('twitch.tv')) return;

    function sweepTwitchAds() {
      try {
        if (!bsOn('twitchShieldEnabled')) return;

        const adNotice = document.querySelector('.player-ad-notice, [data-test-selector="ad-banner"], [data-a-target="video-ad-label"]');
        const video = document.querySelector('video');
        if (adNotice && video) {
          video.muted = true;
          video.playbackRate = 16.0;
        }
      } catch (_) {}
    }

    setInterval(sweepTwitchAds, 1000);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 8: Universal Right-Click & Copy-Paste Enabler (Non-Destructive for SPAs)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      window.addEventListener('contextmenu', (e) => {
        if (!isCaptchaHost && bsOn('rightClickEnabled') && e) {
          e.stopImmediatePropagation ? e.stopImmediatePropagation() : null;
        }
      }, false);

      const enableSelectionStyle = () => {
        try {
          if (document.body && !host.includes('reddit.com')) {
            document.body.style.setProperty('user-select', 'auto', 'important');
            document.body.style.setProperty('-webkit-user-select', 'auto', 'important');
          }
        } catch (_) {}
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enableSelectionStyle);
      } else {
        enableSelectionStyle();
      }
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 9: Clean URL & Tracking Query Stripper (SPA Safe)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const TRACKING_PARAMS = (typeof BS_TRACKING_PARAMS !== 'undefined')
        ? BS_TRACKING_PARAMS
        : [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
          'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid',
          'mc_eid', 'igshid', 'ref_src', 'yclid', 'msclkid'
        ];

      function cleanUrlString(rawUrl) {
        try {
          if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.includes('?')) return rawUrl;
          const u = new URL(rawUrl, window.location.href);
          let modified = false;
          for (const p of TRACKING_PARAMS) {
            if (u.searchParams.has(p)) {
              u.searchParams.delete(p);
              modified = true;
            }
          }
          return modified ? u.toString() : rawUrl;
        } catch (_) {
          return rawUrl;
        }
      }

      // Defer the one-time address-bar cleanup until real config has arrived,
      // so a disabled/whitelisted site never gets rewritten.
      bsOnConfigReady(() => {
        try {
          if (!bsOn('cleanUrlEnabled')) return;
          if (!host.includes('reddit.com') && !host.includes('youtube.com') && !host.includes('twitter.com') && !host.endsWith('x.com')) {
            const cleanedCurrent = cleanUrlString(window.location.href);
            if (cleanedCurrent !== window.location.href && window.history && window.history.replaceState) {
              window.history.replaceState(null, '', cleanedCurrent);
            }
          }
        } catch (_) {}
      });

      document.addEventListener('mousedown', (e) => {
        try {
          if (!bsOn('cleanUrlEnabled')) return;
          const a = e.target && e.target.closest ? e.target.closest('a') : null;
          if (a && a.href && a.href.includes('?') && a.hostname && a.hostname !== window.location.hostname) {
            const clean = cleanUrlString(a.href);
            if (clean !== a.href) a.href = clean;
          }
        } catch (_) {}
      }, true);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 10: Universal HTML5 Video Speed Controller ([ / ] hotkeys)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      let speedHud = null;
      let hudFadeTimer = null;

      function showSpeedPill(speed) {
        try {
          if (!speedHud) {
            speedHud = document.createElement('div');
            speedHud.id = 'bs-video-speed-hud';
            speedHud.style.cssText = `
              position: fixed;
              top: 24px;
              right: 24px;
              z-index: 2147483647;
              background: rgba(13, 17, 23, 0.88);
              border: 1px solid rgba(0, 240, 118, 0.4);
              color: #00f076;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 14px;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 20px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 240, 118, 0.25);
              backdrop-filter: blur(12px);
              transition: opacity 0.25s ease, transform 0.25s ease;
              pointer-events: none;
            `;
            document.body.appendChild(speedHud);
          }

          speedHud.textContent = `⚡ Playback Speed: ${speed.toFixed(2)}x`;
          speedHud.style.opacity = '1';
          speedHud.style.transform = 'translateY(0) scale(1)';

          if (hudFadeTimer) clearTimeout(hudFadeTimer);
          hudFadeTimer = setTimeout(() => {
            if (speedHud) {
              speedHud.style.opacity = '0';
              speedHud.style.transform = 'translateY(-8px) scale(0.95)';
            }
          }, 1500);
        } catch (_) {}
      }

      window.addEventListener('keydown', (e) => {
        try {
          if (!bsOn('videoSpeedEnabled')) return;
          if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
          const videos = document.querySelectorAll('video');
          if (!videos || videos.length === 0) return;

          if (e.key === ']') {
            e.preventDefault();
            videos.forEach(v => {
              v.playbackRate = Math.min(16.0, Math.round((v.playbackRate + 0.25) * 100) / 100);
              showSpeedPill(v.playbackRate);
            });
          } else if (e.key === '[') {
            e.preventDefault();
            videos.forEach(v => {
              v.playbackRate = Math.max(0.25, Math.round((v.playbackRate - 0.25) * 100) / 100);
              showSpeedPill(v.playbackRate);
            });
          } else if (e.key === '\\') {
            e.preventDefault();
            videos.forEach(v => {
              v.playbackRate = 1.0;
              showSpeedPill(1.0);
            });
          }
        } catch (_) {}
      }, true);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 11: Auto-Skip Video Intros & Next Episode
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const SKIP_SELECTORS = [
        '.watch-video--skip-content-button', '.skip-credits', '[data-uia="player-skip-intro"]',
        '.atvwebplayersdk-skipelement-button', '.fq92fcf', '.skip-button',
        '.vjs-overlay-skip-intro', '.skip-intro-button', '.skip-recap',
        '.next-episode-button', '[data-uia="next-episode-seamless-button"]'
      ];

      function autoSkipIntros() {
        try {
          if (!bsOn('autoSkipIntrosEnabled')) return;
          for (const sel of SKIP_SELECTORS) {
            const btn = document.querySelector(sel);
            if (btn && !btn._bsAutoSkipped && typeof btn.click === 'function') {
              btn._bsAutoSkipped = true;
              btn.click();
              reportTelemetry('trapsNeutralized', 1);
            }
          }
        } catch (_) {}
      }

      setInterval(autoSkipIntros, 1000);
    } catch (_) {}
  })();

  console.log('[BraveShield Bypass Pro] Stealth Engine Armed. Live config bridge active.');
})();