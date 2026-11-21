/**
 * BraveShield Bypass Pro — Content Script Bridge & HUD Controller
 * Version: synced from manifest at runtime
 * Execution World: ISOLATED (document_start)
 * Purpose: LIVE CONFIG BRIDGE to the MAIN world (instant kill-switch/toggle
 *          application without reload), fast DOM modal annihilation, button
 *          unlocking, direct-link floating HUD bar, live telemetry tracking,
 *          and popup bridge.
 */

(() => {
  'use strict';

  const host = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  const path = (window.location && window.location.pathname) ? window.location.pathname : '';

  if (
    (typeof bsIsCaptchaHost === 'function' && bsIsCaptchaHost(host, path)) ||
    typeof window._cf_chl_opt !== 'undefined' ||
    typeof window._cf_chl_ctx !== 'undefined'
  ) {
    return;
  }

  // Domain whitelist uses suffix matching (example.com covers sub.example.com)
  function bsIsWhitelisted(hostname, whitelist) {
    if (!Array.isArray(whitelist) || !hostname) return false;
    return whitelist.some(d => d && typeof bsDomainMatches === 'function'
      ? bsDomainMatches(hostname, d)
      : (hostname === d || hostname.endsWith('.' + d)));
  }

  // Raw JSON-LD dump guard: if site JS failed and body is just {"@context":"https://schema.org"...},
  // NEVER touch DOM — any style forcing makes it worse. Bridge still runs, sweeps skip.
  function bsIsJsonDumpPage() {
    try {
      const txt = (document.body && (document.body.innerText || document.body.textContent) || '').trim();
      if (!txt) return false;
      if (txt.startsWith('{"@context"') && txt.includes('schema.org')) return true;
      if (txt.length > 2000 && (txt.match(/"@type"\s*:\s*"/g) || []).length >= 3 && txt.includes('schema.org')) return true;
      return false;
    } catch (_) { return false; }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LIVE CONFIG BRIDGE — push effective per-site config into the MAIN world.
  // Replaces the old one-way sessionStorage mirror which raced document_start
  // and required a page reload before any toggle took effect.
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_SYNC_KEYS = [
    'masterEnabled', 'enabled',
    'unshortenerEnabled', 'autoBypassTimers', 'gentleTurboEnabled', 'turboAllSites',
    'paywallDefuserEnabled', 'bypassAdblockDetection',
    'maskBraveApi', 'clientHintsEnabled',
    'webglSpoofingEnabled', 'canvasNoiseEnabled', 'audioNoiseEnabled',
    'webrtcShieldEnabled', 'domJitterEnabled', 'timerCoarseningEnabled',
    'mediaDevicesSanitizeEnabled', 'speechVoicesSanitizeEnabled',
    'batteryMaskEnabled', 'networkInfoMaskEnabled', 'screenNormalizationEnabled',
    'uaSpoofingEnabled', 'timezoneSpoofingEnabled', 'webgpuMaskingEnabled', 'fontEnumMaskingEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled',
    'instagramReelsAdsEnabled', 'instagramAutoScrollEnabled',
    'youtubeShortsEnabled', 'youtubeShortsAutoScroll', 'facebookReelsEnabled',
    'permissionAutoDenyEnabled', 'workerParityEnabled', 'gpcCloakEnabled', 'domStructureDefuserEnabled',
    'fontEnsembleEnabled', 'identityRotationEnabled', 'identityRotationPeriodHours',
    'devtoolsDefuseEnabled',
    'reelDwellSeconds', 'reelMaxAutoSeconds', 'customResolvers', 'rotatedDeviceProfile',
    'moduleMatrixMode',
    'deviceProfile', 'customHardwareProfile', 'resolvedUA', 'spoofTimezone', 'spoofLocale', 'browserType'
  ];

  // Protected Sites: these BYPASS/behavior modules are force-disabled on
  // protected hosts, while every STEALTH module (canvas/audio/webgl/webgpu/
  // fonts/UA/clients-hints/…) keeps running. Zero behavioral touch, full cloak.
  const BS_PROTECTED_OFF_KEYS = [
    'unshortenerEnabled', 'autoBypassTimers', 'gentleTurboEnabled', 'turboAllSites',
    'paywallDefuserEnabled', 'bypassAdblockDetection', 'domStructureDefuserEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled',
    'instagramReelsAdsEnabled', 'instagramAutoScrollEnabled',
    'youtubeShortsEnabled', 'youtubeShortsAutoScroll', 'facebookReelsEnabled',
    'permissionAutoDenyEnabled',
    'devtoolsDefuseEnabled'
  ];

  // Modules that can be overridden per-site in "perSite" matrix mode.
  const BS_MATRIX_MODULES = [
    'unshortenerEnabled', 'autoBypassTimers', 'gentleTurboEnabled', 'turboAllSites',
    'paywallDefuserEnabled', 'bypassAdblockDetection',
    'canvasNoiseEnabled', 'audioNoiseEnabled', 'webglSpoofingEnabled', 'clientHintsEnabled',
    'maskBraveApi', 'webrtcShieldEnabled', 'domJitterEnabled', 'timerCoarseningEnabled',
    'uaSpoofingEnabled', 'screenNormalizationEnabled', 'webgpuMaskingEnabled', 'fontEnumMaskingEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'youtubeAds', 'spotifyUnlocked', 'twitchShieldEnabled',
    'instagramReelsAdsEnabled', 'instagramAutoScrollEnabled',
    'youtubeShortsEnabled', 'youtubeShortsAutoScroll', 'facebookReelsEnabled',
    'permissionAutoDenyEnabled', 'domStructureDefuserEnabled',
    'devtoolsDefuseEnabled'
  ];
  const BS_MATRIX_SET = new Set(BS_MATRIX_MODULES);

  const bsGate = { ready: false, master: true, paywall: true, adblock: true, timers: true, domdef: true, protected: false };

  function bsFindSiteOverride(siteProfiles, hostname) {
    if (!siteProfiles || typeof siteProfiles !== 'object' || !hostname) return null;
    let best = null;
    let bestLen = -1;
    for (const [domain, prof] of Object.entries(siteProfiles)) {
      if (domain === '__proto__' || domain === 'constructor' || domain === 'prototype') continue;
      if (!Object.prototype.hasOwnProperty.call(siteProfiles, domain)) continue;
      if (!prof || typeof prof !== 'object') continue;
      const hasAny = prof.deviceProfile || prof.browserType || (prof.modules && typeof prof.modules === 'object');
      if (!hasAny) continue;
      const matched = typeof bsDomainMatches === 'function' ? bsDomainMatches(hostname, domain) : (hostname === domain || hostname.endsWith('.' + domain));
      if (matched && domain.length > bestLen) {
        bestLen = domain.length;
        best = {
          domain,
          deviceProfile: prof.deviceProfile,
          browserType: prof.browserType,
          modules: (prof.modules && typeof prof.modules === 'object' && !Array.isArray(prof.modules)) ? prof.modules : null
        };
      }
    }
    return best;
  }

  // Merge a site's module overrides into the effective config.
  // Only keys present in that site's `modules` map are overridden; everything
  // else falls through to the global value.
  function bsApplyMatrix(config, siteModules) {
    if (!siteModules || typeof siteModules !== 'object') return;
    for (const [k, v] of Object.entries(siteModules)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      if (!BS_MATRIX_SET.has(k)) continue;
      if (typeof v === 'boolean') config[k] = v;
    }
  }

  let lastPushedJson = '';
  function pushConfigToMainWorld() {
    try {
      chrome.storage.local.get(null, (res) => {
        if (!res || chrome.runtime.lastError) return;
        try {
          const siteDisabled = res.masterEnabled === false ||
                               res.enabled === false ||
                               bsIsWhitelisted(host, res.whitelist);

          const firstSnapshot = !bsGate.ready;
          bsGate.ready = true;

          const siteOverride = bsFindSiteOverride(res.siteProfiles, host);
          const matrixMode = res.moduleMatrixMode === 'perSite' ? 'perSite' : 'global';
          // Protected Sites deny-list: site is NOT disabled (stealth keeps
          // running) but every bypass/behavior module gets force-off'ed below.
          const siteProtected = !siteDisabled && bsIsWhitelisted(host, res.protectedSites);

          const config = {};
          for (const k of BS_SYNC_KEYS) {
            if (res[k] !== undefined) config[k] = res[k];
          }
          config.masterEnabled = res.masterEnabled !== false;
          config.moduleMatrixMode = matrixMode;

          // Identity rotation lands BEFORE the per-site override merge: a
          // pinned override always wins over the rotating global identity.
          if (res.identityRotationEnabled === true && !siteOverride &&
              typeof res.rotatedDeviceProfile === 'string' && res.rotatedDeviceProfile) {
            config.deviceProfile = res.rotatedDeviceProfile;
          }

          // Per-site module matrix applies ONLY in perSite mode.
          if (matrixMode === 'perSite' && siteOverride) {
            bsApplyMatrix(config, siteOverride.modules);
          }

          if (siteOverride) {
            if (siteOverride.deviceProfile) config.deviceProfile = siteOverride.deviceProfile;
            if (siteOverride.browserType) config.browserType = siteOverride.browserType;
            const bySite = res.resolvedUABySite;
            if (bySite && bySite[siteOverride.domain]) config.resolvedUA = bySite[siteOverride.domain];
          }

          // Flags the MAIN world uses for its own live gates.
          config.siteOverrideActive = !!siteOverride;
          config.siteProtected = siteProtected;

          // Protected Sites: force every bypass/behavior module off AFTER the
          // matrix/override merge so even per-site matrices cannot re-enable.
          if (siteProtected) {
            for (const k of BS_PROTECTED_OFF_KEYS) config[k] = false;
          }

          // Gates are derived from the RESOLVED config, not the raw globals,
          // so per-site overrides instantly affect the content-side sweeps.
          bsGate.master = !siteDisabled;
          bsGate.protected = siteProtected;
          bsGate.paywall = config.paywallDefuserEnabled !== false;
          bsGate.adblock = config.bypassAdblockDetection !== false;
          bsGate.domdef = config.domStructureDefuserEnabled !== false;
          bsGate.timers = config.autoBypassTimers !== false;
          bsGate.modules = config;

          const fingerprint = JSON.stringify({ s: siteDisabled, c: config });
          if (fingerprint !== lastPushedJson) {
            lastPushedJson = fingerprint;
            try { window.postMessage({ type: 'bs-config-sync', siteDisabled, config }, location.origin); } catch (_) { window.postMessage({ type: 'bs-config-sync', siteDisabled, config }, '*'); }
          }
          if (firstSnapshot) debouncedContentScan();
        } catch (_) {}
      });
    } catch (_) {}
  }

  function bsBumpStat(stat, delta) {
    try {
      chrome.storage.local.get([stat], (res) => {
        const current = (res && typeof res[stat] === 'number') ? res[stat] : 0;
        chrome.storage.local.set({ [stat]: Math.min(9_999_999, current + delta) });
      });
    } catch (_) {}
  }

  // Auto-reload top frame when 50x / 1.9x / Aggressive turbo toggled — per user request
  let bsReloadDebounce = null;
  function bsMaybeAutoReload(changes) {
    if (!changes) return;
    const turboKeys = ['autoBypassTimers', 'gentleTurboEnabled', 'turboAllSites'];
    const touched = turboKeys.some(k => changes[k] !== undefined);
    if (!touched) return;
    if (window !== window.top) return; // only top frame reloads, not every iframe
    if (isProtectedCaptchaOrAuth(document.body) || isProtectedCaptchaOrAuth(document.documentElement)) return;
    if (bsReloadDebounce) clearTimeout(bsReloadDebounce);
    bsReloadDebounce = setTimeout(() => {
      try { window.location.reload(); } catch (_) {}
    }, 350);
  }

  pushConfigToMainWorld();
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        pushConfigToMainWorld();
        bsMaybeAutoReload(changes);
      }
    });
  } catch (_) {}


  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Live Telemetry Event Listener & Incrementor
  // Security: only accept same-frame messages from the MAIN world, restrict
  // counters to a known key set and clamp deltas so hostile pages cannot
  // forge or flood stats.
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_VALID_STATS = new Set(['timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked']);

  function bsTodayKey() {
    try {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    } catch (_) { return ''; }
  }

  window.addEventListener('message', (e) => {
    try {
      if (e.source !== window || !e.data || typeof e.data !== 'object') return;

      if (e.data.type === 'bs-telemetry-event') {
        const { stat, delta } = e.data;
        if (!BS_VALID_STATS.has(stat)) return;
        const inc = Math.floor(Number(delta));
        if (!Number.isFinite(inc) || inc <= 0 || inc > 50) return;
        chrome.storage.local.get([stat, 'timeSavedDaily'], (res) => {
          const current = (res && typeof res[stat] === 'number') ? res[stat] : 0;
          const update = { [stat]: Math.min(9_999_999, current + inc) };
          // 7-day trend data for the popup sparkline: per-day time-saved
          // buckets, keyed by local date, pruned to the last 30 days.
          if (stat === 'timeSavedSeconds') {
            try {
              const dayKey = bsTodayKey();
              if (dayKey) {
                const daily = (res && res.timeSavedDaily && typeof res.timeSavedDaily === 'object' && !Array.isArray(res.timeSavedDaily)) ? res.timeSavedDaily : {};
                daily[dayKey] = Math.min(9_999_999, (daily[dayKey] || 0) + inc);
                const keys = Object.keys(daily).sort();
                while (keys.length > 30) { delete daily[keys.shift()]; }
                update.timeSavedDaily = daily;
              }
            } catch (_) {}
          }
          chrome.storage.local.set(update);
        });
      } else if (e.data.type === 'bs-direct-link' && typeof e.data.url === 'string') {
        renderDirectLinkHud(e.data.url);
      }
    } catch (_) {}
  });

  // Only absolute http(s) URLs may ever reach the HUD renderer.
  function bsSafeHudUrl(raw) {
    if (typeof raw !== 'string' || raw.length > 2048) return null;
    try {
      const u = new URL(raw);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : null;
    } catch (_) {
      return null;
    }
  }

  // 3. Feature A: Floating Obsidian-Neon Direct Link HUD
  // Built exclusively with DOM APIs + textContent — the target URL is never
  // interpolated into markup, so hostile pages cannot inject HTML.
  let hudRendered = false;
  function renderDirectLinkHud(targetUrl) {
    const safeUrl = bsSafeHudUrl(targetUrl);
    if (hudRendered || !safeUrl) return;

    function mountHud() {
      const container = document.body || document.documentElement;
      if (!container || document.getElementById('bs-direct-link-bar')) return;
      hudRendered = true;

      try {
        const bar = document.createElement('div');
        bar.id = 'bs-direct-link-bar';
        bar.style.cssText = `
          position: fixed !important; top: 14px !important; right: 14px !important;
          z-index: 2147483647 !important; background: rgba(10, 15, 25, 0.94) !important;
          border: 1px solid rgba(0, 255, 204, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 204, 0.2) !important;
          backdrop-filter: blur(12px) !important; border-radius: 10px !important;
          padding: 10px 16px !important; display: flex !important; align-items: center !important;
          justify-content: space-between !important; gap: 16px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 13px !important; color: #fff !important;
        `;

        const left = document.createElement('div');
        left.style.cssText = 'display:flex; align-items:center; gap:10px;';
        const glyph = document.createElement('span');
        glyph.textContent = '⚡';
        glyph.style.fontSize = '16px';
        const label = document.createElement('span');
        label.textContent = 'Direct Link Detected:';
        label.style.cssText = 'font-weight:700; color:#00ffcc; letter-spacing:0.5px;';
        const urlSpan = document.createElement('span');
        urlSpan.textContent = safeUrl;
        urlSpan.title = safeUrl;
        urlSpan.style.cssText = 'max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#a0aec0; font-size:12px;';
        left.append(glyph, label, urlSpan);

        const right = document.createElement('div');
        right.style.cssText = 'display:flex; align-items:center; gap:8px;';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy';
        copyBtn.style.cssText = 'background:rgba(255,255,255,0.1); color:#00ffcc; border:1px solid rgba(0,255,204,0.3); font-weight:700; font-size:11px; padding:6px 10px; border-radius:6px; cursor:pointer; transition:all 0.2s ease;';
        copyBtn.addEventListener('click', () => {
          try {
            navigator.clipboard.writeText(safeUrl);
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
          } catch (_) {}
        });

        const jump = document.createElement('a');
        jump.href = safeUrl;
        jump.target = '_blank';
        jump.rel = 'noopener noreferrer';
        jump.textContent = 'Jump Directly ↗';
        jump.style.cssText = 'background:linear-gradient(135deg, #00ffcc, #0077ff); color:#000; font-weight:800; font-size:12px; padding:6px 14px; border-radius:6px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 0 12px rgba(0,255,204,0.4);';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Dismiss direct link bar');
        closeBtn.style.cssText = 'background:transparent; border:none; color:#718096; font-size:16px; cursor:pointer; padding:2px 6px;';
        closeBtn.addEventListener('click', () => bar.remove());

        right.append(copyBtn, jump, closeBtn);
        bar.append(left, right);
        container.appendChild(bar);

        const style = document.createElement('style');
        style.textContent = '@keyframes bsSlideIn { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }';
        (document.head || container).appendChild(style);
        bar.style.animation = 'bsSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      } catch (_) {}
    }

    if (document.body || document.documentElement) {
      mountHud();
    } else {
      document.addEventListener('DOMContentLoaded', mountHud, { once: true });
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'get-audit') {
      let ver = 'unknown';
      try { ver = chrome.runtime.getManifest().version; } catch (_) {}
      sendResponse({ status: 'active', version: ver });
    }
  });

  // 5. Universal Anti-Adblock Modal Annihilator & Captcha Protection Shield
  // Includes forced-ad-view lockers: "Click On Ads To Get Download Link" (health-insurance blog screenshot)
  // Brave-detection phrases added: these lockers identify Brave via navigator.brave /
  // brand mismatches and show "please open in Chrome"-class modals — all defused.
  const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|brave\s+(?:has\s+been\s+)?detected|we\s+(?:have\s+)?(?:detect(?:ed)?|noticed)\s+(?:that\s+)?(?:you\s+are\s+|you're\s+|using\s+)?brave|shields?\s+(?:have\s+been\s+|are\s+)?detected|(?:disable|turn\s+off)\s+(?:your\s+)?(?:brave\s+)?shields|turn\s+off\s+brave|switch\s+to\s+chrome|open\s+(?:this\s+page\s+)?in\s+chrome|use\s+chrome\s+to\s+continue|please\s+use\s+(?:google\s+)?chrome|chrome\s+browser\s+is\s+required|chrome\s+is\s+required|your\s+browser\s+is\s+(?:blocking|unsupported|not\s+supported|blocked)|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice|click on ads to get download link|click on ads|close ad/i;

  function isProtectedCaptchaOrAuth(el) {
    if (!el) return false;
    const host = (window.location.hostname || '').toLowerCase();
    if (
      host.includes('challenges.cloudflare.com') || host.includes('recaptcha.net') || host.includes('google.com') ||
      host.includes('hcaptcha.com') || host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') ||
      host.includes('arkoselabs.com') || host.includes('funcaptcha.com') || host.includes('geetest.com') ||
      host.includes('awswaf.com') || host.includes('mtcaptcha.com') || host.includes('leminnow.com') ||
      host.includes('smartcaptcha.yandexcloud.net') || host.includes('captcha-api.yandex.ru') ||
      host.includes('capy.me') || host.includes('friendlycaptcha.com') || host.includes('friendlycaptcha.eu') ||
      host.includes('captcha-delivery.com') || host.includes('perimeterx.net') || host.includes('kasada.io')
    ) return true;

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

  // Feature B: Universal Paywall & Blur-Filter Defuser in Content Script
  function defusePaywallsAndBlur() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.paywall) return;
      // Never touch trusted web-apps (Meta AI studio, Gmail, etc.)
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;

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

  function annihilateAntiAdblockModals() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.adblock) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;

      ensureCaptchasVisible();
      defusePaywallsAndBlur();

      const candidates = document.querySelectorAll('.modal, .swal2-container, .sweet-alert, [role="alertdialog"], [class*="adblock"], [id*="adblock"]');
      for (const el of candidates) {
        if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
        if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    } catch (_) {}
  }

  // 6. Shortener & Download Button Unlocker
  function purgeInvisibleOverlays() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.adblock) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 800;
      const vh = window.innerHeight || document.documentElement.clientHeight || 600;
      const candidates = document.querySelectorAll('div, a, span, section, iframe');

      for (const el of candidates) {
        if (!el || el._bsContentOverlayNeutralized || isProtectedCaptchaOrAuth(el)) continue;
        if (el === document.body || el === document.documentElement || el.id?.startsWith('bs-')) continue;

        const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (!style) continue;

        const isFixed = style.position === 'fixed' || style.position === 'absolute';
        const zIndex = parseInt(style.zIndex, 10) || 0;
        const opacity = parseFloat(style.opacity);
        const isTransparent = opacity === 0 || style.visibility === 'hidden' || style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)';

        const rect = el.getBoundingClientRect();
        const coversFullViewport = rect.width >= (vw * 0.75) && rect.height >= (vh * 0.75);

        // Forced-ad locker: "Click On Ads To Get Download Link" has visible text but is still a blocking overlay
        const forcedAdLocker = el.innerText && /click on ads to get download link|close ad/i.test(el.innerText);

        if (isFixed && zIndex >= 30 && (isTransparent || opacity < 0.6 || forcedAdLocker) && (coversFullViewport || forcedAdLocker)) {
          const hasVisibleText = el.innerText && el.innerText.trim().length > 0;
          // Allow removing even with visible text if it's a known ad-locker
          const isAdLocker = forcedAdLocker || /click on ads/i.test(el.innerText || '');
          const hasInputs = el.querySelector('input, form, video, select');
          // Don't block captcha-protected elements
          if (isProtectedCaptchaOrAuth(el)) continue;

          if ((!hasVisibleText && !hasInputs) || isAdLocker) {
            el._bsContentOverlayNeutralized = true;
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('z-index', '-9999', 'important');
            // Remove dimming on body/html that many lockers add
            try { document.documentElement.style.setProperty('overflow', 'auto', 'important'); document.body.style.setProperty('overflow', 'auto', 'important'); document.body.style.removeProperty('filter'); } catch (_) {}
            if (el.tagName === 'A' && el.parentNode) {
              el.remove();
            }
            // Also remove sibling overlay that holds the "Refresh" button
            if (isAdLocker) {
              try {
                const refreshBtn = document.querySelector('button, a');
                // Try to auto-click "Refresh" if it exists — many lockers unlock after Refresh
                const allBtns = document.querySelectorAll('button, a');
                for (const b of allBtns) {
                  if (/^refresh$/i.test((b.innerText||'').trim())) {
                    b.style.setProperty('display','none','important');
                  }
                }
              } catch (_) {}
            }
          }
        }
      }
    } catch (_) {}
  }

  // ── 5b. Structure-based blocker defuser (text-independent second pass) ──
  // Catches lockers whose wording the keyword regex does not know yet: a
  // full-viewport fixed shell, top-layer z, visible text, NO close affordance
  // and no consent wording. Guarded by a first-seen dwell time so hero
  // sections, launch splash frames and React portals never get touched.
  const bsShellFirstSeen = new WeakMap();
  function bsNeutralizeBlockingShells() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.adblock) return;
      if (bsGate.domdef === false) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      const vw = window.innerWidth || 800;
      const vh = window.innerHeight || 600;
      const now = Date.now();
      const shells = document.querySelectorAll('div, section');
      for (const el of shells) {
        if (!el || el._bsShellNeutralized || el._bsContentOverlayNeutralized) continue;
        if (el === document.body || el === document.documentElement) continue;
        if (typeof el.id === 'string' && el.id.startsWith('bs-')) continue;
        if (isProtectedCaptchaOrAuth(el)) continue;
        let cs = null;
        try { cs = window.getComputedStyle ? window.getComputedStyle(el) : null; } catch (_) {}
        if (!cs) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < vw * 0.92 || rect.height < vh * 0.92) continue;   // must blanket the viewport
        if (cs.position !== 'fixed') continue;
        if ((parseInt(cs.zIndex, 10) || 0) < 999) continue;
        const txt = (el.innerText || '').toLowerCase();
        if (!txt.trim()) continue;                                          // empty/invisible → other passes
        // Consent & cookie surfaces belong to the dedicated consent flow
        if (/cookie|consent|gdpr|privacy policy|terms of|we value your/.test(txt)) continue;
        // Any click affordance (link/close/skip/accept) → likely legitimate modal UI
        const clickable = el.querySelectorAll('a, button, [role="button"], input, select, textarea, form, video, iframe');
        if (clickable.length > 0) continue;
        // Dwell check: must persist as a blocker for a full timer cycle before acting
        const seen = bsShellFirstSeen.get(el) || 0;
        if (!seen) { bsShellFirstSeen.set(el, now); continue; }
        if (now - seen < 8000) continue;

        el._bsShellNeutralized = true;
        try {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        } catch (_) {}
        try {
          document.documentElement.style.setProperty('overflow', 'auto', 'important');
          document.body.style.setProperty('overflow', 'auto', 'important');
        } catch (_) {}
        bsBumpStat('trapsNeutralized', 1);
      }
    } catch (_) {}
  }

  // Universal wait-page detector — sabhi wait wale patterns pakdega.
  // Strong signals (alone enough): explicit locker phrasing.
  // Weak signals (need timer element): bare "wait N" + countdown node.
  // Safe: Meta AI "Couldn't generate" has no wait/seconds/link-ready/countdown → never matches.
  function bsIsLockerPage() {
    try {
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return false;
      if (typeof BS_SHORTENER_HOSTS !== 'undefined') {
        try {
          if (BS_SHORTENER_HOSTS.some(h => host === h || host.endsWith('.' + h))) return true;
        } catch (_) {}
      }
      const bodyTxt = (document.body && (document.body.innerText || document.body.textContent) || '').toLowerCase();
      if (!bodyTxt) return false;
      // 1) Strong universal patterns — koi bhi wait wala
      const strongRe = /wait for the link|wait for \d+\s*s(?:ec(?:onds?)?)?\b|wait\s+\d+\s*s(?:ec(?:onds?)?)?\b|waiting \d+\s*s|please wait|you must wait|wait a moment|wait a second|your link is almost ready|link is almost ready|almost ready|seconds?\s*(remaining|left|to go)|countdown|generat\w*\s+(link|download)|link will appear|download will start|redirecting in \d+|continue to.*link|click.*continue|proceed.*link|click here to continue|click image to go fast|or click image|verify you are human.*continue|click allow to continue|press allow to continue/i;
      if (strongRe.test(bodyTxt)) return true;
      // 2) Timer-node + seconds combo — e.g. big "60" circle + "Seconds" label
      try {
        const hasTimerNode = !!document.querySelector('[id*="countdown"],[class*="countdown"],[id*="timer"],[class*="timer"],.seconds,[class*="seconds"],#link,[id*="safelink"],#get-link,#download-btn,#btn-main');
        if (hasTimerNode && /\b\d+\s*s(?:ec(?:onds?)?)?\b|seconds/i.test(bodyTxt)) return true;
      } catch (_) {}
      return false;
    } catch (_) { return false; }
  }

  // "wait for 60s or click image to go fast" → auto-click the linked image to skip wait
  function bsClickFastImage() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.timers) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      const bodyTxt = (document.body && (document.body.innerText || document.body.textContent) || '').toLowerCase();
      if (!/click image to go fast|wait for \d+\s*s\b.*click image/i.test(bodyTxt)) return;
      // Find clickable images: <a><img></a> inside article / main content
      const linkedImgs = document.querySelectorAll('article a img, main a img, .entry-content a img, .post-content a img, a img');
      for (const img of linkedImgs) {
        try {
          const a = img.closest ? img.closest('a') : null;
          if (!a || a._bsClicked) continue;
          if (isProtectedCaptchaOrAuth(a)) continue;
          const href = a.getAttribute('href') || '';
          if (!href || href === '#' || href.startsWith('javascript:')) continue;
          a._bsClicked = true;
          try { a.click(); } catch (_) {}
          try { a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
          bsBumpStat('directLinksUnlocked', 1);
          break; // one fast-path click is enough
        } catch (_) {}
      }
    } catch (_) {}
  }

  function fastPassButtons() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.timers) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      // Only touch locker pages — never restyle generic web-app buttons (Meta AI, Gmail, etc.)
      if (!bsIsLockerPage()) return;

      const btnSelectors = [
        'a.btn', 'a[class*="download"]', 'a[class*="button"]', 'div[class*="download"]',
        'a[href*="download"]', 'a[href*="server"]', 'a[href*="drive"]', 'a[href*="mega"]',
        '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download', '.get-link',
        '.download-btn', '.btn-download', '#wpsafe-generate', '#continue-btn', '#btn-continue',
        '#imnotrobot', '#btn6', '#btn-captcha', '.btn-captcha', '#openInChrome', '.btn-open-chrome',
        '.download-box a', '.download-box button', 'a[onclick*="download"]',
        'a[id*="link"], button[id*="link"], button[id*="download"], button[class*="download"], #link, .link-button, .generate-link, [id*="safelink"]',
        'button[type="submit"], input[type="submit"]'
      ];

      const btns = document.querySelectorAll(btnSelectors.join(', '));
      for (const btn of btns) {
        if (!btn || btn._bsTouched) continue;
        if (isProtectedCaptchaOrAuth(btn)) continue;
        const txt = (btn.innerText || btn.textContent || btn.value || '').trim().toLowerCase();
        // Strict: require locker CTA wording. Bare "generate" (Meta AI) is NOT enough.
        const isDownloadTarget = txt.includes('download') || txt.includes('get link') || txt.includes('getting link') || txt.includes('almost ready') || txt.includes('continue to') || txt.includes('click here to continue') || txt.includes('proceed to') || (txt === 'continue') || (txt === 'submit') || (txt === 'get link') || txt.includes('view link') || txt.includes('final link');

        const idCls = (btn.id || '') + ' ' + (typeof btn.className === 'string' ? btn.className : '');
        const looksLikeLockerBtn = /download|get-link|getlink|safelink|btn-main|btn-continue|wpsafe/i.test(idCls);

        if (!isDownloadTarget && !looksLikeLockerBtn) continue;

        // Non-destructive: only un-disable / un-hide if actually disabled or hidden.
        const wasDisabled = btn.hasAttribute && (btn.hasAttribute('disabled') || btn.hasAttribute('aria-disabled') || btn.classList.contains('disabled'));
        let wasHidden = false;
        try {
          const cs = window.getComputedStyle ? window.getComputedStyle(btn) : null;
          if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.2 || cs.pointerEvents === 'none')) wasHidden = true;
        } catch (_) {}
        if (!wasDisabled && !wasHidden) continue;

        btn._bsTouched = true;
        try { btn.removeAttribute('disabled'); btn.removeAttribute('aria-disabled'); } catch (_) {}
        try { if (btn.classList.contains('disabled')) btn.classList.remove('disabled'); } catch (_) {}
        // Minimal restore — never force position/z-index/display on web-apps.
        if (wasHidden) {
          try {
            btn.style.setProperty('pointer-events', 'auto', 'important');
            btn.style.setProperty('opacity', '1', 'important');
            if (window.getComputedStyle(btn).display === 'none') btn.style.setProperty('display', 'inline-block', 'important');
            if (window.getComputedStyle(btn).visibility === 'hidden') btn.style.setProperty('visibility', 'visible', 'important');
          } catch (_) {}
        }
        const pageZero = /\b0\s*sec(onds?)?\b/.test((document.body && document.body.innerText || '').toLowerCase());
        if (pageZero && /getting link|get link|submit/.test(txt) && !btn._bsClicked) {
          try {
            btn._bsClicked = true;
            setTimeout(() => {
              const f = btn.closest ? btn.closest('form') : null;
              if (f && f.requestSubmit) try { f.requestSubmit(btn); return; } catch (_) {}
              try { btn.click(); } catch (_) {}
            }, 900);
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  function bsForceClickGreenCTA() {
    try {
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      if (typeof bsIsLockerPage === 'function' && !bsIsLockerPage()) return;
      const ctas = document.querySelectorAll('#btn-main, #get-link, #getlink, #download-btn, #btn-download, .get-link, .download-btn, a[href*="download"], button[id*="link"], button[id*="download"], input[type=submit], button[type=submit]');
      for (const btn of ctas) {
        if (!btn || btn._bsClicked || isProtectedCaptchaOrAuth(btn)) continue;
        const raw = btn.innerText || btn.textContent || btn.value || (btn.getAttribute ? btn.getAttribute('value') : '') || '';
        const txt = raw.trim().toLowerCase();
        const isCTA = /getting link|get link|your link|continue|download|click here|proceed|getlink|generat|submit|verify|confirm|please wait/.test(txt)
          || btn.id === 'get-link' || btn.id === 'download-btn' || btn.id === 'btn-main' || btn.id === 'btn6' || btn.id === 'submit' || btn.id === 'btn-submit'
          || /getting|get-link|download|submit/.test(btn.className || '') || btn.type === 'submit';
        if (!isCTA) continue;
        const pageText = (document.body && (document.body.innerText || document.body.textContent) || '').toLowerCase();
        const countdownZero = /\b0\s*sec(onds?)?\b/.test(pageText) || pageText.includes('your link is almost ready') || pageText.includes('link is almost ready') || pageText.includes('please wait');
        if (!countdownZero && !/getting link|submit/.test(txt)) continue;
        btn._bsClicked = true;
        try { btn.removeAttribute('disabled'); btn.removeAttribute('aria-disabled'); btn.classList.remove('disabled'); } catch (_) {}
        btn.style.setProperty('pointer-events', 'auto', 'important');
        btn.style.setProperty('opacity', '1', 'important');
        btn.style.setProperty('display', 'inline-block', 'important');
        btn.style.setProperty('visibility', 'visible', 'important');
        if (/getting link/.test(txt)) try { btn.textContent = 'Get Link'; } catch (_) {}
        setTimeout(() => {
          try {
            const form = btn.closest ? btn.closest('form') : null;
            if (form && typeof form.requestSubmit === 'function') {
              try { form.requestSubmit(btn); } catch (_) { btn.click(); }
            } else if (form) {
              try { form.submit(); } catch (_) { btn.click(); }
            } else {
              btn.click();
            }
            bsBumpStat('directLinksUnlocked', 1);
          } catch (_) {}
        }, 900);
        break;
      }
    } catch (_) {}
  }

  // User request: timer text ko haath nahi lagana — display normal rahega.
  // Time skip sirf inject.js turbo (setTimeout/setInterval) se hoga. Yahan sirf zero-detect + auto-click.
  function fastForwardCountdown() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.timers) return;
      if (typeof bsIsNoAutomationHost === 'function' && bsIsNoAutomationHost(host)) return;
      if (bsIsJsonDumpPage()) return;
      if (typeof bsIsLockerPage === 'function' && !bsIsLockerPage()) return;
      let foundZero = false;
      try {
        const bodyTxt = (document.body && (document.body.innerText || document.body.textContent) || '').toLowerCase();
        if (/\b0\s*s(?:ec(?:onds?)?)?\b/.test(bodyTxt) && /almost ready|getting link|please wait|wait for|countdown/i.test(bodyTxt)) foundZero = true;
      } catch (_) {}
      if (foundZero) bsForceClickGreenCTA();
      const hiddenLinks = document.querySelectorAll('a[href^="http"], a[href^="/"]');
      for (const a of hiddenLinks) {
        if (a._bsFF || isProtectedCaptchaOrAuth(a)) continue;
        const txt2 = (a.innerText || '').toLowerCase();
        const isFinalLink = txt2.includes('get link') || txt2.includes('continue') || txt2.includes('download') || txt2.includes('click here') || a.id === 'get-link' || a.id === 'download-btn';
        const style = window.getComputedStyle ? window.getComputedStyle(a) : null;
        if (isFinalLink && style && (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.2)) {
          a._bsFF = true;
          a.style.setProperty('display', 'inline-block', 'important');
          a.style.setProperty('visibility', 'visible', 'important');
          a.style.setProperty('opacity', '1', 'important');
          a.style.setProperty('pointer-events', 'auto', 'important');
        }
        if (isFinalLink && a.parentElement) {
          const ps = window.getComputedStyle ? window.getComputedStyle(a.parentElement) : null;
          if (ps && ps.display === 'none') {
            a.parentElement.style.setProperty('display', 'block', 'important');
          }
        }
      }
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Cookie Consent + Notification Prompt Auto-Dismiss
  // Gated by `bypassAdblockDetection` (Popup: "AdBlock Trap Modal Defuser").
  // Only clicks when the visible button text EXACTLY matches a consent verb, so
  // ordinary page CTAs ("Continue shopping", "Accept invite") are never touched.
  // ─────────────────────────────────────────────────────────────────────────────
  const BS_CONSENT_ACCEPT = /^(accept( all)?|i accept|agree( to all)?|allow( all)?|got it|ok(ay)?|fine|accept & continue|accept all cookies|allow all cookies|agree & continue|yes,? i agree|i'?m ok with (this|these)|continue with cookies|accept cookie policy)$/i;
  const BS_CONSENT_REJECT = /^(reject all|reject( all cookies)?|decline( all)?|refuse|only necessary|essential only|none|deny( all)?|no,? thanks|decline all)$/i;
  const BS_NOTIF_PROMPT = /(turn on notifications?|enable notifications?|allow notifications?|subscribe to (our )?notifications?|get notifications?|don'?t miss (out|updates)|enable alerts?)/i;
  const BS_CONSENT_SEL = [
    '#onetrust-accept-btn-handler', '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '#CybotCookiebotDialogBodyButtonAccept', '#usercentrics-root [data-testid="uc-accept-all-button"]',
    '[id*="cookie" i] button', '[class*="cookie" i] button', '[class*="consent" i] button',
    '[class*="gdpr" i] button', '[aria-label*="accept" i][role="button"]',
    '[aria-label*="agree" i][role="button"]', '[data-testid*="accept" i]',
    '[data-testid*="cookie" i] button', '[data-id*="accept" i]'
  ].join(', ');

  function dismissConsentPrompts() {
    try {
      if (!bsGate.ready || !bsGate.master || bsGate.protected || !bsGate.adblock) return;
      if (bsIsJsonDumpPage()) return;

      // 1) Click a known consent button (exact text match only)
      const nodes = document.querySelectorAll(BS_CONSENT_SEL);
      for (const n of nodes) {
        if (!n || n._bsConsent) continue;
        const label = (n.innerText || n.textContent || n.getAttribute('aria-label') || '').trim();
        if (!label || label.length > 40) continue;
        if (!BS_CONSENT_ACCEPT.test(label) && !BS_CONSENT_REJECT.test(label)) continue;
        n._bsConsent = true;
        try { n.click(); } catch (_) {}
        try { n.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
        try { bsBumpStat('trapsNeutralized', 1); } catch (_) {}
        return; // one consent per pass
      }

      // 2) Notification permission prompts (full-screen or corner modal)
      const prompts = document.querySelectorAll('div, section, aside');
      for (const p of prompts) {
        if (!p || p._bsNotif) continue;
        const t = (p.innerText || '').trim();
        if (!t || t.length > 400) continue;
        if (!BS_NOTIF_PROMPT.test(t)) continue;
        // Must actually be a blocking/overlaying prompt
        let overlay = false;
        try {
          const cs = window.getComputedStyle ? window.getComputedStyle(p) : null;
          if (cs) {
            const z = parseInt(cs.zIndex, 10) || 0;
            const r = p.getBoundingClientRect();
            const big = r.width >= (window.innerWidth || 800) * 0.3 && r.height >= (window.innerHeight || 600) * 0.2;
            overlay = (cs.position === 'fixed' && z >= 30) || (z >= 1000 && big);
          }
        } catch (_) {}
        if (!overlay) continue;
        p._bsNotif = true;
        // Prefer a real opt-out button, else remove the prompt outright
        const optOut = p.querySelector('button, [role="button"]');
        if (optOut) { try { optOut.click(); } catch (_) {} }
        try {
          p.style.setProperty('display', 'none', 'important');
          bsBumpStat('trapsNeutralized', 1);
        } catch (_) {}
        return;
      }
    } catch (_) {}
  }

  let cScanTimer = null;
  function debouncedContentScan() {
    if (cScanTimer) return;
    cScanTimer = setTimeout(() => {
      annihilateAntiAdblockModals();
      purgeInvisibleOverlays();
      bsNeutralizeBlockingShells();
      fastPassButtons();
      fastForwardCountdown();
      bsClickFastImage();
      dismissConsentPrompts();
      cScanTimer = null;
    }, 150);
  }

  annihilateAntiAdblockModals();
  purgeInvisibleOverlays();
  fastPassButtons();
  fastForwardCountdown();
  bsClickFastImage();
  dismissConsentPrompts();
  const trapInterval = setInterval(() => {
    debouncedContentScan();
    try { fastForwardCountdown(); fastPassButtons(); bsClickFastImage(); dismissConsentPrompts(); } catch (_) {}
  }, 800);
  // Scans stop after the page has had ample time to render its trap. 60s was
  // too short for lazy-injected lockers (SPA route swaps at 60-120s). Hidden
  // tabs are handled below via visibilitychange, so the cost stays low.
  setTimeout(() => clearInterval(trapInterval), 150000);

  const trapObserver = new MutationObserver(debouncedContentScan);
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
  try {
    document.addEventListener('visibilitychange', () => { if (document.hidden) { try { trapObserver.disconnect(); clearInterval(trapInterval); } catch (_) {} } });
    setTimeout(() => { try { trapObserver.disconnect(); } catch (_) {} }, 150000);
  } catch (_) {}
})();
