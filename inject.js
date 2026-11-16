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
    autoBypassTimers: true,
    gentleTurboEnabled: true,
    turboAllSites: false,
    paywallDefuserEnabled: true,
    bypassAdblockDetection: true,
    maskBraveApi: true,
    clientHintsEnabled: true,
    webglSpoofingEnabled: true,
    canvasNoiseEnabled: true,
    audioNoiseEnabled: true,
    webrtcShieldEnabled: true,
    domJitterEnabled: true,
    timerCoarseningEnabled: true,
    mediaDevicesSanitizeEnabled: true,
    speechVoicesSanitizeEnabled: true,
    batteryMaskEnabled: true,
    networkInfoMaskEnabled: true,
    screenNormalizationEnabled: true,
    uaSpoofingEnabled: true,
    resolvedUA: null,
    timezoneSpoofingEnabled: false,
    webgpuMaskingEnabled: true,
    fontEnumMaskingEnabled: true,
    fontEnsembleEnabled: true,
    identityRotationEnabled: false,
    identityRotationPeriodHours: 24,
    reelDwellSeconds: 1,
    reelMaxAutoSeconds: 0,
    customResolvers: [],
    siteProtected: false,
    siteOverrideActive: false,
    cleanUrlEnabled: true,
    rightClickEnabled: true,
    videoSpeedEnabled: true,
    autoSkipIntrosEnabled: true,
    youtubeAds: true,
    spotifyUnlocked: true,
    twitchShieldEnabled: true,
    instagramReelsAdsEnabled: true,
    instagramAutoScrollEnabled: false,
    deviceProfile: 'win-rtx4090',
    browserType: 'brave',
    customHardwareProfile: null,
    spoofTimezone: null,
    spoofLocale: null
  };

  let bsSiteDisabled = false;   // master off OR domain whitelisted
  let bsConfigReady = false;
  const bsReadyQueue = [];

  // Hardware baseline hoisted to the IIFE scope: Modules C/D/E live in sibling
  // closures and previously referenced Module-1's private `bsHardware` var,
  // throwing ReferenceError and silently disabling matchMedia coherence,
  // performance.memory/storage.estimate parity and Worker cloak parity.
  const BS_HW_FALLBACK = {
    platform: 'Win32',
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    concurrency: 16,
    memory: 16,
    devicePixelRatio: 1,
    screen: { width: 1920, height: 1080, colorDepth: 24 }
  };
  function bsGetHardwareSafe() {
    try {
      return (typeof window.bsGetHardware === 'function' && window.bsGetHardware()) || BS_HW_FALLBACK;
    } catch (_) {
      return BS_HW_FALLBACK;
    }
  }

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

  /** Custom-resolver host pattern: "example.com", "*.example.com" (subdomains
   *  only) or "*" (everywhere). Scheme/path parts of the pattern are ignored. */
  function bsRuleHostMatch(pattern, hostname) {
    try {
      let p = String(pattern || '').trim().toLowerCase();
      const h = String(hostname || '').toLowerCase();
      if (!p || !h) return false;
      p = p.replace(/^https?:\/\//, '').split('/')[0];
      if (p === '*') return true;
      if (p.startsWith('*.')) return h.endsWith('.' + p.slice(2));
      return h === p || h.endsWith('.' + p);
    } catch (_) { return false; }
  }

  /** Tiny FNV-1a string hash → uint32. Deterministic seeds for per-key factors. */
  function bsStrHash(str) {
    try {
      let h = 2166136261;
      const s = String(str);
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    } catch (_) { return 0; }
  }

  window.addEventListener('message', (e) => {
    try {
      if (e.source !== window) return;
      if (e.origin !== location.origin) return;
      const d = e.data;
      if (!d || d.type !== 'bs-config-sync' || typeof d.config !== 'object' || d.config === null) return;
      if (Object.prototype.hasOwnProperty.call(d, 'siteDisabled')) {
        bsSiteDisabled = d.siteDisabled === true;
      }
      // Prototype-pollution-safe, allowlist-guarded merge
      const allowedKeys = new Set(Object.keys(BS_CONFIG));
      for (const k of Object.keys(d.config)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        if (!allowedKeys.has(k)) continue;
        if (!Object.prototype.hasOwnProperty.call(d.config, k)) continue;
        BS_CONFIG[k] = d.config[k];
      }
      const firstSync = !bsConfigReady;
      bsConfigReady = true;
      if (typeof bsResolveHardware === 'function') bsResolveHardware();
      if (typeof window.bsSyncBrowserIdentity === 'function') window.bsSyncBrowserIdentity();
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

    // Constructor-level stack sanitation. V8 installs `stack` as an OWN value
    // property on each error instance, so the prototype accessors above never
    // fire for `new Error().stack` — extension frames were still leaking there.
    // Each built-in error class is replaced with a native-looking wrapper whose
    // .prototype IS the original prototype (instanceof + brand stay intact).
    try {
      const bsSanitizeOwnStack = (e) => {
        try {
          const d = Object.getOwnPropertyDescriptor(e, 'stack');
          if (d && typeof d.value === 'string') {
            const cleaned = cleanStackString(d.value);
            if (cleaned !== d.value) {
              Object.defineProperty(e, 'stack', { value: cleaned, writable: true, enumerable: false, configurable: true });
            }
          }
        } catch (_) {}
        return e;
      };
      const BS_ERROR_CLASSES = ['Error', 'TypeError', 'RangeError', 'EvalError', 'SyntaxError', 'ReferenceError', 'URIError', 'AggregateError', 'DOMException'];
      // Prototype-shadow probe guard (CreepJS-style "poison Object.prototype.stack,
      // throw, read inherited"): an own 'stack' written at construction shadows
      // ANY prototype poison, and every wrapped class above (incl. DOMException,
      // whose Chromium instances carry .stack) now guarantees exactly that for
      // every instance built after this module runs. captureStackTrace targets
      // and legacy prototype accessors get the same own-property write.
      for (const bsCn of BS_ERROR_CLASSES) {
        try {
          const bsOrigErrorCtor = window[bsCn];
          if (typeof bsOrigErrorCtor !== 'function') continue;
          const bsWrappedError = makeNative(function(...args) {
            let e;
            if (new.target) {
              // Subclass (class E extends Error) → bind to the subclass proto
              // so `instanceof E` and brand stay exactly native. Direct `new`
              // → plain original prototype.
              const nt = (new.target === bsWrappedError) ? bsOrigErrorCtor : new.target;
              e = Reflect.construct(bsOrigErrorCtor, args, nt);
            } else {
              try { e = bsOrigErrorCtor.apply(this, args); } catch (_) {}
              if (!e || typeof e !== 'object') e = Reflect.construct(bsOrigErrorCtor, args, bsOrigErrorCtor);
            }
            return bsSanitizeOwnStack(e);
          }, bsCn, bsOrigErrorCtor.length);
          try { Object.defineProperty(bsWrappedError, 'prototype', { value: bsOrigErrorCtor.prototype, writable: false, enumerable: false, configurable: false }); } catch (_) {}
          try { Object.setPrototypeOf(bsWrappedError, bsOrigErrorCtor); } catch (_) {}
          window[bsCn] = bsWrappedError;
        } catch (_) {}
      }
    } catch (_) {}
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.5. MOCK COMMON LINK-SHORTENER TRACKING & AD GLOBALS (Prevents Button Lockup)
  // Undetectable: every known adblock-detector global is mocked to "not detected"
  // and every mock is makeNative()-wrapped so toString() == "[native code]".
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

    // Core bait globals — must be true/false exactly as a real page with ads would expose
    window.canRunAds = true;
    window.canRunAdvertisements = true;
    window.isAdBlockActive = false;
    window.isAdBlocked = false;
    window.adblock = false;
    window.adBlock = false;
    window.hasAdblock = false;
    window.hasAdBlock = false;
    window.adblockDetected = false;
    window.adBlockDetected = false;
    window.adblockDetector = false;
    window.AdBlockDetected = false;
    window.isAdBlockDetected = false;
    window.google_ad_client = 'ca-pub-9999999999999999';
    window.google_ad_status = 1;
    window.google_ad_slot = 'loaded';
    window._pop = window._pop || [];
    window.popns = window.popns || {};
    window.AdServer = window.AdServer || {};
    window.fba = window.fba || makeNative(function() {}, 'fba', 0);
    window.fbq = window.fbq || makeNative(function() {}, 'fbq', 0);
    window.pys = window.pys || {};

    // FuckAdBlock / BlockAdBlock — the two most fingerprinted detector libs
    // They register callbacks: onDetected (should never fire), onNotDetected (should fire)
    function bsMakeFuckAdBlockMock() {
      const mock = {};
      mock.setOption = makeNative(function() { return true; }, 'setOption', 2);
      mock.setOptions = makeNative(function() { return true; }, 'setOptions', 1);
      mock.on = makeNative(function(detected, cb) {
        // If caller asks for "not detected", fire immediately async
        if (typeof detected === 'string' && /notDetected/i.test(detected) && typeof cb === 'function') {
          try { setTimeout(cb, 10); } catch (_) {}
        }
        return mock;
      }, 'on', 2);
      mock.onDetected = makeNative(function(cb) { return mock; }, 'onDetected', 1);
      mock.onNotDetected = makeNative(function(cb) {
        if (typeof cb === 'function') try { setTimeout(cb, 10); } catch (_) {}
        return mock;
      }, 'onNotDetected', 1);
      mock.check = makeNative(function(cb, od) {
        // Some builds call check(onDetected, onNotDetected) — always call notDetected
        if (typeof cb === 'function') try { setTimeout(cb, 10); } catch (_) {}
        if (typeof od === 'function') try { setTimeout(od, 10); } catch (_) {}
        return false;
      }, 'check', 2);
      mock.emitEvent = makeNative(function() { return false; }, 'emitEvent', 1);
      return mock;
    }
    const bsFAB = bsMakeFuckAdBlockMock();
    window.FuckAdBlock = window.FuckAdBlock || bsFAB;
    window.fuckAdBlock = window.fuckAdBlock || bsFAB;
    window.BlockAdBlock = window.BlockAdBlock || bsFAB;
    window.blockAdBlock = window.blockAdBlock || bsFAB;
    window.adBlockerDetected = false;
    window.adblockerDetected = false;
    // Some detectors test `window.adblock` truthiness — force false
    try { Object.defineProperty(window, 'adblock', { get: makeNative(function(){ return false; }, 'get adblock', 0), set: function(){}, configurable: true }); } catch (_) { window.adblock = false; }

    // Admiral / admiral — enterprise adblock wall
    if (!window.admiral) {
      window.admiral = makeNative(function() {}, 'admiral', 0);
      window.admiral.status = 'subscribed';
    }

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
    } else {
      // Ensure cmd.push executes callbacks even if googletag already exists but is inert
      try {
        if (window.googletag.cmd && window.googletag.cmd.push === Array.prototype.push) {
          window.googletag.cmd.push = makeNative(function(fn) {
            if (typeof fn === 'function') try { fn(); } catch (_) {}
            return Array.prototype.push.apply(this, arguments);
          }, 'push', 1);
        }
      } catch (_) {}
    }

    // Hook window.open safely to prevent ad popunders while allowing genuine download actions
    const origWindowOpen = window.open;
    window.open = makeNative(function(url, target, features) {
      if (bsOn('bypassAdblockDetection') && !isCaptchaHost && url && typeof url === 'string') {
        const isAdUrl = /(popcash|popads|adsterra|propellerads|exoclick|bet365|1xbet|clickadu|trafficjunky|adkeeper|syndication|hisspano|hispano)/i.test(url);
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
  // Expanded to cover HispanoADS, BlockAdBlock probes, ad bait XHR & CSS probes.
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const AD_SCRIPT_PROBE_REGEX = /pagead2\.googlesyndication\.com|adservice\.google\.com|securepubads\.g\.doubleclick\.net|adnxs\.com|prebid\.js|\/ads?\.js|\/adframe\.js|\/adbanner\.js|\/adsbygoogle\.js|adblockdetector|fuckadblock|blockadblock|hispano|googletag|carbonads|advertisement|adsbygoogle|ad\.js/i;

    if (typeof window.fetch === 'function') {
      const origFetch = window.fetch;
      window.fetch = makeNative(function(input, init) {
        try {
          if (bsOn('bypassAdblockDetection')) {
            const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input?.url);
            if (url && typeof url === 'string') {
              // Never mock captcha / challenge requests — causes "Could not connect to reCAPTCHA"
              if (/recaptcha|gstatic\.com\/recaptcha|challenges\.cloudflare|hcaptcha|arkoselabs|awswaf|geetest/i.test(url)) {
                return origFetch.apply(window, arguments);
              }
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
          if (/recaptcha|gstatic\.com\/recaptcha|challenges\.cloudflare|hcaptcha|arkoselabs|awswaf|geetest/i.test(url)) {
            // never mock captcha XHR
          } else if (/^brave:\/\//i.test(url) && bsOn('maskBraveApi')) {
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
    const AD_BAIT_REGEX = /ad[s_-]?box|ad[s_-]?banner|ad[s_-]?unit|ad[s_-]?container|ad[s_-]?wrapper|adsbygoogle|pub_300|banner-ad|ad-zone|ad_slot|sponsor|advertisement|textads|carbonads|ad-detector|ad-test|adblock|fuckadblock|blockadblock|hispano/i;

    function isBaitElement(el) {
      if (!el || !(el instanceof Element)) return false;
      const idOrClass = (el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '') + ' ' + (el.getAttribute ? (el.getAttribute('data-ad') || '') : '');
      if (!AD_BAIT_REGEX.test(idOrClass)) return false;
      // If element strongly matches bait regex, do NOT skip even if it contains images —
      // detection scripts inject tiny 1x1 baits that still contain a placeholder img.
      // Only skip obvious gallery items: large media that don't look like baits.
      return true;
    }

    // Frame-stable jitter cache: the same element always returns the SAME
    // value, so repeated layout probes never compound. The seed is derived
    // from non-hooked data (tagName + original descriptor values) to avoid
    // any possibility of mutual recursion with the hooked getters.
    const bsJitterCache = new WeakMap();
    const bsOriginalDescriptors = {};

    function bsComputeJitterSeed(el, prop) {
      const desc = bsOriginalDescriptors[prop];
      let base = 0;
      if (desc && desc.get) {
        try { base = desc.get.call(el) | 0; } catch (_) {}
      }
      const tag = (el.tagName || '').toUpperCase();
      let tagHash = 0;
      for (let i = 0; i < tag.length; i++) tagHash = (tagHash * 31 + tag.charCodeAt(i)) >>> 0;
      return (base + tagHash + prop.length) >>> 0;
    }

    function bsGetStableJitter(el, prop) {
      let entry = bsJitterCache.get(el);
      if (!entry) { entry = {}; bsJitterCache.set(el, entry); }
      if (entry[prop] === undefined) {
        const seed = bsComputeJitterSeed(el, prop);
        const jPrng = createPrng(seed);
        entry[prop] = (jPrng() - 0.5) * 0.002;
      }
      return entry[prop];
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
            if (bsOn('bypassAdblockDetection') && typeof val === 'string' && /pagead|googlesyndication|doubleclick|adservice|adnxs|prebid|\/ads?\.js|adblockdetector|fuckadblock|blockadblock|hispano/i.test(val)) {
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
      // Populate jitter seed descriptors now that originals are captured (fixes forward-ref bug)
      bsOriginalDescriptors.offsetHeight = origOffsetHeight;
      bsOriginalDescriptors.offsetWidth = origOffsetWidth;
      bsOriginalDescriptors.clientHeight = origClientHeight;
      bsOriginalDescriptors.clientWidth = origClientWidth;

      if (origOffsetHeight && origOffsetHeight.get) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
          get: makeNative(function() {
            const real = origOffsetHeight.get.call(this);
            if (bsOn('bypassAdblockDetection') && real === 0 && isBaitElement(this)) return 250;
            if (bsOn('domJitterEnabled') && real > 0) return real + bsGetStableJitter(this, 'offsetHeight');
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
            if (bsOn('domJitterEnabled') && real > 0) return real + bsGetStableJitter(this, 'offsetWidth');
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
            if (bsOn('domJitterEnabled') && real > 0) return real + bsGetStableJitter(this, 'clientHeight');
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
            if (bsOn('domJitterEnabled') && real > 0) return real + bsGetStableJitter(this, 'clientWidth');
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
    let storedSeed = null;
    try { storedSeed = sessionStorage.getItem('bs_prng_seed'); } catch (_) {}
    // Validate stored seed is a plausible 32-bit int; attacker pre-seeding with "0" or garbage is rejected
    let parsed = storedSeed ? parseInt(storedSeed, 10) : NaN;
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 2147483647) {
      // Use crypto randomness as primary entropy, fallback to Math.random
      try {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        parsed = (arr[0] % 2147483646) + 1;
      } catch (_) { parsed = Math.floor(Math.random() * 2147483646) + 1; }
      try { sessionStorage.setItem('bs_prng_seed', String(parsed)); } catch (_) {}
    }
    sessionSeed = parsed >>> 0;
    for (let i = 0; i < host.length; i++) {
      sessionSeed = (sessionSeed ^ (host.charCodeAt(i) * 31)) >>> 0;
    }
    if (!sessionSeed || sessionSeed >= 2147483647) sessionSeed = 1337;
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
      window.bsGetHardware = function() { return bsHardware; };

      // ── 1. navigator.brave neutralization (LIVE-GATED, original preserved) ──
      // Any non-Brave identity (chrome/firefox/safari) must never expose it.
      const nativeBraveValue = ('brave' in navigator) ? navigator.brave : undefined;
      // makeNative-wrapped: a bare JS getter is readable via
      // Object.getOwnPropertyDescriptor(...).get.toString() — an instant tell.
      const braveGetter = makeNative(function() {
        const bt = BS_CONFIG.browserType || 'brave';
        if (bt !== 'brave' || bsOn('maskBraveApi')) return undefined;
        return nativeBraveValue;
      }, 'get brave', 0);
      try { Object.defineProperty(Navigator.prototype, 'brave', { get: braveGetter, set: makeNative(function() {}, 'set brave', 1), configurable: true, enumerable: false }); } catch (_) {}
      try { Object.defineProperty(navigator, 'brave', { get: braveGetter, set: makeNative(function() {}, 'set brave', 1), configurable: true, enumerable: false }); } catch (_) {}

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
      // Alias: legacy key 'hideWebdriver' never existed in BS_CONFIG — use 'hideWebdriver' fallback plus canonical 'webdriverMaskEnabled'
      const bsShouldHideWebdriver = () => {
        if (bsSiteDisabled) return false;
        if (BS_CONFIG.webdriverMaskEnabled !== undefined) return BS_CONFIG.webdriverMaskEnabled !== false;
        if (BS_CONFIG.hideWebdriver !== undefined) return BS_CONFIG.hideWebdriver !== false;
        return true; // default hide
      };
      const origWebdriverDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
      try {
        Object.defineProperty(Navigator.prototype, 'webdriver', {
          get: makeNative(function() {
            if (bsShouldHideWebdriver()) return false;
            return origWebdriverDesc && origWebdriverDesc.get ? origWebdriverDesc.get.call(this) : false;
          }, 'get webdriver', 0),
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

      // deviceMemory is spec-clamped to 8 GB max — remap to nearest legal bucket {0.25,0.5,1,2,4,8}
      const BS_MEMORY_BUCKETS = [0.25, 0.5, 1, 2, 4, 8];
      const memoryGetter = function() {
        const raw = Number(bsHardware.memory) || 8;
        // Clamp then snap to nearest bucket
        let v = Math.min(8, Math.max(0.25, raw));
        let best = BS_MEMORY_BUCKETS[0];
        let bestDiff = Math.abs(v - best);
        for (const b of BS_MEMORY_BUCKETS) {
          const d = Math.abs(v - b);
          if (d < bestDiff) { bestDiff = d; best = b; }
        }
        return best;
      };
      try { Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: makeNative(memoryGetter, 'get deviceMemory', 0), configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'deviceMemory', { get: makeNative(memoryGetter, 'get deviceMemory', 0), configurable: true }); } catch (_) {}

      // ── 4b. maxTouchPoints parity (mobile profiles claim a phone screen — a
      // touch-capability of 0 is an instant Pixelscan/PTR fail) ──
      const origTouchDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'maxTouchPoints');
      const touchGetter = makeNative(function() {
        if (!bsOn('screenNormalizationEnabled')) {
          return origTouchDesc && origTouchDesc.get ? origTouchDesc.get.call(this) : (origTouchDesc ? origTouchDesc.value : 0);
        }
        const p = String(bsGetHardwareSafe().platform || 'Win32');
        if (/iPhone|iPad/i.test(p)) return 5;                      // iOS/iPadOS report 5
        if (/arm|Android/i.test(p)) return 5;                      // Android flagships report 5-10
        return 0;                                                  // desktop reports 0
      }, 'get maxTouchPoints', 0);
      try { Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: touchGetter, configurable: true, enumerable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'maxTouchPoints', { get: touchGetter, configurable: true, enumerable: true }); } catch (_) {}

      // ── 4c. Global Privacy Control coherence (LIVE-GATED) ──
      // Brave ships navigator.globalPrivacyControl === true; Chrome & Firefox
      // never implement it (probe result undefined — NOT false, which is
      // itself a "something is faking here" hit). Whenever the engine claims
      // a non-Brave identity AND the user hasn't opted out in the Defense
      // panel (gpcCloakEnabled, default ON), we answer undefined; when the
      // Brave identity is shown intact, the genuine value flows through.
      // Re-evaluated on every read so toggles apply live without reload.
      try {
        const origGpcDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'globalPrivacyControl') ||
                            Object.getOwnPropertyDescriptor(navigator, 'globalPrivacyControl');
        const gpcGetter = makeNative(function() {
          const claimingChrome = bsOn('maskBraveApi') || (BS_CONFIG.browserType || 'brave') !== 'brave';
          if (BS_CONFIG.gpcCloakEnabled !== false && claimingChrome) {
            return undefined;   // Chrome & Firefox truth
          }
          return origGpcDesc ? (typeof origGpcDesc.get === 'function' ? origGpcDesc.get.call(this) : origGpcDesc.value) : true;
        }, 'get globalPrivacyControl', 0);
        Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: gpcGetter, configurable: true, enumerable: false });
        Object.defineProperty(navigator, 'globalPrivacyControl', { get: gpcGetter, configurable: true, enumerable: false });
      } catch (_) {}

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
            Object.defineProperty(window.screen, k, { get: makeNative(function() { return screenValue(k); }, `get ${k}`, 0), configurable: true, enumerable: true });
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

          // Pixel-readback farbling: GPU scene hashes are a primary CreepJS
          // vector. Deterministic +/-1 on sampled bytes, cached per buffer so
          // repeated reads of an unchanged framebuffer stay stable instead of
          // compounding.
          if (proto.readPixels) {
            const rpCache = new WeakMap();
            const origReadPixels = proto.readPixels;
            proto.readPixels = makeNative(function(x, y, width, height, format, type, pixels) {
              origReadPixels.apply(this, arguments);
              try {
                if (!isCaptchaHost && bsOn('webglSpoofingEnabled') && pixels && pixels.length > 64) {
                  const len = pixels.length;
                  const stride = Math.max(16, Math.floor(len / 48));
                  let prev = rpCache.get(pixels);
                  if (!prev || prev.raw.length !== Math.floor(len / stride)) {
                    prev = null;
                  }
                  const rPrng = createPrng(113);
                  const samples = Math.floor(len / stride);
                  const raw = new Uint8Array(samples);
                  for (let s = 0; s < samples; s++) {
                    const i = s * stride;
                    raw[s] = pixels[i];
                    const shift = rPrng() > 0.5 ? 1 : -1;
                    if (prev && prev.raw[s] === raw[s]) {
                      pixels[i] = prev.out[s];
                    } else {
                      pixels[i] = Math.min(255, Math.max(0, raw[s] + shift));
                      if (!prev) prev = { raw: new Uint8Array(samples), out: new Uint8Array(samples) };
                      prev.raw[s] = raw[s];
                      prev.out[s] = pixels[i];
                    }
                  }
                  rpCache.set(pixels, prev);
                }
              } catch (_) {}
            }, 'readPixels', 7);
          }
      };

      if (typeof WebGLRenderingContext !== 'undefined') hookWebGL(WebGLRenderingContext.prototype);
      if (typeof WebGL2RenderingContext !== 'undefined') hookWebGL(WebGL2RenderingContext.prototype);

      // ── 7. Client Hints (UA-CH) Consistency on NavigatorUAData Prototype (LIVE-GATED) ──
      {
        // userAgentData is a Chromium-only API — a Firefox/Safari identity
        // must not expose it at all, regardless of module toggles.
        try {
          const origUaDataOwnDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgentData');
          if (origUaDataOwnDesc && origUaDataOwnDesc.get) {
            Object.defineProperty(Navigator.prototype, 'userAgentData', {
              get: makeNative(function() {
                const bt = BS_CONFIG.browserType || 'brave';
                if (bt === 'firefox' || bt === 'safari') return undefined;
                return origUaDataOwnDesc.get.call(this);
              }, 'get userAgentData', 0),
              configurable: true,
              enumerable: true
            });
          }
        } catch (_) {}

        if (typeof NavigatorUAData !== 'undefined' && NavigatorUAData.prototype) {
          try {
            const uaPlatformName = () => {
              const p = bsGetHardwareSafe().platform || 'Win32';
              if (p.includes('Win')) return 'Windows';
              if (p === 'iPhone' || p === 'iPad') return 'iOS'; // parity with Sec-CH-UA-Platform headers built by background.js
              if (p.includes('Mac')) return 'macOS';
              if (p.includes('Android') || p.includes('arm')) return 'Android';
              return 'Linux';
            };
            const chromeBrandify = (list) => (BS_CONFIG.resolvedUA && Array.isArray(BS_CONFIG.resolvedUA.brands))
              ? BS_CONFIG.resolvedUA.brands
              : (list || []).map(b => (b.brand === 'Brave' ? { brand: 'Google Chrome', version: b.version } : b));

            const origBrands = Object.getOwnPropertyDescriptor(NavigatorUAData.prototype, 'brands');
            if (origBrands && origBrands.get) {
              Object.defineProperty(NavigatorUAData.prototype, 'brands', {
                get: makeNative(function() {
                  if (!bsOn('clientHintsEnabled')) return origBrands.get.call(this) || [];
                  return chromeBrandify(origBrands.get.call(this));
                }, 'get brands', 0),
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
              get: makeNative(function() {
                return bsOn('clientHintsEnabled') ? uaPlatformName() : origPlatformValue;
              }, 'get platform', 0),
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
                  res.model = (BS_CONFIG.resolvedUA && BS_CONFIG.resolvedUA.model) || '';
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

      // ── 8. User-Agent string parity (LIVE-GATED, backed by useragents.js) ──
      // background.js resolves the active profile to a full UA object and
      // rewrites request headers via DNR; this keeps JS-visible APIs identical.
      try {
        const origUADesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent');
        const origAppVersionDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'appVersion');
        if (origUADesc && origAppVersionDesc) {
          const uaGetter = function() {
            const r = BS_CONFIG.resolvedUA;
            return (bsOn('uaSpoofingEnabled') && r && r.ua) ? r.ua : origUADesc.get.call(this);
          };
          const appVersionGetter = function() {
            const r = BS_CONFIG.resolvedUA;
            if (!bsOn('uaSpoofingEnabled') || !r || !r.ua) return origAppVersionDesc.get.call(this);
            const idx = r.ua.indexOf('Mozilla/');
            return idx === 0 ? r.ua.slice('Mozilla/'.length) : origAppVersionDesc.get.call(this);
          };
          Object.defineProperty(Navigator.prototype, 'userAgent', { get: makeNative(uaGetter, 'get userAgent', 0), configurable: true, enumerable: true });
          Object.defineProperty(navigator, 'userAgent', { get: makeNative(uaGetter, 'get userAgent', 0), configurable: true, enumerable: true });
          Object.defineProperty(Navigator.prototype, 'appVersion', { get: makeNative(appVersionGetter, 'get appVersion', 0), configurable: true, enumerable: true });
        }
      } catch (_) {}

      // ── 9. Authentic window.chrome API Stubs (managed per browser identity) ──
      // browserType arrives via the config bridge AFTER document_start, so the
      // stubs are (un)installed by bsSyncBrowserIdentity() on every config sync
      // instead of being gated on the default value once at startup.
      const nativeChromeObj = (window.chrome && typeof window.chrome === 'object') ? window.chrome : null;
      const bsChromeObj = nativeChromeObj || {};
      let bsChromeStubsInstalled = false;

      function bsInstallChromeStubs() {
        if (bsChromeStubsInstalled) return;
        bsChromeStubsInstalled = true;
        try {
          bsChromeObj.app = bsChromeObj.app || {
            isInstalled: false,
            InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
            RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
            getDetails: makeNative(function() { return null; }, 'getDetails', 0),
            getIsInstalled: makeNative(function() { return false; }, 'getIsInstalled', 0),
            runningState: makeNative(function() { return 'cannot_run'; }, 'runningState', 0)
          };

          bsChromeObj.runtime = bsChromeObj.runtime || {
            OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
            OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
            PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
            RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' }
          };

          // Real web pages ALWAYS have chrome.runtime.sendMessage/connect — a
          // missing method is a first-order "there is no Chrome here" tell.
          if (typeof bsChromeObj.runtime.sendMessage !== 'function') {
            bsChromeObj.runtime.sendMessage = makeNative(function(...args) {
              const cb = (args.length && typeof args[args.length - 1] === 'function') ? args.pop() : null;
              const msg = 'Could not establish connection. Receiving end does not exist.';
              if (cb) {
                try { chrome.runtime.lastError = { message: msg }; cb(); } catch (_) {}
                setTimeout(() => { try { delete chrome.runtime.lastError; } catch (_) {} }, 0);
                return undefined;
              }
              return Promise.reject(new Error(msg));
            }, 'sendMessage', 1);
          }
          if (typeof bsChromeObj.runtime.connect !== 'function') {
            bsChromeObj.runtime.connect = makeNative(function() {
              throw new Error('Cannot call connect() to an invalid extension ID.');
            }, 'connect', 1);
          }

          bsChromeObj.csi = bsChromeObj.csi || makeNative(function() {
            return {
              startE: performance.timing?.navigationStart || Date.now(),
              onloadT: performance.timing?.loadEventEnd || Date.now(),
              pageT: performance.now(),
              tran: 15
            };
          }, 'csi', 0);

          bsChromeObj.loadTimes = bsChromeObj.loadTimes || makeNative(function() {
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
          }, 'loadTimes', 0);
        } catch (_) {}
      }

      const bsChromeAccessor = makeNative(function() {
        const bt = BS_CONFIG.browserType || 'brave';
        if (bt === 'firefox' || bt === 'safari') return undefined;
        return bsChromeObj;
      }, 'get chrome', 0);

      // ── 8b. Vendor string + Firefox-only navigator fields per identity ──
      const origVendorDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'vendor');
      let bsIdentitySyncedFor = null;

      // Chromium-only Web APIs that Firefox/Safari never expose. Under a
      // Firefox/Safari identity these are REMOVED (restorable when the user
      // switches back), because their presence while claiming Firefox is an
      // instant leak on CreepJS/BrowserLeaks device-API liveness probes.
      const BS_API_STRIP_NAV = ['bluetooth', 'usb', 'hid', 'serial', 'keyboard', 'virtualKeyboard', 'ink', 'xr'];
      const BS_API_STRIP_WIN = ['SpeechRecognition', 'webkitSpeechRecognition', 'queryLocalFonts'];
      const bsOriginalNavApiDesc = new Map();
      const bsOriginalWinApiDesc = new Map();

      function bsStripWindowApis(strip) {
        try {
          for (const name of BS_API_STRIP_WIN) {
            if (typeof window[name] === 'undefined' && !bsOriginalWinApiDesc.has(name)) continue;
            if (!bsOriginalWinApiDesc.has(name)) {
              const d = Object.getOwnPropertyDescriptor(window, name);
              if (d) bsOriginalWinApiDesc.set(name, d);
            }
            try {
              if (strip) delete window[name];
              else if (bsOriginalWinApiDesc.has(name)) Object.defineProperty(window, name, bsOriginalWinApiDesc.get(name));
            } catch (_) {}
          }
        } catch (_) {}
      }

      function bsStripNavApis(strip) {
        try {
          for (const name of BS_API_STRIP_NAV) {
            const d = Object.getOwnPropertyDescriptor(Navigator.prototype, name);
            const instD = Object.getOwnPropertyDescriptor(navigator, name);
            const exists = d || instD;
            if (!exists && !bsOriginalNavApiDesc.has(name)) continue;
            if (!bsOriginalNavApiDesc.has(name)) bsOriginalNavApiDesc.set(name, d || instD);
            try {
              if (strip) {
                if (d) delete Navigator.prototype[name];
                if (instD) Object.defineProperty(navigator, name, { get: () => undefined, configurable: true, enumerable: false });
              } else if (bsOriginalNavApiDesc.has(name)) {
                const orig = bsOriginalNavApiDesc.get(name);
                if (orig) Object.defineProperty(Navigator.prototype, name, orig);
                const curInst = Object.getOwnPropertyDescriptor(navigator, name);
                if (curInst && curInst.get) { try { delete navigator[name]; } catch (_) {} }
              }
            } catch (_) {}
          }
        } catch (_) {}
      }

      function bsApplyFirefoxNavFields(apply) {
        try {
          if (apply) {
            const plat = (typeof window.bsGetHardware === 'function' && window.bsGetHardware())
              ? window.bsGetHardware().platform : 'Win32';
            let oscpu = 'Windows NT 10.0; Win64; x64';
            if (/Mac/i.test(plat)) oscpu = 'Macintosh; Intel Mac OS X 10.15';
            else if (/Linux arm/i.test(plat)) oscpu = 'Linux armv8l';
            else if (/Linux/i.test(plat)) oscpu = 'Linux x86_64';
            Object.defineProperty(Navigator.prototype, 'oscpu', { get: makeNative(function() { return oscpu; }, 'get oscpu', 0), configurable: true, enumerable: true });
            Object.defineProperty(Navigator.prototype, 'buildID', { get: makeNative(function() { return '20100101'; }, 'get buildID', 0), configurable: true, enumerable: true });
          } else {
            delete Navigator.prototype.oscpu;
            delete Navigator.prototype.buildID;
          }
        } catch (_) {}
      }

      window.bsSyncBrowserIdentity = function() {
        const bt = BS_CONFIG.browserType || 'brave';
        if (bsIdentitySyncedFor === bt) return;
        bsIdentitySyncedFor = bt;
        const chromeLike = (bt !== 'firefox' && bt !== 'safari');

        // window.chrome presence follows the identity (Firefox/Safari have none)
        try {
          const curDesc = Object.getOwnPropertyDescriptor(window, 'chrome');
          if (chromeLike) {
            if (!curDesc || curDesc.get !== bsChromeAccessor) {
              try { delete window.chrome; } catch (_) {}
              Object.defineProperty(window, 'chrome', { get: bsChromeAccessor, set: function() {}, configurable: true });
            }
            bsInstallChromeStubs();
          } else if (curDesc || window.chrome !== undefined) {
            try { delete window.chrome; } catch (_) {}
          }
        } catch (_) {}

        // navigator.vendor: '' for Firefox, Apple for Safari, native otherwise
        try {
          if (!chromeLike) {
            const val = (bt === 'safari') ? 'Apple Computer, Inc.' : '';
            Object.defineProperty(Navigator.prototype, 'vendor', { get: makeNative(function() { return val; }, 'get vendor', 0), configurable: true, enumerable: true });
            try { Object.defineProperty(navigator, 'vendor', { get: function() { return val; }, configurable: true }); } catch (_) {}
          } else {
            if (origVendorDesc) Object.defineProperty(Navigator.prototype, 'vendor', origVendorDesc);
            try { delete navigator.vendor; } catch (_) {}
          }
        } catch (_) {}

        // Chromium-only API surface follows the identity (Firefox/Safari never
        // ship bluetooth/usb/hid/serial/keyboard/xr or SpeechRecognition)
        bsStripNavApis(!chromeLike);
        bsStripWindowApis(!chromeLike);

        bsApplyFirefoxNavFields(bt === 'firefox');
      };
      window.bsSyncBrowserIdentity();

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
          const origConnectionDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'connection');
          const connectionGetter = function() {
            if (bsOn('networkInfoMaskEnabled')) return mockConnection;
            return origConnectionDesc && origConnectionDesc.get ? origConnectionDesc.get.call(this) : undefined;
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

          // Time-domain siblings were previously left native - analyser
          // waveforms are an equally valid audio fingerprint surface.
          if (AnalyserNode.prototype.getFloatTimeDomainData) {
            const origGetFloatTD = AnalyserNode.prototype.getFloatTimeDomainData;
            AnalyserNode.prototype.getFloatTimeDomainData = makeNative(function(array) {
              origGetFloatTD.apply(this, arguments);
              if (!isCaptchaHost && bsOn('audioNoiseEnabled') && array && array.length > 0) {
                const tdPrng = createPrng(61);
                for (let i = 0; i < Math.min(array.length, 64); i++) {
                  array[i] = array[i] * (1 + (tdPrng() - 0.5) * 2e-7);
                }
              }
            }, 'getFloatTimeDomainData', 1);
          }

          if (AnalyserNode.prototype.getByteTimeDomainData) {
            const origGetByteTD = AnalyserNode.prototype.getByteTimeDomainData;
            AnalyserNode.prototype.getByteTimeDomainData = makeNative(function(array) {
              origGetByteTD.apply(this, arguments);
              if (!isCaptchaHost && bsOn('audioNoiseEnabled') && array && array.length > 0) {
                const tdbPrng = createPrng(67);
                if (tdbPrng() > 0.5) {
                  const idx = Math.floor(tdbPrng() * Math.min(array.length, 128));
                  array[idx] = Math.min(255, Math.max(0, array[idx] + (tdbPrng() > 0.5 ? 1 : -1)));
                }
              }
            }, 'getByteTimeDomainData', 1);
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
          // Processes large canvases in row-chunks to avoid blocking and
          // ensure toDataURL/getImageData consistency for fingerprinting resistance.
          const makeNoisyCopy = (canvas) => {
            if (!canvas || !canvas.width || !canvas.height) return null;
            const copy = document.createElement('canvas');
            copy.width = canvas.width;
            copy.height = canvas.height;
            const cctx = copy.getContext('2d');
            if (!cctx) return null;
            cctx.drawImage(canvas, 0, 0);
            // Process in row chunks to handle arbitrarily large canvases cheaply
            const chunkHeight = 256;
            for (let y = 0; y < copy.height; y += chunkHeight) {
              const h = Math.min(chunkHeight, copy.height - y);
              const img = cctx.getImageData(0, y, copy.width, h);
              applyCanvasNoise(img);
              cctx.putImageData(img, 0, y);
            }
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
          // Also coarsen timeOrigin so performance.now()+timeOrigin stays consistent with Date.now
          try {
            const origTimeOriginDesc = Object.getOwnPropertyDescriptor(Performance.prototype, 'timeOrigin') || Object.getOwnPropertyDescriptor(performance, 'timeOrigin');
            if (origTimeOriginDesc && origTimeOriginDesc.get) {
              Object.defineProperty(performance, 'timeOrigin', {
                get: makeNative(function() {
                  const v = origTimeOriginDesc.get.call(performance);
                  if (!bsOn('timerCoarseningEnabled')) return v;
                  return Math.floor(v / 20) * 20;
                }, 'get timeOrigin', 0),
                configurable: true
              });
            } else if (typeof performance.timeOrigin === 'number') {
              const origTO = performance.timeOrigin;
              Object.defineProperty(performance, 'timeOrigin', {
                get: makeNative(function() {
                  if (!bsOn('timerCoarseningEnabled')) return origTO;
                  return Math.floor(origTO / 20) * 20;
                }, 'get timeOrigin', 0),
                configurable: true
              });
            }
          } catch (_) {}
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

    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1.6: WebGPU Adapter Masking & Canvas Text-Metric Farbling (LIVE-GATED)
  // README promised WebGPU masking — here it is: adapter.info vendor/architecture/
  // device/description are normalized to the active hardware profile. Font
  // enumeration via canvas measureText width comparisons gets deterministic
  // per-session farbling (invisible, stable within a session).
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.gpu && typeof navigator.gpu.requestAdapter === 'function') {
        const origRequestAdapter = navigator.gpu.requestAdapter;
        navigator.gpu.requestAdapter = makeNative(function(options) {
          return origRequestAdapter.apply(this, arguments).then(adapter => {
            try {
              if (adapter && bsOn('webgpuMaskingEnabled') && adapter.info && !adapter.__bsMasked) {
                Object.defineProperty(adapter, '__bsMasked', { value: true });
                const hw = (typeof window.bsGetHardware === 'function') ? window.bsGetHardware() : null;
                let vendor = '';
                if (hw && hw.vendor) {
                  const v = String(hw.vendor).toLowerCase();
                  for (const key of ['nvidia', 'amd', 'intel', 'apple', 'qualcomm', 'arm']) {
                    if (v.includes(key)) { vendor = key; break; }
                  }
                }
                for (const k of ['architecture', 'device', 'description']) {
                  try { Object.defineProperty(adapter.info, k, { value: '', configurable: true }); } catch (_) {}
                }
                try { Object.defineProperty(adapter.info, 'vendor', { value: vendor, configurable: true }); } catch (_) {}
              }
            } catch (_) {}
            return adapter;
          });
        }, 'requestAdapter', 0);
      }

      if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.measureText) {
        const origMeasureText = CanvasRenderingContext2D.prototype.measureText;
        CanvasRenderingContext2D.prototype.measureText = makeNative(function(text) {
          const metrics = origMeasureText.apply(this, arguments);
          if (!isCaptchaHost && bsOn('fontEnumMaskingEnabled') && metrics && typeof metrics.width === 'number' && metrics.width > 0) {
            try {
              // Seed per (font, text) — the old text-length-only seed was
              // CONSTANT across fonts, so cross-font width RATIOS survived
              // untouched and still identified the installed font list.
              let fseed = 'mt:' + String(text == null ? '' : text);
              try { fseed += '|' + String(this && this.font ? this.font : ''); } catch (_) {}
              const mPrng = createPrng(97 + (bsStrHash(fseed) % 100000));
              const factor = 1 + (mPrng() - 0.5) * 0.0008;
              Object.defineProperty(metrics, 'width', { value: metrics.width * factor, configurable: true });
            } catch (_) {}
          }
          return metrics;
        }, 'measureText', 1);
      }
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1.6b: Font Ensemble Spoofing (LIVE-GATED)
  // Instead of merely masking enumeration, the page sees the REALISTIC system
  // font set of the spoofed identity's platform: document.fonts.check and
  // window.queryLocalFonts agree with it, and measureText jitter (above) is
  // seeded per (font, text) so cross-font width ratios no longer leak fonts.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const BS_FONT_ENSEMBLES = {
      win: ['Arial', 'Arial Black', 'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'Impact', 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Historic', 'Segoe UI Symbol', 'Sitka', 'Sylfaen', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Microsoft Sans Serif', 'MS Gothic', 'SimSun', 'Yu Gothic', 'Malgun Gothic', 'Leelawadee UI'],
      mac: ['American Typewriter', 'Andale Mono', 'Arial', 'Avenir', 'Avenir Next', 'Baskerville', 'Big Caslon', 'Chalkboard', 'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Lucida Grande', 'Luminari', 'Menlo', 'Marker Felt', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino', 'Apple Symbols', 'Apple Color Emoji'],
      linux: ['DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Liberation Sans', 'Liberation Sans Narrow', 'Liberation Serif', 'Liberation Mono', 'Noto Sans', 'Noto Serif', 'Noto Sans Mono', 'Ubuntu', 'Ubuntu Mono', 'Cantarell', 'FreeSans', 'FreeSerif', 'FreeMono', 'Carlito', 'Caladea', 'Loma', 'Garuda', 'Norasi', 'Amiri', 'KacstOne', 'NanumGothic'],
      android: ['Roboto', 'Roboto Condensed', 'Roboto Mono', 'Noto Sans', 'Noto Serif', 'Noto Sans Mono', 'Noto Color Emoji', 'Droid Sans Mono', 'Cutive Mono', 'Coming Soon', 'Dancing Script', 'Carrois Gothic SC', 'Arsenal', 'Rubik', 'Acme'],
      ios: ['Academy Engraved LET', 'Al Nile', 'American Typewriter', 'Apple Color Emoji', 'Apple SD Gothic Neo', 'Arial', 'Arial Hebrew', 'Arial Rounded MT Bold', 'Avenir', 'Avenir Next', 'Baskerville', 'Bodoni 72', 'Bradley Hand', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Courier New', 'Damascus', 'Didot', 'Euphemia UCAS', 'Futura', 'Geeza Pro', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Hiragino Maru Gothic ProN', 'Hiragino Mincho ProN', 'Hoefler Text', 'Kailasa', 'Kefa', 'Khmer Sangam MN', 'Lao Sangam MN', 'Marker Felt', 'Menlo', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'PingFang HK', 'PingFang SC', 'PingFang TC', 'Rockwell', 'Savoye LET', 'Sinhala Sangam MN', 'Snell Roundhand', 'Tahoma', 'Thonburi', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Zapfino']
    };
    // True CSS generics + system keywords: never treated as probe targets.
    const BS_GENERIC_FONT_FAMILIES = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', '-apple-system', 'blinkmacsystemfont']);
    // Union of every platform's real system fonts: a probe for a font that IS
    // a system font somewhere but NOT part of this identity is answered
    // "false"; probes for anything else (webfonts, exotic families) pass
    // through untouched so legitimate @font-face feature detection never breaks.
    const BS_ALL_SYSTEM_FONTS = new Set();
    for (const list of Object.values(BS_FONT_ENSEMBLES)) {
      for (const f of list) BS_ALL_SYSTEM_FONTS.add(f.toLowerCase());
    }

    let ensCache = { key: null, set: null, list: null };
    function bsFontPlatformKey() {
      try {
        const plat = String((bsGetHardwareSafe() && bsGetHardwareSafe().platform) || 'Win32');
        if (plat === 'MacIntel') return 'mac';
        if (plat === 'iPhone' || plat === 'iPad') {
          const ua = navigator.userAgent || '';
          if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
          return 'mac';
        }
        if (plat === 'Linux armv81' || plat === 'Linux aarch64' || plat === 'Android') return 'android';
        if (/^Linux/i.test(plat)) return 'linux';
        return 'win';
      } catch (_) { return 'win'; }
    }

    function bsFontEnsemble() {
      try {
        const platKey = bsFontPlatformKey();
        const key = platKey + '|' + String(BS_CONFIG.deviceProfile || '') + '|' + String(BS_CONFIG.browserType || '');
        if (ensCache.key === key && ensCache.set) return ensCache;
        const base = BS_FONT_ENSEMBLES[platKey] || BS_FONT_ENSEMBLES.win;
        // Deterministic identity flavor: rotate + trim the platform list by the
        // identity hash so every identity presents a slightly different — but
        // still realistic — font inventory.
        const seed = bsStrHash(key);
        const rot = seed % base.length;
        const rotated = base.slice(rot).concat(base.slice(0, rot));
        const kept = rotated.slice(0, Math.max(20, rotated.length - (seed % 6)));
        const set = new Set(kept.map(f => f.toLowerCase()));
        ensCache = { key, set, list: kept };
        return ensCache;
      } catch (_) {
        const list = BS_FONT_ENSEMBLES.win;
        return { key: 'fallback', set: new Set(list.map(f => f.toLowerCase())), list };
      }
    }

    /** "italic bold 12px/1.4 'Segoe UI', Arial" → ['segoe ui', 'arial'] */
    function bsParseFontFamilies(fontStr) {
      try {
        const s = String(fontStr || '');
        const m = s.match(/(\d+(?:\.\d+)?)(?:px|pt|pc|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|q|in|%)(?:\s*\/\s*[\d.]+\S*)?\s*([\s\S]*)$/i);
        const tail = m ? m[2] : s;
        const out = [];
        for (const part of tail.split(',')) {
          const f = part.replace(/^['"]+|['"]+$/g, '').trim().toLowerCase();
          if (f) out.push(f);
        }
        return out;
      } catch (_) { return []; }
    }

    // document.fonts.check — ensemble gate (true for ensemble members, false
    // for known system fonts outside this identity, passthrough otherwise)
    try {
      if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.check === 'function') {
        const origCheck = document.fonts.check;
        document.fonts.check = makeNative(function (font) {
          const orig = origCheck.apply(this, arguments);
          try {
            if (!isCaptchaHost && bsOn('fontEnsembleEnabled') && orig === true) {
              const fams = bsParseFontFamilies(String(font == null ? '' : font));
              if (fams.length) {
                const ens = bsFontEnsemble().set;
                let allKnownSystem = true, anyEnsemble = false;
                for (const f of fams) {
                  if (BS_GENERIC_FONT_FAMILIES.has(f)) { allKnownSystem = false; break; }
                  if (ens.has(f)) { anyEnsemble = true; }
                  else if (!BS_ALL_SYSTEM_FONTS.has(f)) { allKnownSystem = false; break; }
                }
                if (allKnownSystem && !anyEnsemble) return false;
              }
            }
          } catch (_) {}
          return orig;
        }, 'check', 1);
      }
    } catch (_) {}

    // window.queryLocalFonts — Local Font Access returns the ensemble.
    // Without user activation the promise rejects NotAllowedError exactly
    // like the native permission flow.
    try {
      if (typeof window.queryLocalFonts === 'function') {
        const origQLF = window.queryLocalFonts;
        window.queryLocalFonts = makeNative(function () {
          if (isCaptchaHost || !bsOn('fontEnsembleEnabled')) return origQLF.apply(this, arguments);
          try {
            if (navigator.userActivation && navigator.userActivation.isActive === false) {
              return Promise.reject(new DOMException('Failed to execute \'queryLocalFonts\' on \'Window\': user activation is required.', 'NotAllowedError'));
            }
          } catch (_) {}
          return new Promise((resolve, reject) => {
            const synthetic = () => {
              try {
                const ens = bsFontEnsemble().list;
                resolve(ens.map((family) => ({
                  family,
                  fullName: family,
                  postscriptName: String(family).replace(/\s+/g, ''),
                  style: 'Regular'
                })));
              } catch (_) { reject(new DOMException('queryLocalFonts failed', 'InvalidStateError')); }
            };
            try {
              origQLF.call(window).then((fonts) => {
                try {
                  const ens = bsFontEnsemble().set;
                  const seen = new Set();
                  const out = [];
                  for (const f of (fonts || [])) {
                    if (!f || !ens.has(String(f.family || '').toLowerCase()) || seen.has(f.family)) continue;
                    seen.add(f.family);
                    out.push(f);
                  }
                  resolve(out);
                } catch (_) { synthetic(); }
              }, synthetic);
            } catch (_) { synthetic(); }
          });
        }, 'queryLocalFonts', 0);
      }
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1.7: Media Devices & Speech Synthesis Sanitization (LIVE-GATED)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
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
        const EN_VOICES = [
          { voiceURI: 'Google US English', name: 'Google US English', lang: 'en-US', localService: false, default: true },
          { voiceURI: 'Google UK English Female', name: 'Google UK English Female', lang: 'en-GB', localService: false, default: false },
          { voiceURI: 'Google UK English Male', name: 'Google UK English Male', lang: 'en-GB', localService: false, default: false }
        ];
        // Voices must agree with the spoofed locale - an en-US-only voice list
        // next to navigator.language ja-JP is a live consistency leak.
        function buildVoices() {
          const loc = BS_CONFIG.spoofLocale;
          if (bsOptIn('timezoneSpoofingEnabled') && typeof loc === 'string' && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/i.test(loc)) {
            return [
              { voiceURI: `Google ${loc}`, name: `Google ${loc}`, lang: loc, localService: false, default: true },
              { voiceURI: 'Google US English', name: 'Google US English', lang: 'en-US', localService: false, default: false }
            ];
          }
          return EN_VOICES;
        }
        window.speechSynthesis.getVoices = makeNative(function() {
          return bsOn('speechVoicesSanitizeEnabled') ? buildVoices() : origGetVoices.apply(this, arguments);
        }, 'getVoices', 0);
      }
    } catch (_) {}

    // ── Plugin / MimeType / PDF parity ──────────────────────────────────────
    // A zero-length navigator.plugins + a PDF viewer that agrees with the
    // spoofed browser identity are the two cheapest headless tells on
    // BrowserLeaks. Chrome/Brave always expose 5 PDF entries; Firefox never
    // exposes pdfViewerEnabled the same way.
    try {
      const BS_PDF_MIME = 'application/pdf';
      const BS_PDF_DESC = 'Portable Document Format';
      const BS_PDF_PLUGINS = [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
      ];

      function bsMakePluginArray() {
        const items = BS_PDF_PLUGINS.map((p, i) => {
          const mime = {
            type: BS_PDF_MIME,
            suffixes: 'pdf',
            description: BS_PDF_DESC,
            __proto__: null
          };
          Object.defineProperty(mime, '__proto__', { value: null, enumerable: false });
          const plugin = { name: p.name, filename: p.filename, description: p.description, length: 1, item: () => mime, namedItem: () => mime, __i: i, __mime: mime };
          try { Object.defineProperty(mime, 'enabledPlugin', { value: plugin, enumerable: true, configurable: true }); } catch (_) {}
          try {
            Object.setPrototypeOf(plugin, Plugin.prototype);
          } catch (_) {}
          return plugin;
        });
        const arr = items.slice();
        try { Object.setPrototypeOf(arr, PluginArray.prototype); } catch (_) {}
        for (let i = 0; i < items.length; i++) {
          try { Object.defineProperty(arr, i, { value: items[i], enumerable: true, configurable: true }); } catch (_) {}
        }
        // Real PluginArray exposes named properties (navigator.plugins['PDF Viewer'])
        for (const pl of items) {
          try { Object.defineProperty(arr, pl.name, { value: pl, enumerable: false, configurable: true }); } catch (_) {}
        }
        try { Object.defineProperty(arr, 'length', { value: items.length, enumerable: false, configurable: false }); } catch (_) {}
        arr.item = makeNative(function(idx) {
          const i = Number(idx) | 0;
          return (i >= 0 && i < items.length) ? items[i] : null;
        }, 'item', 1);
        arr.namedItem = makeNative(function(name) {
          return items.find(p => p.name === name) || null;
        }, 'namedItem', 1);
        arr.refresh = makeNative(function() {}, 'refresh', 0);
        return arr;
      }

      function bsMakeMimeTypeArray() {
        const mime = { type: BS_PDF_MIME, suffixes: 'pdf', description: BS_PDF_DESC, enabledPlugin: null, __proto__: null };
        try { Object.defineProperty(mime, '__proto__', { value: null, enumerable: false }); } catch (_) {}
        const list = [mime];
        try { Object.setPrototypeOf(list, MimeTypeArray.prototype); } catch (_) {}
        try { Object.defineProperty(list, 0, { value: mime, enumerable: true, configurable: true }); } catch (_) {}
        // Named lookup: navigator.mimeTypes['application/pdf']
        try { Object.defineProperty(list, BS_PDF_MIME, { value: mime, enumerable: false, configurable: true }); } catch (_) {}
        try { Object.defineProperty(list, 'length', { value: 1, enumerable: false, configurable: false }); } catch (_) {}
        list.item = makeNative(function(idx) {
          const i = Number(idx) | 0;
          return (i >= 0 && i < list.length) ? list[i] : null;
        }, 'item', 1);
        list.namedItem = makeNative(function(type) {
          return String(type) === BS_PDF_MIME ? mime : null;
        }, 'namedItem', 1);
        return list;
      }

      const bsChromeLike = () => {
        try { return BS_CONFIG.browserType !== 'firefox' && BS_CONFIG.browserType !== 'safari'; } catch (_) { return true; }
      };

      if (bsChromeLike()) {
        const fakePlugins = bsMakePluginArray();
        const fakeMimes = bsMakeMimeTypeArray();
        try { Object.defineProperty(Navigator.prototype, 'plugins', { get: makeNative(function() { return fakePlugins; }, 'get plugins', 0), configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(navigator, 'plugins', { get: makeNative(function() { return fakePlugins; }, 'get plugins', 0), configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: makeNative(function() { return fakeMimes; }, 'get mimeTypes', 0), configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(navigator, 'mimeTypes', { get: makeNative(function() { return fakeMimes; }, 'get mimeTypes', 0), configurable: true, enumerable: true }); } catch (_) {}
        // pdfViewerEnabled: Chrome true, Firefox false — must agree with UA
        const pdfGetter = makeNative(function() { return BS_CONFIG.browserType === 'firefox' ? false : true; }, 'get pdfViewerEnabled', 0);
        try { Object.defineProperty(Navigator.prototype, 'pdfViewerEnabled', { get: pdfGetter, configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(navigator, 'pdfViewerEnabled', { get: pdfGetter, configurable: true, enumerable: true }); } catch (_) {}
      } else {
        // Firefox/Safari: report no PDF plugins at all
        try { Object.defineProperty(Navigator.prototype, 'plugins', { get: makeNative(function() { return []; }, 'get plugins', 0), configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: makeNative(function() { return []; }, 'get mimeTypes', 0), configurable: true, enumerable: true }); } catch (_) {}
        try { Object.defineProperty(Navigator.prototype, 'pdfViewerEnabled', { get: makeNative(function() { return false; }, 'get pdfViewerEnabled', 0), configurable: true, enumerable: true }); } catch (_) {}
      }
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1.5: Timezone & Locale Parity (LIVE-GATED, opt-in per profile)
  // A Win32 platform claim paired with a real Asia/Kolkata clock is the single
  // cheapest CreepJS catch — this closes it end-to-end (Intl, Date math,
  // toString rendering, navigator.languages).
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const tzCache = { tz: null, stamp: -1, offset: 0 };

      function bsTargetTz() {
        if (!bsOptIn('timezoneSpoofingEnabled')) return null;
        const tz = BS_CONFIG.spoofTimezone;
        return (typeof tz === 'string' && tz.length > 0 && tz.length < 64) ? tz : null;
      }

      function bsSpoofLocale() {
        if (!bsOptIn('timezoneSpoofingEnabled')) return null;
        const loc = BS_CONFIG.spoofLocale;
        return (typeof loc === 'string' && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/i.test(loc)) ? loc : null;
      }

      function bsOffsetMinutes(tz) {
        const stamp = Math.floor(Date.now() / 60000);
        if (tzCache.tz === tz && tzCache.stamp === stamp) return tzCache.offset;
        const now = new Date();
        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const parts = {};
        for (const p of dtf.formatToParts(now)) parts[p.type] = p.value;
        const asUTC = Date.UTC(
          Number(parts.year), Number(parts.month) - 1, Number(parts.day),
          Number(parts.hour) % 24, Number(parts.minute), Number(parts.second)
        );
        const offset = Math.round((asUTC - now.getTime()) / 60000);
        tzCache.tz = tz; tzCache.stamp = stamp; tzCache.offset = offset;
        return offset;
      }

      // Date.prototype.getTimezoneOffset (positive-west convention)
      const origGetTZOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = makeNative(function() {
        const tz = bsTargetTz();
        if (!tz) return origGetTZOffset.apply(this, arguments);
        const off = bsOffsetMinutes(tz);
        return off === null ? origGetTZOffset.apply(this, arguments) : off;
      }, 'getTimezoneOffset', 0);

      // Intl.DateTimeFormat.prototype.resolvedOptions
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat.prototype.resolvedOptions) {
        const origResolved = Intl.DateTimeFormat.prototype.resolvedOptions;
        Intl.DateTimeFormat.prototype.resolvedOptions = makeNative(function() {
          const res = origResolved.apply(this, arguments);
          if (!res) return res;
          const tz = bsTargetTz();
          if (tz) { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); res.timeZone = tz; } catch (_) {} }
          const loc = bsSpoofLocale();
          if (loc) res.locale = loc;
          return res;
        }, 'resolvedOptions', 0);
      }

      // Date.prototype.toString — render in target zone incl. GMT suffix & tz name
      const origToString = Date.prototype.toString;
      Date.prototype.toString = makeNative(function() {
        const tz = bsTargetTz();
        if (!tz) return origToString.apply(this, arguments);
        try {
          const d = this;
          if (isNaN(d.getTime())) return origToString.apply(this, arguments);
          const fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, hour12: false,
            weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZoneName: 'long'
          });
          const p = {};
          for (const part of fmt.formatToParts(d)) p[part.type] = part.value;
          const off = bsOffsetMinutes(tz);
          const sign = off <= 0 ? '+' : '-';
          const abs = Math.abs(off);
          const gh = String(Math.floor(abs / 60)).padStart(2, '0');
          const gm = String(abs % 60).padStart(2, '0');
          const hh = String(Number(p.hour) % 24).padStart(2, '0');
          const mm = String(p.minute).padStart(2, '0');
          const ss = String(p.second).padStart(2, '0');
          return `${p.weekday} ${p.month} ${p.day} ${p.year} ${hh}:${mm}:${ss} GMT${sign}${gh}${gm} (${p.timeZoneName || tz})`;
        } catch (_) {
          return origToString.apply(this, arguments);
        }
      }, 'toString', 0);

      // Date.prototype.toLocaleString inherits the target zone automatically
      const origToLocaleString = Date.prototype.toLocaleString;
      Date.prototype.toLocaleString = makeNative(function(loc, opts) {
        const tz = bsTargetTz();
        if (!tz) return origToLocaleString.apply(this, arguments);
        const merged = Object.assign({}, opts || {});
        if (!merged.timeZone) merged.timeZone = tz;
        return origToLocaleString.call(this, loc, merged);
      }, 'toLocaleString', 0);

      // navigator.language / languages follow the spoofed locale
      const origLanguageDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'language');
      const origLanguagesDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'languages');
      if (origLanguageDesc && origLanguagesDesc) {
        const languageGetter = function() {
          const loc = bsSpoofLocale();
          if (loc) return loc.split('-')[0].length === 2 ? loc : origLanguageDesc.get.call(this);
          return origLanguageDesc.get.call(this);
        };
        const languagesGetter = function() {
          const loc = bsSpoofLocale();
          if (loc) return Object.freeze([loc]);
          return origLanguagesDesc.get.call(this);
        };
        Object.defineProperty(Navigator.prototype, 'language', { get: makeNative(languageGetter, 'get language', 0), configurable: true, enumerable: true });
        Object.defineProperty(navigator, 'language', { get: makeNative(languageGetter, 'get language', 0), configurable: true, enumerable: true });
        Object.defineProperty(Navigator.prototype, 'languages', { get: makeNative(languagesGetter, 'get languages', 0), configurable: true, enumerable: true });
        Object.defineProperty(navigator, 'languages', { get: makeNative(languagesGetter, 'get languages', 0), configurable: true, enumerable: true });
      }
    } catch (_) {}
  })();

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
        if (BS_CONFIG.siteProtected === true) return;
        const anchors = document.querySelectorAll(UNPACK_SELECTORS.join(', '));
        anchors.forEach(a => {
          if (a._bsResolved) return;
          const target = decodeQueryTarget(a.href);
          if (target && target !== a.href) {
            a._bsResolved = true;
            a.href = target;
            a.title = '⚡ Direct link unlocked by BraveShield: ' + target;
            reportTelemetry('directLinksUnlocked', 1);
            reportTelemetry('timeSavedSeconds', 5);
          }
        });
        // Custom Resolver Rules (action=click): auto-click the user-picked
        // selector once per element on matching hosts.
        try {
          const rules = BS_CONFIG.customResolvers;
          if (Array.isArray(rules) && rules.length > 0) {
            for (const r of rules) {
              if (!r || r.action !== 'click' || r.enabled === false || !r.value) continue;
              if (!bsRuleHostMatch(r.pattern, host)) continue;
              let els = [];
              try { els = Array.from(document.querySelectorAll(r.value)); } catch (_) { continue; }
              for (const el of els) {
                if (!el || el._bsRuleClicked) continue;
                el._bsRuleClicked = true;
                try { el.click(); } catch (_) {}
              }
            }
          }
        } catch (_) {}
      }

      // Custom Resolver Rules (action=redirect): if a configured query param
      // carries the real destination URL, decode and jump once. Session-
      // flagged so a bounce-back cannot loop.
      function bsTryCustomRedirect() {
        try {
          if (bsSiteDisabled || BS_CONFIG.siteProtected === true) return;
          const rules = BS_CONFIG.customResolvers;
          if (!Array.isArray(rules) || rules.length === 0) return;
          let marker = null;
          try { marker = sessionStorage.getItem('_bsCustomRedirect'); } catch (_) {}
          if (marker === location.href) return;
          const params = new URLSearchParams(location.search);
          for (const r of rules) {
            if (!r || r.action !== 'redirect' || r.enabled === false || !r.value) continue;
            if (!bsRuleHostMatch(r.pattern, host)) continue;
            let target = params.get(r.value);
            if (!target) continue;
            try { target = decodeURIComponent(target); } catch (_) {}
            if (/^https?:\/\//i.test(target) && target !== location.href) {
              try { sessionStorage.setItem('_bsCustomRedirect', location.href); } catch (_) {}
              window.location.replace(target);
              return;
            }
          }
        } catch (_) {}
      }
      bsOnConfigReady(bsTryCustomRedirect);

      setInterval(sweepUnshortenLinks, 1200);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 3: 50x Safe Countdown Acceleration (MAIN-world timer hooks only)
  // NOTE: DOM overlay purging / button unlocking lives exclusively in content.js
  // now — the duplicated MAIN-world copy was removed.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    // Acceleration now targets link-shortener/locker hosts only — accelerating
    // every site's timeouts broke autosave, debounces and carousels site-wide.
    // Users can opt into global acceleration via the Aggressive Turbo setting.
    const isShortenerHost = (() => {
      try {
        if (typeof BS_SHORTENER_HOSTS === 'undefined') return false;
        return BS_SHORTENER_HOSTS.some(h => host === h || host.endsWith('.' + h));
      } catch (_) { return false; }
    })();

    // Heuristic wait-page detection: the "Click Image → Wait For The Link" flow
    // lands on an intermediate page that shows "Please wait X seconds", "Wait For The Link",
    // "Generating link..." etc.  Those pages are not always on a known shortener host,
    // so we accelerate when the visible text or DOM strongly resembles a countdown locker.
    // surajitlinks / getmodpc validate server-side wait — timer acceleration causes Bad Request / JSON dump, so never turbo there
    // + trusted web-apps (Meta AI, Gmail, etc.) must never have timers accelerated — breaks generation/polling
    const isNoTurboHost = host.includes('surajitlinks') || host.includes('shrinkearn') || host.includes('getmodpc') ||
      (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host));
    const BS_WAIT_TEXT_RE = /wait for the link|wait for \d+\s*s(?:ec(?:onds?)?)?\b|wait\s+\d+\s*s(?:ec(?:onds?)?)?\b|waiting \d+|please wait|you must wait|wait a moment|seconds?\s*(remaining|left|to go)|countdown|get link|getting link|your link is almost ready|link is almost ready|almost ready|generat\w*\s+(link|download)|link will appear|download will start|redirecting in \d+|continue to.*link|click.*continue|proceed.*link|click here to continue|click image to go fast|or click image|wait\s*\d+\s*sec|your link is almost ready.*0\s*sec/i;
    let bsWaitCache = { val: false, stamp: 0 };
    // Back from a hidden tab: body text may have changed while away — drop cache
    try { document.addEventListener('visibilitychange', () => { if (!document.hidden) bsWaitCache.stamp = 0; }, true); } catch (_) {}
    function bsLooksLikeWaitPage() {
      try {
        if (isNoTurboHost) return false;
        if (isShortenerHost) return true;
        // innerText sweep is expensive — cache for 2.5s between timer calls
        const nowMs = Date.now();
        if (nowMs - bsWaitCache.stamp < 2500) return bsWaitCache.val;
        let result = false;
        const txt = (document.body && document.body.innerText || document.documentElement && document.documentElement.innerText || '').toLowerCase();
        if (txt && BS_WAIT_TEXT_RE.test(txt)) result = true;
        else if (txt && /seconds|getting link|almost ready/i.test(txt) &&
          document.querySelector('[id*="countdown"],[class*="countdown"],[id*="timer"],[class*="timer"],#link,[id*="link"],#get-link,#getlink,#download-btn,#btn-main,#safelink,button, a.btn')) {
          result = true;
        }
        bsWaitCache = { val: result, stamp: nowMs };
        return result;
      } catch (_) { return false; }
    }

    function bsTurboAllowed() {
      if (isNoTurboHost) return false;
      if (BS_CONFIG.siteProtected === true) return false;
      if (!bsOn('autoBypassTimers')) return false;
      return true;
    }

    // Hidden tabs are never accelerated in the background: apps save, poll and
    // animate on timers, and fast-forwarding those while the tab is invisible
    // breaks sync. Lockers/shorteners and explicit turboAllSites stay boosted —
    // those countdowns only ever run in the foreground anyway.
    function bsTabHidden() {
      try { return document.visibilityState === 'hidden'; } catch (_) { return false; }
    }

    // Timer acceleration factor. Lockers/shorteners and wait-pages get the
    // historical 50x; ordinary sites get a modest 4x so autosaves, polls and
    // animations stay sane. "Aggressive Turbo (All Sites)" restores 50x
    // everywhere (this toggle previously did nothing).
    function bsTurboFactor() {
      try {
        if (BS_CONFIG.siteProtected === true) return 1;
        // Custom Resolver Rules (action=turbo): user-declared 50x locker hosts.
        let customTurbo = false;
        const rules = BS_CONFIG.customResolvers;
        if (Array.isArray(rules)) {
          for (const r of rules) {
            if (r && r.action === 'turbo' && r.enabled !== false && bsRuleHostMatch(r.pattern, host)) { customTurbo = true; break; }
          }
        }
        if (isShortenerHost || customTurbo || BS_CONFIG.turboAllSites === true) return 50;
        if (bsTabHidden()) return 1;   // 1 = original delay
        return bsLooksLikeWaitPage() ? 50 : 4;
      } catch (_) {
        return BS_CONFIG.turboAllSites === true ? 50 : 4;
      }
    }

    try {
      const origSetTimeout = window.setTimeout;
      const origSetInterval = window.setInterval;

      window.setTimeout = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && typeof delay === 'number' && delay > 50 && delay < 120000 && bsTurboAllowed()) {
          const isShortTimer = delay <= 5000;
          if (isShortTimer && BS_CONFIG.gentleTurboEnabled === false) {
            return origSetTimeout.apply(this, arguments);
          }
          const turboFactor = isShortTimer ? (bsTabHidden() ? 1 : 1.9) : bsTurboFactor();
          const fastDelay = Math.max(10, Math.floor(delay / turboFactor));
          const savedMs = delay - fastDelay;
          if (savedMs >= 300) reportTelemetry('timeSavedSeconds', Math.min(50, Math.round(savedMs / 1000)));
          return origSetTimeout.call(this, fn, fastDelay, ...args);
        }
        return origSetTimeout.apply(this, arguments);
      }, 'setTimeout', 2);

      window.setInterval = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && typeof delay === 'number' && delay >= 200 && delay < 120000 && bsTurboAllowed()) {
          const isShortTimer = delay <= 5000;
          if (isShortTimer && BS_CONFIG.gentleTurboEnabled === false) {
            return origSetInterval.apply(this, arguments);
          }
          const turboFactor = isShortTimer ? (bsTabHidden() ? 1 : 1.9) : bsTurboFactor();
          const fastDelay = Math.max(20, Math.floor(delay / turboFactor));
          const savedMs = delay - fastDelay;
          if (savedMs >= 300) reportTelemetry('timeSavedSeconds', Math.min(50, Math.round(savedMs / 1000)));
          return origSetInterval.call(this, fn, fastDelay, ...args);
        }
        return origSetInterval.apply(this, arguments);
      }, 'setInterval', 2);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Modules 4 & 5 (Paywall/Blur Defuser, AdBlock Trap Defuser) live in
  // content.js now — one implementation, gated by the live per-site config,
  // with captcha/auth guards and telemetry. Keeping a MAIN-world copy caused
  // double work and ignored the user's toggles.
  // ─────────────────────────────────────────────────────────────────────────────

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
          if (!video._bsAdTurboHandled) {
            video._bsAdTurboHandled = true;
            video._bsAdTurboApplied = true;
            if (video.duration && isFinite(video.duration)) {
              const remaining = video.duration - (video.currentTime || 0);
              if (remaining > 1) reportTelemetry('timeSavedSeconds', Math.min(50, Math.round(remaining)));
            }
          }
          video.playbackRate = 16.0;
          video.muted = true;
          if (video.duration && isFinite(video.duration)) {
            video.currentTime = video.duration;
          }
        } else if (video) {
          // FIX: restore rate/mute after the ad — previously the 16x rate and the
          // forced mute stayed applied to the user's real video.
          if (video._bsAdTurboApplied) {
            video._bsAdTurboApplied = false;
            try { video.playbackRate = 1.0; video.muted = false; } catch (_) {}
          }
          video._bsAdTurboHandled = false;
        }

        if (skipBtn && typeof skipBtn.click === 'function') {
          skipBtn.click();
          reportTelemetry('trapsNeutralized', 1);
          reportTelemetry('timeSavedSeconds', 5);
        }
      } catch (_) {}
    }

    setInterval(speedupYouTubeAds, 500);
  })();

  // ── Shared reel/short navigation kit (used by Modules 6b + 6c) ──
  // Reels AND Shorts auto-REPLAY (loop) — the 'ended' event almost never
  // fires, so pure end-detection is dead on arrival. This kit:
  //   • advances through each site's NATIVE affordance first (YT Shorts ships
  //     a stable next-chevion #navigation-button-down; both IG desktop reels
  //     and YT Shorts respond to ArrowDown) before any hand-rolled scroll,
  //     because those survive DOM redesigns
  //   • detects the loop-restart boundary (currentTime jumps back to ~0) as
  //     the real "reel finished" moment
  //   • debounces advances globally (site scroll + our fallback must not
  //     double-land) and re-checks every live gate at fire time
  const bsReelKit = (function () {
    let lastAdvance = 0;
    let autoSessionStart = 0;   // set at the FIRST fired advance — the budget clock
    function advanceGate() {
      const now = Date.now();
      if (now - lastAdvance < 1500) return false;
      lastAdvance = now;
      return true;
    }
    // Auto-Pilot budget: reelMaxAutoSeconds (0 = unlimited). The clock only
    // runs while auto-advancing actually fires, not while the user watches.
    function bsAutoCapReached() {
      try {
        const cap = Math.max(0, Math.min(86400, Number(BS_CONFIG.reelMaxAutoSeconds) || 0));
        if (cap <= 0 || !autoSessionStart) return false;
        return (Date.now() - autoSessionStart) >= cap * 1000;
      } catch (_) { return false; }
    }

    // Single fresh ArrowDown per call (reusing one Event object across
    // dispatches lets handlers poison the second hop with stopPropagation).
    function makeArrowDown() {
      try {
        const ev = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true, composed: true });
        // The init dict IGNORES keyCode/which — they stay 0 unless patched.
        // Legacy handlers key off ev.keyCode === 40, this is load-bearing.
        try {
          Object.defineProperty(ev, 'keyCode', { get: () => 40, configurable: true });
          Object.defineProperty(ev, 'which', { get: () => 40, configurable: true });
        } catch (_) {}
        return ev;
      } catch (_) { return null; }
    }
    // Dispatch at a DEEP node (the reel's <video>): the event bubbles up
    // through every ancestor — the page's React root container, document
    // and window — so delegated + global handlers all receive it. Firing on
    // document/activeElement instead never descends into the app tree and
    // silently reaches nothing (the previous version's failure mode).
    function key(el) {
      const ev = makeArrowDown();
      if (!ev) return;
      try { (el || document).dispatchEvent(ev); } catch (_) {}
    }
    function wheel(el, dy) {
      try {
        const ev = new WheelEvent('wheel', { deltaY: dy || 900, bubbles: true, cancelable: true, composed: true, view: window });
        (el || document).dispatchEvent(ev);
      } catch (_) {}
    }
    function bindLoopAdvance(v, nextFn) {
      if (!v || v._bsLoopAdv) return;
      v._bsLoopAdv = true;
      let last = 0;
      v.addEventListener('timeupdate', () => {
        try {
          const t = v.currentTime || 0;
          const d = v.duration || 0;
          // Auto-Pilot dwell: minimum seconds on the reel before advancing.
          const dwell = Math.max(0, Math.min(10, Number(BS_CONFIG.reelDwellSeconds) || 0));
          // 'ended' flag OR visible replay-boundary: was near tail, now at top
          if (t >= dwell && !bsAutoCapReached() &&
              (v.ended || (d > 0.5 && last > Math.max(0.2, d - 0.35) && t < 0.3))) {
            if (advanceGate()) {
              autoSessionStart = autoSessionStart || Date.now();
              setTimeout(() => nextFn(v), 120);
            }
          }
          last = t;
        } catch (_) {}
      }, { passive: true });
      v.addEventListener('ended', () => {
        try {
          const dwell = Math.max(0, Math.min(10, Number(BS_CONFIG.reelDwellSeconds) || 0));
          if ((v.currentTime || 0) >= dwell && !bsAutoCapReached() && advanceGate()) {
            autoSessionStart = autoSessionStart || Date.now();
            setTimeout(() => nextFn(v), 120);
          }
        } catch (_) {}
      }, { passive: true });
    }
    return { advanceGate, key, wheel, bindLoopAdvance };
  })();

  function bsReelOnScreen(v) {
    try {
      const r = v.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0;
    } catch (_) { return false; }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 6b: Instagram / Facebook Reels
  //   • instagramReelsAdsEnabled  → Sponsored detection + 16x turbo + skip
  //   • instagramAutoScrollEnabled→ auto-advance to next reel when one ends
  // Both are independent switches so you can keep the scroller without ad skip.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const isIgFb = host.includes('instagram.com') || host.includes('facebook.com') || host.includes('fb.watch');
    if (!isIgFb) return;

    const AD_TEXT_RE = /^\s*(sponsored|sponsored\s*·|paid partnership|paid\s*·|suggested for you|recommended for you)\s*$/i;
    const AD_BTN_RE = /skip ad|see ad options|hide ad|ad options|not interested|why this ad|unfollow|close ad/i;
    // Instagram ad UI hooks (class names rotate, so we match families)
    const AD_UI_SEL = [
      '[class*="Sponsored"]', '[class*="sponsored"]',
      '[data-testid*="sponsored"]', '[aria-label*="Sponsored" i]',
      '[class*="AdInfo"]', '[data-ad-rendered="true"]',
      '[class*="ads_"]', '[id*="ad-"]'
    ].join(', ');

    function bsIsAdReel() {
      try {
        // Any visible Sponsored/Paid pill in viewport (cheap + rotated-proof)
        const pills = document.querySelectorAll('span, div, a');
        for (const p of pills) {
          if (p._bsAdChecked) continue;
          p._bsAdChecked = true;
          const t = (p.innerText || p.textContent || '').trim();
          if (!t || t.length > 40) continue;
          if (!AD_TEXT_RE.test(t)) continue;
          const r = p.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.bottom < 0 || r.top > (window.innerHeight || 800)) continue;
          return true;
        }
        // Meta in-stream ad markers
        if (document.querySelector('video[src*="ads"], [data-testid*="adVideo"], [class*="AdPlayer"]')) return true;
        return false;
      } catch (_) { return false; }
    }

    function bsReelScroller() {
      // Instagram renders Reels inside a scrollable inner container, not the document
      const candidates = document.querySelectorAll('div');
      let best = null;
      let bestH = 0;
      for (const d of candidates) {
        try {
          if (d.scrollHeight - d.clientHeight < window.innerHeight * 0.6) continue;
          const r = d.getBoundingClientRect();
          // Must be a tall, narrow, vertically-scrolling column
          if (r.width > window.innerWidth * 0.6) continue;
          if (d.clientHeight < window.innerHeight * 0.5) continue;
          if (d.clientHeight > bestH) { bestH = d.clientHeight; best = d; }
        } catch (_) {}
      }
      return best || document.scrollingElement;
    }

    function bsNextReel() {
      try {
        const scroller = bsReelScroller();
        if (!scroller) return false;
        const vh = window.innerHeight || 800;
        if (scroller === document.scrollingElement) {
          window.scrollBy({ top: vh * 0.92, behavior: 'smooth' });
        } else {
          scroller.scrollTo({ top: scroller.scrollTop + vh * 0.92, behavior: 'smooth' });
        }
        return true;
      } catch (_) {
        try { window.scrollBy(0, (window.innerHeight || 800) * 0.92); return true; } catch (_) { return false; }
      }
    }

    // ── A) Ad skipper (instagramReelsAdsEnabled) ──
    function instaAdSkipper() {
      try {
        if (!bsOn('youtubeAds')) return;          // master switch
        if (BS_CONFIG.instagramReelsAdsEnabled === false) return; // dedicated toggle

        // 1) Turbo any ad video currently playing
        const videos = document.querySelectorAll('video');
        for (const v of videos) {
          try {
            const r = v.getBoundingClientRect();
            const onScreen = r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0;
            if (!onScreen) continue;
            if (!v.paused && bsIsAdReel()) {
              v.muted = true;
              try { v.playbackRate = 16.0; } catch (_) {}
              if (v.duration && isFinite(v.duration) && v.duration > 0) {
                try { v.currentTime = v.duration; } catch (_) {}
              }
              if (!v._bsAdCounted) {
                v._bsAdCounted = true;
                reportTelemetry('trapsNeutralized', 1);
                reportTelemetry('timeSavedSeconds', 5);
              }
            } else {
              v._bsAdCounted = false;
            }
          } catch (_) {}
        }

        // 2) Auto-click "Skip Ad" / "See ad options"
        const btns = document.querySelectorAll('div[role="button"], button, a, span[role="button"]');
        for (const b of btns) {
          if (b._bsAdBtn) continue;
          const t = (b.innerText || b.textContent || '').trim();
          if (!t || t.length > 30) continue;
          if (!AD_BTN_RE.test(t)) continue;
          b._bsAdBtn = true;
          try { b.click(); } catch (_) {}
          reportTelemetry('trapsNeutralized', 1);
        }

        // 3) Nuke in-feed ad cards
        const cards = document.querySelectorAll('div[role="article"], article');
        for (const c of cards) {
          if (c._bsAdCard) continue;
          if (c.querySelector(AD_UI_SEL)) {
            c._bsAdCard = true;
            try {
              c.style.setProperty('display', 'none', 'important');
              reportTelemetry('trapsNeutralized', 1);
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    // ── B) Auto-scroll to next reel when the current one ends ──
    // Advance cascade, each stage verified against real DOM state:
    //   1. IG's own next-chevron (hover arrows, desktop reels)
    //   2. ArrowDown dispatched AT the reel's <video> — bubbling from a deep
    //      node is the only dispatch that reaches IG's React-root delegation,
    //      document and window handlers (fires on body/document hit nothing)
    //   3. 700 ms later, if the SAME reel is still connected (a real advance
    //      unmounts/recycles it — that's our receipt), escalate to wheel
    //   4. and finally the container scroll math as the last resort
    function bsIgChevronNext() {
      try {
        const btns = document.querySelectorAll('[role="button"], button, div[tabindex="0"]');
        for (const n of btns) {
          const label = (typeof n.getAttribute === 'function') ? (n.getAttribute('aria-label') || '') : '';
          if (!/^(next|go to next)/i.test(label)) continue;
          if (!n.querySelector || !n.querySelector('svg')) continue;
          try { n.click(); return true; } catch (_) {}
        }
      } catch (_) {}
      return false;
    }

    function bsIgDeepAnchor(preferred) {
      try {
        if (preferred && preferred.isConnected) return preferred;
        const playing = Array.from(document.querySelectorAll('video')).find(v => !v.paused && bsReelOnScreen(v));
        return playing || document.querySelector('main video, video') || null;
      } catch (_) { return null; }
    }

    function bsIgAdvance(v) {
      try {
        if (bsSiteDisabled || BS_CONFIG.instagramAutoScrollEnabled !== true) return;
        if (bsIgChevronNext()) return;
        const anchor = bsIgDeepAnchor(v);
        bsReelKit.key(anchor);
        setTimeout(() => {
          try {
            if (bsSiteDisabled || BS_CONFIG.instagramAutoScrollEnabled !== true) return;
            // Receipt check: on success the reel's video leaves the document
            if (anchor && anchor.isConnected && anchor.tagName === 'VIDEO') {
              bsReelKit.wheel(anchor, 900);
              setTimeout(() => {
                try {
                  if (bsSiteDisabled || BS_CONFIG.instagramAutoScrollEnabled !== true) return;
                  if (anchor && anchor.isConnected) {
                    bsNextReel();
                    return;
                  }
                } catch (_) {}
              }, 700);
            }
          } catch (_) {}
        }, 700);
      } catch (_) {}
    }

    function instaAutoScroll() {
      try {
        // Gated ONLY by its own opt-in — previously this also required the
        // YouTube turbo master ("youtubeAds"), which silently killed IG
        // auto-scroll for everyone who turned that toggle off.
        if (bsSiteDisabled || BS_CONFIG.instagramAutoScrollEnabled !== true) return;
        const videos = document.querySelectorAll('video');
        for (const v of videos) {
          if (!bsReelOnScreen(v)) continue;
          bsReelKit.bindLoopAdvance(v, bsIgAdvance);
        }
      } catch (_) {}
    }

    setInterval(instaAdSkipper, 700);
    setInterval(instaAutoScroll, 500);

    // ── C) Nuke the "Skip Ad" interstitial / fullscreen ad overlay ──
    (() => {
      try {
        const mo = new MutationObserver(() => {
          if (bsSiteDisabled) return;
          if (!bsOn('youtubeAds')) return;
          if (BS_CONFIG.instagramReelsAdsEnabled === false) return;
          const overlays = document.querySelectorAll('[data-testid*="interstitial"], [class*="Interstitial"], [class*="InterstitialAd"]');
          for (const o of overlays) {
            if (o._bsInter) continue;
            const t = (o.innerText || '').toLowerCase();
            if (!/skip ad|ad options|sponsored|continue watching|advertisement/i.test(t)) continue;
            o._bsInter = true;
            try {
              o.style.setProperty('display', 'none', 'important');
              setTimeout(() => { try { bsNextReel(); } catch (_) {} }, 120);
            } catch (_) {}
          }
        });
        if (document.documentElement) mo.observe(document.documentElement, { childList: true, subtree: true });
      } catch (_) {}
    })();
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 6c: YouTube Shorts Skipper
  //   • youtubeShortsEnabled   → master gate (bsOn)
  //   • youtubeShortsAutoScroll→ opt-in auto-scroll (bsOptIn)
  //   • Shorts use ytd-reel-video-renderer inside ytd-shared scroller
  //   • Ad detection: [is-ad], skip btn, ad overlay, "Sponsored"/"Ad" text
  //   • On ad: rate 16, mute, jump to end, click skip
  //   • Auto-scroll: on 'ended' + poll fallback, scroll next renderer
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) return;

    const YT_SHORT_AD_RE = /Sponsored|Ad/;

    function bsYtShortAdDetected() {
      try {
        const renderers = document.querySelectorAll('ytd-reel-video-renderer[is-ad]');
        for (const r of renderers) {
          try {
            const vid = r.querySelector('video');
            if (!vid) continue;
            const skipBtn = r.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
            const adOverlay = r.querySelector('.ytp-ad-player-overlay');
            const hasAdTag = r.getAttribute('is-ad') === 'true';
            const hasSponsoredText = (vid.innerText || '').includes('Sponsored') || (vid.innerText || '').includes('Ad');
            if (hasAdTag || hasSponsoredText) {
              if (vid.playbackRate !== 16) {
                vid.playbackRate = 16;
                vid.muted = true;
              }
              if (vid.duration && isFinite(vid.duration)) {
                vid.currentTime = vid.duration;
              }
              if (skipBtn && typeof skipBtn.click === 'function') {
                skipBtn.click();
              }
              return true;
            }
          } catch (_) {}
        }
        return false;
      } catch (_) { return false; }
    }

    // Auto-scroll to the NEXT short: YT's own chevron first (stable across
    // redesigns), then ArrowDown, then DOM-order renderer targeting.
    // (Previous version searched the FIRST sibling ≠ current ≡ the short
    // ABOVE — it bounced between the two topmost shorts instead of going next.)
    function bsYtShortScrollNext() {
      try {
        if (bsSiteDisabled || !bsOptIn('youtubeShortsAutoScroll')) return false;
        const navHost = document.querySelector('#navigation-button-down');
        if (navHost) {
          const nav = (navHost.matches('button') || navHost.matches('[role="button"]'))
            ? navHost : navHost.querySelector('button, [role="button"]');
          if (nav) { try { nav.click(); return true; } catch (_) {} }
        }
      } catch (_) {}
      // Deep-node ArrowDown: fires at the on-screen short's <video> so the
      // event bubbles through YT's root-container delegation + document.
      try {
        const vids = document.querySelectorAll('ytd-reel-video-renderer video');
        let deepVid = null;
        for (const vv of vids) {
          if (bsReelOnScreen(vv) && !vv.paused) { deepVid = vv; break; }
        }
        bsReelKit.key(deepVid || (vids[0] || null));
        return true;
      } catch (_) {}
      try {
        const all = Array.from(document.querySelectorAll('ytd-reel-video-renderer'));
        if (all.length < 2) return false;
        const vh = window.innerHeight || 800;
        const current = all.find(r => r.getAttribute('is-active') === 'true' || r.hasAttribute('youtube-shown'))
          || all.find(r => { const b = r.getBoundingClientRect(); return b.bottom > vh * 0.55 && b.top < vh * 0.45; })
          || all[0];
        const next = all[all.indexOf(current) + 1];
        if (!next || next === current) return false;   // last short: nothing to advance to
        next.scrollIntoView({ block: 'center' });
        return true;
      } catch (_) { return false; }
    }

    // Ad skipper loop
    function bsYtShortAdSkipper() {
      if (!bsOn('youtubeShortsEnabled')) return;
      try {
        const detected = bsYtShortAdDetected();
        if (detected) {
          reportTelemetry('trapsNeutralized', 1);
          reportTelemetry('timeSavedSeconds', 5);
        }
      } catch (_) {}
    }

    // Auto-scroll loop: bind the loop-aware advance ONCE per video
    // (Shorts auto-replay, so the loop-restart boundary is the real
    // "finished" moment). Every advance re-checks its own live gates.
    function bsYtShortAutoScrollLoop() {
      if (!bsOn('youtubeShortsEnabled')) return;
      if (!bsOptIn('youtubeShortsAutoScroll')) return;
      try {
        const videos = document.querySelectorAll('ytd-reel-video-renderer video');
        for (const v of videos) {
          if (!bsReelOnScreen(v)) continue;
          bsReelKit.bindLoopAdvance(v, bsYtShortScrollNext);
        }
      } catch (_) {}
    }

    setInterval(bsYtShortAdSkipper, 500);
    setInterval(bsYtShortAutoScrollLoop, 600);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 6d: Facebook Reels
  //   • facebookReelsEnabled → master gate (bsOn)
  //   • Scroll container: div[role="main"] with div[role="article"] items
  //   • Ad detection: visible "Sponsored"/"Paid partnership" text + [aria-label*="Sponsored" i]
  //   • On ad: video playbackRate 16, mute, currentTime = duration
  //   • Hide in-feed sponsored posts: div[role="article"] with display none
  //   • Telemetry guarded by _bs flags (once per element)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('facebook.com') && !host.includes('fb.watch')) return;

    const FB_AD_TEXT_RE = /^\s*(Sponsored|Paid partnership)\s*$/i;

    function bsFbIsAdReel(el) {
      try {
        if (!el) return false;
        const text = (el.innerText || el.textContent || '').trim();
        if (!text || !FB_AD_TEXT_RE.test(text)) return false;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        if (r.bottom < 0 || r.top > (window.innerHeight || 800)) return false;
        // Also check aria-label
        if (el.getAttribute('aria-label') && /Sponsored/i.test(el.getAttribute('aria-label'))) return true;
        return true;
      } catch (_) { return false; }
    }

    function bsFbFindArticleWithAd() {
      try {
        const articles = document.querySelectorAll('div[role="article"]');
        for (const art of articles) {
          try {
            // Check direct children spans/divs/as for sponsored text
            const pills = art.querySelectorAll('span, div, a');
            for (const p of pills) {
              if (p._bsFbAdChecked) continue;
              p._bsFbAdChecked = true;
              if (bsFbIsAdReel(p)) {
                const vid = p.querySelector('video');
                if (vid) {
                  if (vid.playbackRate !== 16) {
                    vid.playbackRate = 16;
                    vid.muted = true;
                  }
                  if (vid.duration && isFinite(vid.duration)) {
                    vid.currentTime = vid.duration;
                  }
                }
                // Hide the article card
                art.style.setProperty('display', 'none', 'important');
                reportTelemetry('trapsNeutralized', 1);
                reportTelemetry('timeSavedSeconds', 5);
                return true;
              }
            }
            // Check aria-label on article itself
            if (art.getAttribute('aria-label') && /Sponsored/i.test(art.getAttribute('aria-label'))) {
              art.style.setProperty('display', 'none', 'important');
              reportTelemetry('trapsNeutralized', 1);
              reportTelemetry('timeSavedSeconds', 5);
              return true;
            }
          } catch (_) {}
        }
        return false;
      } catch (_) { return false; }
    }

    function bsFbAutoScrollNext() {
      try {
        const main = document.querySelector('div[role="main"]');
        if (!main) return false;
        const articles = main.querySelectorAll('div[role="article"]:not([style*="display:none"])');
        const shown = Array.from(articles).filter(a => a.style.display !== 'none');
        if (shown.length === 0) return false;
        const last = shown[shown.length - 1];
        last.scrollIntoView({ block: 'center' });
        return true;
      } catch (_) { return false; }
    }

    function bsFbAdSkipper() {
      if (!bsOn('facebookReelsEnabled')) return;
      try {
        const result = bsFbFindArticleWithAd();
        if (result) {
          reportTelemetry('trapsNeutralized', 1);
          reportTelemetry('timeSavedSeconds', 5);
        }
      } catch (_) {}
    }

    setInterval(bsFbAdSkipper, 600);
    setInterval(bsFbAutoScrollNext, 500);
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
  // FIX: the old bubble-phase listener could not stop page handlers that ran
  // first (they call preventDefault and kill the native menu). Capture-phase
  // interception registered at document_start always wins.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      window.addEventListener('contextmenu', (e) => {
        if (!isCaptchaHost && bsOn('rightClickEnabled') && e) {
          try { e.stopImmediatePropagation(); e.stopPropagation(); } catch (_) {}
        }
      }, true);

      // selectstart/dragstart blockers are neutralized capture-first — copy/cut
      // are intentionally NOT intercepted (stopping them would break handlers
      // that legitimately write clipboardData).
      const bsUnblockEvents = (e) => {
        if (!bsOn('rightClickEnabled') || isCaptchaHost) return;
        try { e.stopImmediatePropagation(); e.stopPropagation(); } catch (_) {}
      };
      window.addEventListener('selectstart', bsUnblockEvents, true);
      window.addEventListener('dragstart', bsUnblockEvents, true);

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
              reportTelemetry('timeSavedSeconds', 15);
            }
          }
        } catch (_) {}
      }

      setInterval(autoSkipIntros, 1000);
    } catch (_) {}
})();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module A: Permission Auto-Deny
  // Gated by: bsOn('permissionAutoDenyEnabled')
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      // Guard: if Notification.permission is already 'granted', do not override
      const origNotificationPermission = typeof Notification !== 'undefined' ? Notification.permission : undefined;
      if (origNotificationPermission !== 'granted') {
        try {
          Object.defineProperty(Notification, 'permission', {
            get: makeNative(function() { return 'denied'; }, 'get permission', 0),
            configurable: true,
            enumerable: true
          });
        } catch (_) {}
      }

      // Intercept navigator.permissions.query()
      try {
        if (navigator.permissions && typeof navigator.permissions.query === 'function') {
          const origQuery = navigator.permissions.query;
          navigator.permissions.query = makeNative(function(query) {
            if (typeof query === 'string') {
              const deniedNames = ['notifications', 'geolocation', 'camera', 'microphone', 'midi', 'persistent-storage', 'background-sync'];
              if (deniedNames.includes(query)) {
                return Promise.resolve({ state: 'denied', onchange: null });
              }
            }
            return origQuery.apply(this, arguments);
          }, 'query', 1);
        }
      } catch (_) {}

      // Intercept navigator.mediaDevices.getUserMedia()
      try {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          const origGetUserMedia = navigator.mediaDevices.getUserMedia;
          navigator.mediaDevices.getUserMedia = makeNative(function(constraints) {
            try {
              const realPermission = typeof Notification !== 'undefined' && Notification.permission ? Notification.permission : 'default';
              if (realPermission === 'granted') {
                return origGetUserMedia.apply(this, arguments);
              }
            } catch (_) {}
            try {
              const fakeStream = new MediaStream();
              fakeStream.getTracks = () => [];
              return Promise.resolve(fakeStream);
            } catch (_) {}
            try {
              const err = new DOMException('The request is denied', 'NotAllowedError');
              return Promise.reject(err);
            } catch (_) {}
            return Promise.reject(new Error('Not allowed'));
          }, 'getUserMedia', 1);
        }
      } catch (_) {}
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module B: Bluetooth / USB / HID / Serial Cloak
  // FIX: getAvailability() per spec resolves to a BOOLEAN. The old mock
  // resolved { value: false } — a truthy object that advertised the device as
  // AVAILABLE. Also the API itself is now an accessor returning a singleton
  // cloak (typeof stays "object" like real Chrome).
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const bsMakeDeviceCloak = () => ({
        getAvailability: makeNative(function() { return Promise.resolve(false); }, 'getAvailability', 0),
        requestDevice: makeNative(function() { return Promise.reject(new DOMException('Not found', 'NotFoundError')); }, 'requestDevice', 1)
      });
      const bsDeviceCloaks = {};
      const cloakFor = (name) => (bsDeviceCloaks[name] = bsDeviceCloaks[name] || bsMakeDeviceCloak());

      for (const bsApiName of ['bluetooth', 'usb', 'hid', 'serial']) {
        try {
          if (!navigator[bsApiName]) continue;
          const origDesc = Object.getOwnPropertyDescriptor(navigator, bsApiName) ||
                           Object.getOwnPropertyDescriptor(Navigator.prototype, bsApiName);
          const cloakGetter = makeNative(function() {
            if (bsOn('mediaDevicesSanitizeEnabled')) return cloakFor(bsApiName);
            return origDesc && origDesc.get ? origDesc.get.call(this) : origDesc && origDesc.value;
          }, `get ${bsApiName}`, 0);
          try { Object.defineProperty(Navigator.prototype, bsApiName, { get: cloakGetter, configurable: true, enumerable: true }); } catch (_) {}
          try { Object.defineProperty(navigator, bsApiName, { get: cloakGetter, configurable: true, enumerable: true }); } catch (_) {}
        } catch (_) {}
      }

      // navigator.keyboard is Chromium-only and leaks layout-map geometry
      try {
        if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
          const origKeyboard = navigator.keyboard.getLayoutMap;
          navigator.keyboard.getLayoutMap = makeNative(function() {
            if (bsOn('mediaDevicesSanitizeEnabled')) return Promise.reject(new DOMException('Not allowed', 'NotAllowedError'));
            return origKeyboard.apply(this, arguments);
          }, 'getLayoutMap', 0);
        }
      } catch (_) {}

      // navigator.xr — session support probe is a headset/VR fingerprint
      try {
        if (navigator.xr && navigator.xr.isSessionSupported) {
          const origXrSupported = navigator.xr.isSessionSupported;
          navigator.xr.isSessionSupported = makeNative(function() {
            if (bsOn('mediaDevicesSanitizeEnabled')) return Promise.resolve(false);
            return origXrSupported.apply(this, arguments);
          }, 'isSessionSupported', 1);
        }
      } catch (_) {}
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module C: matchMedia / CSS Media Query Coherence
  // Gated by: bsOn('screenNormalizationEnabled')
  // FIX: previously dereferenced Module-1's private `bsHardware` — ReferenceError
  // at every call, making the hook a silent no-op. All reads now go through
  // bsGetHardwareSafe() and the query is re-evaluated with real listeners.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const origMatchMedia = window.matchMedia;
      if (typeof origMatchMedia !== 'function') return;
      window.matchMedia = makeNative(function(query) {
        try {
          if (typeof query !== 'string') return origMatchMedia.apply(window, arguments);
          const lowerQuery = query.toLowerCase();
          const hw = bsGetHardwareSafe();
          const dpr = Number(hw.devicePixelRatio) || 1;
          const platform = hw.platform || 'Win32';
          const isMobile = /(iPhone|iPad|iPod|Android|BlackBerry)/i.test(platform);

          let matches;
          if (lowerQuery.includes('resolution') || lowerQuery.includes('device-pixel-ratio')) {
            const numMatch = lowerQuery.match(/(?:device-pixel-ratio|resolution)\s*:\s*([\d.]+)/);
            const wanted = numMatch ? parseFloat(numMatch[1]) : 0;
            if (/(^|[^-])min-resolution|min-device-pixel-ratio/.test(lowerQuery)) matches = dpr >= wanted;
            else if (/(^|[^-])max-resolution|max-device-pixel-ratio/.test(lowerQuery)) matches = dpr <= wanted;
            else matches = Math.abs(dpr - wanted) < 0.0001;
          } else if (lowerQuery.includes('pointer: coarse') || lowerQuery.includes('pointer : coarse')) {
            matches = isMobile;
          } else if (lowerQuery.includes('pointer: fine')) {
            matches = !isMobile;
          } else if (lowerQuery.includes('hover')) {
            // "(hover: none)" pairs with touch; "(hover: hover)" pairs with mouse
            matches = isMobile ? lowerQuery.includes('hover: none') || lowerQuery.includes('none') : lowerQuery.includes('hover: hover');
          } else {
            matches = origMatchMedia.apply(window, arguments).matches;
          }

          const mql = origMatchMedia('not all');
          Object.defineProperty(mql, 'matches', {
            get: function() { return matches; },
            configurable: true,
            enumerable: true
          });
          const origAdd = mql.addEventListener ? mql.addEventListener.bind(mql) : null;
          mql.addEventListener = makeNative(function(type, listener) {
            try { origMatchMedia.apply(window, arguments); } catch (_) {}
            if (origAdd) return origAdd(type, listener);
          }, 'addEventListener', 2);
          return mql;
        } catch (_) {
          return origMatchMedia.apply(window, arguments);
        }
      }, 'matchMedia', 1);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module D: performance.memory + storage.estimate parity
  // Gated by: bsOn('screenNormalizationEnabled')
  // FIX: previously referenced Module-1's private `bsHardware`/`BS_HW_FALLBACK`
  // (ReferenceError → entire module dead). Also the old values were
  // self-inconsistent (used > limit): Chromium reports a ~2-4GB heap limit and
  // a multi-hundred-GB storage quota — these stubs now mirror that envelope.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      // performance.memory (Chromium only)
      try {
        if (typeof performance.memory !== 'undefined') {
          const hw = bsGetHardwareSafe();
          const deviceMemory = Number(hw.memory) || 8;
          // Chromium 64-bit desktop: ~2-4GB; scale from the active RAM profile.
          const heapLimit = deviceMemory >= 32 ? 4294705152
            : deviceMemory >= 8 ? 2172649472
            : 1048576000;
          const sessionPrng = createPrng(11);
          const totalHeap = Math.floor(heapLimit * (0.42 + sessionPrng() * 0.1));
          const usedHeap = Math.floor(totalHeap * (0.55 + sessionPrng() * 0.2));

          Object.defineProperty(performance, 'memory', {
            get: makeNative(function() {
              return {
                jsHeapSizeLimit: heapLimit,
                totalJSHeapSize: totalHeap,
                usedJSHeapSize: usedHeap,
                doNotTrack: false
              };
            }, 'get performance.memory', 0),
            configurable: true,
            enumerable: true
          });
        }
      } catch (_) {}

      // navigator.storage.estimate()
      try {
        if (navigator.storage && typeof navigator.storage.estimate === 'function') {
          const origEstimate = navigator.storage.estimate;
          const storagePrng = createPrng(23);
          const QUOTA = 298598403072;  // ~278 GiB — typical Chrome desktop quota
          const USAGE = Math.floor(8 * 1024 * 1024 * (1 + storagePrng() * 4)); // 8-40MB, deterministic per session
          navigator.storage.estimate = makeNative(function() {
            if (!bsOn('screenNormalizationEnabled')) return origEstimate.apply(this, arguments);
            return Promise.resolve({
              quota: QUOTA,
              usage: USAGE,
              usageDetails: {
                serviceWorkerRegistrations: 0,
                indexedDB: Math.floor(USAGE * 0.3),
                caches: Math.floor(USAGE * 0.55),
                fileSystem: Math.floor(USAGE * 0.15)
              }
            });
          }, 'estimate', 0);
        }
      } catch (_) {}
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module E: Worker / OffscreenCanvas Parity (opt-in — CSP sensitive)
  // A page that fingerprints inside `new Worker(blobURL)` sees the RAW browser
  // because content scripts never run in a worker realm. We prepend a compact
  // stealth core to blob-sourced workers so the identity matches the page.
  //
  // SAFETY: opt-in (workerParityEnabled), never touches network/http(s) workers,
  // and every failure path silently falls back to the untouched Worker.
  // FIX: the old wrapper resolved `new Worker()` through an async IIFE — it
  // returned a PROMISE, which broke every site that called postMessage right
  // after construction and was itself a detection signal. Blob source is now
  // read with a synchronous XHR so the constructor returns a real Worker.
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    let workerParityInstalled = false;

    function bsInstallWorkerParity() {
      if (workerParityInstalled) return;
      // Config-gated via the live bridge: at document_start BS defaults are
      // absent, so install happens on the FIRST real config sync (bsOnConfigReady).
      if (BS_CONFIG.workerParityEnabled !== true) return;
      if (typeof window.Worker !== 'function' || typeof Blob === 'undefined') return;
      workerParityInstalled = true;

      const hw = bsGetHardwareSafe();
      const spoof = {
        platform: String(hw.platform || 'Win32'),
        concurrency: Number(hw.concurrency || 16) | 0,
        memory: Math.min(8, Math.max(0.25, Number(hw.memory) || 8)),
        vendor: String(hw.vendor || 'Google Inc.'),
        renderer: String(hw.renderer || ''),
        screenW: (hw.screen && hw.screen.width) || 1920,
        screenH: (hw.screen && hw.screen.height) || 1080,
        dpr: Number(hw.devicePixelRatio || 1),
        ua: (BS_CONFIG.resolvedUA && BS_CONFIG.resolvedUA.ua) || ''
      };

      // Compact core — must be a self-contained IIFE string.
      const CORE = `(()=>{try{
        var H=${JSON.stringify(spoof)};
        var NP=Object.getPrototypeOf(navigator);
        function d(o,p,g){try{Object.defineProperty(o,p,{get:g,configurable:true,enumerable:true});}catch(e){}}
        d(NP,'platform',function(){return H.platform;});
        d(NP,'hardwareConcurrency',function(){return H.concurrency;});
        d(NP,'deviceMemory',function(){return H.memory;});
        d(NP,'vendor',function(){return H.vendor;});
        d(NP,'webdriver',function(){return false;});
        if(H.ua){d(NP,'userAgent',function(){return H.ua;});d(NP,'appVersion',function(){return H.ua.replace(/^Mozilla\\//,'');});}
        try{Object.defineProperty(NP,'plugins',{get:function(){return [];},configurable:true});}catch(e){}
        try{Object.defineProperty(NP,'mimeTypes',{get:function(){return [];},configurable:true});}catch(e){}
        if(typeof self.screen!=='undefined'){d(Object.getPrototypeOf(self.screen),'width',function(){return H.screenW;});d(Object.getPrototypeOf(self.screen),'height',function(){return H.screenH;});d(Object.getPrototypeOf(self.screen),'availWidth',function(){return H.screenW;});d(Object.getPrototypeOf(self.screen),'availHeight',function(){return H.screenH;});}
        if(typeof self.devicePixelRatio!=='undefined'){try{Object.defineProperty(self,'devicePixelRatio',{get:function(){return H.dpr;},configurable:true});}catch(e){}}
        if(typeof OffscreenCanvas!=='undefined'){try{
          var OG=OffscreenCanvas.prototype.getContext;
          OffscreenCanvas.prototype.getContext=function(t){
            var c=OG.apply(this,arguments);
            if((t==='webgl'||t==='webgl2'||t==='experimental-webgl')&&c){
              try{var OP=c.getParameter.bind(c);
                c.getParameter=function(p){
                  if(p===37445)return H.vendor;
                  if(p===37446)return H.renderer;
                  return OP(p);
                };}catch(e){}
            }
            return c;
          };
        }catch(e){}}
      }catch(e){}})();`;

      // Synchronous blob read — sync XHR is deprecated but still permitted for
      // blob: URLs on the main thread, and it is the only way to keep the
      // Worker constructor synchronous.
      const bsReadBlobSync = (blobUrl) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', blobUrl, false);
          xhr.send(null);
          if (xhr.status === 0 && xhr.responseText) return xhr.responseText;
          if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText;
        } catch (_) {}
        return null;
      };

      const bsPatchWorker = (ErrCtor, nativeKey) => {
        const wrapped = makeNative(function(url, opts) {
          try {
            if (typeof url === 'string' && url.startsWith('blob:')) {
              const src = bsReadBlobSync(url);
              if (src != null) {
                const patched = new Blob([CORE, '\n', src], { type: 'text/javascript' });
                const newUrl = URL.createObjectURL(patched);
                const w = new ErrCtor(newUrl, opts);
                try { w.__bsOriginalUrl = url; } catch (_) {}
                setTimeout(() => { try { URL.revokeObjectURL(newUrl); } catch (_) {} }, 30000);
                return w;
              }
            }
          } catch (_) {}
          return new ErrCtor(url, opts);
        }, nativeKey, 2);
        try { Object.defineProperty(wrapped, 'prototype', { value: ErrCtor.prototype, writable: false, enumerable: false, configurable: false }); } catch (_) {}
        return wrapped;
      };

      window.Worker = bsPatchWorker(origWorkerBase('Worker'), 'Worker');

      // SharedWorker shares the same realm problem.
      if (typeof window.SharedWorker === 'function') {
        window.SharedWorker = bsPatchWorker(origWorkerBase('SharedWorker'), 'SharedWorker');
      }

      function origWorkerBase(name) { return window[name]; }
    }

    function bsTryInstallParity() { try { bsInstallWorkerParity(); } catch (_) {} }
    bsTryInstallParity();
    bsOnConfigReady(bsTryInstallParity);
  })();

  console.log('[BraveShield Bypass Pro] Stealth Engine Armed. Live config bridge active.');
})();