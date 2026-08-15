/**
 * BraveShield Bypass Pro — Core Stealth & Anti-Detection Engine
 * Version: 5.3.0
 * Execution World: MAIN (True document_start)
 * Purpose: Complete Google Chrome parity, deep Brave cloaking, anti-adblock defusal,
 *          safe turbo timers, YouTube/Spotify acceleration, and canvas/webgl protection.
 */

(() => {
  'use strict';

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

  window.__bs_audit = {
    blockedTrackers: 0,
    sanitizedFingerprints: 0,
    trapsBypassed: 0
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Module 1: Deep Brave Identity Purge & Pure Google Chrome Parity
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      if (typeof navigator === 'undefined') return;

      // 1. Completely neutralize navigator.brave and Navigator.prototype.brave
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

      // 3. Exact Google Chrome User-Agent & Platform Cloak
      const CHROME_VERSION = '131.0.6778.86';
      const CHROME_UA = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`;

      try { Object.defineProperty(navigator, 'userAgent', { get: () => CHROME_UA, configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'appVersion', { get: () => `5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`, configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.', configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'productSub', { get: () => '20030107', configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'platform', { get: () => 'Win32', configurable: true }); } catch (_) {}
      try { Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true }); } catch (_) {}

      // 4. Authentic Google Chrome Client Hints (navigator.userAgentData)
      if (navigator.userAgentData) {
        const chromeBrands = [
          { brand: 'Google Chrome', version: '131' },
          { brand: 'Chromium', version: '131' },
          { brand: 'Not_A Brand', version: '24' }
        ];

        try {
          Object.defineProperty(navigator, 'userAgentData', {
            get: () => ({
              brands: chromeBrands,
              mobile: false,
              platform: 'Windows',
              getHighEntropyValues: () => Promise.resolve({
                brands: chromeBrands,
                mobile: false,
                platform: 'Windows',
                platformVersion: '15.0.0',
                architecture: 'x86',
                bitness: '64',
                model: '',
                uaFullVersion: CHROME_VERSION,
                fullVersionList: [
                  { brand: 'Google Chrome', version: CHROME_VERSION },
                  { brand: 'Chromium', version: CHROME_VERSION },
                  { brand: 'Not_A Brand', version: '24.0.0.0' }
                ]
              }),
              toJSON: () => ({ brands: chromeBrands, mobile: false, platform: 'Windows' })
            }),
            configurable: true
          });
        } catch (_) {}
      }

      // 5. Authentic window.chrome API Stubs
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
        } catch (_) {}
        return /pagead2\.googlesyndication\.com|adservice\.google\.com|securepubads\.g\.doubleclick\.net|adnxs\.com|prebid\.js|fuckadblock|blockadblock|adblockdetector/i.test(url);
      }

      // Transparent Fetch Proxy
      if (typeof window.fetch === 'function') {
        const originalFetch = window.fetch;
        window.fetch = function (input, init) {
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
        };
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
  // Module 4: Universal Anti-Adblock Modal Annihilator & Fullscreen Backdrop Cleaner
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

    function isProtectedCaptchaOrAuth(el) {
      if (!el) return false;
      const host = (window.location.hostname || '').toLowerCase();
      if (host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') || host.includes('arkoselabs.com')) return true;
      const htmlSnippet = (el.outerHTML || '').slice(0, 800).toLowerCase();
      const textSnippet = (el.innerText || '').toLowerCase();
      if (htmlSnippet.includes('arkose') || htmlSnippet.includes('funcaptcha') || htmlSnippet.includes('recaptcha') || htmlSnippet.includes('hcaptcha') || htmlSnippet.includes('turnstile') || htmlSnippet.includes('cf-chl') || htmlSnippet.includes('challenge-form')) return true;
      if (textSnippet.includes("make sure that you're a human") || textSnippet.includes('verify you are human') || textSnippet.includes('security check')) return true;
      if (el.querySelector && el.querySelector('iframe[src*="arkose"], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], #challenge-stage')) return true;
      return false;
    }

    function autoBypassAgeAndConsent() {
      try {
        const AGE_COOKIES = ['age_verified=1', 'disclaimer=1', 'accessAgeDisclaimer=true', 'over18=1', 'age_gate=1', 'age_confirmed=1', 'agree=1', 'terms_agreed=1'];
        AGE_COOKIES.forEach(c => { try { document.cookie = c + '; path=/; max-age=31536000; SameSite=Lax'; } catch (_) {} });
        try {
          localStorage.setItem('age_verified', 'true');
          localStorage.setItem('has_accepted_18', 'true');
          localStorage.setItem('disclaimer_accepted', 'true');
        } catch (_) {}

        const ageButtonSelectors = ['#enter-button', '.btn-enter', '.enter-btn', '#btn-enter', '#confirm-age', '#agree-button', '.agree-btn', '#over18', '.btn-agree', '#btn-agree', '.disclaimer-agree'];
        for (const sel of ageButtonSelectors) {
          document.querySelectorAll(sel).forEach(btn => {
            if (btn && !btn._bsAgeClicked && !isProtectedCaptchaOrAuth(btn)) {
              btn._bsAgeClicked = true;
              try { btn.click(); } catch (_) {}
            }
          });
        }
      } catch (_) {}
    }

    function annihilateAntiAdblockModals() {
      try {
        let destroyed = false;
        autoBypassAgeAndConsent();

        const candidates = document.querySelectorAll('div, section, dialog, [role="dialog"], [role="alertdialog"], .modal, .swal2-container, .sweet-alert, .overlay, .popup, [class*="modal"], [class*="overlay"], [class*="popup"], [id*="modal"], [id*="overlay"], [id*="adblock"]');
        for (const el of candidates) {
          if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
          if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
            let target = el;
            let parent = el.parentElement;
            while (parent && parent !== document.body && parent !== document.documentElement) {
              if (isProtectedCaptchaOrAuth(parent)) { target = null; break; }
              const style = window.getComputedStyle(parent);
              if (style.position === 'fixed' || style.position === 'absolute' || parent.classList.contains('modal') || parent.classList.contains('overlay') || parent.classList.contains('swal2-container')) {
                target = parent;
              }
              parent = parent.parentElement;
            }

            if (!target || isProtectedCaptchaOrAuth(target)) continue;

            const buttons = target.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
            for (const btn of buttons) {
              if (/disabled\s+adblocker|i've\s+disabled|close|ok|dismiss|i\s+understand/i.test(btn.innerText || btn.value || '')) {
                try { btn.click(); } catch (_) {}
              }
            }

            try {
              target.remove();
            } catch (_) {
              target.style.setProperty('display', 'none', 'important');
              target.style.setProperty('visibility', 'hidden', 'important');
            }
            destroyed = true;
          }
        }

        // Clean dark backdrop overlays & restore scrolling ONLY when a modal was destroyed
        if (destroyed) {
          const backdropSelectors = ['.modal-backdrop', '.swal2-backdrop', '.swal2-container', '.overlay-backdrop', '[class*="backdrop"]', '[class*="overlay"]', '#overlay', '.overlay', '.popup-overlay', '#popup-overlay', '.fade.show', '.sk-overlay', '#sk-overlay', '[class*="adb-overlay"]', '#adb-overlay'];
          for (const sel of backdropSelectors) {
            document.querySelectorAll(sel).forEach(b => {
              if (b && !isProtectedCaptchaOrAuth(b) && !b.querySelector('h1, h2, form, video, article, .video-list')) {
                try { b.remove(); } catch (_) { b.style.display = 'none'; }
              }
            });
          }

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
  // Module 5: Safe Turbo Timer Fast-Forward & Shortener Fast-Pass (Manual Click Armed)
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    const isMediaPlatform = host.includes('spotify.com') || host.includes('youtube.com') || host.includes('youtu.be') || host.includes('netflix.com') || host.includes('twitch.tv');

    // High-speed setTimeout & setInterval timer compression with window bound receiver
    const origSetTimeout = window.setTimeout;
    const origSetInterval = window.setInterval;

    window.setTimeout = function(handler, delay, ...args) {
      let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
      if (!isMediaPlatform && numDelay >= 800 && numDelay <= 180000) {
        numDelay = Math.max(20, Math.floor(numDelay / 25)); // 25x-50x fast compression
      }
      return origSetTimeout.apply(window, [handler, numDelay, ...args]);
    };

    window.setInterval = function(handler, delay, ...args) {
      let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
      if (!isMediaPlatform) {
        if (numDelay >= 800 && numDelay <= 2000) {
          numDelay = 35; // 1s countdown tick compressed to 35ms
        }
      }
      return origSetInterval.apply(window, [handler, numDelay, ...args]);
    };

    // Suppress shortener Bad Request and YuThemeStore credit alerts
    const origAlert = window.alert;
    window.alert = function(msg) {
      if (typeof msg === 'string' && /yuthemestore|yuidea|theme\s+is\s+made\s+by|copyright|credit|bad\s+request|adblock|disable\s+ad/i.test(msg)) {
        console.log('[BraveShield] Suppressed annoying alert:', msg);
        return;
      }
      return origAlert.apply(window, arguments);
    };

    const origConfirm = window.confirm;
    window.confirm = function(msg) {
      if (typeof msg === 'string' && /yuthemestore|yuidea|theme\s+is\s+made\s+by|copyright|credit|bad\s+request|adblock|disable\s+ad/i.test(msg)) {
        return true;
      }
      return origConfirm.apply(window, arguments);
    };

    function turboPassCountdownsAndLinks() {
      try {
        function isPaginationOrNavigation(el) {
          if (!el) return true;
          const href = (el.getAttribute('href') || '').toLowerCase();
          const id = (el.id || '').toLowerCase();
          const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
          if (/reverse-paginate|updated-max|max-results|blog-pager|pagination|page-numbers|older-posts|newer-posts|nav-links|category|tag\//i.test(href)) return true;
          if (/blog-pager|pagination|pager|page-nav|nav-links|page-numbers|older-link|newer-link/i.test(id + ' ' + cls)) return true;
          return false;
        }

        // Trigger shortener theme link generators if present
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

        const buttonSelectors = [
          '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download',
          '.get-link', '.download-btn', '.btn-download', '.getlink', '#link-button',
          '#continue-btn', '#btn-continue', '.continue-btn', '#go-link', '.go-link',
          '#final-download', '.direct-download', '#downloadBtn', '#btnDownload',
          '#wpsafe-generate', '#wpsafe-snp', '#tp-snp2',
          'button[id*="download"]', 'a[id*="download"]', 'button[id*="link"]', 'a[id*="link"]',
          'a[href*="get-link"]', 'a[href*="download"]'
        ];

        for (const sel of buttonSelectors) {
          const btns = document.querySelectorAll(sel);
          for (const btn of btns) {
            if (btn && !isPaginationOrNavigation(btn)) {
              btn.removeAttribute('disabled');
              btn.removeAttribute('aria-disabled');
              if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
              btn.style.setProperty('pointer-events', 'auto', 'important');
              btn.style.setProperty('opacity', '1', 'important');
              btn.style.setProperty('display', 'inline-block', 'important');
              btn.style.setProperty('visibility', 'visible', 'important');
              btn.style.setProperty('cursor', 'pointer', 'important');
              const txt = (btn.innerText || btn.textContent || btn.value || '').trim();
              if (/getting\s+link|generating/i.test(txt)) {
                btn.innerText = 'GET LINK';
                btn.textContent = 'GET LINK';
              }
            }
          }
        }

        // Generic Button Scanner (e.g. indianshortner.com / earn4link.in / 10drives.com)
        const genericBtns = document.querySelectorAll('button, a.btn, a[role="button"], .btn, [class*="btn"], input[type="button"], input[type="submit"]');
        for (const gBtn of genericBtns) {
          const txt = (gBtn.innerText || gBtn.textContent || gBtn.value || '').trim().toLowerCase();
          if (/click\s+here\s+to\s+continue|get\s*link|continue|download|generate\s*link|proceed|verify|getting\s+link/i.test(txt) && !isPaginationOrNavigation(gBtn)) {
            gBtn.removeAttribute('disabled');
            gBtn.removeAttribute('aria-disabled');
            if (gBtn.classList.contains('disabled')) gBtn.classList.remove('disabled');
            gBtn.style.setProperty('pointer-events', 'auto', 'important');
            gBtn.style.setProperty('opacity', '1', 'important');
            gBtn.style.setProperty('display', 'inline-block', 'important');
            gBtn.style.setProperty('visibility', 'visible', 'important');
            gBtn.style.setProperty('cursor', 'pointer', 'important');
            if (/getting\s+link|generating/i.test(txt)) {
              gBtn.innerText = 'GET LINK';
              gBtn.textContent = 'GET LINK';
            }
          }
        }

        // Unhide direct destination links
        const destLinks = document.querySelectorAll('a[href*="/links/"], a[href*="/go/"], a[href*="indianshortner.com/"], a[href*="drive.google"], a[href*="mediafire"], a[href*="mega.nz"], a[href*="pixeldrain"], a[href*="gofile"], a[href*="uploadrar"]');
        for (const dLink of destLinks) {
          if (!isPaginationOrNavigation(dLink)) {
            dLink.style.setProperty('display', 'inline-block', 'important');
            dLink.style.setProperty('visibility', 'visible', 'important');
            dLink.style.setProperty('opacity', '1', 'important');
            dLink.style.setProperty('pointer-events', 'auto', 'important');
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
    const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    if (!host.includes('spotify.com')) return;

    console.log('[BraveShield] Spotify Web Player Engine Armed.');

    // Ad Audio Element Speedup & Auto-Mute
    function sweepSpotifyAds() {
      try {
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
    const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) return;

    function speedupYouTubeAds() {
      try {
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
  // Module 8: Canvas & WebGL Privacy Noise Armor
  // ─────────────────────────────────────────────────────────────────────────────
  (() => {
    try {
      const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type, ...args) {
        if (this.width > 16 && this.height > 16) {
          const ctx = this.getContext('2d');
          if (ctx) {
            try {
              const imgData = ctx.getImageData(0, 0, Math.min(this.width, 10), Math.min(this.height, 10));
              if (imgData && imgData.data && imgData.data.length > 3) {
                imgData.data[0] = (imgData.data[0] ^ 1);
                ctx.putImageData(imgData, 0, 0);
              }
            } catch (_) {}
          }
        }
        return origToDataURL.apply(this, [type, ...args]);
      };

      const origGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(param) {
        if (param === 0x1F00) return 'Google Inc. (NVIDIA)';
        if (param === 0x1F01) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        if (param === 0x9245) return 'Google Inc. (NVIDIA)';
        if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        return origGetParameter.apply(this, arguments);
      };

      if (typeof WebGL2RenderingContext !== 'undefined') {
        const origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(param) {
          if (param === 0x1F00) return 'Google Inc. (NVIDIA)';
          if (param === 0x1F01) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
          if (param === 0x9245) return 'Google Inc. (NVIDIA)';
          if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
          return origGetParam2.apply(this, arguments);
        };
      }
    } catch (_) {}
  })();

  console.log('[BraveShield Bypass Pro] v5.3.0 Engine Armed & Synchronized.');
})();