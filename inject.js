/**
 * BraveShield Bypass Pro - Main World Stealth Engine
 * Executes at document_start in the MAIN world.
 * Neutralizes: navigator.brave, Brave Shields DOM Traps, Tracker variable checks, Canvas/WebGL farbling.
 */
(function() {
  'use strict';

  if (window.__brave_shield_bypass_active) return;
  window.__brave_shield_bypass_active = true;

  console.log('[BraveShield Bypass] Injecting stealth protections into MAIN world...');

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
  } catch (e) {
    console.debug('[BraveShield Bypass] Navigator override notice:', e);
  }

  // ==========================================
  // 2. MASK USER AGENT BRANDS (CLIENT HINTS)
  // ==========================================
  try {
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      const originalBrands = navigator.userAgentData.brands;
      const cleanBrands = originalBrands
        .filter(b => !b.brand.toLowerCase().includes('brave'))
        .concat([
          { brand: 'Google Chrome', version: '124' },
          { brand: 'Chromium', version: '124' },
          { brand: 'Not-A.Brand', version: '99' }
        ]);

      // Deduplicate brands
      const uniqueBrands = Array.from(new Set(cleanBrands.map(b => b.brand)))
        .map(brand => cleanBrands.find(b => b.brand === brand));

      Object.defineProperty(navigator.userAgentData, 'brands', {
        get: () => uniqueBrands,
        configurable: true
      });

      if (navigator.userAgentData.getHighEntropyValues) {
        const origGetHigh = navigator.userAgentData.getHighEntropyValues;
        navigator.userAgentData.getHighEntropyValues = function(hints) {
          return origGetHigh.call(this, hints).then(res => {
            if (res.brands) {
              res.brands = res.brands.filter(b => !b.brand.toLowerCase().includes('brave'));
            }
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
        configurable: true,
        enumerable: false
      });
    }
  } catch (e) {}

  // ==========================================
  // 4. SHIELDS ON AD-BLOCKER STUBS (FAKE ADS/ANALYTICS)
  // ==========================================
  // Anti-adblock scripts test if window.adsbygoogle, window.ga, window.gtag exist.
  // When Shields are ON, requests to doubleclick/analytics are blocked.
  // We create silent stub proxies so anti-adblock scripts think ads & analytics loaded!

  // Stub window.adsbygoogle
  if (!window.adsbygoogle) {
    const fakeAdsArray = [];
    fakeAdsArray.push = function(arg) {
      console.log('[BraveShield Bypass] Neutralized adsbygoogle.push() call');
      if (typeof arg === 'object' && arg && arg.onload) {
        try { arg.onload(); } catch(e) {}
      }
      return Array.prototype.push.apply(this, arguments);
    };
    fakeAdsArray.loaded = true;
    Object.defineProperty(window, 'adsbygoogle', {
      get: () => fakeAdsArray,
      set: (v) => {},
      configurable: true
    });
  }

  // Stub window.ga / window.gtag
  if (!window.ga) {
    const fakeGa = function() {
      const lastArg = arguments[arguments.length - 1];
      if (typeof lastArg === 'function') {
        try { lastArg(); } catch(e) {}
      } else if (typeof lastArg === 'object' && lastArg && typeof lastArg.hitCallback === 'function') {
        try { lastArg.hitCallback(); } catch(e) {}
      }
    };
    fakeGa.q = [];
    fakeGa.l = Date.now();
    fakeGa.loaded = true;
    window.ga = fakeGa;
  }

  if (!window.gtag) {
    window.gtag = function() {};
  }

  // Stub Google Publisher Tags (googletag)
  if (!window.googletag) {
    const fakePubAds = {
      addEventListener: () => fakePubAds,
      clear: () => true,
      enableSingleRequest: () => fakePubAds,
      enableServices: () => fakePubAds,
      refresh: () => fakePubAds,
      setTargeting: () => fakePubAds,
      collapseEmptyDivs: () => fakePubAds,
      definePassback: () => ({ display: () => {} }),
      getSlots: () => []
    };
    window.googletag = {
      cmd: [],
      display: () => {},
      enableServices: () => {},
      pubads: () => fakePubAds,
      defineSlot: () => ({
        addService: () => ({ setTargeting: () => ({ addModule: () => {} }) }),
        setTargeting: () => {},
        setCollapseEmptyDIV: () => {}
      }),
      apiReady: true
    };
    // Process queued cmd calls
    setInterval(() => {
      if (window.googletag && Array.isArray(window.googletag.cmd)) {
        while (window.googletag.cmd.length > 0) {
          const fn = window.googletag.cmd.shift();
          if (typeof fn === 'function') {
            try { fn(); } catch(e) {}
          }
        }
      }
    }, 50);
  }

  // Stub Sentry & Prebid (pbjs)
  if (!window.pbjs) {
    window.pbjs = {
      que: [],
      addAdUnits: () => {},
      requestBids: (cfg) => {
        if (cfg && typeof cfg.bidsBackHandler === 'function') {
          setTimeout(cfg.bidsBackHandler, 10);
        }
      },
      setTargetingForGPT: () => {}
    };
  }

  // ==========================================
  // 5. DOM TRAP NEUTRALIZATION (CRITICAL FOR SHIELDS ON)
  // ==========================================
  // When Brave Shields are ON, cosmetic filters apply "display:none!important" to ad elements.
  // Detectors create a hidden <div class="adsbygoogle"> and check offsetHeight or getComputedStyle.
  // We hook offsetHeight/offsetWidth/getBoundingClientRect/getComputedStyle for ad trap elements!

  const AD_TRAP_PATTERNS = [
    /ad[s]?[-_]?google/i,
    /ad[-_]?banner/i,
    /ad[-_]?unit/i,
    /ad[-_]?container/i,
    /ad[-_]?wrapper/i,
    /adblock/i,
    /blockadblock/i,
    /fuckadblock/i,
    /sponsor/i,
    /taboola/i,
    /outbrain/i,
    /admiral/i
  ];

  function isAdTrapElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    const id = el.id || '';
    const className = typeof el.className === 'string' ? el.className : '';
    const src = el.getAttribute ? (el.getAttribute('src') || '') : '';

    return AD_TRAP_PATTERNS.some(p => p.test(id) || p.test(className) || p.test(src));
  }

  // Override offsetHeight
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: function() {
        const actual = originalOffsetHeight.get.call(this);
        if (actual === 0 && isAdTrapElement(this)) {
          return 250; // Fake visible height for ad trap
        }
        return actual;
      },
      configurable: true
    });
  }

  // Override offsetWidth
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      get: function() {
        const actual = originalOffsetWidth.get.call(this);
        if (actual === 0 && isAdTrapElement(this)) {
          return 300; // Fake visible width for ad trap
        }
        return actual;
      },
      configurable: true
    });
  }

  // Override getBoundingClientRect
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function() {
    const rect = originalGetBoundingClientRect.call(this);
    if (rect.width === 0 && rect.height === 0 && isAdTrapElement(this)) {
      return {
        top: 100,
        bottom: 350,
        left: 100,
        right: 400,
        width: 300,
        height: 250,
        x: 100,
        y: 100,
        toJSON: function() { return this; }
      };
    }
    return rect;
  };

  // Override getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function(el, pseudoElt) {
    const style = originalGetComputedStyle.call(this, el, pseudoElt);
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
  // 6. CANVAS & WEBGL FARBLING NORMALIZATION
  // ==========================================
  // Brave Shields randomizes Canvas & WebGL readouts ("farbling").
  // We normalize WebGL parameters to return consistent Chrome hardware strings.

  try {
    const SPOOF_VENDOR = "Google Inc. (NVIDIA)";
    const SPOOF_RENDERER = "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";

    // WebGL 1
    if (window.WebGLRenderingContext) {
      const origGetParam = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // UNMASKED_VENDOR_WEBGL = 37445
        if (parameter === 37445) return SPOOF_VENDOR;
        // UNMASKED_RENDERER_WEBGL = 37446
        if (parameter === 37446) return SPOOF_RENDERER;
        return origGetParam.call(this, parameter);
      };
    }

    // WebGL 2
    if (window.WebGL2RenderingContext) {
      const origGetParam2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return SPOOF_VENDOR;
        if (parameter === 37446) return SPOOF_RENDERER;
        return origGetParam2.call(this, parameter);
      };
    }
  } catch (e) {}

  console.log('[BraveShield Bypass] Main world stealth initialized successfully.');
})();
