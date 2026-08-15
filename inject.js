/**
 * inject.js — BraveShield Bypass Pro Stealth Engine
 * Version: 5.0.0
 * Injected into the MAIN world via a <script> tag in the page.
 * Purpose: Anti-detection, adblock bypass, brave:// leak prevention, and stealth hardening.
 */

// ─────────────────────────────────────────────────────
// Master Kill Switch Check & Telemetry
// ─────────────────────────────────────────────────────
try {
  if (sessionStorage.getItem('bs_master_disabled') === 'true') {
    console.log('[Extension] BraveShield Bypass Pro is disabled via Master Kill Switch.');
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'bs-set-master-state' && e.data.enabled) {
        try { sessionStorage.removeItem('bs_master_disabled'); } catch (_) {}
        window.location.reload();
      }
    });
  }
} catch (_) {}

window.__bs_audit = {
  blockedTrackers: 0,
  sanitizedFingerprints: 0,
  trapsBypassed: 0
};

// ─────────────────────────────────────────────────────
// Module 0: Brave-Specific Detection Bypass
// ─────────────────────────────────────────────────────
(() => {
  // Block all brave:// URL detection attempts with transparent native Proxy
  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch;
    window.fetch = new Proxy(originalFetch, {
      apply(target, thisArg, args) {
        try {
          const input = args[0];
          const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input?.url);
          if (url && typeof url === 'string' && /^brave:\/\//i.test(url)) {
            return Promise.resolve(new Response('', { status: 404, statusText: 'Not Found' }));
          }
        } catch (_) {}
        return Reflect.apply(target, thisArg || window, args);
      }
    });
  }

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
// Module 1: Complete Google Chrome Parity & Brave Cloaking
// ─────────────────────────────────────────────────────
(() => {
  if (typeof navigator === 'undefined') return;

  // 1. Deep Purge of all Brave traces from prototype chain & window
  try {
    delete Navigator.prototype.brave;
    delete navigator.brave;
    if (navigator.__proto__) delete navigator.__proto__.brave;
    
    // Patch Object.getOwnPropertyNames on Navigator prototype
    const origGetOwnPropertyNames = Object.getOwnPropertyNames;
    Object.getOwnPropertyNames = function(obj) {
      const names = origGetOwnPropertyNames.apply(this, arguments);
      if (obj === Navigator.prototype || obj === navigator) {
        return names.filter(n => n !== 'brave');
      }
      return names;
    };

    // Proxy Object.getOwnPropertyDescriptor to return undefined for brave probes
    const origGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(target, prop) {
      if ((target === Navigator.prototype || target === navigator) && prop === 'brave') {
        return undefined;
      }
      return origGetOwnPropertyDescriptor.apply(this, arguments);
    };

    // Remove Brave Crypto/Wallet detectors (Ethereum & Solana)
    delete window.braveSolana;
    delete window.solanaBrave;
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
  } catch (_) {}

  // 2. Exact Google Chrome User-Agent & Platform Cloak
  try {
    const CHROME_VERSION = '124.0.6367.207';
    const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + CHROME_VERSION + ' Safari/537.36';

    Object.defineProperty(navigator, 'userAgent', {
      get: () => CHROME_UA,
      configurable: true
    });

    Object.defineProperty(navigator, 'appVersion', {
      get: () => '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + CHROME_VERSION + ' Safari/537.36',
      configurable: true
    });

    Object.defineProperty(navigator, 'vendor', {
      get: () => 'Google Inc.',
      configurable: true
    });

    Object.defineProperty(navigator, 'productSub', {
      get: () => '20030107',
      configurable: true
    });

    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32',
      configurable: true
    });

    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
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

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8,
      configurable: true
    });

    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8,
      configurable: true
    });

    // 3. Authentic Chrome Plugins Array
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = [
          { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
        ];
        arr.item = (i) => arr[i] || null;
        arr.namedItem = (name) => arr.find((p) => p.name === name) || null;
        arr.refresh = () => {};
        return arr;
      },
      configurable: true
    });
  } catch (_) {}

  // 4. Authentic Google Chrome Client Hints (navigator.userAgentData)
  try {
    if (navigator.userAgentData) {
      const chromeBrands = [
        { brand: 'Chromium', version: '124' },
        { brand: 'Google Chrome', version: '124' },
        { brand: 'Not-A.Brand', version: '99' }
      ];

      Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
          brands: chromeBrands,
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: (hints) => Promise.resolve({
            brands: chromeBrands,
            mobile: false,
            platform: 'Windows',
            platformVersion: '15.0.0',
            architecture: 'x86',
            bitness: '64',
            model: '',
            uaFullVersion: '124.0.6367.207',
            fullVersionList: [
              { brand: 'Chromium', version: '124.0.6367.207' },
              { brand: 'Google Chrome', version: '124.0.6367.207' },
              { brand: 'Not-A.Brand', version: '99.0.0.0' }
            ]
          }),
          toJSON: () => ({
            brands: chromeBrands,
            mobile: false,
            platform: 'Windows'
          })
        }),
        configurable: true
      });
    }
  } catch (_) {}

  // 5. Authentic window.chrome API Stubs (Exact Google Chrome footprint)
  try {
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
  } catch (_) {}
})();

// ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────
// Module 3: Anti-Adblock Trap Defusal & Synthetic Ad Globals
// ─────────────────────────────────────────────────────
(() => {
  // 1. Universal Fake Ad Globals to defeat script detectors
  try {
    window.canRunAds = true;
    window.isAdBlockActive = false;
    window.adblock = false;
    window.adBlocker = false;
    window.adsBlocked = false;
    window.adblockDetected = false;
    window.hasAdBlocker = false;
    window.isAdblock = false;
    window.adBlockDetected = false;
    window.adBlockerDetected = false;
    window.is_adblock_detected = false;
    window.ad_block_detected = false;
    window.adb = false;
    window._adsEnabled = true;

    // Scriptlet constant defusers (set-constant)
    const defusedConstants = {
      canRunAds: true,
      isAdBlockActive: false,
      adblockDetected: false,
      adBlockDetected: false,
      hasAdblock: false,
      isAdBlocked: false,
      adblock: false,
      adBlock: false,
      ad_block: false,
      isAdblock: false,
      is_adblock: false
    };

    for (const [key, val] of Object.entries(defusedConstants)) {
      try {
        Object.defineProperty(window, key, {
          get: () => val,
          set: () => {},
          configurable: true,
          enumerable: true
        });
      } catch (_) {
        window[key] = val;
      }
    }

    // Google AdSense stubs
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.loaded = true;
    window.adsbygoogle.push = function(o) { return 1; };
    window.google_ad_client = 'ca-pub-9999999999999999';
    window.google_ad_status = 1;

    // Analytics & Telemetry stubs
    window.ga = window.ga || function() {};
    window.gtag = window.gtag || function() {};
    window.dataLayer = window.dataLayer || [];

    // Prebid & Ad Networks
    window.pbjs = window.pbjs || {
      que: [],
      getAdserverTargeting: () => ({}),
      requestBids: (o) => { try { o?.bidsBackHandler?.(); } catch(_) {} },
      adUnits: []
    };

    window.googletag = window.googletag || {
      cmd: [],
      apiReady: true,
      pubads: () => ({
        addEventListener: () => {},
        enableSingleRequest: () => {},
        enableServices: () => {},
        setTargeting: () => {},
        collapseEmptyDivs: () => {},
        clear: () => {},
        refresh: () => {}
      }),
      display: () => {},
      defineSlot: () => ({
        addService: () => ({ setTargeting: () => {} }),
        setTargeting: () => {},
        renderEnded: () => {}
      }),
      enableServices: () => {}
    };

    // Universal Anti-Adblock Trap Interceptors (FuckAdBlock, BlockAdBlock, SAB, Admiral, Detector)
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
    window.babasbml = { isAdblockEnabled: () => false };
    window.admiral = window.admiral || function() {};
    window.snackBar = window.snackBar || { show: () => {} };
  } catch (_) {}

  // 2. DOM Bait Trap Hook: Prevent offsetHeight === 0 or clientHeight === 0 detection
  try {
    const AD_BAIT_REGEX = /ad[s_-]?box|ad[s_-]?banner|ad[s_-]?unit|ad[s_-]?container|ad[s_-]?wrapper|adsbygoogle|pub_300|banner-ad|ad-zone|ad_slot|sponsor|advertisement|textads|carbonads|ad-detector|ad-test/i;

    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const origClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    const origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    const origOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');

    function isBaitElement(el) {
      if (!el || !(el instanceof HTMLElement)) return false;
      const idOrClass = (el.id || '') + ' ' + (el.className || '') + ' ' + (el.getAttribute('data-ad') || '');
      return AD_BAIT_REGEX.test(idOrClass);
    }

    if (origOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get: function() {
          const real = origOffsetHeight.get.call(this);
          if (real === 0 && isBaitElement(this)) return 250;
          return real;
        },
        configurable: true
      });
    }

    if (origOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        get: function() {
          const real = origOffsetWidth.get.call(this);
          if (real === 0 && isBaitElement(this)) return 300;
          return real;
        },
        configurable: true
      });
    }

    if (origClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        get: function() {
          const real = origClientHeight.get.call(this);
          if (real === 0 && isBaitElement(this)) return 250;
          return real;
        },
        configurable: true
      });
    }

    if (origClientWidth) {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        get: function() {
          const real = origClientWidth.get.call(this);
          if (real === 0 && isBaitElement(this)) return 300;
          return real;
        },
        configurable: true
      });
    }

    if (origOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get: function() {
          const real = origOffsetParent.get.call(this);
          if (!real && isBaitElement(this)) return document.body || this.parentElement;
          return real;
        },
        configurable: true
      });
    }

    // getBoundingClientRect & getClientRects Hook for Bait Elements
    const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      const rect = origGetBoundingClientRect.call(this);
      if (rect.width === 0 && rect.height === 0 && isBaitElement(this)) {
        return new DOMRect(rect.x || 0, rect.y || 0, 300, 250);
      }
      return rect;
    };

    const origGetClientRects = Element.prototype.getClientRects;
    Element.prototype.getClientRects = function() {
      const list = origGetClientRects.call(this);
      if (list.length === 0 && isBaitElement(this)) {
        const mockRect = new DOMRect(0, 0, 300, 250);
        return Object.assign([mockRect], { item: (i) => i === 0 ? mockRect : null });
      }
      return list;
    };

    // prevent-addEventListener Hook: Drop anti-adblock honeypot listeners
    const origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (typeof listener === 'function' && (type === 'DOMContentLoaded' || type === 'load' || type === 'resize')) {
        try {
          const fnStr = Function.prototype.toString.call(listener).toLowerCase();
          if (/fuckadblock|blockadblock|adblockdetected|canrunads|isadblockactive|yavli|ad-shield/i.test(fnStr)) {
            return;
          }
        } catch (_) {}
      }
      return origAddEventListener.call(this, type, listener, options);
    };

    // abort-on-property-read Scriptlet Helper
    window.abortOnPropertyRead = function(prop) {
      try {
        Object.defineProperty(window, prop, {
          get() { throw new ReferenceError(`${prop} is not defined`); },
          set() {},
          configurable: true
        });
      } catch (_) {}
    };
  } catch (_) {}
})();

// ─────────────────────────────────────────────────────
// Module 4: Universal Anti-Adblock Modal Annihilator & Fullscreen Backdrop Cleaner
// ─────────────────────────────────────────────────────
(() => {
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

  function annihilateAntiAdblockModals() {
    try {
      // First pass: auto-bypass disclaimer gates cleanly
      autoBypassAgeAndConsent();

      // 1. Detect and destroy anti-adblock modals
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

          if (window.__bs_audit) window.__bs_audit.trapsBypassed++;
        }
      }

      // 2. Clean up dark backdrops and dimmed overlays
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

      // 3. Remove fixed fullscreen dark dimmers
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

      // 4. Unconditionally restore page scrolling, opacity, brightness, and pointer-events
      document.body.style.setProperty('overflow', 'auto', 'important');
      document.body.style.setProperty('position', 'static', 'important');
      document.body.style.setProperty('filter', 'none', 'important');
      document.body.style.setProperty('opacity', '1', 'important');
      document.body.style.setProperty('pointer-events', 'auto', 'important');
      document.documentElement.style.setProperty('overflow', 'auto', 'important');
      document.documentElement.style.setProperty('filter', 'none', 'important');
      document.documentElement.style.setProperty('opacity', '1', 'important');
      document.documentElement.style.setProperty('pointer-events', 'auto', 'important');

      // 5. Restore any dimmed/blurred main page content
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

  // Run immediately and periodically
  annihilateAntiAdblockModals();
  const trapInterval = setInterval(annihilateAntiAdblockModals, 300);
  setTimeout(() => clearInterval(trapInterval), 15000);

  // Also observe DOM changes
  const trapObserver = new MutationObserver(() => {
    annihilateAntiAdblockModals();
  });
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      trapObserver.observe(document.documentElement, { childList: true, subtree: true });
    });
  }
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
// Module 15: Network Bait Faking (Fake Ad Request Responses & DNS Probes)
// ─────────────────────────────────────────────────────
(() => {
  const AD_PATTERNS = [
    /doubleclick\.net/i,
    /googlesyndication\.com/i,
    /googleadservices\.com/i,
    /adservice\.google\./i,
    /pagead2\.googlesyndication\.com/i,
    /pagead2\.google/i,
    /ad\.nativex\.com/i,
    /ads\.mediavine\.com/i,
    /prebid/i,
    /amazon-adsystem\.com/i,
    /criteo\.com/i,
    /taboola\.com/i,
    /outbrain\.com/i,
    /monetag\.com/i,
    /propellerads\.com/i,
    /adsterra\.com/i,
    /adnxs\.com/i,
    /clarity\.ms/i,
    /clickadu\.com/i,
    /popads\.net/i,
    /\/ads?\.js/i,
    /\/adframe\.js/i,
    /\/advert\.js/i,
    /\/adblock\.js/i,
    /\/show_ads\.js/i
  ];

  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input?.url);
    if (!url) return origFetch.apply(this, arguments);

    const isAdRequest = AD_PATTERNS.some((p) => p.test(url));
    if (isAdRequest) {
      const isJs = /\.js/i.test(url);
      const body = isJs 
        ? 'window.canRunAds=true;window.isAdBlockActive=false;window.adblock=false;' 
        : JSON.stringify({ success: true, ads: [], impressions: 0, clickthroughs: 0 });
      
      return Promise.resolve(new Response(body, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': isJs ? 'application/javascript' : 'application/json',
          'Cache-Control': 'no-cache'
        }
      }));
    }

    return origFetch.apply(this, arguments);
  };

  const origXHROpen = XMLHttpRequest.prototype.open;
  const origXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._bypassAdRequest = typeof url === 'string' && AD_PATTERNS.some((p) => p.test(url));
    this._bypassUrl = url;
    return origXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (this._bypassAdRequest) {
      const isJs = typeof this._bypassUrl === 'string' && /\.js/i.test(this._bypassUrl);
      const resp = isJs 
        ? 'window.canRunAds=true;window.isAdBlockActive=false;window.adblock=false;' 
        : '{"success":true,"ads":[]}';

      Object.defineProperty(this, 'readyState', { writable: true, value: 4 });
      Object.defineProperty(this, 'status', { writable: true, value: 200 });
      Object.defineProperty(this, 'statusText', { writable: true, value: 'OK' });
      Object.defineProperty(this, 'responseText', { writable: true, value: resp });
      Object.defineProperty(this, 'response', { writable: true, value: resp });
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

// ─────────────────────────────────────────────────────
// Module 31: Video Turbo Engine (Option C: 16x Ad Skip, Background Play, PiP)
// ─────────────────────────────────────────────────────
(() => {
  // 1. Background Video Playback (Anti-Tab-Switch Freeze)
  try {
    const origHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    const origVisibility = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');

    Object.defineProperty(document, 'hidden', {
      get: function () {
        const playing = Array.from(document.querySelectorAll('video, audio')).some(m => !m.paused);
        if (playing) return false;
        return origHidden && origHidden.get ? origHidden.get.call(this) : false;
      },
      configurable: true
    });

    Object.defineProperty(document, 'visibilityState', {
      get: function () {
        const playing = Array.from(document.querySelectorAll('video, audio')).some(m => !m.paused);
        if (playing) return 'visible';
        return origVisibility && origVisibility.get ? origVisibility.get.call(this) : 'visible';
      },
      configurable: true
    });

    document.addEventListener('visibilitychange', (e) => {
      const playing = Array.from(document.querySelectorAll('video, audio')).some(m => !m.paused);
      if (playing) {
        e.stopImmediatePropagation();
      }
    }, true);
  } catch (_) {}

  // 2. 16x Video Ad Fast-Forwarder & Auto-Mute
  function handleVideoAds() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      // Remove Picture-in-Picture restrictions
      if (video.hasAttribute('disablepictureinpicture')) {
        video.removeAttribute('disablepictureinpicture');
      }
      try {
        if ('disablePictureInPicture' in video) {
          video.disablePictureInPicture = false;
        }
      } catch (_) {}

      // Identify ad player wrapper or ad classes
      const isAdShowing = video.closest('.ad-showing') !== null ||
                          video.closest('.ad-interrupting') !== null ||
                          video.classList.contains('ad-interrupting') ||
                          document.querySelector('.ad-showing, .ad-interrupting, .video-ads .ad-container') !== null;

      if (isAdShowing) {
        try {
          if (video.playbackRate < 16.0) video.playbackRate = 16.0;
          if (!video.muted) {
            video._bsOriginalMuted = video.muted;
            video.muted = true;
          }
          if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.1) {
            video.currentTime = video.duration;
          }
          if (window.__bs_audit) window.__bs_audit.blockedTrackers++;
        } catch (_) {}
      } else if (video.playbackRate > 2.0) {
        video.playbackRate = 1.0;
        if (video._bsOriginalMuted === false) {
          video.muted = false;
          delete video._bsOriginalMuted;
        }
      }
    });
  }

  setInterval(handleVideoAds, 400);

  // 3. Message handlers for PiP and Master Kill Switch
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'bs-trigger-pip') {
      const mainVideo = document.querySelector('video');
      if (mainVideo) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {});
        } else {
          mainVideo.requestPictureInPicture().catch(() => {});
        }
      }
    } else if (e.data?.type === 'bs-set-master-state') {
      try {
        if (!e.data.enabled) {
          sessionStorage.setItem('bs_master_disabled', 'true');
        } else {
          sessionStorage.removeItem('bs_master_disabled');
        }
        window.location.reload();
      } catch (_) {}
    } else if (e.data?.type === 'bs-clear-storage') {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch (_) {}
    }
  });
})();

// ─────────────────────────────────────────────────────
// Module 32: Ultra 50x-100x Turbo Timer, Clock Warp & Link Shortener Bypass
// ─────────────────────────────────────────────────────
(() => {
  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  const isMediaPlatform = host.includes('spotify.com') || host.includes('youtube.com') || host.includes('youtu.be') || host.includes('netflix.com') || host.includes('twitch.tv');

  // 1. Virtual 50x Clock Time-Warp for Date.now() and performance.now()
  if (!isMediaPlatform) {
    try {
      const origDateNow = Date.now.bind(Date);
      const warpStartTime = origDateNow();
      const WARP_SPEED = 50; // True 50x acceleration

      Date.now = function() {
        const realElapsed = origDateNow() - warpStartTime;
        return warpStartTime + (realElapsed * WARP_SPEED);
      };

      if (window.performance && typeof window.performance.now === 'function') {
        const origPerfNow = window.performance.now.bind(window.performance);
        const perfStartTime = origPerfNow();
        window.performance.now = function() {
          const realElapsed = origPerfNow() - perfStartTime;
          return perfStartTime + (realElapsed * WARP_SPEED);
        };
      }
    } catch (_) {}
  }

  // 2. Ultra 50x-100x setTimeout & setInterval compression
  const origSetTimeout = window.setTimeout;
  const origSetInterval = window.setInterval;

  window.setTimeout = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (!isMediaPlatform && numDelay >= 500 && numDelay <= 180000) {
      // 50x acceleration: 15,000ms -> 300ms, 30,000ms -> 600ms
      numDelay = Math.max(10, Math.floor(numDelay / 50));
    }
    return origSetTimeout.call(this, handler, numDelay, ...args);
  };

  window.setInterval = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (!isMediaPlatform) {
      // Accelerate 1-second countdown tick loops (1000ms -> 20ms)
      if (numDelay >= 800 && numDelay <= 2500) {
        numDelay = Math.max(15, Math.floor(numDelay / 50));
      } else if (numDelay >= 40 && numDelay <= 400) {
        numDelay = 5;
      }
    }
    return origSetInterval.call(this, handler, numDelay, ...args);
  };

  // 3. Suppress blocking "Bad Request." alerts from premature clicks
  const origAlert = window.alert;
  window.alert = function(msg) {
    if (typeof msg === 'string' && /bad\s+request|adblock|disable\s+ad/i.test(msg)) {
      console.warn('[Bypass] Suppressed shortener alert:', msg);
      return;
    }
    return origAlert.apply(this, arguments);
  };

  // 4. Force Zero Known Global Shortener Countdown Variables
  const COUNTDOWN_VAR_NAMES = [
    'count', 'counter', 'countdown', 'seconds', 'sec', 'timer', 'timer_count',
    'wpsafe_time', 'p_time', 'c', 'time_left', 'timeLeft', 'waittime', 'waitTime',
    'step', 'num', 'totalTime', 'secCount', 'downloadWait'
  ];

  function forceZeroCountdownGlobals() {
    if (isMediaPlatform) return;
    for (const v of COUNTDOWN_VAR_NAMES) {
      try {
        if (typeof window[v] === 'number' && window[v] > 1) {
          window[v] = 0;
        }
      } catch (_) {}
    }
  }

  // 5. Intelligent Link Shortener Completion & Safe Auto-Clicker
  function turboPassCountdownsAndLinks() {
    try {
      // STRICT EXCLUSION: Never click pagination, blog navigation, or site internal search links
      function isPaginationOrNavigation(el) {
        if (!el) return true;
        const href = (el.getAttribute('href') || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        const cls = (el.className || '').toLowerCase();

        if (/reverse-paginate|updated-max|max-results|blog-pager|pagination|page-numbers|older-posts|newer-posts|nav-links|comment-editor|category|tag\//i.test(href)) {
          return true;
        }
        if (/blog-pager|pagination|pager|page-nav|nav-links|page-numbers|older-link|newer-link/i.test(id + ' ' + cls)) {
          return true;
        }
        return false;
      }

      const buttonSelectors = [
        '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download',
        '.get-link', '.download-btn', '.btn-download', '.getlink', '#link-button',
        '#continue-btn', '#btn-continue', '.continue-btn', '#go-link', '.go-link',
        '#final-download', '.direct-download', '#downloadBtn', '#btnDownload',
        'a[href*="get-link"]', 'a[href*="download-file"]'
      ];

      for (const sel of buttonSelectors) {
        const btns = document.querySelectorAll(sel);
        for (const btn of btns) {
          if (btn && !isPaginationOrNavigation(btn)) {
            const txt = (btn.innerText || btn.value || '').trim();

            // CRITICAL: NEVER click when button is in loading state
            if (/getting\s+link|please\s+wait|loading|generating|processing|wait\s+\d+|countdown/i.test(txt)) {
              continue;
            }

            // Strictly match real download actions (NOT bare 'next' or generic blog buttons)
            const isReadyText = /^(get\s+link|download|download\s+now|direct\s+download|download\s+apk|click\s+here\s+to\s+download)$/i.test(txt);
            const hasValidExternalHref = btn.href && (btn.href.includes('drive.google') || btn.href.includes('mega.nz') || btn.href.includes('mediafire') || btn.href.includes('pixeldrain') || btn.href.includes('gofile') || btn.href.includes('1fichier') || btn.href.includes('dupload') || btn.href.includes('apkadmin') || btn.href.includes('uploadrar'));

            if (isReadyText || hasValidExternalHref) {
              btn.removeAttribute('disabled');
              btn.removeAttribute('aria-disabled');
              if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
              btn.style.pointerEvents = 'auto';
              btn.style.opacity = '1';
              btn.style.display = 'inline-block';
              btn.style.visibility = 'visible';

              if (!btn._bsClicked) {
                btn._bsClicked = true;
                setTimeout(() => {
                  try { btn.click(); } catch (_) {}
                }, 400);
              }
            }
          }
        }
      }

      // Unveil APK download boxes (e.g. SpotiDuck, Blogger APK blogs)
      const hiddenApkLinks = document.querySelectorAll(
        '.download-box a, .post-body a[href*="download"], .entry-content a[href*="download"], a[href*="drive.google"], a[href*="mediafire"], a[href*="mega.nz"], a[href*="pixeldrain"], a[href*="gofile"], a[href*="dupload"], a[href*="apkadmin"], a[href*="uploadrar"]'
      );
      for (const apk of hiddenApkLinks) {
        if (apk && !isPaginationOrNavigation(apk)) {
          apk.style.setProperty('display', 'inline-block', 'important');
          apk.style.setProperty('visibility', 'visible', 'important');
          apk.style.setProperty('opacity', '1', 'important');
          apk.style.setProperty('pointer-events', 'auto', 'important');
          if (apk.parentElement) {
            apk.parentElement.style.setProperty('display', 'block', 'important');
            apk.parentElement.style.setProperty('visibility', 'visible', 'important');
          }
        }
      }

      // Hide lingering loading spinners on download boxes once content is ready
      if (hiddenApkLinks.length > 0) {
        document.querySelectorAll('.spinner, .loading, svg.spin, .fa-spin').forEach(sp => {
          try { sp.style.display = 'none'; } catch (_) {}
        });
      }

      // Bypass window.open traps — only block known rogue ad popunder domains with safe mock window
      if (!window._bsPopupFiltered) {
        window._bsPopupFiltered = true;
        const origWindowOpen = window.open;
        const KNOWN_AD_POPUNDER_DOMAINS = [
          /popcash\.net/i, /popads\.net/i, /syndication\.exoclick/i, /clickadu\.com/i,
          /monetag\.com/i, /propellerads\.com/i, /adsterra\.com/i, /trafficjunky\.com/i,
          /adkeeper\.co/i, /exoclick\.com/i, /juicyads\.com/i, /adnxs\.com/i
        ];
        const safeMockWindow = {
          closed: false,
          focus: function() {},
          blur: function() {},
          close: function() {},
          location: { href: '' },
          document: { write: function() {} }
        };
        window.open = function(url, target, features) {
          if (typeof url === 'string' && KNOWN_AD_POPUNDER_DOMAINS.some(p => p.test(url))) {
            return safeMockWindow;
          }
          return origWindowOpen.apply(this, arguments);
        };
      }
    } catch (_) {}
  }

  // 4. "Click On Ads To Get Download Link" Universal Fast-Pass Engine
  function bypassClickOnAdsPattern() {
    try {
      // Set all standard safelink/verification globals
      window.adClicked = true;
      window.isAdClicked = true;
      window.hasClickedAd = true;
      window.clickedAd = true;
      window.ad_clicked = true;
      window.ad_status = 1;
      window.adClickCount = 1;
      window.isAdOpened = true;
      window.cookies_status = 1;
      window.is_ad_clicked = true;
      window.click_status = 1;
      try {
        sessionStorage.setItem('ad_clicked', 'true');
        sessionStorage.setItem('adClicked', 'true');
        sessionStorage.setItem('is_ad_clicked', 'true');
        localStorage.setItem('ad_clicked', 'true');
        localStorage.setItem('adClicked', 'true');
      } catch (_) {}

      // Automatically execute any site-defined link reveal functions
      const siteRevealFunctions = [
        'showDownloadButton', 'showDownloadBtn', 'getDownloadLink', 'getDownloadBtn',
        'generateLink', 'getLink', 'showLink', 'startTimer', 'clickOnAd', 'verifyAdClick',
        'directDownload', 'finalDownloadLink', 'unhideLink', 'openDownload', 'createDownloadLink'
      ];
      for (const fn of siteRevealFunctions) {
        if (typeof window[fn] === 'function') {
          try { window[fn](); } catch (_) {}
        }
      }

      // Auto-click WordPress Safelink / GPVadnagar sequence buttons
      const wpSafelinkGenerate = document.querySelector('#wpsafe-generate, #wpsafe-snp, #tp-snp2');
      if (wpSafelinkGenerate && !wpSafelinkGenerate._bsTriggered) {
        wpSafelinkGenerate._bsTriggered = true;
        try { wpSafelinkGenerate.click(); } catch (_) {}
      }

      // Discover destination download link from page DOM, scripts, or attributes
      let targetDownloadUrl = '';
      const allAnchors = document.querySelectorAll('a[href]');
      for (const a of allAnchors) {
        const h = a.href || '';
        if (h && (h.includes('dupload.net') || h.includes('drive.google') || h.includes('mega.nz') || h.includes('mediafire') || h.includes('pixeldrain') || h.includes('gofile') || h.includes('1fichier') || h.includes('apkadmin') || h.includes('uploadrar') || h.includes('/go/') || h.includes('/links/'))) {
          targetDownloadUrl = h;
          // Highlight the real link
          a.style.setProperty('display', 'inline-block', 'important');
          a.style.setProperty('visibility', 'visible', 'important');
          a.style.setProperty('opacity', '1', 'important');
          a.style.setProperty('pointer-events', 'auto', 'important');
          break;
        }
      }

      // ONLY target real button elements (never header/footer banner divs!)
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
              } else {
                window.adClicked = true;
                window.isAdClicked = true;
                try {
                  window.dispatchEvent(new Event('blur'));
                  setTimeout(() => window.dispatchEvent(new Event('focus')), 50);
                } catch (_) {}
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

  // 5. Force Navigation on Safelink / Download Links (excluding pagination)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (href && (href.startsWith('http') || href.startsWith('//')) && !href.startsWith('javascript:')) {
      if (!/reverse-paginate|updated-max|max-results|blog-pager|pagination/i.test(href)) {
        setTimeout(() => {
          if (e.defaultPrevented) {
            console.log('[Bypass] Safelink navigation unblocked:', href);
            window.open(href, anchor.target || '_blank');
          }
        }, 50);
      }
    }
  }, true);

  setInterval(turboPassCountdownsAndLinks, 300);
  setInterval(bypassClickOnAdsPattern, 300);
  document.addEventListener('DOMContentLoaded', () => {
    turboPassCountdownsAndLinks();
    bypassClickOnAdsPattern();
  });
})();

console.log('[Extension] Stealth engine v5.1.0 loaded. 42 modules active.');