/**
 * BraveShield Bypass Pro — Core Stealth & Anti-Detection Engine
 * Version: 5.4.0
 * Execution World: MAIN (True document_start)
 * Purpose: Complete Google Chrome & Multi-Device Profile parity, deep Brave cloaking,
 *          Instant URL Unshortener, Paywall/Blur Defuser, Live Telemetry,
 *          100% Captcha passing (Turnstile/reCAPTCHA/Cloudflare Interstitials),
 *          Safe turbo timers, YouTube/Spotify/Twitch acceleration.
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

      // 4. Comprehensive Hardware Profile & Custom Hardware Engine (100+ Presets)
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
          if (matched) activeHw = matched;
        } else if (selectedId.startsWith('mac-')) {
          activeHw = {
            platform: 'MacIntel',
            vendor: 'Apple Inc.',
            renderer: 'Apple M3 Max',
            concurrency: 16,
            memory: 64,
            devicePixelRatio: 2,
            screen: { width: 3456, height: 2234, colorDepth: 30 }
          };
        } else if (selectedId.startsWith('android-')) {
          activeHw = {
            platform: 'Linux armv81',
            vendor: 'Qualcomm',
            renderer: 'Adreno (TM) 750',
            concurrency: 8,
            memory: 16,
            devicePixelRatio: 3,
            screen: { width: 412, height: 915, colorDepth: 24 }
          };
        } else if (selectedId.startsWith('ios-')) {
          activeHw = {
            platform: 'iPhone',
            vendor: 'Apple Inc.',
            renderer: 'Apple GPU',
            concurrency: 6,
            memory: 8,
            devicePixelRatio: 3,
            screen: { width: 440, height: 956, colorDepth: 32 }
          };
        } else if (selectedId.startsWith('linux-')) {
          activeHw = {
            platform: 'Linux x86_64',
            vendor: 'Google Inc. (NVIDIA Corporation)',
            renderer: 'NVIDIA GeForce RTX 4090/PCIe/SSE2',
            concurrency: 32,
            memory: 64,
            devicePixelRatio: 1,
            screen: { width: 2560, height: 1440, colorDepth: 24 }
          };
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

      // Apply WebGL Hardware Vendor & GPU Renderer Spoofing
      const hookWebGL = (proto) => {
        if (!proto || !proto.getParameter) return;
        const origGetParameter = proto.getParameter;
        proto.getParameter = makeNative(function(pname) {
          if (!isCaptchaHost) {
            if (pname === 0x9245) return activeHw.vendor; // UNMASKED_VENDOR_WEBGL
            if (pname === 0x9246) return activeHw.renderer; // UNMASKED_RENDERER_WEBGL
          }
          return origGetParameter.apply(this, arguments);
        }, 'getParameter');
      };
      if (typeof WebGLRenderingContext !== 'undefined') hookWebGL(WebGLRenderingContext.prototype);
      if (typeof WebGL2RenderingContext !== 'undefined') hookWebGL(WebGL2RenderingContext.prototype);

      // 5. Sanitize Client Hints on NavigatorUAData Prototype
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
          Object.defineProperty(NavigatorUAData.prototype, 'platform', {
            get: () => (activeHw.platform.includes('Win') ? 'Windows' : (activeHw.platform.includes('Mac') ? 'macOS' : (activeHw.platform.includes('Android') || activeHw.platform.includes('arm') ? 'Android' : 'Linux'))),
            configurable: true
          });
        } catch (_) {}
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
            navigator.getBattery = makeNative(() => Promise.resolve(mockBattery), 'getBattery');
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

      // 8. AudioContext Sub-Pixel Noise Cloaker (Neutralizes Audio Fingerprinting)
      if (sessionStorage.getItem('bs_audio_disabled') !== 'true') {
        try {
          if (typeof AudioBuffer !== 'undefined' && AudioBuffer.prototype.getChannelData) {
            const origGetChannelData = AudioBuffer.prototype.getChannelData;
            AudioBuffer.prototype.getChannelData = makeNative(function(channel) {
              const data = origGetChannelData.apply(this, arguments);
              if (!isCaptchaHost && data && data.length > 30) {
                // Apply imperceptible float jitter to sample points
                for (let i = 0; i < Math.min(data.length, 64); i += 8) {
                  data[i] += (Math.random() * 0.0000002 - 0.0000001);
                }
              }
              return data;
            }, 'getChannelData');
          }

          if (typeof AnalyserNode !== 'undefined' && AnalyserNode.prototype.getFloatFrequencyData) {
            const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
            AnalyserNode.prototype.getFloatFrequencyData = makeNative(function(array) {
              origGetFloatFreq.apply(this, arguments);
              if (!isCaptchaHost && array && array.length > 0) {
                array[0] += (Math.random() * 0.0001 - 0.00005);
              }
            }, 'getFloatFrequencyData');
          }
        } catch (_) {}
      }

      // 9. Canvas Sub-Dither Noise Cloaker (Neutralizes Canvas Fingerprinting)
      if (sessionStorage.getItem('bs_canvas_disabled') !== 'true') {
        try {
          if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.getImageData) {
            const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = makeNative(function(sx, sy, sw, sh) {
              const imgData = origGetImageData.apply(this, arguments);
              if (!isCaptchaHost && imgData && imgData.data && imgData.data.length >= 4) {
                // Sub-dither a single byte imperceptibly on small/probe canvases (< 300x300)
                if (sw <= 320 && sh <= 320) {
                  const idx = (Math.floor(Math.random() * 10) * 4);
                  if (idx < imgData.data.length) {
                    imgData.data[idx] = Math.min(255, Math.max(0, imgData.data[idx] + (Math.random() > 0.5 ? 1 : -1)));
                  }
                }
              }
              return imgData;
            }, 'getImageData');
          }
        } catch (_) {}
      }

      // 10. WebRTC Local IP Leak Protection
      if (sessionStorage.getItem('bs_webrtc_disabled') !== 'true') {
        try {
          if (typeof RTCPeerConnection !== 'undefined') {
            const origCreateOffer = RTCPeerConnection.prototype.createOffer;
            RTCPeerConnection.prototype.createOffer = makeNative(function(options) {
              return origCreateOffer.apply(this, arguments).then(offer => {
                if (offer && offer.sdp) {
                  // Filter LAN IP addresses from SDP candidates
                  offer.sdp = offer.sdp.replace(/(\r\n|\n)?a=candidate:.*?(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|\.local).*/gi, '');
                }
                return offer;
              });
            }, 'createOffer');
          }
        } catch (_) {}
      }
    } catch (_) {}
  })();

  // If this is an active Cloudflare interstitial challenge page, exit now to avoid interrupting verification!
  if (isCloudflareInterstitial()) {
    return;
  }

  const isMediaPlatform = host.includes('spotify.com') || host.includes('youtube.com') || host.includes('youtu.be') || host.includes('netflix.com') || host.includes('twitch.tv');

  function makeNative(fn, name) {
    try {
      const nativeStr = `function ${name || fn.name || ''}() { [native code] }`;
      Object.defineProperty(fn, 'toString', {
        value: () => nativeStr,
        configurable: true,
        writable: true
      });
    } catch (_) {}
    return fn;
  }

  function reportTelemetry(stat, delta = 1) {
    try {
      window.postMessage({ type: 'bs-telemetry-event', stat, delta }, '*');
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. Master Kill Switch & Telemetry Initialization
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    if (sessionStorage.getItem('bs_master_disabled') === 'true') {
      console.log('[BraveShield] Disabled via Master Kill Switch.');
      window.addEventListener('message', (e) => {
        if (e.data?.type === 'bs-set-master-state' && e.data.enabled) {
          try { sessionStorage.removeItem('bs_master_disabled'); } catch (_) {}
          window.location.reload();
        }
      });
      return;
    }
  } catch (_) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 2: Network Ad-Probe & Trap Interceptor (Fetch / XHR)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      function isAdProbeUrl(url) {
        if (!url || typeof url !== 'string') return false;
        try {
          const curHost = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
          if (!url.startsWith('http://') && !url.startsWith('https://')) return false; // Relative URLs belong to the site itself!
          const parsed = new URL(url);
          const parsedHost = parsed.hostname.toLowerCase();
          if (parsedHost === curHost || parsedHost.endsWith('.' + curHost)) return false; // Never intercept same-origin site requests!
          // NEVER intercept Captcha or Cloudflare verification services!
          if (/recaptcha|hcaptcha|turnstile|cloudflare|cdn-cgi|arkoselabs|geetest|funcaptcha/i.test(url)) return false;
        } catch (_) {}
        return /pagead2\.googlesyndication\.com|adservice\.google\.com|securepubads\.g\.doubleclick\.net|adnxs\.com|prebid\.js|fuckadblock|blockadblock|adblockdetector/i.test(url);
      }

      // Transparent Fetch Proxy
      if (typeof window.fetch === 'function') {
        const originalFetch = window.fetch;
        window.fetch = makeNative(function (input, init) {
          try {
            const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
            if (url && typeof url === 'string') {
              if (/^brave:\/\//i.test(url)) {
                return Promise.resolve(new Response('', { status: 404, statusText: 'Not Found' }));
              }
              if (isAdProbeUrl(url)) {
                return Promise.resolve(new Response('window.canRunAds=true;window.isAdBlockActive=false;window.adblock=false;', {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/javascript' }
                }));
              }
            }
          } catch (_) {}
          return originalFetch.apply(window, arguments);
        }, 'fetch');
      }

      // Transparent XMLHttpRequest Proxy
      const origXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (typeof url === 'string') {
          if (/^brave:\/\//i.test(url)) {
            this._isBraveProbe = true;
          } else if (isAdProbeUrl(url)) {
            this._isAdProbe = true;
          }
        }
        return origXHROpen.apply(this, [method, url, ...rest]);
      };

      const origXHRSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function (...args) {
        if (this._isBraveProbe) {
          try {
            Object.defineProperty(this, 'status', { get: () => 0, configurable: true });
            Object.defineProperty(this, 'readyState', { get: () => 4, configurable: true });
          } catch (_) {}
          setTimeout(() => { try { this.dispatchEvent(new Event('error')); } catch (_) {} }, 0);
          return;
        }
        if (this._isAdProbe) {
          try {
            Object.defineProperty(this, 'status', { get: () => 200, configurable: true });
            Object.defineProperty(this, 'statusText', { get: () => 'OK', configurable: true });
            Object.defineProperty(this, 'responseText', { get: () => 'window.canRunAds=true;window.isAdBlockActive=false;', configurable: true });
            Object.defineProperty(this, 'readyState', { get: () => 4, configurable: true });
          } catch (_) {}
          setTimeout(() => {
            try { this.dispatchEvent(new Event('readystatechange')); } catch (_) {}
            try { this.dispatchEvent(new Event('load')); } catch (_) {}
          }, 0);
          return;
        }
        return origXHRSend.apply(this, args);
      };
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 3: Global Ad Defusers & AdSense Stubs
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const globals = [
        'canRunAds', 'isAdBlockActive', 'adblock', 'adBlocker', 'adsBlocked',
        'adblockDetected', 'hasAdBlocker', 'isAdblock', 'adBlockDetected',
        'adBlockerDetected', 'is_adblock_detected', 'ad_clicked', 'is_ad_clicked',
        'isBrave'
      ];
      for (const k of globals) {
        try {
          Object.defineProperty(window, k, {
            get: () => (k === 'canRunAds' || k === 'ad_clicked' || k === 'is_ad_clicked'),
            set: () => {},
            configurable: true,
            enumerable: true
          });
        } catch (_) {
          window[k] = (k === 'canRunAds');
        }
      }

      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.loaded = true;
      window.adsbygoogle.push = function() { return 1; };
      window.google_ad_client = 'ca-pub-9999999999999999';
      window.google_ad_status = 1;

      const UniversalAdBlockMock = function(options) {
        this.check = function() {};
        this.clearEvent = function() {};
        this.on = function(detected, callback) {
          if (!detected && typeof callback === 'function') setTimeout(callback, 20);
          return this;
        };
        this.onDetected = function() { return this; };
        this.onNotDetected = function(cb) { if (typeof cb === 'function') setTimeout(cb, 20); return this; };
        this.setOption = function() { return this; };
        if (options && typeof options.onNotDetected === 'function') setTimeout(options.onNotDetected, 20);
      };

      window.FuckAdBlock = UniversalAdBlockMock;
      window.BlockAdBlock = UniversalAdBlockMock;
      window.fuckAdBlock = new UniversalAdBlockMock();
      window.blockAdBlock = window.fuckAdBlock;
      window.SAB = UniversalAdBlockMock;
      window.SimpleAdBlock = UniversalAdBlockMock;
      window.adblockDetector = new UniversalAdBlockMock();
      window.adblockChecker = new UniversalAdBlockMock();
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 4: Universal Anti-Adblock Modal Annihilator & Paywall/Blur Defuser
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

    function isProtectedCaptchaOrAuth(el) {
      if (!el) return false;
      if (host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') || host.includes('arkoselabs.com')) return true;

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

    // Actively guarantee full visibility and clickability for all Captcha widgets
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

    // Feature B: Universal Paywall & Blur-Filter Defuser
    function defusePaywallsAndBlur() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_paywall_disabled') === 'true') return;

        // Unblur readable text on Medium, Quora, Pinterest, news portals
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

    function autoBypassAgeAndConsent() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        const AGE_COOKIES = ['age_verified=1', 'disclaimer=1', 'accessAgeDisclaimer=true', 'over18=1', 'age_gate=1', 'age_confirmed=1', 'agree=1', 'terms_agreed=1'];
        AGE_COOKIES.forEach(c => { try { document.cookie = c + '; path=/; max-age=31536000; SameSite=Lax'; } catch (_) {} });
        try {
          localStorage.setItem('age_verified', 'true');
          localStorage.setItem('has_accepted_18', 'true');
          localStorage.setItem('disclaimer_accepted', 'true');
        } catch (_) {}
      } catch (_) {}
    }

    function annihilateAntiAdblockModals() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_adblock_disabled') === 'true') return;

        autoBypassAgeAndConsent();
        ensureCaptchasVisible();
        defusePaywallsAndBlur();

        const candidates = document.querySelectorAll('.modal, .swal2-container, .sweet-alert, [role="alertdialog"], [class*="adblock"], [id*="adblock"]');
        for (const el of candidates) {
          if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
          if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            reportTelemetry('trapsNeutralized', 1);
          }
        }
      } catch (_) {}
    }

    let scanTimer = null;
    function debouncedScan() {
      if (scanTimer) return;
      scanTimer = setTimeout(() => {
        annihilateAntiAdblockModals();
        scanTimer = null;
      }, 500);
    }

    annihilateAntiAdblockModals();
    const trapInterval = setInterval(debouncedScan, 1000);
    setTimeout(() => clearInterval(trapInterval), 15000);

    const trapObserver = new MutationObserver(debouncedScan);
    if (document.documentElement) {
      trapObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 5: Safe Turbo Timer Fast-Forward & Shortener Fast-Pass + Feature A Unshortener
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    function isCaptchaPresentOnPage() {
      const hasToken = (
        (document.getElementById('g-recaptcha-response')?.value?.length > 0) ||
        (document.querySelector('textarea[name="g-recaptcha-response"]')?.value?.length > 0) ||
        (document.querySelector('input[name="cf-turnstile-response"]')?.value?.length > 0) ||
        (document.querySelector('textarea[name="h-captcha-response"]')?.value?.length > 0) ||
        (document.querySelector('input[name="mtcaptcha-verifiedtoken"]')?.value?.length > 0) ||
        (document.querySelector('input[name="geetest_validate"]')?.value?.length > 0) ||
        (document.querySelector('input[name="fc-token"]')?.value?.length > 0)
      );
      if (hasToken) return false; // Captcha solved, resume turbo timers!

      return !!document.querySelector(
        '.cf-turnstile, .g-recaptcha, .h-captcha, .geetest_holder, #aws-waf-captcha, .mtcaptcha, #lemin-cropped-captcha, .smart-captcha, .frc-captcha, ' +
        'iframe[src*="cloudflare"], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], iframe[src*="arkose"], iframe[src*="funcaptcha"], iframe[src*="geetest"], iframe[src*="awswaf"], iframe[src*="mtcaptcha"], iframe[src*="lemin"], iframe[src*="smartcaptcha"], iframe[src*="capy"], iframe[src*="friendlycaptcha"], iframe[src*="captcha-delivery"], ' +
        '#challenge-stage, #cf-wrapper, [data-sitekey]'
      );
    }

    // High-speed setTimeout & setInterval timer compression with window bound receiver
    const origSetTimeout = window.setTimeout;
    const origSetInterval = window.setInterval;

    window.setTimeout = makeNative(function(handler, delay, ...args) {
      let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
      const isTimersActive = (sessionStorage.getItem('bs_timers_disabled') !== 'true');
      if (isTimersActive && !isMediaPlatform && !isCaptchaPresentOnPage() && numDelay >= 800 && numDelay <= 180000) {
        const compressed = Math.max(20, Math.floor(numDelay / 25)); // 25x-50x fast compression
        const savedSecs = Math.max(0, Math.round((numDelay - compressed) / 1000));
        if (savedSecs > 0) reportTelemetry('timeSavedSeconds', savedSecs);
        numDelay = compressed;
      }
      return origSetTimeout.apply(window, [handler, numDelay, ...args]);
    }, 'setTimeout');

    window.setInterval = makeNative(function(handler, delay, ...args) {
      let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
      const isTimersActive = (sessionStorage.getItem('bs_timers_disabled') !== 'true');
      if (isTimersActive && !isMediaPlatform && !isCaptchaPresentOnPage()) {
        if (numDelay >= 800 && numDelay <= 2000) {
          numDelay = 35; // 1s countdown tick compressed to 35ms
        }
      }
      return origSetInterval.apply(window, [handler, numDelay, ...args]);
    }, 'setInterval');

    // Suppress shortener Bad Request and YuThemeStore credit alerts
    const origAlert = window.alert;
    window.alert = makeNative(function(msg) {
      if (typeof msg === 'string' && /yuthemestore|yuidea|theme\s+is\s+made\s+by|copyright|credit|bad\s+request|adblock|disable\s+ad/i.test(msg)) {
        console.log('[BraveShield] Suppressed annoying alert:', msg);
        return;
      }
      return origAlert.apply(window, arguments);
    }, 'alert');

    const origConfirm = window.confirm;
    window.confirm = makeNative(function(msg) {
      if (typeof msg === 'string' && /yuthemestore|yuidea|theme\s+is\s+made\s+by|copyright|credit|bad\s+request|adblock|disable\s+ad/i.test(msg)) {
        return true;
      }
      return origConfirm.apply(window, arguments);
    }, 'confirm');

    // Feature A: Instant URL Unshortener & Direct Link Resolver
    let reportedDirectUrl = null;
    function resolveDirectDestination() {
      try {
        if (sessionStorage.getItem('bs_unshortener_disabled') === 'true') return;
        let candidateUrl = null;

        // 1. Query parameters
        const search = window.location.search;
        if (search) {
          const rawSearch = search.startsWith('?') ? search.slice(1) : search;
          if (rawSearch.startsWith('aHR0c') || rawSearch.startsWith('http')) {
            try {
              candidateUrl = rawSearch.startsWith('aHR0c') ? atob(rawSearch) : rawSearch;
              candidateUrl = decodeURIComponent(candidateUrl);
            } catch (_) {}
          } else {
            const params = new URLSearchParams(search);
            const keys = ['dest', 'url', 'go', 'link', 'target', 'r', 'destination', 'download', 'redirect', 'to', 'next', 'out', 'targetUrl', 'file'];
            for (const key of keys) {
              const val = params.get(key);
              if (val) {
                let target = val;
                if (val.startsWith('aHR0c') || val.startsWith('http') || val.includes('%3A%2F%2F')) {
                  try {
                    if (val.startsWith('aHR0c')) target = atob(val);
                    target = decodeURIComponent(target);
                  } catch (_) {}
                }
                if (/^https?:\/\//i.test(target) && !target.includes(host)) {
                  candidateUrl = target;
                  break;
                }
              }
            }
          }
        }

        // 2. Hidden Form Inputs
        if (!candidateUrl) {
          const formInputs = document.querySelectorAll('input[type="hidden"][name="go"], input[type="hidden"][name="link"], input[type="hidden"][name="url"], input[type="hidden"][name="dest"], input[type="hidden"][name="target"]');
          for (const inp of formInputs) {
            const val = (inp.value || '').trim();
            if (val.startsWith('aHR0c')) {
              try {
                const dec = atob(val);
                if (/^https?:\/\//i.test(dec) && !dec.includes(host)) {
                  candidateUrl = dec;
                  break;
                }
              } catch (_) {}
            }
          }
        }

        // 3. Download/Direct Links in DOM
        if (!candidateUrl) {
          const directLinks = document.querySelectorAll('a[href*="mega.nz"], a[href*="drive.google.com"], a[href*="mediafire.com"], a[href*="pixeldrain.com"], a[href*="1drv.ms"], a[href*="dropbox.com"], a[href*="terabox.com"], a[href*="t.me/"], a[href^="magnet:"]');
          for (const a of directLinks) {
            const href = a.getAttribute('href');
            if (href && !href.includes(host)) {
              candidateUrl = href;
              break;
            }
          }
        }

        if (candidateUrl && candidateUrl !== reportedDirectUrl && /^https?:\/\//i.test(candidateUrl)) {
          reportedDirectUrl = candidateUrl;
          window.postMessage({ type: 'bs-direct-link', url: candidateUrl }, '*');
          reportTelemetry('directLinksUnlocked', 1);
        }
      } catch (_) {}
    }

    function turboPassCountdownsAndLinks() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;

        resolveDirectDestination();

        if (sessionStorage.getItem('bs_timers_disabled') === 'true') return;

        function isPaginationOrNavigation(el) {
          if (!el) return true;
          const href = (el.getAttribute('href') || '').toLowerCase();
          const id = (el.id || '').toLowerCase();
          const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
          if (/reverse-paginate|updated-max|max-results|blog-pager|pagination|page-numbers|older-posts|newer-posts|nav-links|category|tag\//i.test(href)) return true;
          if (/blog-pager|pagination|pager|page-nav|nav-links|page-numbers|older-link|newer-link/i.test(id + ' ' + cls)) return true;
          return false;
        }

        // Softurl.in & Gateway Form Submitter
        if (host.includes('softurl.in')) {
          try {
            document.cookie = 'opened_in_chrome=1; path=/; max-age=86400';
            document.cookie = 'is_chrome=1; path=/; max-age=86400';
            sessionStorage.setItem('opened_in_chrome', 'true');
          } catch (_) {}

          const landingForm = document.getElementById('landing');
          if (landingForm && !landingForm._bsSubmitted) {
            landingForm._bsSubmitted = true;
            try { landingForm.submit(); } catch (_) {}
          }
        }

        // Trigger shortener theme link generators ONLY IF Captcha is solved/not present
        if (!isCaptchaPresentOnPage()) {
          const siteRevealFunctions = [
            'showDownloadButton', 'showDownloadBtn', 'getDownloadLink', 'getDownloadBtn',
            'generateLink', 'getLink', 'showLink', 'startTimer', 'clickOnAd', 'verifyAdClick',
            'directDownload', 'finalDownloadLink', 'unhideLink', 'openDownload', 'createDownloadLink',
            'startRedirect', 'doRedirect', 'redirect'
          ];
          for (const fn of siteRevealFunctions) {
            if (typeof window[fn] === 'function') {
              try { window[fn](); } catch (_) {}
            }
          }
        }

        // Fix softurl.in & mobile intent redirects (convert intent:// to clean https://)
        document.querySelectorAll('a[href^="intent://"], a[href^="googlechrome://"], button[data-url^="intent://"], [onclick*="intent://"]').forEach(el => {
          let rawHref = el.getAttribute('href') || el.dataset.url || '';
          if (rawHref.startsWith('intent://')) {
            let cleanUrl = rawHref.replace(/^intent:\/\//, 'https://').split('#Intent')[0];
            if (cleanUrl !== window.location.href && cleanUrl !== window.location.href + '/') {
              el.setAttribute('href', cleanUrl);
              el.dataset.url = cleanUrl;
            } else {
              const landingForm = document.getElementById('landing');
              if (landingForm) {
                el.onclick = (ev) => {
                  ev.preventDefault();
                  landingForm.submit();
                };
              }
            }
          } else if (rawHref.startsWith('googlechrome://')) {
            let cleanUrl = rawHref.replace(/^googlechrome:\/\//, 'https://');
            el.setAttribute('href', cleanUrl);
            el.dataset.url = cleanUrl;
          }
        });

        const buttonSelectors = [
          '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download',
          '.get-link', '.download-btn', '.btn-download', '.getlink', '#link-button',
          '#continue-btn', '#btn-continue', '.continue-btn', '#go-link', '.go-link',
          '#final-download', '.direct-download', '#downloadBtn', '#btnDownload',
          '#wpsafe-generate', '#wpsafe-snp', '#tp-snp2',
          '#imnotrobot', '#btn6', '#btn-captcha', '.btn-captcha', '#captcha-btn',
          '#openInChrome', '.btn-open-chrome'
        ];

        for (const sel of buttonSelectors) {
          const btns = document.querySelectorAll(sel);
          for (const btn of btns) {
            if (btn && !isPaginationOrNavigation(btn)) {
              btn.removeAttribute('disabled');
              btn.removeAttribute('aria-disabled');
              if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
              btn.style.setProperty('pointer-events', 'auto', 'important');
              btn.style.setProperty('cursor', 'pointer', 'important');
            }
          }
        }

        // Unhide direct destination links & report telemetry
        const destLinks = document.querySelectorAll('a[href*="/links/"], a[href*="/go/"], a[href*="indianshortner.com/"], a[href*="drive.google"], a[href*="mediafire"], a[href*="mega.nz"], a[href*="pixeldrain"], a[href*="gofile"], a[href*="uploadrar"]');
        for (const dLink of destLinks) {
          if (!isPaginationOrNavigation(dLink)) {
            dLink.style.setProperty('pointer-events', 'auto', 'important');
            const targetHref = dLink.getAttribute('href');
            if (targetHref && targetHref.startsWith('http') && targetHref !== reportedDirectUrl && !targetHref.includes(host)) {
              reportedDirectUrl = targetHref;
              window.postMessage({ type: 'bs-direct-link', url: targetHref }, '*');
              reportTelemetry('directLinksUnlocked', 1);
            }
          }
        }
      } catch (_) {}
    }

    turboPassCountdownsAndLinks();
    const tInt = setInterval(turboPassCountdownsAndLinks, 1000);
    setTimeout(() => clearInterval(tInt), 15000);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 6: Spotify Web Player Super Engine (Ad-Free & Synced Lyrics)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('spotify.com')) return;

    function sweepSpotifyAds() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_spotify_disabled') === 'true') return;

        const audioNodes = document.querySelectorAll('audio, video');
        for (const media of audioNodes) {
          const isAd = document.querySelector('[data-testid="ad-display-name"], .advertisement, [aria-label*="Advertisement"]');
          if (isAd && media.duration && media.currentTime < media.duration) {
            media.playbackRate = 16.0;
            media.muted = true;
            media.currentTime = media.duration - 0.1;
          }
        }
      } catch (_) {}
    }

    setInterval(sweepSpotifyAds, 800);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 7: YouTube Turbo & Ad-Skipper Engine
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) return;

    function speedupYouTubeAds() {
      try {
        if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
        if (sessionStorage.getItem('bs_youtube_disabled') === 'true') return;

        const video = document.querySelector('video');
        const adShowing = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay');
        if (adShowing && video) {
          video.playbackRate = 16.0;
          video.muted = true;
          if (video.duration && !isNaN(video.duration)) {
            video.currentTime = video.duration - 0.1;
          }
          const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
          if (skipBtn) {
            try { skipBtn.click(); } catch (_) {}
          }
        }
      } catch (_) {}
    }

    setInterval(speedupYouTubeAds, 500);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 8: Feature E — Twitch & Streaming Media Ad Shield
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
  // Module 9: Universal Right-Click & Copy-Paste Enabler
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (sessionStorage.getItem('bs_master_disabled') === 'true') return;
      if (sessionStorage.getItem('bs_rightclick_disabled') === 'true') return;

      const allowEvent = (e) => {
        if (!isCaptchaHost && e) {
          e.stopPropagation();
          return true;
        }
      };

      const events = ['contextmenu', 'selectstart', 'copy', 'cut', 'paste', 'dragstart'];
      events.forEach(evtName => {
        window.addEventListener(evtName, allowEvent, true);
        document.addEventListener(evtName, allowEvent, true);
      });

      // Enable CSS user-select on body & html
      const enableSelectionStyle = () => {
        try {
          if (document.body) {
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
  // Module 10: Clean URL & Tracking Query Stripper
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

      // Strip address bar tracking params silently
      try {
        const cleanedCurrent = cleanUrlString(window.location.href);
        if (cleanedCurrent !== window.location.href && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', cleanedCurrent);
        }
      } catch (_) {}

      // Intercept link clicks to strip tracking before navigation
      document.addEventListener('click', (e) => {
        try {
          const a = e.target && e.target.closest ? e.target.closest('a') : null;
          if (a && a.href && a.href.includes('?')) {
            const clean = cleanUrlString(a.href);
            if (clean !== a.href) a.href = clean;
          }
        } catch (_) {}
      }, true);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 11: Universal HTML5 Video Speed Controller ([ / ] hotkeys)
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
            speedHud.id = 'bs-speed-pill';
            speedHud.style.cssText = `
              position: fixed !important;
              top: 24px !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              background: rgba(10, 15, 25, 0.92) !important;
              color: #00ffcc !important;
              border: 1px solid rgba(0, 255, 204, 0.5) !important;
              box-shadow: 0 0 20px rgba(0, 255, 204, 0.3) !important;
              padding: 8px 18px !important;
              border-radius: 20px !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace !important;
              font-size: 14px !important;
              font-weight: 800 !important;
              letter-spacing: 0.5px !important;
              z-index: 2147483647 !important;
              pointer-events: none !important;
              transition: opacity 0.2s ease !important;
            `;
            (document.body || document.documentElement).appendChild(speedHud);
          }
          speedHud.textContent = `⚡ Video Speed: ${speed.toFixed(2)}x`;
          speedHud.style.opacity = '1';
          clearTimeout(hudFadeTimer);
          hudFadeTimer = setTimeout(() => {
            if (speedHud) speedHud.style.opacity = '0';
          }, 1200);
        } catch (_) {}
      }

      window.addEventListener('keydown', (e) => {
        try {
          if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
          if (e.target && e.target.isContentEditable) return;

          const videos = document.querySelectorAll('video');
          if (!videos || videos.length === 0) return;

          if (e.key === '[' || e.key === ']' || e.key === '\\') {
            e.preventDefault();
            for (const v of videos) {
              let cur = v.playbackRate || 1.0;
              if (e.key === ']') cur = Math.min(16.0, cur + 0.25);
              if (e.key === '[') cur = Math.max(0.25, cur - 0.25);
              if (e.key === '\\') cur = 1.0;
              v.playbackRate = cur;
              showSpeedPill(cur);
            }
          }
        } catch (_) {}
      }, true);
    } catch (_) {}
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 12: Auto-Skip Video Intros & Next Episode
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

  console.log('[BraveShield Bypass Pro] v5.5.0 Titanium Engine Armed & Synchronized.');
})();