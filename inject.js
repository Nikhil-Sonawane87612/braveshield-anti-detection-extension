/**
 * BraveShield Bypass Pro — Enterprise Stealth & Anti-Fingerprinting Engine
 * Version: 6.0.0 (CreepJS & BrowserLeaks Hardening Pack)
 * Execution World: MAIN (True document_start)
 * Purpose: Complete Google Chrome & Multi-Device Profile parity, deep Brave cloaking,
 *          Unforgeable native function proxies, Reflect.apply/construct transparency,
 *          Error stack extension path masking, High-res timer coarsening (Spectre defense),
 *          Screen geometry normalization, Session-seeded mathematical canvas/audio noise,
 *          WebGL/WebGPU masking, Client Hints (UA-CH) sync, DOM measurement jitter,
 *          Media device & Speech synthesis sanitization, Instant URL Unshortener,
 *          Paywall/Blur Defuser, Live Telemetry, 100% Captcha passing.
 */

(() => {
  'use strict';

  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';

  // ─────────────────────────────────────────────────────────────────────────────
  // ZERO-TOUCH PASSTHROUGH FOR ALL INDUSTRY CAPTCHA PROVIDERS & INTERSTITIALS
  // ─────────────────────────────────────────────────────────────────────────────
  const isCaptchaHost = (
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
  );

  function isCloudflareInterstitial() {
    return isCaptchaHost;
  }

  // If inside ANY Captcha iframe or security challenge interstitial, exit immediately with 100% zero-touch!
  if (isCaptchaHost) {
    return;
  }

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
      if (!isCaptchaHost && url && typeof url === 'string') {
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
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (typeof navigator === 'undefined') return;

      // 1. Completely neutralize navigator.brave on Prototype & Instance
      try {
        Object.defineProperty(Navigator.prototype, 'brave', {
          get: () => undefined,
          set: () => {},
          configurable: true,
          enumerable: false
        });
      } catch (_) {}

      try {
        Object.defineProperty(navigator, 'brave', {
          get: () => undefined,
          set: () => {},
          configurable: true,
          enumerable: false
        });
      } catch (_) {}

      delete Navigator.prototype.brave;
      delete navigator.brave;
      if (navigator.__proto__) {
        try {
          delete navigator.__proto__.brave;
          navigator.__proto__.brave = undefined;
        } catch (_) {}
      }

      // 2. Remove Web3 Brave Wallet and Solana detectors
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
          window.ethereum.isMetaMask = true;
        } catch (_) {}
      }

      if (window.solana) {
        try {
          delete window.solana.isBraveWallet;
          window.solana.isBraveWallet = false;
        } catch (_) {}
      }

      // 3. Prototype-level webdriver (Safe for Cloudflare Turnstile)
      try {
        Object.defineProperty(Navigator.prototype, 'webdriver', {
          get: () => false,
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      // 4. Comprehensive Hardware Profile & Custom Hardware Engine (110+ Presets)
      let activeHw = {
        platform: 'Win32',
        vendor: 'Google Inc. (NVIDIA)',
        renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        concurrency: 32,
        memory: 64,
        devicePixelRatio: 1,
        screen: { width: 3840, height: 2160, colorDepth: 24 }
      };

      try {
        const customJson = sessionStorage.getItem('bs_custom_hardware');
        const selectedId = sessionStorage.getItem('bs_device_profile') || 'win-rtx4090';

        if (selectedId === 'custom' && customJson) {
          const custom = JSON.parse(customJson);
          activeHw = {
            platform: custom.platform || 'Win32',
            vendor: custom.vendor || 'Google Inc. (NVIDIA)',
            renderer: custom.renderer || 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
            concurrency: parseInt(custom.concurrency, 10) || 16,
            memory: parseInt(custom.memory, 10) || 32,
            devicePixelRatio: parseFloat(custom.devicePixelRatio) || 1,
            screen: custom.screen || { width: 2560, height: 1440, colorDepth: 24 }
          };
        } else if (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') {
          const matched = HARDWARE_PROFILES_CATALOG.find(p => p.id === selectedId);
          if (matched) {
            activeHw = {
              platform: matched.platform,
              vendor: matched.vendor,
              renderer: matched.renderer,
              concurrency: matched.concurrency,
              memory: matched.memory,
              devicePixelRatio: matched.devicePixelRatio,
              screen: matched.screen
            };
          }
        }
      } catch (_) {}

      // Apply Platform Spoofing
      try { Object.defineProperty(Navigator.prototype, 'platform', { get: () => activeHw.platform, configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'platform', { get: () => activeHw.platform, configurable: true }); } catch (_) {}

      // Apply CPU Hardware Concurrency
      try { Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => activeHw.concurrency || 16, configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => activeHw.concurrency || 16, configurable: true }); } catch (_) {}

      // Apply Device Memory (RAM)
      try { Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => activeHw.memory || 32, configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'deviceMemory', { get: () => activeHw.memory || 32, configurable: true }); } catch (_) {}

      // Apply Screen & Monitor Geometry Normalization
      const activeScreen = activeHw.screen || { width: 1920, height: 1080, colorDepth: 24 };
      const screenProps = {
        width: activeScreen.width,
        height: activeScreen.height,
        availWidth: activeScreen.width,
        availHeight: Math.max(600, activeScreen.height - 40),
        colorDepth: activeScreen.colorDepth || 24,
        pixelDepth: activeScreen.colorDepth || 24,
        availLeft: 0,
        availTop: 0
      };

      for (const [k, v] of Object.entries(screenProps)) {
        try {
          if (typeof Screen !== 'undefined' && Screen.prototype) {
            Object.defineProperty(Screen.prototype, k, { get: makeNative(() => v, `get ${k}`, 0), configurable: true, enumerable: true });
          }
        } catch (_) {}
        try {
          if (window.screen) {
            Object.defineProperty(window.screen, k, { get: makeNative(() => v, `get ${k}`, 0), configurable: true, enumerable: true });
          }
        } catch (_) {}
      }

      try {
        Object.defineProperty(window, 'devicePixelRatio', {
          get: makeNative(() => activeHw.devicePixelRatio || 1, 'get devicePixelRatio', 0),
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      try {
        Object.defineProperty(window, 'outerWidth', {
          get: makeNative(() => activeScreen.width, 'get outerWidth', 0),
          configurable: true,
          enumerable: true
        });
        Object.defineProperty(window, 'outerHeight', {
          get: makeNative(() => activeScreen.height, 'get outerHeight', 0),
          configurable: true,
          enumerable: true
        });
      } catch (_) {}

      // Apply WebGL Hardware Vendor & GPU Renderer Spoofing
      if (sessionStorage.getItem('bs_webgl_disabled') !== 'true') {
        const hookWebGL = (proto) => {
          if (!proto || !proto.getParameter) return;
          const origGetParameter = proto.getParameter;
          proto.getParameter = makeNative(function(pname) {
            if (!isCaptchaHost) {
              if (pname === 0x9245) return activeHw.vendor; // UNMASKED_VENDOR_WEBGL
              if (pname === 0x9246) return activeHw.renderer; // UNMASKED_RENDERER_WEBGL
              if (pname === 0x1F00) return 'WebKit'; // VENDOR
              if (pname === 0x1F01) return 'WebKit WebGL'; // RENDERER
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
      }

      // 5. Client Hints (UA-CH) Consistency on NavigatorUAData Prototype
      if (sessionStorage.getItem('bs_hints_disabled') !== 'true') {
        if (typeof NavigatorUAData !== 'undefined' && NavigatorUAData.prototype) {
          try {
            const origBrands = Object.getOwnPropertyDescriptor(NavigatorUAData.prototype, 'brands');
            if (origBrands && origBrands.get) {
              Object.defineProperty(NavigatorUAData.prototype, 'brands', {
                get: function() {
                  const brands = origBrands.get.call(this) || [];
                  return brands.map(b => (b.brand === 'Brave' ? { brand: 'Google Chrome', version: b.version } : b));
                },
                configurable: true,
                enumerable: true
              });
            }

            const targetPlatform = (activeHw.platform.includes('Win') ? 'Windows' : (activeHw.platform.includes('Mac') ? 'macOS' : (activeHw.platform.includes('Android') || activeHw.platform.includes('arm') ? 'Android' : 'Linux')));
            Object.defineProperty(NavigatorUAData.prototype, 'platform', {
              get: () => targetPlatform,
              configurable: true,
              enumerable: true
            });

            if (NavigatorUAData.prototype.getHighEntropyValues) {
              const origHighEntropy = NavigatorUAData.prototype.getHighEntropyValues;
              NavigatorUAData.prototype.getHighEntropyValues = makeNative(function(hints) {
                return origHighEntropy.apply(this, arguments).then(res => {
                  if (res) {
                    res.platform = targetPlatform;
                    res.architecture = activeHw.platform.includes('arm') ? 'arm' : 'x86';
                    res.bitness = '64';
                    res.model = '';
                    res.wow64 = false;
                    if (Array.isArray(res.brands)) {
                      res.brands = res.brands.map(b => (b.brand === 'Brave' ? { brand: 'Google Chrome', version: b.version } : b));
                    }
                    if (Array.isArray(res.fullVersionList)) {
                      res.fullVersionList = res.fullVersionList.map(b => (b.brand === 'Brave' ? { brand: 'Google Chrome', version: b.version } : b));
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

      // 7. Battery & Network Information Cloaking
      if (sessionStorage.getItem('bs_battery_disabled') !== 'true') {
        try {
          if (navigator.getBattery) {
            const mockBattery = {
              charging: true,
              chargingTime: 0,
              dischargingTime: Infinity,
              level: 1.0,
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true
            };
            navigator.getBattery = makeNative(() => Promise.resolve(mockBattery), 'getBattery', 0);
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
            try { Object.defineProperty(Navigator.prototype, 'connection', { get: () => mockConnection, configurable: true }); } catch (_) {}
            try { Object.defineProperty(navigator, 'connection', { get: () => mockConnection, configurable: true }); } catch (_) {}
          }
        } catch (_) {}
      }

      // 8. High-Precision Audio Noise (Non-Destructive Mathematical Variance)
      if (sessionStorage.getItem('bs_audio_disabled') !== 'true') {
        try {
          if (typeof AudioBuffer !== 'undefined' && AudioBuffer.prototype.getChannelData) {
            const origGetChannelData = AudioBuffer.prototype.getChannelData;
            AudioBuffer.prototype.getChannelData = makeNative(function(channel) {
              const data = origGetChannelData.apply(this, arguments);
              if (!isCaptchaHost && data && data.length > 10) {
                const audioPrng = createPrng(channel + 7);
                for (let i = 0; i < Math.min(data.length, 128); i += 4) {
                  data[i] += (audioPrng() - 0.5) * 2e-7;
                }
              }
              return data;
            }, 'getChannelData', 1);

            if (AudioBuffer.prototype.copyFromChannel) {
              const origCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
              AudioBuffer.prototype.copyFromChannel = makeNative(function(dest, channelNumber, startInChannel) {
                origCopyFromChannel.apply(this, arguments);
                if (!isCaptchaHost && dest && dest.length > 10) {
                  const audioPrng = createPrng(channelNumber + 13);
                  for (let i = 0; i < Math.min(dest.length, 128); i += 4) {
                    dest[i] += (audioPrng() - 0.5) * 2e-7;
                  }
                }
              }, 'copyFromChannel', 2);
            }
          }

          if (typeof AnalyserNode !== 'undefined' && AnalyserNode.prototype.getFloatFrequencyData) {
            const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
            AnalyserNode.prototype.getFloatFrequencyData = makeNative(function(array) {
              origGetFloatFreq.apply(this, arguments);
              if (!isCaptchaHost && array && array.length > 0) {
                const audioPrng = createPrng(29);
                for (let i = 0; i < Math.min(array.length, 32); i++) {
                  array[i] += (audioPrng() - 0.5) * 2e-7;
                }
              }
            }, 'getFloatFrequencyData', 1);

            if (AnalyserNode.prototype.getByteFrequencyData) {
              const origGetByteFreq = AnalyserNode.prototype.getByteFrequencyData;
              AnalyserNode.prototype.getByteFrequencyData = makeNative(function(array) {
                origGetByteFreq.apply(this, arguments);
                if (!isCaptchaHost && array && array.length > 0) {
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
                if (!isCaptchaHost && audioBuffer && audioBuffer.numberOfChannels) {
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
      }

      // 9. Session-Seeded Non-Destructive Canvas Spoofing (±1 RGB Bit Shifts)
      if (sessionStorage.getItem('bs_canvas_disabled') !== 'true') {
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

          if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.getImageData) {
            const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = makeNative(function(sx, sy, sw, sh) {
              const imgData = origGetImageData.apply(this, arguments);
              if (!isCaptchaHost) {
                applyCanvasNoise(imgData);
              }
              return imgData;
            }, 'getImageData', 4);
          }

          if (typeof HTMLCanvasElement !== 'undefined') {
            if (HTMLCanvasElement.prototype.toDataURL) {
              const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
              HTMLCanvasElement.prototype.toDataURL = makeNative(function() {
                if (!isCaptchaHost && this.width > 0 && this.height > 0 && this.width <= 512 && this.height <= 512) {
                  try {
                    const ctx = this.getContext('2d');
                    if (ctx) {
                      const img = ctx.getImageData(0, 0, this.width, this.height);
                      applyCanvasNoise(img);
                      ctx.putImageData(img, 0, 0);
                    }
                  } catch (_) {}
                }
                return origToDataURL.apply(this, arguments);
              }, 'toDataURL', 0);
            }

            if (HTMLCanvasElement.prototype.toBlob) {
              const origToBlob = HTMLCanvasElement.prototype.toBlob;
              HTMLCanvasElement.prototype.toBlob = makeNative(function(callback, type, quality) {
                if (!isCaptchaHost && this.width > 0 && this.height > 0 && this.width <= 512 && this.height <= 512) {
                  try {
                    const ctx = this.getContext('2d');
                    if (ctx) {
                      const img = ctx.getImageData(0, 0, this.width, this.height);
                      applyCanvasNoise(img);
                      ctx.putImageData(img, 0, 0);
                    }
                  } catch (_) {}
                }
                return origToBlob.apply(this, arguments);
              }, 'toBlob', 1);
            }
          }
        } catch (_) {}
      }

      // 10. WebRTC Local IP Leak Protection
      if (sessionStorage.getItem('bs_webrtc_disabled') !== 'true') {
        try {
          if (typeof RTCPeerConnection !== 'undefined') {
            const filterSdp = (sdp) => {
              if (typeof sdp !== 'string') return sdp;
              return sdp.replace(/(\r\n|\n)?a=candidate:.*?(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|\.local).*/gi, '');
            };

            const origCreateOffer = RTCPeerConnection.prototype.createOffer;
            RTCPeerConnection.prototype.createOffer = makeNative(function(options) {
              return origCreateOffer.apply(this, arguments).then(offer => {
                if (offer && offer.sdp) {
                  offer.sdp = filterSdp(offer.sdp);
                }
                return offer;
              });
            }, 'createOffer', 0);

            if (RTCPeerConnection.prototype.createAnswer) {
              const origCreateAnswer = RTCPeerConnection.prototype.createAnswer;
              RTCPeerConnection.prototype.createAnswer = makeNative(function(options) {
                return origCreateAnswer.apply(this, arguments).then(answer => {
                  if (answer && answer.sdp) {
                    answer.sdp = filterSdp(answer.sdp);
                  }
                  return answer;
                });
              }, 'createAnswer', 0);
            }

            if (RTCPeerConnection.prototype.setLocalDescription) {
              const origSetLocalDesc = RTCPeerConnection.prototype.setLocalDescription;
              RTCPeerConnection.prototype.setLocalDescription = makeNative(function(desc) {
                if (desc && desc.sdp) {
                  desc.sdp = filterSdp(desc.sdp);
                }
                return origSetLocalDesc.apply(this, arguments);
              }, 'setLocalDescription', 1);
            }
          }
        } catch (_) {}
      }

      // 11. DOM Measurement Micro-Jitter (Defeats Sub-Pixel Font Fingerprinting)
      if (sessionStorage.getItem('bs_domjitter_disabled') !== 'true') {
        try {
          if (typeof Element !== 'undefined' && Element.prototype.getBoundingClientRect) {
            const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
            Element.prototype.getBoundingClientRect = makeNative(function() {
              const rect = origGetBoundingClientRect.apply(this, arguments);
              if (!isCaptchaHost && rect) {
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

          if (typeof Element !== 'undefined' && Element.prototype.getClientRects) {
            const origGetClientRects = Element.prototype.getClientRects;
            Element.prototype.getClientRects = makeNative(function() {
              const rects = origGetClientRects.apply(this, arguments);
              return rects;
            }, 'getClientRects', 0);
          }
        } catch (_) {}
      }

      // 12. High-Resolution Timer Coarsening (Spectre, Date & Cache-Timing Protection)
      if (sessionStorage.getItem('bs_timercoarse_disabled') !== 'true') {
        try {
          if (typeof performance !== 'undefined' && performance.now) {
            const origNow = performance.now;
            performance.now = makeNative(function() {
              const t = origNow.apply(performance, arguments);
              // Coarsen resolution to nearest 20ms to destroy CPU cache benchmarking
              return Math.floor(t / 20) * 20;
            }, 'now', 0);
          }

          const origDateNow = Date.now;
          Date.now = makeNative(function() {
            const d = origDateNow.apply(Date, arguments);
            return Math.floor(d / 20) * 20;
          }, 'now', 0);

          if (typeof Event !== 'undefined' && Event.prototype) {
            const origTimeStamp = Object.getOwnPropertyDescriptor(Event.prototype, 'timeStamp');
            if (origTimeStamp && origTimeStamp.get) {
              Object.defineProperty(Event.prototype, 'timeStamp', {
                get: makeNative(function() {
                  const ts = origTimeStamp.get.call(this);
                  return Math.floor(ts / 20) * 20;
                }, 'get timeStamp', 0),
                configurable: true,
                enumerable: true
              });
            }
          }
        } catch (_) {}
      }

      // 13. Media Devices & Speech Synthesis Sanitization
      if (sessionStorage.getItem('bs_mediadevices_disabled') !== 'true') {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            const mockDevices = [
              { deviceId: 'default', kind: 'audioinput', label: 'Default Audio Device', groupId: 'group_default' },
              { deviceId: 'default', kind: 'audiooutput', label: 'Default Speaker', groupId: 'group_default' },
              { deviceId: 'default', kind: 'videoinput', label: 'Integrated HD Camera', groupId: 'group_default' }
            ];
            navigator.mediaDevices.enumerateDevices = makeNative(() => Promise.resolve(mockDevices), 'enumerateDevices', 0);
          }
        } catch (_) {}
      }

      if (sessionStorage.getItem('bs_speechvoices_disabled') !== 'true') {
        try {
          if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.getVoices) {
            const mockVoices = [
              { voiceURI: 'Google US English', name: 'Google US English', lang: 'en-US', localService: false, default: true },
              { voiceURI: 'Google UK English Female', name: 'Google UK English Female', lang: 'en-GB', localService: false, default: false },
              { voiceURI: 'Google UK English Male', name: 'Google UK English Male', lang: 'en-GB', localService: false, default: false }
            ];
            window.speechSynthesis.getVoices = makeNative(() => mockVoices, 'getVoices', 0);
          }
        } catch (_) {}
      }

    } catch (_) {}
  })();

  // If this is an active Cloudflare interstitial challenge page, exit now to avoid interrupting verification!
  if (isCloudflareInterstitial()) {
    return;
  }

  const isMediaPlatform = host.includes('spotify.com') || host.includes('youtube.com') || host.includes('youtu.be') || host.includes('netflix.com') || host.includes('twitch.tv') || host.includes('reddit.com');

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. Master Kill Switch & Telemetry Initialization
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    if (sessionStorage.getItem('bs_master_disabled') === 'true') {
      console.log('[BraveShield] Disabled via Master Kill Switch.');
      window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'bs-sync-state' && e.data.enabled) {
          window.location.reload();
        }
      });
      return;
    }
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 2: Feature A — Instant URL Unshortener & Direct Link Resolvers
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (sessionStorage.getItem('bs_unshortener_disabled') === 'true') return;

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
  // Module 3: 50x Safe Countdown Acceleration & Fast-Pass Buttons
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (sessionStorage.getItem('bs_timers_disabled') === 'true') return;
    if (isMediaPlatform) return;

    try {
      const origSetTimeout = window.setTimeout;
      const origSetInterval = window.setInterval;

      window.setTimeout = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && typeof delay === 'number' && delay > 100 && delay < 120000) {
          const fastDelay = Math.max(10, Math.floor(delay / 50));
          return origSetTimeout.call(this, fn, fastDelay, ...args);
        }
        return origSetTimeout.apply(this, arguments);
      }, 'setTimeout', 2);

      window.setInterval = makeNative(function(fn, delay, ...args) {
        if (!isCaptchaHost && typeof delay === 'number' && delay >= 1000 && delay < 60000) {
          const fastDelay = Math.max(50, Math.floor(delay / 50));
          return origSetInterval.call(this, fn, fastDelay, ...args);
        }
        return origSetInterval.apply(this, arguments);
      }, 'setInterval', 2);
    } catch (_) {}

    function purgeInvisibleClickBlockers() {
      try {
        if (isCaptchaHost) return;
        const vw = window.innerWidth || document.documentElement.clientWidth || 800;
        const vh = window.innerHeight || document.documentElement.clientHeight || 600;
        const candidates = document.querySelectorAll('div, a, span, section, iframe');

        candidates.forEach(el => {
          if (!el || el._bsOverlayNeutralized) return;
          if (el === document.body || el === document.documentElement || el.id?.startsWith('bs-')) return;

          const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
          if (!style) return;

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
              el._bsOverlayNeutralized = true;
              el.style.setProperty('display', 'none', 'important');
              el.style.setProperty('pointer-events', 'none', 'important');
              el.style.setProperty('z-index', '-9999', 'important');
              if (el.tagName === 'A' && el.parentNode) {
                el.remove();
              }
              reportTelemetry('trapsNeutralized', 1);
            }
          }
        });
      } catch (_) {}
    }

    function fastPassButtons() {
      try {
        const btnSelectors = [
          'button', 'a.btn', 'a[class*="download"]', 'a[class*="button"]', 'div[class*="download"]',
          'a[href*="download"]', 'a[href*="server"]', 'a[href*="drive"]', 'a[href*="mega"]',
          '#download-btn', '#btn-main', '#get-link', '.btn-download', '.download-now',
          '.get-link', '.download_link', '[id*="download"]', '[class*="download"]',
          '.download-box a', '.download-box button', 'a[onclick*="download"]',
          '#btn-main', '#download-btn', '#get-link', '#continue-btn', '#btn-download', '#submit-btn', '#final-link'
        ];

        const nodes = document.querySelectorAll(btnSelectors.join(', '));
        nodes.forEach(el => {
          if (!el) return;
          const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
          const isDownloadTarget = txt.includes('download') || txt.includes('server') || txt.includes('get link') || txt.includes('continue') || txt.includes('tutorial') || txt.includes('watch') || txt.includes('final');

          if (isDownloadTarget || el.classList.contains('btn') || el.id?.includes('download') || el.className?.includes('download') || el.className?.includes('server')) {
            if (el.disabled) {
              el.disabled = false;
              el.removeAttribute('disabled');
            }
            if (el.getAttribute('aria-disabled') === 'true') {
              el.removeAttribute('aria-disabled');
            }
            if (el.classList.contains('disabled')) {
              el.classList.remove('disabled');
            }

            el.style.setProperty('pointer-events', 'auto', 'important');
            el.style.setProperty('cursor', 'pointer', 'important');
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('position', 'relative', 'important');
            el.style.setProperty('z-index', '9999', 'important');
          }
        });
      } catch (_) {}
    }

    setInterval(purgeInvisibleClickBlockers, 800);
    setInterval(fastPassButtons, 500);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 4: Feature B — Universal Paywall & Blur Defuser
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (sessionStorage.getItem('bs_paywall_disabled') === 'true') return;

    const PAYWALL_PATTERNS = [
      '.paywall', '.modal-backdrop', '.blur-overlay',
      '.tp-backdrop', '.tp-modal', '#gateway-content',
      '.fc-ab-root', '.adblock-overlay', '.gate-overlay',
      'div[id*="paywall"]', 'div[class*="paywall"]',
      'div[class*="gate_overlay"]', 'div[class*="blurred_answer"]'
    ];

    function defusePaywallAndBlur() {
      try {
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
  // Module 5: Feature C — AdBlock Trap Defuser
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (sessionStorage.getItem('bs_adblock_disabled') === 'true') return;

    const ADBLOCK_MODAL_TEXT_REGEX = /(disable\s+your\s+ad\s?blocker|ad\s?block\s+detected|turn\s+off\s+adblock|we\s+notice\s+you\s+are\s+using\s+an\s+ad\s?blocker|ad\s?blocking\s+software)/i;

    function neutralizeAdBlockTraps() {
      try {
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
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_youtube_disabled') === 'true') return;

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
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_twitch_disabled') === 'true') return;

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
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_rightclick_disabled') === 'true') return;

      window.addEventListener('contextmenu', (e) => {
        if (!isCaptchaHost && e) {
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
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_cleanurl_disabled') === 'true') return;

      const TRACKING_PARAMS = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
        'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid',
        'mc_eid', 'si', 'igshid', 'ref', 'ref_src', 'yclid', 'msclkid'
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

      try {
        if (!host.includes('reddit.com') && !host.includes('youtube.com') && !host.includes('twitter.com') && !host.includes('x.com')) {
          const cleanedCurrent = cleanUrlString(window.location.href);
          if (cleanedCurrent !== window.location.href && window.history && window.history.replaceState) {
            window.history.replaceState(null, '', cleanedCurrent);
          }
        }
      } catch (_) {}

      document.addEventListener('mousedown', (e) => {
        try {
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
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_videospeed_disabled') === 'true') return;

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
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_autoskip_disabled') === 'true') return;

      const SKIP_SELECTORS = [
        '.watch-video--skip-content-button', '.skip-credits', '[data-uia="player-skip-intro"]',
        '.atvwebplayersdk-skipelement-button', '.fq92fcf', '.skip-button',
        '.vjs-overlay-skip-intro', '.skip-intro-button', '.skip-recap',
        '.next-episode-button', '[data-uia="next-episode-seamless-button"]'
      ];

      function autoSkipIntros() {
        try {
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

  console.log('[BraveShield Bypass Pro] v6.0.0 CreepJS Evasion & Stealth Engine Armed.');
})();