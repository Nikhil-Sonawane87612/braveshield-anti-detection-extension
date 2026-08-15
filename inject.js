/**
 * inject.js — BraveShield Bypass Pro Stealth Engine
 * Version: 5.0.0
 * Injected into the MAIN world via a <script> tag in the page.
 * Purpose: Anti-detection, adblock bypass, brave:// leak prevention, and stealth hardening.
 */

// ─────────────────────────────────────────────────────
// Module 0: Brave-Specific Detection Bypass
// ─────────────────────────────────────────────────────
(() => {
  // Block all brave:// URL detection attempts
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && /^brave:\/\//i.test(url)) {
      return Promise.resolve(new Response('', { status: 404, statusText: 'Not Found' }));
    }
    return originalFetch.apply(this, arguments);
  };

  const origXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string' && /^brave:\/\//i.test(url)) {
      this._braveShieldBypass = true;
    }
    return origXHROpen.apply(this, [method, url, ...rest]);
  };

  const origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    if (this._braveShieldBypass) {
      Object.defineProperty(this, 'status', { get: () => 0 });
      Object.defineProperty(this, 'statusText', { get: () => '' });
      Object.defineProperty(this, 'responseText', { get: () => '' });
      Object.defineProperty(this, 'readyState', { get: () => 4 });
      setTimeout(() => { try { this.dispatchEvent(new Event('error')); } catch (_) {} }, 0);
      return;
    }
    return origXHRSend.apply(this, args);
  };

  // Block Image probe to brave://
  const origImage = window.Image;
  window.Image = function (...args) {
    const img = new origImage(...args);
    const origSrcSet = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
    Object.defineProperty(img, 'src', {
      set(val) {
        if (typeof val === 'string' && /^brave:\/\//i.test(val)) {
          this._blocked = true;
          return;
        }
        origSrcSet.call(this, val);
      },
      get() {
        return Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get.call(this);
      }
    });
    return img;
  };
  window.Image.prototype = origImage.prototype;
})();

// ─────────────────────────────────────────────────────
// Module 1: Navigator Properties Override
// ─────────────────────────────────────────────────────
(() => {
  if (typeof navigator !== 'undefined') {
    // Spoof plugins count — 0 = strong adblock signal, 3 = normal Brave
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ];
        arr.item = (i) => arr[i] || null;
        arr.namedItem = (name) => arr.find((p) => p.name === name) || null;
        arr.refresh = () => {};
        return arr;
      },
      configurable: true
    });

    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
      configurable: true
    });

    Object.defineProperty(navigator, 'language', {
      get: () => 'en-US',
      configurable: true
    });

    // Do NOT override navigator.brave here — Module 0 handles brave detection
    // navigator.brave is used by some detection scripts — let the real one exist
    // or spoof it only if it doesn't already exist
    if (!navigator.brave) {
      try {
        const braveObj = {
          isBrave: () => Promise.resolve(true),
          isDEPRECATED: undefined
        };
        Object.defineProperty(navigator, 'brave', {
          get: () => braveObj,
          configurable: true
        });
      } catch (_) {}
    }

    // Ensure navigator.webdriver is always false
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true
    });

    // Spoof hardwareConcurrency to a realistic value (not 1 or too high)
    const origHC = navigator.hardwareConcurrency;
    if (origHC === 1 || origHC > 32) {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
        configurable: true
      });
    }

    // Spoof deviceMemory (some detection scripts check this)
    if (!navigator.deviceMemory) {
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
        configurable: true
      });
    }
  }
})();

// ─────────────────────────────────────────────────────
// Module 2: Client Hints Override
// ─────────────────────────────────────────────────────
(() => {
  if (typeof navigator !== 'undefined' && navigator.userAgentData) {
    const realUAData = navigator.userAgentData;
    Object.defineProperty(navigator, 'userAgentData', {
      get: () => ({
        brands: [
          { brand: 'Chromium', version: '120' },
          { brand: 'Not_A Brand', version: '8' },
          { brand: 'Google Chrome', version: '120' }
        ],
        mobile: realUAData?.mobile ?? false,
        platform: 'Windows',
        getHighEntropyValues: (hints) => Promise.resolve({
          brands: [
            { brand: 'Chromium', version: '120' },
            { brand: 'Not_A Brand', version: '8' },
            { brand: 'Google Chrome', version: '120' }
          ],
          mobile: realUAData?.mobile ?? false,
          platform: 'Windows',
          platformVersion: '15.0.0',
          architecture: 'x86',
          bitness: '64',
          model: '',
          uaFullVersion: '120.0.6099.109',
          fullVersionList: [
            { brand: 'Chromium', version: '120.0.6099.109' },
            { brand: 'Not_A Brand', version: '8.0.0.0' },
            { brand: 'Google Chrome', version: '120.0.6099.109' }
          ]
        }),
        toJSON: () => ({
          brands: [
            { brand: 'Chromium', version: '120' },
            { brand: 'Not_A Brand', version: '8' },
            { brand: 'Google Chrome', version: '120' }
          ],
          mobile: false,
          platform: 'Windows'
        })
      }),
      configurable: true
    });
  }
})();

// ─────────────────────────────────────────────────────
// Module 3: Ad Creative Stub Blocks
// ─────────────────────────────────────────────────────
(() => {
  const AD_SELECTORS = [
    '[id*="google_ads"]',
    '[class*="ad-container"]',
    '[class*="adsbygoogle"]',
    '[data-ad-slot]',
    '[id*="ad-slot"]',
    '.ad-wrapper',
    '.sponsored',
    '[id*="doubleclick"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'ins.adsbygoogle'
  ];
  const STUB = '<div style="display:none!important"></div>';

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        for (const sel of AD_SELECTORS) {
          try {
            if (node.matches && node.matches(sel)) {
              node.remove();
              return;
            }
            const inner = node.querySelectorAll?.(sel);
            if (inner?.length) inner.forEach((el) => el.remove());
          } catch (_) {}
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// ─────────────────────────────────────────────────────
// Module 4: DOM Mutation Traps for Anti-Adblock
// ─────────────────────────────────────────────────────
(() => {
  const ANTI_ADBLOCK_SELECTORS = [
    '[class*="adblock"]',
    '[id*="adblock"]',
    '[class*="adb-modal"]',
    '[class*="adb-overlay"]',
    '[class*="adb-dialog"]',
    '[class*="anti-adblock"]',
    '[id*="anti-adblock"]',
    '[class*="blocker-notice"]',
    '[id*="blocker-notice"]',
    '[class*="adblock-modal"]',
    '[class*="adblocker"]',
    '.adb-overlay',
    '.adb-modal',
    '#adb-overlay',
    '#adb-modal'
  ];

  const trapObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        for (const sel of ANTI_ADBLOCK_SELECTORS) {
          try {
            if (node.matches && node.matches(sel)) {
              node.remove();
              return;
            }
            const inner = node.querySelectorAll?.(sel);
            if (inner?.length) inner.forEach((el) => el.remove());
          } catch (_) {}
        }
      }
    }
  });
  trapObserver.observe(document.documentElement, { childList: true, subtree: true });
})();

// ─────────────────────────────────────────────────────
// Module 5: Service Worker Leak Fix
// ─────────────────────────────────────────────────────
(() => {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    // Block the extension's own SW from registering to avoid fingerprinting
    const origRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function (scriptURL, opts) {
      const url = typeof scriptURL === 'string' ? scriptURL : scriptURL?.href;
      if (url && (/background\.js|service-worker\.js|sw\.js/i.test(url))) {
        return Promise.resolve({ scope: '/', installing: null, waiting: null, active: null });
      }
      return origRegister.apply(this, arguments);
    };

    // Hide the controller change event leak
    const origAddEvent = navigator.serviceWorker.addEventListener;
    navigator.serviceWorker.addEventListener = function (type, listener, options) {
      if (type === 'controllerchange') {
        return; // silently drop controller change listeners from page context
      }
      return origAddEvent.apply(this, arguments);
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 6: WebGL Fingerprint Farbling & Profile Spoofing
// ─────────────────────────────────────────────────────
(() => {
  if (typeof WebGLRenderingContext === 'undefined') return;

  function getWebGLVendor() {
    try {
      return sessionStorage.getItem('bs_webgl_vendor') || localStorage.getItem('bs_webgl_vendor') || 'Google Inc. (NVIDIA)';
    } catch (_) {
      return 'Google Inc. (NVIDIA)';
    }
  }

  function getWebGLRenderer() {
    try {
      return sessionStorage.getItem('bs_webgl_renderer') || localStorage.getItem('bs_webgl_renderer') || 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
    } catch (_) {
      return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
    }
  }

  const origGetParam = WebGLRenderingContext.prototype.getParameter;
  const origGetExtension = WebGLRenderingContext.prototype.getExtension;

  const debugRendererInfoStub = {
    UNMASKED_VENDOR_WEBGL: 0x9245,
    UNMASKED_RENDERER_WEBGL: 0x9246
  };

  // Override common fingerprint parameters
  WebGLRenderingContext.prototype.getParameter = function (param) {
    // UNMASKED_VENDOR_WEBGL (0x9245)
    if (param === 0x9245) return getWebGLVendor();
    // UNMASKED_RENDERER_WEBGL (0x9246)
    if (param === 0x9246) return getWebGLRenderer();
    // VENDOR (0x1F00)
    if (param === 0x1F00) return 'WebKit';
    // RENDERER (0x1F01)
    if (param === 0x1F01) return 'WebKit WebGL';
    // MAX_TEXTURE_SIZE — normalize
    if (param === 0x0D33) return 16384;
    // MAX_RENDERBUFFER_SIZE
    if (param === 0x84E8) return 16384;
    // MAX_VIEWPORT_DIMS
    if (param === 0x0D3A) return new Int32Array([32767, 32767]);
    // ALIASED_LINE_WIDTH_RANGE
    if (param === 0x846E) return new Float32Array([1, 1]);
    // ALIASED_POINT_SIZE_RANGE
    if (param === 0x846D) return new Float32Array([1, 1024]);
    // DEPTH_BITS
    if (param === 0x0D56) return 24;
    // STENCIL_BITS
    if (param === 0x0D57) return 8;
    // RED_BITS, GREEN_BITS, BLUE_BITS, ALPHA_BITS
    if ([0x0D52, 0x0D53, 0x0D54, 0x0D55].includes(param)) return 8;
    return origGetParam.apply(this, arguments);
  };

  WebGLRenderingContext.prototype.getExtension = function (name) {
    if (name === 'WEBGL_debug_renderer_info') {
      return debugRendererInfoStub;
    }
    return origGetExtension.apply(this, arguments);
  };

  // Also override WebGL2
  if (typeof WebGL2RenderingContext !== 'undefined') {
    const origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
    const origGetExt2 = WebGL2RenderingContext.prototype.getExtension;

    WebGL2RenderingContext.prototype.getParameter = function (param) {
      if (param === 0x9245) return getWebGLVendor();
      if (param === 0x9246) return getWebGLRenderer();
      if (param === 0x1F00) return 'WebKit';
      if (param === 0x1F01) return 'WebKit WebGL';
      if (param === 0x0D33) return 16384;
      if (param === 0x84E8) return 16384;
      if (param === 0x0D3A) return new Int32Array([32767, 32767]);
      if (param === 0x846E) return new Float32Array([1, 1]);
      if (param === 0x846D) return new Float32Array([1, 1024]);
      if (param === 0x0D56) return 24;
      if (param === 0x0D57) return 8;
      if ([0x0D52, 0x0D53, 0x0D54, 0x0D55].includes(param)) return 8;
      return origGetParam2.apply(this, arguments);
    };

    WebGL2RenderingContext.prototype.getExtension = function (name) {
      if (name === 'WEBGL_debug_renderer_info') {
        return debugRendererInfoStub;
      }
      return origGetExt2.apply(this, arguments);
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 7: Canvas Fingerprint Normalization
// ─────────────────────────────────────────────────────
(() => {
  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const origToBlob = HTMLCanvasElement.prototype.toBlob;
  const origGetContext = HTMLCanvasElement.prototype.getContext;

  // Add subtle noise to canvas output
  function addCanvasNoise(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Very subtle noise: ±1 on RGB channels
        data[i] = Math.min(255, Math.max(0, data[i] + ((Math.random() > 0.5) ? 1 : -1)));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + ((Math.random() > 0.5) ? 1 : -1)));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + ((Math.random() > 0.5) ? 1 : -1)));
      }
      ctx.putImageData(imageData, 0, 0);
    } catch (_) {}
  }

  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    try { addCanvasNoise(this); } catch (_) {}
    return origToDataURL.apply(this, args);
  };

  HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
    try { addCanvasNoise(this); } catch (_) {}
    return origToBlob.apply(this, [callback, ...args]);
  };

  // WebGL canvas — add noise to toDataURL/toBlob as well
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    const ctx = origGetContext.apply(this, [type, ...args]);
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
      const origTDU = ctx.__proto__.toDataURL;
      if (origTDU) {
        ctx.__proto__.toDataURL = function (...a) {
          return origTDU.apply(this, a);
        };
      }
    }
    return ctx;
  };
})();

// ─────────────────────────────────────────────────────
// Module 8: AudioContext Normalization
// ─────────────────────────────────────────────────────
(() => {
  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return;

  const OrigAudioContext = window.AudioContext || window.webkitAudioContext;

  // Override getChannelData to add subtle noise to audio fingerprint
  const origGetChannelData = OrigAudioContext.prototype.getChannelData;
  if (origGetChannelData) {
    OrigAudioContext.prototype.getChannelData = function (channel) {
      const data = origGetChannelData.apply(this, arguments);
      if (data && data.length > 0) {
        // Add noise to last sample to prevent fingerprinting
        const lastIdx = data.length - 1;
        data[lastIdx] = data[lastIdx] + 0.0001;
      }
      return data;
    };
  }

  // Override createAnalyser to prevent audio fingerprinting via frequency analysis
  const origCreateAnalyser = OrigAudioContext.prototype.createAnalyser;
  if (origCreateAnalyser) {
    OrigAudioContext.prototype.createAnalyser = function () {
      const analyser = origCreateAnalyser.apply(this, arguments);
      const origGetFloatFreqData = analyser.getFloatFrequencyData;
      if (origGetFloatFreqData) {
        analyser.getFloatFrequencyData = function (array) {
          origGetFloatFreqData.apply(this, arguments);
          // Add subtle noise to prevent fingerprinting
          for (let i = 0; i < array.length; i++) {
            array[i] += (Math.random() - 0.5) * 0.001;
          }
        };
      }
      return analyser;
    };
  }

  // Override copyFrom to add noise
  const origCopyFrom = OrigAudioContext.prototype.copyFromChannel;
  if (origCopyFrom) {
    OrigAudioContext.prototype.copyFromChannel = function (destination, channelNumber, startInChannel) {
      origCopyFrom.apply(this, arguments);
      for (let i = 0; i < destination.length; i++) {
        destination[i] += (Math.random() - 0.5) * 0.00001;
      }
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 9: WebRTC Leak Prevention
// ─────────────────────────────────────────────────────
(() => {
  if (typeof RTCPeerConnection === 'undefined') return;

  const OrigRTCPeerConnection = window.RTCPeerConnection;

  window.RTCPeerConnection = function (config, constraints) {
    // Strip TURN/STUN servers to prevent IP leak
    if (config && config.iceServers) {
      config.iceServers = config.iceServers.filter((server) => {
        // Only keep STUN servers (non-TURN) to prevent IP leak
        if (server.urls) {
          const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
          return urls.every((url) => /^stun:/i.test(url));
        }
        return false;
      });
    }
    return new OrigRTCPeerConnection(config, constraints);
  };
  window.RTCPeerConnection.prototype = OrigRTCPeerConnection.prototype;
  window.RTCPeerConnection.generateCertificate = OrigRTCPeerConnection.generateCertificate;

  // Override getStats to hide local candidate IP addresses
  if (OrigRTCPeerConnection.prototype.getStats) {
    const origGetStats = OrigRTCPeerConnection.prototype.getStats;
    OrigRTCPeerConnection.prototype.getStats = function () {
      return origGetStats.apply(this, arguments).then((stats) => {
        const filtered = [];
        stats.forEach((report) => {
          if (report.type === 'local-candidate' || report.type === 'remote-candidate') {
            // Hide IP addresses from stats
            const cloned = Object.assign({}, report);
            if (cloned.ip) cloned.ip = '0.0.0.0';
            if (cloned.address) cloned.address = '0.0.0.0';
            filtered.push(cloned);
          } else {
            filtered.push(report);
          }
        });
        return filtered;
      });
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 10: navigator.webdriver Hide (Deep)
// ─────────────────────────────────────────────────────
(() => {
  // Multi-layer webdriver hiding
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: true
  });

  // Override the CDP detection via window.cdc_ properties
  const cdcKeys = Object.keys(window).filter((k) => /^cdc_/i.test(k));
  cdcKeys.forEach((k) => {
    try { delete window[k]; } catch (_) {}
  });

  // Prevent detection via toString check
  const origToString = Function.prototype.toString;
  Function.prototype.toString = function () {
    if (this === navigator.webdriver?.get) {
      return 'function get webdriver() { [native code] }';
    }
    return origToString.apply(this, arguments);
  };

  // Remove automation-related properties
  const AUTOMATION_PROPS = [
    'webdriver',
    'callPhantom',
    '_phantom',
    '__nightmare',
    '_selenium',
    '_Selenium_IDE_Recorder',
    '__webdriver_evaluate',
    '__driver_evaluate',
    '__webdriver_unwrapped',
    '__selenium_unwrapped',
    '__fxdriver_evaluate',
    '__fxdriver_unwrapped',
    'callSelenium',
    '__lastWatirAlert',
    '__lastWatirConfirm',
    '__lastWatirPrompt',
    'domAutomation',
    'domAutomationController'
  ];
  AUTOMATION_PROPS.forEach((prop) => {
    try { delete window[prop]; } catch (_) {}
    try {
      Object.defineProperty(window, prop, {
        get: () => undefined,
        set: () => {},
        configurable: true
      });
    } catch (_) {}
  });
})();

// ─────────────────────────────────────────────────────
// Module 11: Permission Auto-Deny (Notifications, Geolocation)
// ─────────────────────────────────────────────────────
(() => {
  if (typeof Notification !== 'undefined') {
    const origRequest = Notification.requestPermission;
    Notification.requestPermission = function (cb) {
      if (typeof cb === 'function') {
        cb('denied');
        return Promise.resolve('denied');
      }
      return Promise.resolve('denied');
    };
  }

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition = function (success, error) {
      if (error) {
        error({ code: 1, message: 'User denied geolocation' });
      }
    };
    navigator.geolocation.watchPosition = function (success, error) {
      if (error) {
        error({ code: 1, message: 'User denied geolocation' });
      }
      return 0;
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 12: Performance Timer Clamp
// ─────────────────────────────────────────────────────
(() => {
  if (typeof performance !== 'undefined') {
    const origNow = performance.now;
    let lastTime = 0;
    performance.now = function () {
      const now = origNow.apply(this, arguments);
      // Ensure monotonic and add small jitter to prevent timing attacks
      if (now <= lastTime) {
        lastTime += 0.001;
      } else {
        lastTime = now;
      }
      return lastTime + (Math.random() * 0.01);
    };

    // Override timing entries to prevent high-resolution timing leaks
    const origGetEntries = performance.getEntries;
    performance.getEntries = function () {
      const entries = origGetEntries.apply(this, arguments);
      return entries.map((e) => {
        const clone = Object.assign({}, e);
        if (clone.startTime) clone.startTime = Math.round(clone.startTime * 100) / 100;
        if (clone.duration) clone.duration = Math.round(clone.duration * 100) / 100;
        return clone;
      });
    };

    const origGetEntriesByType = performance.getEntriesByType;
    performance.getEntriesByType = function (type) {
      const entries = origGetEntriesByType.apply(this, arguments);
      return entries.map((e) => {
        const clone = Object.assign({}, e);
        if (clone.startTime) clone.startTime = Math.round(clone.startTime * 100) / 100;
        if (clone.duration) clone.duration = Math.round(clone.duration * 100) / 100;
        return clone;
      });
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 13: brave:// URL Leak Fix
// ─────────────────────────────────────────────────────
(() => {
  // Override window.location accessors to block brave:// navigation
  const origAssign = window.location.assign;
  const origReplace = window.location.replace;

  if (origAssign) {
    window.location.assign = function (url) {
      if (typeof url === 'string' && /^brave:\/\//i.test(url)) {
        return;
      }
      return origAssign.apply(this, arguments);
    };
  }

  if (origReplace) {
    window.location.replace = function (url) {
      if (typeof url === 'string' && /^brave:\/\//i.test(url)) {
        return;
      }
      return origReplace.apply(this, arguments);
    };
  }

  // Block window.open to brave://
  const origOpen = window.open;
  window.open = function (url, ...args) {
    if (typeof url === 'string' && /^brave:\/\//i.test(url)) {
      return null;
    }
    return origOpen.apply(this, [url, ...args]);
  };

  // Block anchor clicks to brave://
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && /^brave:\/\//i.test(anchor.href)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();

// ─────────────────────────────────────────────────────
// Module 14: Storage Leak Fix
// ─────────────────────────────────────────────────────
(() => {
  // Clear extension-related storage entries that could be used for detection
  try {
    const keys = Object.keys(localStorage);
    const EXT_KEYS = keys.filter((k) =>
      /brave|shield|adblock|extension|extensionid/i.test(k)
    );
    EXT_KEYS.forEach((k) => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  } catch (_) {}

  // Override storage access to hide extension-related entries
  const origStorageKeys = Object.getOwnPropertyDescriptor(Storage.prototype, 'key');
  if (origStorageKeys) {
    Object.defineProperty(Storage.prototype, 'key', {
      value: function (index) {
        const key = origStorageKeys.value.call(this, index);
        if (key && /brave|shield|adblock|extension|extensionid/i.test(key)) {
          return null;
        }
        return key;
      },
      configurable: true
    });
  }

  const origGetItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function (key) {
    if (key && /brave|shield|adblock|extension|extensionid/i.test(key)) {
      return null;
    }
    return origGetItem.call(this, key);
  };

  const origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key && /brave|shield|adblock|extension|extensionid/i.test(key)) {
      return;
    }
    return origSetItem.call(this, key, value);
  };
})();

// ─────────────────────────────────────────────────────
// Module 15: Network Bait Faking (Fake Ad Request Responses)
// ─────────────────────────────────────────────────────
(() => {
  // Intercept requests that look like ad requests and return realistic fake responses
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (!url) return origFetch.apply(this, arguments);

    // Fake ad server responses to prevent detection
    const AD_PATTERNS = [
      /doubleclick\.net/i,
      /googlesyndication\.com/i,
      /googleadservices\.com/i,
      /adservice\.google\.com/i,
      /pagead2\.googlesyndication\.com/i,
      /ad\.nativex\.com/i,
      /ads\.mediavine\.com/i,
      /prebid/i,
      /amazon-adsystem\.com/i,
      /criteo\.com/i,
      /taboola\.com/i,
      /outbrain\.com/i
    ];

    const isAdRequest = AD_PATTERNS.some((p) => p.test(url));
    if (isAdRequest) {
      // Return a realistic empty ad response
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        ads: [],
        impressions: 0,
        clickthroughs: 0
      }), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }));
    }

    return origFetch.apply(this, arguments);
  };

  // Also intercept XHR ad requests
  const origXHROpen = XMLHttpRequest.prototype.open;
  const origXHRSend = XMLHttpRequest.prototype.send;
  const AD_PATTERNS = [
    /doubleclick\.net/i,
    /googlesyndication\.com/i,
    /googleadservices\.com/i,
    /adservice\.google\.com/i,
    /pagead2\.googlesyndication\.com/i,
    /amazon-adsystem\.com/i,
    /criteo\.com/i,
    /taboola\.com/i,
    /outbrain\.com/i
  ];

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._bypassAdRequest = AD_PATTERNS.some((p) => p.test(url));
    return origXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (this._bypassAdRequest) {
      // Simulate a successful empty ad response
      Object.defineProperty(this, 'readyState', { writable: true, value: 4 });
      Object.defineProperty(this, 'status', { writable: true, value: 200 });
      Object.defineProperty(this, 'statusText', { writable: true, value: 'OK' });
      Object.defineProperty(this, 'responseText', { writable: true, value: '{"success":true,"ads":[]}' });
      Object.defineProperty(this, 'response', { writable: true, value: '{"success":true,"ads":[]}' });
      setTimeout(() => {
        this.dispatchEvent(new Event('readystatechange'));
        this.dispatchEvent(new Event('load'));
        this.dispatchEvent(new Event('loadend'));
      }, 0);
      return;
    }
    return origXHRSend.apply(this, args);
  };
})();

// ─────────────────────────────────────────────────────
// Module 16: SponsorBlock Integration (In-Page)
// ─────────────────────────────────────────────────────
(() => {
  // Skip sponsor segments when video player is present
  function checkForSponsorSegments() {
    const video = document.querySelector('video');
    if (!video) return;

    // Auto-skip sponsor segments (if SponsorBlock extension is not installed)
    if (!window.SponsorBlock) {
      // Listen for SponsorBlock extension messages or use the video timeupdate
      video.addEventListener('timeupdate', () => {
        // This is a placeholder — actual SponsorBlock integration would require
        // the SponsorBlock API. For now, we just ensure the video plays smoothly.
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForSponsorSegments);
  } else {
    checkForSponsorSegments();
  }
})();

// ─────────────────────────────────────────────────────
// Module 17: Console Detection Bypass
// ─────────────────────────────────────────────────────
(() => {
  // Prevent detection via console.log toString
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;
  const origInfo = console.info;

  console.log = function (...args) {
    // Don't log extension-related messages
    const msg = args.join(' ');
    if (/brave|shield|extension|adblock|bypass/i.test(msg)) {
      return;
    }
    return origLog.apply(this, args);
  };

  console.warn = function (...args) {
    const msg = args.join(' ');
    if (/brave|shield|extension|adblock|bypass/i.test(msg)) {
      return;
    }
    return origWarn.apply(this, args);
  };

  console.error = function (...args) {
    const msg = args.join(' ');
    if (/brave|shield|extension|adblock|bypass/i.test(msg)) {
      return;
    }
    return origError.apply(this, args);
  };

  console.info = function (...args) {
    const msg = args.join(' ');
    if (/brave|shield|extension|adblock|bypass/i.test(msg)) {
      return;
    }
    return origInfo.apply(this, args);
  };

  // Prevent console profiling detection
  if (console.profile) console.profile = function () {};
  if (console.profileEnd) console.profileEnd = function () {};
  if (console.time) {
    const origTime = console.time;
    console.time = function (label) {
      if (label && /brave|shield|extension|adblock/i.test(label)) return;
      return origTime.apply(this, arguments);
    };
  }
  if (console.timeEnd) {
    const origTimeEnd = console.timeEnd;
    console.timeEnd = function (label) {
      if (label && /brave|shield|extension|adblock/i.test(label)) return;
      return origTimeEnd.apply(this, arguments);
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 18: Link Shortener / Redirect Bypass (In-Page)
// ─────────────────────────────────────────────────────
(() => {
  // Intercept link clicks to bypass common link shorteners
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.href;
    if (!href) return;

    const LINK_SHORTENERS = [
      /bit\.ly/i,
      /tinyurl\.com/i,
      /goo\.gl/i,
      /t\.co/i,
      /is\.gd/i,
      /buff\.ly/i,
      /ow\.ly/i,
      /rebrand\.ly/i,
      /cutt\.ly/i,
      /shorte\.st/i,
      /adf\.ly/i,
      /bc\.vc/i,
      /sh\.st/i,
      /clk\.sh/i,
      /adfly/i,
      /linkvertise\.com/i,
      /ouo\.io/i,
      /shrinkme\.io/i
    ];

    const isShortener = LINK_SHORTENERS.some((p) => p.test(href));
    if (isShortener) {
      // Don't prevent default — let the shortener load normally
      // The background.js will handle the actual redirect detection
    }
  }, true);
})();

// ─────────────────────────────────────────────────────
// Module 19: Font Fingerprint Noise
// ─────────────────────────────────────────────────────
(() => {
  // Override document.fonts to prevent font fingerprinting
  if (document.fonts) {
    const origCheck = document.fonts.check;
    document.fonts.check = function (font, text) {
      const result = origCheck.apply(this, arguments);
      // Add slight randomness to font detection
      return Math.random() > 0.05 ? result : !result;
    };
  }

  // Override Canvas measureText to add noise
  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const origMeasure = CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText = function (text) {
      const result = origMeasure.apply(this, arguments);
      // Add tiny noise to text measurement
      const noise = (Math.random() - 0.5) * 0.1;
      const originalWidth = result.width;
      Object.defineProperty(result, 'width', {
        get: () => originalWidth + noise,
        configurable: true
      });
      return result;
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 20: Screen / Display Fingerprint Noise
// ─────────────────────────────────────────────────────
(() => {
  if (typeof screen !== 'undefined') {
    // Normalize screen properties to common values
    const normalizations = {
      colorDepth: 24,
      pixelDepth: 24,
      availWidth: 1920,
      availHeight: 1040,
      width: 1920,
      height: 1080
    };

    for (const [prop, value] of Object.entries(normalizations)) {
      Object.defineProperty(screen, prop, {
        get: () => value,
        configurable: true
      });
    }

    // Override devicePixelRatio to prevent high-DPI fingerprinting
    Object.defineProperty(window, 'devicePixelRatio', {
      get: () => 1,
      configurable: true
    });
  }
})();

// ─────────────────────────────────────────────────────
// Module 21: Timezone / Locale Fingerprint Normalization
// ─────────────────────────────────────────────────────
(() => {
  // Normalize Intl.DateTimeFormat to prevent timezone fingerprinting
  const OrigDateTimeFormat = Intl.DateTimeFormat;

  Intl.DateTimeFormat = function (locales, options) {
    if (options && options.timeZone) {
      // Keep the user's actual timezone — just prevent override-based fingerprinting
    }
    return new OrigDateTimeFormat(locales, options);
  };
  Intl.DateTimeFormat.prototype = OrigDateTimeFormat.prototype;
  Intl.DateTimeFormat.supportedLocalesOf = OrigDateTimeFormat.supportedLocalesOf;

  // Normalize toLocaleString variants
  const origToLocaleString = Date.prototype.toLocaleString;
  Date.prototype.toLocaleString = function (locales, options) {
    return origToLocaleString.apply(this, arguments);
  };
})();

// ─────────────────────────────────────────────────────
// Module 22: Event Listener Leak Prevention
// ─────────────────────────────────────────────────────
(() => {
  // Prevent detection via event listener enumeration
  const origAddEvent = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    // Don't add listeners for extension-specific events
    if (type && /^(braveshield|extension|adblocker)/i.test(type)) {
      return;
    }
    return origAddEvent.apply(this, arguments);
  };
})();

// ─────────────────────────────────────────────────────
// Module 23: Chrome Object Spoofing
// ─────────────────────────────────────────────────────
(() => {
  if (typeof window.chrome === 'undefined') {
    window.chrome = {};
  }

  // Ensure chrome.runtime exists but doesn't leak extension info
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      connect: () => {},
      sendMessage: () => {},
      id: undefined
    };
  }

  // Override chrome.runtime.id to prevent extension detection
  if (window.chrome.runtime) {
    Object.defineProperty(window.chrome.runtime, 'id', {
      get: () => undefined,
      configurable: true
    });
  }
})();

// ─────────────────────────────────────────────────────
// Module 24: Notification Permission Bypass
// ─────────────────────────────────────────────────────
(() => {
  if (typeof Notification !== 'undefined') {
    Object.defineProperty(Notification, 'permission', {
      get: () => 'default',
      configurable: true
    });

    // Override Notification constructor to prevent detection
    const OrigNotification = window.Notification;
    window.Notification = function (title, options) {
      // Silently drop notification creation to prevent detection
      return {
        title,
        body: options?.body || '',
        icon: options?.icon || '',
        close: () => {},
        addEventListener: () => {}
      };
    };
    window.Notification.prototype = OrigNotification.prototype;
    window.Notification.permission = 'default';
    window.Notification.requestPermission = () => Promise.resolve('default');
  }
})();

// ─────────────────────────────────────────────────────
// Module 25: Service Worker Registration Cleanup
// ─────────────────────────────────────────────────────
(() => {
  // Prevent detection via service worker registration
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    const origGetRegistrations = navigator.serviceWorker.getRegistrations;
    navigator.serviceWorker.getRegistrations = function () {
      return origGetRegistrations.apply(this, arguments).then((regs) => {
        // Filter out extension-related service workers
        return regs.filter((reg) => {
          const scope = reg.scope;
          return !(/chrome-extension:|moz-extension:/i.test(scope));
        });
      });
    };
  }
})();

// ─────────────────────────────────────────────────────
// Module 26: History API Leak Prevention
// ─────────────────────────────────────────────────────
(() => {
  // Prevent detection via history manipulation
  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;

  history.pushState = function (state, title, url) {
    if (url && /chrome-extension:|moz-extension:/i.test(url)) {
      return;
    }
    return origPushState.apply(this, arguments);
  };

  history.replaceState = function (state, title, url) {
    if (url && /chrome-extension:|moz-extension:/i.test(url)) {
      return;
    }
    return origReplaceState.apply(this, arguments);
  };
})();

// ─────────────────────────────────────────────────────
// Module 27: Adblock Detection Bypass (Anti-Anti-Adblock)
// ─────────────────────────────────────────────────────
(() => {
  // Override common adblock detection methods
  const origCreateElement = document.createElement.bind(document);

  document.createElement = function (tag, options) {
    const el = origCreateElement(tag, options);

    // Prevent detection via element dimensions (fake ad elements)
    if (tag.toLowerCase() === 'div' || tag.toLowerCase() === 'iframe') {
      const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
      const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

      if (origOffsetWidth) {
        Object.defineProperty(el, 'offsetWidth', {
          get: function () {
            // If this element has ad-related classes/ids, return non-zero
            const className = this.className || '';
            const id = this.id || '';
            if (/ad|banner|sponsor|promo/i.test(className + id)) {
              return 300; // Fake ad dimensions
            }
            return origOffsetWidth.get.call(this);
          },
          configurable: true
        });
      }

      if (origOffsetHeight) {
        Object.defineProperty(el, 'offsetHeight', {
          get: function () {
            const className = this.className || '';
            const id = this.id || '';
            if (/ad|banner|sponsor|promo/i.test(className + id)) {
              return 250;
            }
            return origOffsetHeight.get.call(this);
          },
          configurable: true
        });
      }
    }

    return el;
  };

  // Override getComputedStyle to fake ad element display
  const origGetCS = window.getComputedStyle;
  window.getComputedStyle = function (elt, pseudoElt) {
    const result = origGetCS.apply(this, arguments);
    if (elt && elt.nodeType === 1) {
      const className = elt.className || '';
      const id = elt.id || '';
      if (/ad|banner|sponsor|promo/i.test(className + id)) {
        // Override display to prevent "display:none" detection
        const origDisplay = result.display;
        Object.defineProperty(result, 'display', {
          get: () => 'block',
          configurable: true
        });
      }
    }
    return result;
  };

  // Override common ad detection test functions
  const origQuerySelector = document.querySelector;
  document.querySelector = function (selector) {
    // If the selector is checking for ad elements, return null
    if (/\.ad-container|\.adsbygoogle|\[data-ad-slot\]|#ad-slot|\.sponsored/i.test(selector)) {
      return null; // No ad elements found (they've been removed by Module 3)
    }
    return origQuerySelector.apply(this, arguments);
  };
})();

// ─────────────────────────────────────────────────────
// Module 28: YouTube AdBlocker
// ─────────────────────────────────────────────────────
(() => {
  if (!document.querySelector) return;

  function isYouTube() {
    return window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be');
  }

  if (!isYouTube()) return;

  // YouTube ad selectors to block
  const YT_AD_SELECTORS = [
    '.ytp-ad-module',
    'ytd-ad-slot-renderer',
    'ytd-ad-slot-attachment-renderer',
    '.ytd-ad-preview',
    '.ytp-ad-preview-container',
    '.ytp-ad-overlay-container',
    '.ytp-ad-overlay-heightmap',
    '.ytp-ad-overlay-close-button',
    '.ytp-ad-overlay-icon',
    '.ytp-ad-creation-pane',
    '.ytp-ad-notification',
    '.ytp-ad-info-dialog',
    '.ytp-ad-info-dialog-item',
    '.ytp-gradient-bottom',
    '.ytp-ad-player-overlay',
    '[class*="ytp-ad-"]',
    '[id*="ytp-ad-"]',
    '.ytp-ad-grouping',
    '.ytp-ad-inline',
    '.ytp-ad-overlay',
    '.ytp-ad-show',
    '.ytp-ad-preview',
    '.ytp-ad-text-overlay',
    '.ytp-ad-cta',
    '.ytp-ad-visit-button',
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-skip-button-ytdown',
    '.ytp-ad-allow-instream',
    '.ytp-ad-inline-overlay',
    '.ytp-ad-overlay-slot',
    '.ytp-ad-overlay-slot-linear',
    '.ytp-ad-overlay-slot-nonlinear',
    '.ytp-ad-player-overlay',
    '.ytp-ad-preview-container',
    '.ytp-ad-creation-pane',
    '#movie_player .ytp-ad',
    'ytd-watch-flexy ytd-ad-slot-renderer',
    'ytd-watch-flexy ytd-ad-slot-attachment-renderer',
    'ytd-companion-slot-renderer',
    'ytd-rich-section-renderer',
    '[is="ytd-ad-slot-renderer"]',
    '[is="ytd-ad-slot-attachment-renderer"]',
    'ytd-ad-thumbnail',
    '.ytp-ad-module-container',
    '.ytp-flyout-undo-functions',
    '.ytp-flyout-undo-redo',
    '.ytp-ad-overlay-icon-container',
    '.ytp-ad-action-menu',
    '.ytp-ad-actions',
    '.ytp-ad-preview-header',
    '.ytp-ad-preview-close',
    '.ytp-ad-preview-title',
    '.ytp-ad-preview-description',
    '.ytp-ad-preview-image',
    '.ytp-ad-preview-duration'
  ];

  // Intercept network requests for ad playback
  const AD_PATTERNS = [
    '/get_midroll_',
    '_ad_format=',
    'adformat=',
    'ad_break_',
    '/player_ads',
    'force_release',
    'ad_preflight',
    'ad_show_',
    'pbj=',
    'ad_payload',
    'gcache.goo.gl/ad',
    'youtubei.googleapis.com/*ad',
    'manifest.googlevideo.com/*ad'
  ];

  // Block ad fetch requests
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url || input?.toString();
    if (url && AD_PATTERNS.some(p => new RegExp(p.replace(/\//g, '\\/').replace(/\*/g, '.*'), 'i').test(url))) {
      return Promise.resolve(new Response(JSON.stringify({ adPlacements: [] }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return origFetch.apply(this, arguments);
  };

  // Remove ad elements from DOM
  function removeAdElements() {
    YT_AD_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });

    // Remove ad overlays
    document.querySelectorAll('.ytp-ad-overlay-container, .ytp-ad-overlay-heightmap, .ytp-ad-preview-container').forEach(el => {
      el.style.display = 'none';
      el.remove();
    });

    // Hide ad-related video elements
    document.querySelectorAll('video[playsinline]').forEach(video => {
      video.removeAttribute('disableRemotePlayback');
    });
  }

  // Auto-skip skippable ads
  function autoSkipAds() {
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-ytdown');
    if (skipButton) {
      skipButton.click();
    }
  }

  // Block ad interruptions by intercepting video events
  const origVideoPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const video = this;
    if (video.src && /.*\/.*_ad_.*\.mp4/i.test(video.src)) {
      video.pause();
      video.src = '';
      return Promise.resolve();
    }
    return origVideoPlay.apply(this, arguments);
  };

  // Observer to catch ad elements as they appear
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        try {
          if (node.matches && YT_AD_SELECTORS.some(sel => node.matches(sel))) {
            node.remove();
          } else if (node.querySelectorAll) {
            const ads = node.querySelectorAll(YT_AD_SELECTORS.join(','));
            ads.forEach(el => el.remove());
          }
        } catch (_) {}
      }
      removeAdElements();
      autoSkipAds();
    }
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Run periodically
  setInterval(() => {
    removeAdElements();
    autoSkipAds();
  }, 500);

  // Initial cleanup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeAdElements);
  } else {
    removeAdElements();
  }
})();

// ─────────────────────────────────────────────────────
// Module 29: SponsorBlock Integration
// ─────────────────────────────────────────────────────
(() => {
  function isYouTube() {
    return window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
  }
  if (!isYouTube()) return;

  const SPONSORBLOCK_API = 'https://sponsor.ajay.app';
  let videoId = null;

  function getVideoId() {
    const params = new URLSearchParams(window.location.search);
    let vid = params.get('v');
    if (!vid) {
      const match = window.location.pathname.match(/\/embed\/([^/?&]+)/);
      if (match) vid = match[1];
    }
    if (!vid) {
      const match = window.location.pathname.match(/\/v\/([^/?&]+)/);
      if (match) vid = match[1];
    }
    return vid;
  }

  async function fetchSponsorSegments(vid) {
    try {
      const resp = await fetch(`${SPONSORBLOCK_API}/api/skipSegments/?videoID=${vid}&categories=["sponsor","selfpromotion","interaction","intro","outro","interact","exclusive_access"]`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) return [];
      const segments = await resp.json();
      return segments || [];
    } catch (e) {
      return [];
    }
  }

  function setupAutoSkip() {
    const video = document.querySelector('video');
    if (!video) return;

    video.addEventListener('timeupdate', async function () {
      const newVid = getVideoId();
      if (newVid !== videoId) {
        videoId = newVid;
        if (videoId) {
          const segments = await fetchSponsorSegments(videoId);
          video._sponsorSegments = segments;
        }
      }

      const segments = video._sponsorSegments || [];
      const currentTime = video.currentTime;

      for (const seg of segments) {
        const [start, end] = seg.segment;
        if (currentTime >= start && currentTime < end - 0.1) {
          // Skip to end of segment
          video.currentTime = end;
          break;
        }
      }
    });
  }

  function observeVideo() {
    const target = document.querySelector('ytd-watch-flexy') || document.querySelector('#movie_player');
    if (!target) {
      setTimeout(observeVideo, 500);
      return;
    }

    const config = { childList: true, subtree: true };
    const callback = function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const video = document.querySelector('video');
          if (video && !video._sponsorBlockSetup) {
            video._sponsorBlockSetup = true;
            setupAutoSkip();
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(target, config);
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeVideo);
  } else {
    observeVideo();
  }

  // Poll for video element
  setInterval(() => {
    const video = document.querySelector('video');
    if (video && !video._sponsorBlockSetup) {
      video._sponsorBlockSetup = true;
      setupAutoSkip();
    }
  }, 1000);
})();

// ─────────────────────────────────────────────────────
// Module 30: Undetectable Developer Mode
// ─────────────────────────────────────────────────────
(() => {
  // Check if developer mode flag is set via localStorage
  function isDevModeEnabled() {
    try {
      return localStorage.getItem('bs_dev_mode') === 'true' || sessionStorage.getItem('bs_dev_mode') === 'true';
    } catch (e) {
      return false;
    }
  }

  if (!isDevModeEnabled()) return;

  // Bypass CSP - override security policy
  (function () {
    const origMeta = document.createElement('meta');
    const origCreate = document.createElement;

    document.createElement = function (tag, ...args) {
      const el = origCreate.call(this, tag, ...args);
      if (tag.toLowerCase() === 'meta') {
        const origSet = Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype, 'httpEquiv');
        if (origSet) {
          Object.defineProperty(el, 'httpEquiv', {
            set(value) {
              return; // Block CSP meta tags
            },
            configurable: true
          });
        }
      }
      return el;
    };
  })();

  // Disable anti-debugging
  const origConsole = console;
  console.__proto__.table = function () {
    try { return origConsole.table.apply(origConsole, arguments); } catch (e) {}
  };

  // Override debugger detection
  const origDebugger = Function.prototype.toString;
  Function.prototype.toString = function () {
    if (this.toString === Debugger.prototype.toString) {
      return 'function toString() { [native code] }';
    }
    return origDebugger.apply(this, arguments);
  };

  // Remove debugger traps
  const origOnBeforeUnload = window.addEventListener;
  window.addEventListener = function (type, listener, options) {
    if (type === 'beforeunload' || type === 'unload') {
      // Allow normal beforeunload - don't block
    }
    return origOnBeforeUnload.apply(this, arguments);
  };

  // Override console._buffer and other anti-debug tools
  if (window.console) {
    if (console.memory) {
      Object.defineProperty(console, 'memory', {
        get: () => ({ usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 }),
        configurable: true
      });
    }
    if (console.profile) {
      console._profilerEnabled = false;
      console.profile = function () {};
      console.profileEnd = function () {};
    }
  }

  // Override __devtoolsFormatters and other devtools hooks
  if (window.__devtoolsFormatters) {
    delete window.__devtoolsFormatters;
  }
  Object.defineProperty(window, '__devtoolsFormatters', {
    get: () => [],
    configurable: true
  });

  // Disable source map URL hijacking
  const origCreateElement = document.createElement;

  // Override Error stack to prevent leak
  const origError = window.Error;
  function PatchedError(message) {
    const err = new origError(message);
    const origStack = err.stack;
    try {
      Object.defineProperty(err, 'stack', {
        get: () => origStack,
        configurable: true
      });
    } catch (e) {}
    return err;
  }
  if (origError) {
    PatchedError.prototype = origError.prototype;
    PatchedError.captureStackTrace = origError.captureStackTrace || function () {};
  }
  window.Error = PatchedError;

  // Override __proto__ checks that detection scripts use
  Object.defineProperty(Object.prototype, '__proto__', {
    get: function () { return Object.getPrototypeOf(this); },
    set: function (val) { Object.setPrototypeOf(this, val); },
    configurable: true
  });

  // Remove __noCSP flag detection
  if (typeof window.__noCSP !== 'undefined') {
    Object.defineProperty(window, '__noCSP', {
      value: undefined,
      configurable: true
    });
  }

  // Override PerformanceObserver to hide devtools detection
  if (window.PerformanceObserver) {
    const OrigPerfObs = window.PerformanceObserver;
    window.PerformanceObserver = function (callback) {
      const wrappedCallback = function (list, observer) {
        // Filter out devtools-related entries
        const entries = list.getEntries ? list.getEntries() : [];
        const filtered = entries.filter(e => !/devtool|chrome|extension/i.test(e.name || ''));
        if (filtered.length > 0) {
          callback.call(this, {
            getEntries: () => filtered,
            getEntriesByType: (type) => filtered.filter(e => e.entryType === type),
            getEntriesByName: (name, type) => filtered.filter(e => e.name === name && (!type || e.entryType === type))
          }, observer);
        }
      };
      return new OrigPerfObs(wrappedCallback);
    };
    window.PerformanceObserver.prototype = OrigPerfObs.prototype;
    window.PerformanceObserver.supportedEntryTypes = OrigPerfObs.supportedEntryTypes;
  }

  // Override requestAnimationFrame to detect and bypass DevTools checks
  const origRAF = window.requestAnimationFrame;
  if (origRAF) {
    window.requestAnimationFrame = function (callback) {
      return origRAF.call(this, function () {
        // Patch any devtools detection in callback
        try {
          callback.apply(this, arguments);
        } catch (e) {
          // Silently swallow devtools-related errors
        }
      });
    };
  }

  // Remove detection scripts that check for DevTools
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        try {
          if (node.tagName === 'SCRIPT' && node.textContent) {
            const content = node.textContent;
            if (/devtools|debugger|console\.dir|__devtool/i.test(content)) {
              node.remove();
            }
          }
        } catch (_) {}
      }
    }
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Expose a global flag so other modules can check dev mode
  window.__bsDevMode = true;

  // Listen for toggle messages from popup
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'bs-toggle-dev-mode') {
      const enabled = event.data.enabled;
      try {
        localStorage.setItem('bs_dev_mode', String(enabled));
        sessionStorage.setItem('bs_dev_mode', String(enabled));
      } catch (e) {}
      if (enabled) {
        window.location.reload();
      }
    }
  });
})();

console.log('[Extension] Stealth engine v5.0.0 loaded. 30 modules active.');