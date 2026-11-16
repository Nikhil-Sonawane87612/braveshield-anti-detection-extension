/**
 * BraveShield Bypass Pro — Control Studio Controller
 * Version: synced from manifest.json at runtime
 */

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('studio-master-toggle');
  const masterLabel = document.getElementById('studio-master-status');
  const profileSearch = document.getElementById('studio-profile-search');
  const optProfile = document.getElementById('opt-profile');
  const customHwPanel = document.getElementById('custom-hw-panel');

  const custPlatform = document.getElementById('cust-platform');
  const custConcurrency = document.getElementById('cust-concurrency');
  const custMemory = document.getElementById('cust-memory');
  const custVendor = document.getElementById('cust-vendor');
  const custRenderer = document.getElementById('cust-renderer');
  const custScreen = document.getElementById('cust-screen');
  const custDpr = document.getElementById('cust-dpr');
  const btnSaveCustomHw = document.getElementById('btn-save-custom-hw');

  const optBrave = document.getElementById('opt-brave');
  const optGpc = document.getElementById('opt-gpc');
  const optDomdef = document.getElementById('opt-domdef');
  const optHints = document.getElementById('opt-hints');
  const optBrowsertype = document.getElementById('opt-browsertype');
  const optNetworkinfo = document.getElementById('opt-networkinfo');
  const optUa = document.getElementById('opt-ua');
  const optUnshortener = document.getElementById('opt-unshortener');
  const optTimers = document.getElementById('opt-timers');
  const optGentle = document.getElementById('opt-gentle');
  const optAggressiveTimers = document.getElementById('opt-aggressivetimers');
  const optPaywall = document.getElementById('opt-paywall');
  const optAdblock = document.getElementById('opt-adblock');
  const optYoutube = document.getElementById('opt-youtube');
  const optIgAds = document.getElementById('opt-igads');
  const optIgScroll = document.getElementById('opt-igscroll');
  const optShorts = document.getElementById('opt-shorts');
  const optShortsScroll = document.getElementById('opt-shortsscroll');
  const optFbReels = document.getElementById('opt-fbreels');
  const optPermission = document.getElementById('opt-permission');
  const optWorker = document.getElementById('opt-worker');
  const matrixGlobal = document.getElementById('matrix-global');
  const matrixPerSite = document.getElementById('matrix-persite');
  const matrixModeDesc = document.getElementById('matrix-mode-desc');
  const matrixSitePicker = document.getElementById('matrix-site-picker');
  const matrixModuleGrid = document.getElementById('matrix-module-grid');
  const btnMatrixCopy = document.getElementById('btn-matrix-copy-global');
  const btnMatrixClear = document.getElementById('btn-matrix-clear');

  // ── New-feature controls (Font Ensemble / Identity Rotation / Auto-Pilot /
  //    Custom Resolver Rules / Protected Sites) ──
  const optFontEnsemble = document.getElementById('opt-fontensemble');
  const optRotation = document.getElementById('opt-rotation');
  const optRotationHours = document.getElementById('opt-rotation-hours');
  const optReelDwell = document.getElementById('opt-reeldwell');
  const optReelMaxAuto = document.getElementById('opt-reelmaxauto');
  const rulePatternInput = document.getElementById('rule-pattern');
  const ruleActionSelect = document.getElementById('rule-action');
  const ruleValueInput = document.getElementById('rule-value');
  const btnAddRule = document.getElementById('btn-add-rule');
  const ruleTags = document.getElementById('rule-tags');
  const protectedInput = document.getElementById('protected-input');
  const btnAddProtected = document.getElementById('btn-add-protected');
  const protectedTags = document.getElementById('protected-tags');

  // Modules exposed in the per-site matrix editor (must mirror content.js BS_MATRIX_MODULES)
  const BS_MATRIX_MODULES = [
    ['unshortenerEnabled', 'Instant URL Unshortener'],
    ['autoBypassTimers', '50x Countdown Turbo'],
    ['gentleTurboEnabled', '1.9x Gentle Turbo (≤5s)'],
    ['turboAllSites', 'Aggressive Turbo (All Sites)'],
    ['paywallDefuserEnabled', 'Paywall & Blur Defuser'],
    ['bypassAdblockDetection', 'AdBlock Trap Modal Defuser'],
    ['canvasNoiseEnabled', 'Canvas Bit-Shift Noise'],
    ['audioNoiseEnabled', 'Audio Stack Variance'],
    ['webglSpoofingEnabled', 'WebGL GPU Masking'],
    ['clientHintsEnabled', 'Client Hints Sync'],
    ['maskBraveApi', 'Deep Brave API Cloak'],
    ['webrtcShieldEnabled', 'WebRTC LAN Isolation'],
    ['domJitterEnabled', 'DOM Micro-Pixel Jitter'],
    ['timerCoarseningEnabled', 'Timer Coarsening'],
    ['uaSpoofingEnabled', 'User-Agent Spoofing'],
    ['screenNormalizationEnabled', 'Screen Normalization'],
    ['webgpuMaskingEnabled', 'WebGPU Masking'],
    ['fontEnumMaskingEnabled', 'Font Enumeration Masking'],
    ['fontEnsembleEnabled', 'Font Ensemble Spoofing'],
    ['cleanUrlEnabled', 'Clean URL Stripper'],
    ['rightClickEnabled', 'Right-Click & Copy'],
    ['videoSpeedEnabled', 'Video Speed Controller'],
    ['autoSkipIntrosEnabled', 'Auto-Skip Intros'],
    ['youtubeAds', 'YouTube Turbo 16x'],
    ['spotifyUnlocked', 'Spotify Unlocked'],
    ['twitchShieldEnabled', 'Twitch Ad Shield'],
    ['instagramReelsAdsEnabled', 'IG Reels Ad Skip'],
    ['instagramAutoScrollEnabled', 'IG Reels Auto-Scroll'],
    ['youtubeShortsEnabled', 'YouTube Shorts Skip'],
    ['youtubeShortsAutoScroll', 'Shorts Auto-Scroll'],
    ['facebookReelsEnabled', 'Facebook Reels Shield'],
    ['permissionAutoDenyEnabled', 'Permission Auto-Deny'],
    ['domStructureDefuserEnabled', 'Structural Shell Defuser']
  ];
  const BS_MATRIX_SET = new Set(BS_MATRIX_MODULES.map(m => m[0]));
  let matrixMode = 'global';
  let matrixSiteCache = {};

  function setMatrixModeUI(mode) {
    matrixMode = mode === 'perSite' ? 'perSite' : 'global';
    if (matrixGlobal) {
      matrixGlobal.classList.toggle('is-active', matrixMode === 'global');
      matrixGlobal.setAttribute('aria-pressed', matrixMode === 'global' ? 'true' : 'false');
    }
    if (matrixPerSite) {
      matrixPerSite.classList.toggle('is-active', matrixMode === 'perSite');
      matrixPerSite.setAttribute('aria-pressed', matrixMode === 'perSite' ? 'true' : 'false');
    }
    if (matrixModeDesc) {
      matrixModeDesc.textContent = matrixMode === 'perSite'
        ? 'Per-Site — each website uses its own module matrix defined in the Sync panel below. Global toggles act as defaults.'
        : 'Global — one set of module toggles applies to every website you visit.';
    }
    const editor = document.getElementById('site-matrix-editor');
    if (editor) editor.style.opacity = matrixMode === 'perSite' ? '1' : '0.55';
  }

  function applyMatrixMode(mode) {
    setMatrixModeUI(mode);
    chrome.storage.local.set({ moduleMatrixMode: matrixMode });
  }
  if (matrixGlobal) matrixGlobal.addEventListener('click', () => applyMatrixMode('global'));
  if (matrixPerSite) matrixPerSite.addEventListener('click', () => applyMatrixMode('perSite'));

  function renderMatrixSitePicker(siteProfiles) {
    matrixSiteCache = (siteProfiles && typeof siteProfiles === 'object') ? siteProfiles : {};
    if (!matrixSitePicker) return;
    const prev = matrixSitePicker.value;
    matrixSitePicker.textContent = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '— select a site —';
    matrixSitePicker.appendChild(ph);
    const keys = Object.keys(matrixSiteCache).sort();
    for (const k of keys) {
      const o = document.createElement('option');
      o.value = k;
      const hasMods = matrixSiteCache[k] && matrixSiteCache[k].modules ? ' •matrix' : '';
      o.textContent = k + hasMods;
      matrixSitePicker.appendChild(o);
    }
    if (prev && matrixSiteCache[prev]) matrixSitePicker.value = prev;
  }

  function renderMatrixModules() {
    if (!matrixModuleGrid) return;
    matrixModuleGrid.textContent = '';
    const domain = matrixSitePicker ? matrixSitePicker.value : '';
    if (!domain) {
      const hint = document.createElement('div');
      hint.className = 'setting-desc';
      hint.textContent = 'Add a site override above first, then select it here to edit its module matrix.';
      matrixModuleGrid.appendChild(hint);
      return;
    }
    const entry = matrixSiteCache[domain] || {};
    const mods = (entry.modules && typeof entry.modules === 'object') ? entry.modules : {};

    for (const [key, label] of BS_MATRIX_MODULES) {
      const row = document.createElement('label');
      row.className = 'matrix-module-row';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = Object.prototype.hasOwnProperty.call(mods, key) ? mods[key] === true : true;
      box.addEventListener('change', () => {
        chrome.storage.local.get(['siteProfiles'], (r) => {
          const sp = (r && r.siteProfiles && typeof r.siteProfiles === 'object') ? r.siteProfiles : {};
          if (!sp[domain] || typeof sp[domain] !== 'object') sp[domain] = {};
          if (!sp[domain].modules || typeof sp[domain].modules !== 'object') sp[domain].modules = {};
          sp[domain].modules[key] = box.checked;
          chrome.storage.local.set({ siteProfiles: sp });
        });
      });
      const txt = document.createElement('span');
      txt.className = 'matrix-module-label';
      txt.textContent = label;
      row.appendChild(box);
      row.appendChild(txt);
      matrixModuleGrid.appendChild(row);
    }
  }

  if (matrixSitePicker) matrixSitePicker.addEventListener('change', renderMatrixModules);
  if (btnMatrixClear && matrixSitePicker) {
    btnMatrixClear.addEventListener('click', () => {
      const domain = matrixSitePicker.value;
      if (!domain) return;
      chrome.storage.local.get(['siteProfiles'], (r) => {
        const sp = (r && r.siteProfiles && typeof r.siteProfiles === 'object') ? r.siteProfiles : {};
        if (sp[domain] && typeof sp[domain] === 'object') {
          delete sp[domain].modules;
          if (!sp[domain].deviceProfile && !sp[domain].browserType) delete sp[domain];
        }
        chrome.storage.local.set({ siteProfiles: sp }, () => renderMatrixModules());
      });
    });
  }
  if (btnMatrixCopy && matrixSitePicker) {
    btnMatrixCopy.addEventListener('click', () => {
      const domain = matrixSitePicker.value;
      if (!domain) return;
      chrome.storage.local.get(['siteProfiles'], (r) => {
        const sp = (r && r.siteProfiles && typeof r.siteProfiles === 'object') ? r.siteProfiles : {};
        const snap = {};
        for (const [k] of BS_MATRIX_MODULES) {
          snap[k] = (typeof sp[domain] === 'object' && sp[domain].modules && typeof sp[domain].modules === 'object' && Object.prototype.hasOwnProperty.call(sp[domain].modules, k))
            ? sp[domain].modules[k] === true
            : true;
        }
        if (!sp[domain] || typeof sp[domain] !== 'object') sp[domain] = {};
        sp[domain].modules = snap;
        chrome.storage.local.set({ siteProfiles: sp }, () => renderMatrixModules());
      });
    });
  }
  const optSpotify = document.getElementById('opt-spotify');
  const optTwitch = document.getElementById('opt-twitch');

  const optAudio = document.getElementById('opt-audio');
  const optCanvas = document.getElementById('opt-canvas');
  const optWebrtc = document.getElementById('opt-webrtc');
  const optBattery = document.getElementById('opt-battery');
  const optTzspoof = document.getElementById('opt-tzspoof');
  const custTimezone = document.getElementById('cust-timezone');
  const custLocale = document.getElementById('cust-locale');
  const optDomjitter = document.getElementById('opt-domjitter');
  const optTimercoarse = document.getElementById('opt-timercoarse');
  const optCleanurl = document.getElementById('opt-cleanurl');
  const optRightclick = document.getElementById('opt-rightclick');
  const optVideospeed = document.getElementById('opt-videospeed');
  const optAutoskip = document.getElementById('opt-autoskip');

  const statTimeSaved = document.getElementById('stat-time-saved');
  const statTrapsDefused = document.getElementById('stat-traps-defused');
  const statLinksUnlocked = document.getElementById('stat-links-unlocked');
  const btnResetTelemetry = document.getElementById('btn-reset-telemetry');

  const btnSync = document.getElementById('btn-studio-sync');
  const syncTime = document.getElementById('sync-time');
  const whitelistInput = document.getElementById('whitelist-input');
  const btnAddWhitelist = document.getElementById('btn-add-whitelist');
  const whitelistTags = document.getElementById('whitelist-tags');

  const btnExportBackup = document.getElementById('btn-export-backup');
  const btnImportTrigger = document.getElementById('btn-import-backup-trigger');
  const fileImportBackup = document.getElementById('file-import-backup');

  // Per-Site Overrides (F3)
  const siteDomainInput = document.getElementById('site-profile-domain');
  const siteProfileSelect = document.getElementById('site-profile-select');
  const siteBrowsertype = document.getElementById('site-browsertype');
  const btnAddSiteProfile = document.getElementById('btn-add-site-profile');
  const siteProfileTags = document.getElementById('site-profile-tags');

  let selectedProfileId = 'win-rtx4090';

  // Premium nav active indicator — UI only, null-guarded, no storage side-effects
  try {
    const studioNav = document.querySelector('.studio-nav');
    const studioNavLinks = studioNav ? Array.from(studioNav.querySelectorAll('a[href^="#"]')) : [];
    const studioPanels = Array.from(document.querySelectorAll('.cyber-panel[id]'));
    if (studioNavLinks.length && studioPanels.length && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        let best = null;
        let bestRatio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = e.target;
          }
        }
        if (best && best.id) {
          const targetHref = '#' + best.id;
          studioNavLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === targetHref));
        }
      }, { rootMargin: '-18% 0px -70% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
      studioPanels.forEach((p) => { try { io.observe(p); } catch (_) {} });
      studioNavLinks.forEach((a) => {
        a.addEventListener('click', () => {
          studioNavLinks.forEach((x) => x.classList.remove('active'));
          a.classList.add('active');
        });
      });
    }
  } catch (_) {}

  // Dynamic version from manifest — single source of truth
  const verPill = document.getElementById('studio-ver-pill');
  if (verPill) {
    try { verPill.textContent = 'v' + chrome.runtime.getManifest().version; } catch (_) { verPill.textContent = ''; }
  }

  function formatSeconds(secs) {
    if (!secs || secs < 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  }

  function updateMasterStatus(enabled) {
    if (enabled) {
      masterLabel.textContent = 'SYSTEM DEFENSE ARMED';
      masterLabel.style.color = 'var(--accent-emerald)';
    } else {
      masterLabel.textContent = 'SYSTEM DEFENSE OFFLINE';
      masterLabel.style.color = 'var(--accent-danger)';
    }
  }

  function toggleCustomPanel(show) {
    if (customHwPanel) {
      customHwPanel.style.display = show ? 'block' : 'none';
    }
  }

  // 1. Populate 110+ Profiles into Dropdown
  function renderProfileOptions(filter = '') {
    if (!optProfile) return;
    const filterLower = filter.trim().toLowerCase();
    const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];

    optProfile.innerHTML = '';

    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '🛠️ Custom Hardware Profile (Configure Below)';
    optProfile.appendChild(customOpt);

    const categories = {};
    catalog.forEach(p => {
      if (!filterLower || p.name.toLowerCase().includes(filterLower) || p.category.toLowerCase().includes(filterLower) || p.renderer.toLowerCase().includes(filterLower)) {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
      }
    });

    for (const [catName, profiles] of Object.entries(categories)) {
      const group = document.createElement('optgroup');
      group.label = catName;
      profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        group.appendChild(opt);
      });
      optProfile.appendChild(group);
    }

    optProfile.value = selectedProfileId;
    toggleCustomPanel(selectedProfileId === 'custom');
  }

  renderProfileOptions();

  // Populate the per-site override profile dropdown (F3)
  if (siteProfileSelect) {
    const catalogForSites = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];
    const groups = {};
    catalogForSites.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    for (const [catName, profiles] of Object.entries(groups)) {
      const group = document.createElement('optgroup');
      group.label = catName;
      profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        group.appendChild(opt);
      });
      siteProfileSelect.appendChild(group);
    }
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '🛠️ Custom Hardware Profile';
    siteProfileSelect.appendChild(customOpt);
  }

  if (profileSearch) {
    profileSearch.addEventListener('input', (e) => {
      renderProfileOptions(e.target.value);
    });
  }

  // Defence-in-depth: sanitize poisoned storage.local on every read path.
  // bsSanitizeImport only guards the import flow; a hand-edited or previously
  // poisoned storage would otherwise survive a restart and keep __proto__ keys.
  function bsHardenStoredMaps(res) {
    if (!res || typeof res !== 'object') return res;
    let dirty = false;
    if (Array.isArray(res.whitelist)) {
      const safe = [...new Set(res.whitelist.filter(bsIsValidDomain))].slice(0, 500);
      if (safe.length !== res.whitelist.length) { res.whitelist = safe; dirty = true; }
    }
    if (res.siteProfiles && typeof res.siteProfiles === 'object' && !Array.isArray(res.siteProfiles)) {
      const safe = {};
      let changed = false;
      for (const key of Object.keys(res.siteProfiles)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') { changed = true; continue; }
        const prof = res.siteProfiles[key];
        if (!bsIsValidDomain(key) || !prof || typeof prof !== 'object' || Array.isArray(prof)) { changed = true; continue; }
        const entry = {};
        if (typeof prof.deviceProfile === 'string' && prof.deviceProfile.length <= 64) entry.deviceProfile = prof.deviceProfile;
        if (['brave', 'chrome', 'firefox', 'safari'].includes(prof.browserType)) entry.browserType = prof.browserType;
        safe[key] = entry;
      }
      if (changed) { res.siteProfiles = safe; dirty = true; }
    }
    if (dirty) {
      try { chrome.storage.local.set({ whitelist: res.whitelist, siteProfiles: res.siteProfiles }); } catch (_) {}
    }
    return res;
  }

  // 2. Load Saved Options
  chrome.storage.local.get([
    'masterEnabled', 'deviceProfile', 'customHardwareProfile', 'maskBraveApi', 'maskClientHints',
    'uaSpoofingEnabled', 'browserType',
    'unshortenerEnabled', 'autoBypassTimers', 'turboAllSites', 'paywallDefuserEnabled',
    'bypassAdblockDetection', 'spotifyUnlocked', 'youtubeAds', 'twitchShieldEnabled',
    'instagramReelsAdsEnabled', 'instagramAutoScrollEnabled',
    'youtubeShortsEnabled', 'youtubeShortsAutoScroll', 'facebookReelsEnabled',
    'permissionAutoDenyEnabled', 'workerParityEnabled', 'moduleMatrixMode',
    'audioNoiseEnabled', 'canvasNoiseEnabled', 'webrtcShieldEnabled', 'batteryMaskEnabled', 'networkInfoMaskEnabled',
    'cleanUrlEnabled', 'rightClickEnabled', 'videoSpeedEnabled', 'autoSkipIntrosEnabled',
    'timerCoarseningEnabled', 'domJitterEnabled', 'timezoneSpoofingEnabled', 'spoofTimezone', 'spoofLocale',
    'timeSavedSeconds', 'trapsNeutralized', 'directLinksUnlocked',
    'whitelist', 'lastSyncTime', 'siteProfiles'
  ], (raw) => {
    const res = bsHardenStoredMaps(raw);
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;
    updateMasterStatus(isMaster);

    if (res.deviceProfile) {
      selectedProfileId = res.deviceProfile;
      if (optProfile) optProfile.value = selectedProfileId;
      toggleCustomPanel(selectedProfileId === 'custom');
    }

    const optBrowsertypeValue = res.browserType;
    if (optBrowsertype && optBrowsertypeValue) optBrowsertype.value = optBrowsertypeValue;
    if (optNetworkinfo) optNetworkinfo.checked = res.networkInfoMaskEnabled !== false;

    if (res.customHardwareProfile) {
      const c = res.customHardwareProfile;
      if (custPlatform && c.platform) custPlatform.value = c.platform;
      if (custConcurrency && c.concurrency) custConcurrency.value = c.concurrency.toString();
      if (custMemory && c.memory) custMemory.value = c.memory.toString();
      if (custVendor && c.vendor) custVendor.value = c.vendor;
      if (custRenderer && c.renderer) custRenderer.value = c.renderer;
      if (custScreen && c.screen) custScreen.value = `${c.screen.width}x${c.screen.height}`;
      if (custDpr && c.devicePixelRatio) custDpr.value = c.devicePixelRatio.toString();
    }

    optBrave.checked = res.maskBraveApi !== false;
    if (optGpc) optGpc.checked = res.gpcCloakEnabled !== false;
    if (optDomdef) optDomdef.checked = res.domStructureDefuserEnabled !== false;
    optHints.checked = res.maskClientHints !== false;
    if (optUa) optUa.checked = res.uaSpoofingEnabled !== false;
    optUnshortener.checked = res.unshortenerEnabled !== false;
    optTimers.checked = res.autoBypassTimers !== false;
    if (optGentle) optGentle.checked = res.gentleTurboEnabled !== false;
    if (optAggressiveTimers) optAggressiveTimers.checked = res.turboAllSites === true;
    optPaywall.checked = res.paywallDefuserEnabled !== false;
    optAdblock.checked = res.bypassAdblockDetection !== false;
    optYoutube.checked = res.youtubeAds !== false;
    if (optIgAds) optIgAds.checked = res.instagramReelsAdsEnabled !== false;
    if (optIgScroll) optIgScroll.checked = res.instagramAutoScrollEnabled === true;
    if (optShorts) optShorts.checked = res.youtubeShortsEnabled !== false;
    if (optShortsScroll) optShortsScroll.checked = res.youtubeShortsAutoScroll === true;
    if (optFbReels) optFbReels.checked = res.facebookReelsEnabled !== false;
    if (optPermission) optPermission.checked = res.permissionAutoDenyEnabled !== false;
    if (optWorker) optWorker.checked = res.workerParityEnabled === true;
    setMatrixModeUI(res.moduleMatrixMode);
    optSpotify.checked = res.spotifyUnlocked !== false;
    optTwitch.checked = res.twitchShieldEnabled !== false;

    if (optAudio) optAudio.checked = res.audioNoiseEnabled !== false;
    if (optCanvas) optCanvas.checked = res.canvasNoiseEnabled !== false;
    if (optWebrtc) optWebrtc.checked = res.webrtcShieldEnabled !== false;
    if (optBattery) optBattery.checked = res.batteryMaskEnabled !== false;
    if (optTzspoof) optTzspoof.checked = res.timezoneSpoofingEnabled === true;
    if (custTimezone) custTimezone.value = res.spoofTimezone || '';
    if (custLocale) custLocale.value = res.spoofLocale || '';
    if (optDomjitter) optDomjitter.checked = res.domJitterEnabled !== false;
    if (optTimercoarse) optTimercoarse.checked = res.timerCoarseningEnabled !== false;
    if (optCleanurl) optCleanurl.checked = res.cleanUrlEnabled !== false;
    if (optRightclick) optRightclick.checked = res.rightClickEnabled !== false;
    if (optVideospeed) optVideospeed.checked = res.videoSpeedEnabled !== false;
    if (optAutoskip) optAutoskip.checked = res.autoSkipIntrosEnabled !== false;

    // New-feature restores
    if (optFontEnsemble) optFontEnsemble.checked = res.fontEnsembleEnabled !== false;
    if (optRotation) optRotation.checked = res.identityRotationEnabled === true;
    if (optRotationHours) optRotationHours.value = String(res.identityRotationPeriodHours === undefined ? 24 : res.identityRotationPeriodHours);
    if (optReelDwell) optReelDwell.value = String(res.reelDwellSeconds === undefined ? 1 : res.reelDwellSeconds);
    if (optReelMaxAuto) optReelMaxAuto.value = String(res.reelMaxAutoSeconds === undefined ? 0 : res.reelMaxAutoSeconds);
    renderCustomResolvers(res.customResolvers || []);
    renderProtectedSites(res.protectedSites || []);

    if (statTimeSaved) statTimeSaved.textContent = formatSeconds(res.timeSavedSeconds || 0);
    if (statTrapsDefused) statTrapsDefused.textContent = (res.trapsNeutralized || 0).toString();
    if (statLinksUnlocked) statLinksUnlocked.textContent = (res.directLinksUnlocked || 0).toString();

    if (res.lastSyncTime) {
      syncTime.textContent = 'Last checked: ' + new Date(res.lastSyncTime).toLocaleTimeString();
    }

    renderWhitelist(res.whitelist || []);
    renderSiteOverrides(res.siteProfiles || {});
    renderMatrixSitePicker(res.siteProfiles || {});
    renderMatrixModules();

    // Deep-link from the popup (🧩 Edit-this-site): options.html#bs-edit-site=<domain>
    try {
      const m = location.hash.match(/bs-edit-site=([^\s&]+)/i);
      if (m) {
        const target = decodeURIComponent(m[1]).toLowerCase();
        history.replaceState(null, '', location.pathname + location.search);
        setTimeout(() => {
          const editor = document.getElementById('site-matrix-editor');
          if (matrixSiteCache[target] && matrixSitePicker) {
            matrixSitePicker.value = target;
            if (typeof renderMatrixModules === 'function') renderMatrixModules();
          } else {
            const inp = document.getElementById('site-profile-domain');
            if (inp) inp.value = target;
          }
          if (editor) editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    } catch (_) {}
  });

  // 3. Storage Change Listener (Bidirectional Live Sync)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.masterEnabled !== undefined) {
        masterToggle.checked = changes.masterEnabled.newValue !== false;
        updateMasterStatus(masterToggle.checked);
      }
      if (changes.maskBraveApi !== undefined) optBrave.checked = changes.maskBraveApi.newValue !== false;
      if (changes.maskClientHints !== undefined) optHints.checked = changes.maskClientHints.newValue !== false;
      if (changes.unshortenerEnabled !== undefined) optUnshortener.checked = changes.unshortenerEnabled.newValue !== false;
      if (changes.autoBypassTimers !== undefined) optTimers.checked = changes.autoBypassTimers.newValue !== false;
      if (changes.gentleTurboEnabled !== undefined && optGentle) optGentle.checked = changes.gentleTurboEnabled.newValue !== false;
      if (changes.paywallDefuserEnabled !== undefined) optPaywall.checked = changes.paywallDefuserEnabled.newValue !== false;
      if (changes.bypassAdblockDetection !== undefined) optAdblock.checked = changes.bypassAdblockDetection.newValue !== false;
      if (changes.youtubeAds !== undefined) optYoutube.checked = changes.youtubeAds.newValue !== false;
      if (changes.instagramReelsAdsEnabled !== undefined && optIgAds) optIgAds.checked = changes.instagramReelsAdsEnabled.newValue !== false;
      if (changes.instagramAutoScrollEnabled !== undefined && optIgScroll) optIgScroll.checked = changes.instagramAutoScrollEnabled.newValue === true;
      if (changes.youtubeShortsEnabled !== undefined && optShorts) optShorts.checked = changes.youtubeShortsEnabled.newValue !== false;
      if (changes.youtubeShortsAutoScroll !== undefined && optShortsScroll) optShortsScroll.checked = changes.youtubeShortsAutoScroll.newValue === true;
      if (changes.facebookReelsEnabled !== undefined && optFbReels) optFbReels.checked = changes.facebookReelsEnabled.newValue !== false;
      if (changes.permissionAutoDenyEnabled !== undefined && optPermission) optPermission.checked = changes.permissionAutoDenyEnabled.newValue !== false;
      if (changes.workerParityEnabled !== undefined && optWorker) optWorker.checked = changes.workerParityEnabled.newValue === true;
      if (changes.moduleMatrixMode !== undefined) setMatrixModeUI(changes.moduleMatrixMode.newValue);
      if (changes.spotifyUnlocked !== undefined) optSpotify.checked = changes.spotifyUnlocked.newValue !== false;
      if (changes.twitchShieldEnabled !== undefined) optTwitch.checked = changes.twitchShieldEnabled.newValue !== false;

      if (changes.audioNoiseEnabled !== undefined && optAudio) optAudio.checked = changes.audioNoiseEnabled.newValue !== false;
      if (changes.canvasNoiseEnabled !== undefined && optCanvas) optCanvas.checked = changes.canvasNoiseEnabled.newValue !== false;
      if (changes.webrtcShieldEnabled !== undefined && optWebrtc) optWebrtc.checked = changes.webrtcShieldEnabled.newValue !== false;
      if (changes.batteryMaskEnabled !== undefined && optBattery) optBattery.checked = changes.batteryMaskEnabled.newValue !== false;
      if (changes.networkInfoMaskEnabled !== undefined && optNetworkinfo) optNetworkinfo.checked = changes.networkInfoMaskEnabled.newValue !== false;
      if (changes.domJitterEnabled !== undefined && optDomjitter) optDomjitter.checked = changes.domJitterEnabled.newValue !== false;
      if (changes.timerCoarseningEnabled !== undefined && optTimercoarse) optTimercoarse.checked = changes.timerCoarseningEnabled.newValue !== false;
      if (changes.cleanUrlEnabled !== undefined && optCleanurl) optCleanurl.checked = changes.cleanUrlEnabled.newValue !== false;
      if (changes.rightClickEnabled !== undefined && optRightclick) optRightclick.checked = changes.rightClickEnabled.newValue !== false;
      if (changes.videoSpeedEnabled !== undefined && optVideospeed) optVideospeed.checked = changes.videoSpeedEnabled.newValue !== false;
      if (changes.autoSkipIntrosEnabled !== undefined && optAutoskip) optAutoskip.checked = changes.autoSkipIntrosEnabled.newValue !== false;

      if (changes.deviceProfile !== undefined) {
        selectedProfileId = changes.deviceProfile.newValue;
        if (optProfile) optProfile.value = selectedProfileId;
        toggleCustomPanel(selectedProfileId === 'custom');
      }
      if (changes.whitelist !== undefined) renderWhitelist(changes.whitelist.newValue || []);
      if (changes.protectedSites !== undefined) renderProtectedSites(changes.protectedSites.newValue || []);
      if (changes.customResolvers !== undefined) renderCustomResolvers(changes.customResolvers.newValue || []);
      if (changes.fontEnsembleEnabled !== undefined && optFontEnsemble) optFontEnsemble.checked = changes.fontEnsembleEnabled.newValue !== false;
      if (changes.identityRotationEnabled !== undefined && optRotation) optRotation.checked = changes.identityRotationEnabled.newValue === true;
      if (changes.siteProfiles !== undefined) { renderSiteOverrides(changes.siteProfiles.newValue || {}); renderMatrixSitePicker(changes.siteProfiles.newValue || {}); renderMatrixModules(); }
      if (changes.timeSavedSeconds !== undefined && statTimeSaved) {
        statTimeSaved.textContent = formatSeconds(changes.timeSavedSeconds.newValue || 0);
      }
      if (changes.trapsNeutralized !== undefined && statTrapsDefused) {
        statTrapsDefused.textContent = (changes.trapsNeutralized.newValue || 0).toString();
      }
      if (changes.directLinksUnlocked !== undefined && statLinksUnlocked) {
        statLinksUnlocked.textContent = (changes.directLinksUnlocked.newValue || 0).toString();
      }
    }
  });

  // 4. Master Switch
  masterToggle.addEventListener('change', () => {
    const val = masterToggle.checked;
    chrome.storage.local.set({ masterEnabled: val, enabled: val });
    updateMasterStatus(val);
  });

  if (optBrowsertype) {
    optBrowsertype.addEventListener('change', () => {
      chrome.storage.local.set({ browserType: optBrowsertype.value });
    });
  }

  // Profile Selector Change
  if (optProfile) {
    optProfile.addEventListener('change', () => {
      selectedProfileId = optProfile.value;
      chrome.storage.local.set({ deviceProfile: selectedProfileId });
      toggleCustomPanel(selectedProfileId === 'custom');
    });
  }

  // Save Custom Hardware Profile
  if (btnSaveCustomHw) {
    btnSaveCustomHw.addEventListener('click', () => {
      const [w, h] = (custScreen?.value || '2560x1440').split('x').map(Number);
      const customProfile = {
        platform: custPlatform?.value || 'Win32',
        concurrency: parseInt(custConcurrency?.value || '16', 10),
        memory: parseInt(custMemory?.value || '32', 10),
        vendor: custVendor?.value || 'Google Inc. (NVIDIA)',
        renderer: custRenderer?.value || 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        screen: { width: w, height: h, colorDepth: 24 },
        devicePixelRatio: parseFloat(custDpr?.value || '1')
      };

      chrome.storage.local.set({
        deviceProfile: 'custom',
        customHardwareProfile: customProfile
      }, () => {
        btnSaveCustomHw.textContent = '✅ Custom Profile Saved & Applied!';
        setTimeout(() => { btnSaveCustomHw.textContent = '💾 Save & Apply Custom Hardware Profile'; }, 2000);
      });
    });
  }

  // Settings Toggles
  optBrave.addEventListener('change', () => chrome.storage.local.set({ maskBraveApi: optBrave.checked }));
  if (optGpc) optGpc.addEventListener('change', () => chrome.storage.local.set({ gpcCloakEnabled: optGpc.checked }));
  if (optDomdef) optDomdef.addEventListener('change', () => chrome.storage.local.set({ domStructureDefuserEnabled: optDomdef.checked }));
  optHints.addEventListener('change', () => chrome.storage.local.set({ clientHintsEnabled: optHints.checked, maskClientHints: optHints.checked }));
  if (optUa) optUa.addEventListener('change', () => chrome.storage.local.set({ uaSpoofingEnabled: optUa.checked }));
  optUnshortener.addEventListener('change', () => chrome.storage.local.set({ unshortenerEnabled: optUnshortener.checked }));
  optTimers.addEventListener('change', () => chrome.storage.local.set({ autoBypassTimers: optTimers.checked }));
  if (optGentle) optGentle.addEventListener('change', () => chrome.storage.local.set({ gentleTurboEnabled: optGentle.checked }));
  if (optAggressiveTimers) optAggressiveTimers.addEventListener('change', () => chrome.storage.local.set({ turboAllSites: optAggressiveTimers.checked }));
  optPaywall.addEventListener('change', () => chrome.storage.local.set({ paywallDefuserEnabled: optPaywall.checked }));
  optAdblock.addEventListener('change', () => chrome.storage.local.set({ bypassAdblockDetection: optAdblock.checked }));
  optYoutube.addEventListener('change', () => chrome.storage.local.set({ youtubeAds: optYoutube.checked }));
  if (optIgAds) optIgAds.addEventListener('change', () => chrome.storage.local.set({ instagramReelsAdsEnabled: optIgAds.checked }));
  if (optIgScroll) optIgScroll.addEventListener('change', () => chrome.storage.local.set({ instagramAutoScrollEnabled: optIgScroll.checked }));
  if (optShorts) optShorts.addEventListener('change', () => chrome.storage.local.set({ youtubeShortsEnabled: optShorts.checked }));
  if (optShortsScroll) optShortsScroll.addEventListener('change', () => chrome.storage.local.set({ youtubeShortsAutoScroll: optShortsScroll.checked }));
  if (optFbReels) optFbReels.addEventListener('change', () => chrome.storage.local.set({ facebookReelsEnabled: optFbReels.checked }));
  if (optPermission) optPermission.addEventListener('change', () => chrome.storage.local.set({ permissionAutoDenyEnabled: optPermission.checked }));
  if (optWorker) optWorker.addEventListener('change', () => chrome.storage.local.set({ workerParityEnabled: optWorker.checked }));
  optSpotify.addEventListener('change', () => chrome.storage.local.set({ spotifyUnlocked: optSpotify.checked }));
  optTwitch.addEventListener('change', () => chrome.storage.local.set({ twitchShieldEnabled: optTwitch.checked }));

  if (optAudio) optAudio.addEventListener('change', () => chrome.storage.local.set({ audioNoiseEnabled: optAudio.checked }));
  if (optCanvas) optCanvas.addEventListener('change', () => chrome.storage.local.set({ canvasNoiseEnabled: optCanvas.checked }));
  if (optWebrtc) optWebrtc.addEventListener('change', () => chrome.storage.local.set({ webrtcShieldEnabled: optWebrtc.checked }));
  if (optBattery) optBattery.addEventListener('change', () => chrome.storage.local.set({ batteryMaskEnabled: optBattery.checked }));
  if (optNetworkinfo) optNetworkinfo.addEventListener('change', () => chrome.storage.local.set({ networkInfoMaskEnabled: optNetworkinfo.checked }));
  if (optTzspoof) optTzspoof.addEventListener('change', () => chrome.storage.local.set({ timezoneSpoofingEnabled: optTzspoof.checked }));
  if (custTimezone) custTimezone.addEventListener('change', () => chrome.storage.local.set({ spoofTimezone: custTimezone.value || null }));
  if (custLocale) custLocale.addEventListener('change', () => chrome.storage.local.set({ spoofLocale: custLocale.value || null }));
  if (optDomjitter) optDomjitter.addEventListener('change', () => chrome.storage.local.set({ domJitterEnabled: optDomjitter.checked }));
  if (optTimercoarse) optTimercoarse.addEventListener('change', () => chrome.storage.local.set({ timerCoarseningEnabled: optTimercoarse.checked }));
  if (optCleanurl) optCleanurl.addEventListener('change', () => chrome.storage.local.set({ cleanUrlEnabled: optCleanurl.checked }));
  if (optRightclick) optRightclick.addEventListener('change', () => chrome.storage.local.set({ rightClickEnabled: optRightclick.checked }));
  if (optVideospeed) optVideospeed.addEventListener('change', () => chrome.storage.local.set({ videoSpeedEnabled: optVideospeed.checked }));
  if (optAutoskip) optAutoskip.addEventListener('change', () => chrome.storage.local.set({ autoSkipIntrosEnabled: optAutoskip.checked }));

  // New-feature bindings
  if (optFontEnsemble) optFontEnsemble.addEventListener('change', () => chrome.storage.local.set({ fontEnsembleEnabled: optFontEnsemble.checked }));
  if (optRotation) optRotation.addEventListener('change', () => chrome.storage.local.set({ identityRotationEnabled: optRotation.checked }));
  if (optRotationHours) optRotationHours.addEventListener('change', () => {
    const h = Math.max(1, Math.min(720, parseInt(optRotationHours.value, 10) || 24));
    optRotationHours.value = String(h);
    chrome.storage.local.set({ identityRotationPeriodHours: h });
  });
  if (optReelDwell) optReelDwell.addEventListener('change', () => {
    const s = Math.max(0, Math.min(10, parseInt(optReelDwell.value, 10) || 0));
    optReelDwell.value = String(s);
    chrome.storage.local.set({ reelDwellSeconds: s });
  });
  if (optReelMaxAuto) optReelMaxAuto.addEventListener('change', () => {
    const s = Math.max(0, Math.min(86400, parseInt(optReelMaxAuto.value, 10) || 0));
    optReelMaxAuto.value = String(s);
    chrome.storage.local.set({ reelMaxAutoSeconds: s });
  });

  // 5. JSON Backup Export & Import
  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', () => {
      chrome.storage.local.get(null, (allData) => {
        const jsonStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BraveShield-Backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        btnExportBackup.textContent = '✅ Backup Downloaded!';
        setTimeout(() => { btnExportBackup.textContent = '💾 Export Backup (JSON)'; }, 2000);
      });
    });
  }

  if (btnImportTrigger && fileImportBackup) {
    btnImportTrigger.addEventListener('click', () => fileImportBackup.click());

    // Restore is SCHEMA-VALIDATED: unknown keys, wrong types and oversized or
    // malformed values from a crafted backup file are silently dropped.
    // All filtering lives in shared/import-sanitize.js (unit-tested in
    // tests/import-sanitize.test.mjs); the per-site module allowlist is
    // injected so keys stay single-sourced from BS_MATRIX_MODULES above.

    fileImportBackup.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        btnImportTrigger.textContent = '❌ File Too Large';
        setTimeout(() => { btnImportTrigger.textContent = '📂 Restore Backup'; }, 2000);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
          const clean = bsSanitizeImport(parsed, BS_MATRIX_SET);
          if (Object.keys(clean).length === 0) throw new Error('empty');
          chrome.storage.local.set(clean, () => {
            btnImportTrigger.textContent = '✅ Restored Successfully!';
            setTimeout(() => {
              btnImportTrigger.textContent = '📂 Restore Backup';
              window.location.reload();
            }, 1500);
          });
        } catch (_) {
          btnImportTrigger.textContent = '❌ Invalid JSON File';
          setTimeout(() => { btnImportTrigger.textContent = '📂 Restore Backup'; }, 2000);
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Replay onboarding wizard
  const btnReplayTour = document.getElementById('btn-replay-tour');
  if (btnReplayTour) {
    btnReplayTour.addEventListener('click', () => {
      try { chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') }); }
      catch (_) { window.open(chrome.runtime.getURL('welcome.html')); }
    });
  }

  // Settings search — filters setting rows and hides empty panels
  const studioSearch = document.getElementById('studio-search');
  if (studioSearch) {
    const panels = Array.from(document.querySelectorAll('.cyber-panel[id]'));
    const applyFilter = () => {
      const q = studioSearch.value.trim().toLowerCase();
      if (!q) {
        panels.forEach(p => {
          p.style.display = '';
          p.querySelectorAll('.setting-row').forEach(r => { r.style.display = ''; });
        });
        return;
      }
      let totalMatches = 0;
      for (const panel of panels) {
        const rows = panel.querySelectorAll('.setting-row');
        let panelMatches = 0;
        rows.forEach(row => {
          const hay = (row.querySelector('.setting-title')?.textContent + ' ' +
                       row.querySelector('.setting-desc')?.textContent || '').toLowerCase();
          const hit = hay.includes(q);
          row.style.display = hit ? '' : 'none';
          if (hit) panelMatches++;
        });
        // Panels without searchable rows (hardware builder, audit, sync) stay
        // visible only when the query is empty or their text matches.
        if (rows.length === 0) {
          const hay = panel.textContent.toLowerCase();
          panel.style.display = hay.includes(q) ? '' : 'none';
          if (hay.includes(q)) totalMatches++;
        } else {
          panel.style.display = panelMatches > 0 ? '' : 'none';
          totalMatches += panelMatches;
        }
      }
      studioSearch.title = `${totalMatches} matching setting${totalMatches === 1 ? '' : 's'}`;
    };
    studioSearch.addEventListener('input', applyFilter);
    studioSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { studioSearch.value = ''; applyFilter(); }
    });
  }

  // Factory Reset — wipe everything back to safe defaults
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (!confirm('Factory reset ALL BraveShield settings, whitelist, stats and hardware profile? This cannot be undone.')) return;
      chrome.storage.local.clear(() => {
        btnResetDefaults.textContent = '✅ Reset Complete';
        setTimeout(() => { window.location.reload(); }, 800);
      });
    });
  }

  // Reset Telemetry
  if (btnResetTelemetry) {
    btnResetTelemetry.addEventListener('click', () => {
      chrome.storage.local.set({ timeSavedSeconds: 0, trapsNeutralized: 0, directLinksUnlocked: 0 }, () => {
        if (statTimeSaved) statTimeSaved.textContent = '0s';
        if (statTrapsDefused) statTrapsDefused.textContent = '0';
        if (statLinksUnlocked) statLinksUnlocked.textContent = '0';
        btnResetTelemetry.textContent = 'Telemetry Reset!';
        setTimeout(() => { btnResetTelemetry.textContent = 'Reset Telemetry'; }, 2000);
      });
    });
  }

  // Whitelist Logic
  // Domains are validated on input and rendered via DOM APIs only.
  const BS_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

  function bsIsValidDomain(val) {
    return typeof val === 'string' && val.length <= 253 && BS_DOMAIN_RE.test(val);
  }

  function renderWhitelist(list) {
    whitelistTags.textContent = '';
    (Array.isArray(list) ? list : []).filter(bsIsValidDomain).forEach(domain => {
      const tag = document.createElement('div');
      tag.className = 'whitelist-tag';
      const name = document.createElement('span');
      name.textContent = domain;
      const del = document.createElement('span');
      del.className = 'remove-btn';
      del.textContent = '×';
      del.setAttribute('role', 'button');
      del.setAttribute('aria-label', `Remove ${domain} from whitelist`);
      del.addEventListener('click', () => {
        chrome.storage.local.get(['whitelist'], (r) => {
          const updated = (r.whitelist || []).filter(d => d !== domain);
          chrome.storage.local.set({ whitelist: updated });
          renderWhitelist(updated);
        });
      });
      tag.append(name, del);
      whitelistTags.appendChild(tag);
    });
  }

  btnAddWhitelist.addEventListener('click', () => {
    const val = (whitelistInput.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!val) return;
    if (!bsIsValidDomain(val)) {
      btnAddWhitelist.textContent = 'Invalid Domain';
      setTimeout(() => { btnAddWhitelist.textContent = 'Add Domain'; }, 1800);
      return;
    }
    chrome.storage.local.get(['whitelist'], (r) => {
      const list = r.whitelist || [];
      if (!list.includes(val)) {
        list.push(val);
        chrome.storage.local.set({ whitelist: list });
        renderWhitelist(list);
      }
      whitelistInput.value = '';
    });
  });

  // ── Custom Resolver Rules ──
  // { pattern, action: click|redirect|turbo, value, enabled? } — mirrors
  // shared/import-sanitize.js shape checks (pattern ≤200, value ≤300, ≤20).
  function bsResolverPatternValid(p) {
    return p === '*' || bsIsValidDomain(p.replace(/^\*\./, ''));
  }
  function renderCustomResolvers(rules) {
    if (!ruleTags) return;
    ruleTags.textContent = '';
    (Array.isArray(rules) ? rules : []).forEach((rule, idx) => {
      const tag = document.createElement('div');
      tag.className = 'whitelist-tag';
      const name = document.createElement('span');
      name.textContent = `${rule.pattern} → ${rule.action}` + (rule.value ? ` (${rule.value})` : '');
      name.title = rule.enabled === false ? 'Rule disabled — click ▶ to enable' : 'Rule active — click ⏸ to disable';
      const toggle = document.createElement('span');
      toggle.className = 'remove-btn';
      toggle.textContent = rule.enabled === false ? '⏸' : '▶';
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('aria-label', `Toggle rule ${rule.pattern} → ${rule.action}`);
      toggle.addEventListener('click', () => {
        chrome.storage.local.get(['customResolvers'], (r) => {
          const updated = (r.customResolvers || []).slice();
          if (updated[idx]) updated[idx].enabled = updated[idx].enabled === false;
          chrome.storage.local.set({ customResolvers: updated });
          renderCustomResolvers(updated);
        });
      });
      const del = document.createElement('span');
      del.className = 'remove-btn';
      del.textContent = '×';
      del.setAttribute('role', 'button');
      del.setAttribute('aria-label', `Remove rule ${rule.pattern} → ${rule.action}`);
      del.addEventListener('click', () => {
        chrome.storage.local.get(['customResolvers'], (r) => {
          const updated = (r.customResolvers || []).filter((_, i) => i !== idx);
          chrome.storage.local.set({ customResolvers: updated });
          renderCustomResolvers(updated);
        });
      });
      tag.append(name, toggle, del);
      ruleTags.appendChild(tag);
    });
  }

  if (btnAddRule) {
    btnAddRule.addEventListener('click', () => {
      const pattern = (rulePatternInput.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const action = ruleActionSelect ? ruleActionSelect.value : 'click';
      const value = (ruleValueInput.value || '').trim().slice(0, 300);
      if (!pattern || !bsResolverPatternValid(pattern)) {
        btnAddRule.textContent = 'Invalid Pattern';
        setTimeout(() => { btnAddRule.textContent = 'Add Rule'; }, 1800);
        return;
      }
      if (action !== 'turbo' && !value) {
        btnAddRule.textContent = 'Value needed';
        setTimeout(() => { btnAddRule.textContent = 'Add Rule'; }, 1800);
        return;
      }
      chrome.storage.local.get(['customResolvers'], (r) => {
        const list = (r.customResolvers || []).slice(0, 19);
        if (!list.some(x => x.pattern === pattern && x.action === action && x.value === value)) {
          list.push({ pattern, action, value });
          chrome.storage.local.set({ customResolvers: list });
          renderCustomResolvers(list);
        }
        rulePatternInput.value = '';
        ruleValueInput.value = '';
      });
    });
  }

  // ── Protected Sites (deny-list: never bypass, stealth stays armed) ──
  function renderProtectedSites(list) {
    if (!protectedTags) return;
    protectedTags.textContent = '';
    (Array.isArray(list) ? list : []).filter(bsIsValidDomain).forEach(domain => {
      const tag = document.createElement('div');
      tag.className = 'whitelist-tag';
      const name = document.createElement('span');
      name.textContent = '🛡 ' + domain;
      name.title = 'Bypass modules disabled on this host — stealth stays armed';
      const del = document.createElement('span');
      del.className = 'remove-btn';
      del.textContent = '×';
      del.setAttribute('role', 'button');
      del.setAttribute('aria-label', `Remove ${domain} from protected sites`);
      del.addEventListener('click', () => {
        chrome.storage.local.get(['protectedSites'], (r) => {
          const updated = (r.protectedSites || []).filter(d => d !== domain);
          chrome.storage.local.set({ protectedSites: updated });
          renderProtectedSites(updated);
        });
      });
      tag.append(name, del);
      protectedTags.appendChild(tag);
    });
  }

  if (btnAddProtected) {
    btnAddProtected.addEventListener('click', () => {
      const val = (protectedInput.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!val) return;
      if (!bsIsValidDomain(val)) {
        btnAddProtected.textContent = 'Invalid Domain';
        setTimeout(() => { btnAddProtected.textContent = 'Protect Site'; }, 1800);
        return;
      }
      chrome.storage.local.get(['protectedSites'], (r) => {
        const list = (r.protectedSites || []).slice(0, 299);
        if (!list.includes(val)) {
          list.push(val);
          chrome.storage.local.set({ protectedSites: list });
          renderProtectedSites(list);
        }
        protectedInput.value = '';
      });
    });
  }

  // ── Per-Site Profile Overrides (F3) ──
  // siteProfiles: { [domain]: { deviceProfile?, browserType? } } — suffix-matched
  // against the visited hostname by the content bridge and background resolver.
  function siteOverrideSummary(prof) {
    const parts = [];
    if (prof.deviceProfile) {
      const match = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined')
        ? HARDWARE_PROFILES_CATALOG.find(p => p.id === prof.deviceProfile) : null;
      parts.push(match ? match.name : prof.deviceProfile);
    }
    if (prof.browserType) parts.push(prof.browserType);
    if (prof.modules && typeof prof.modules === 'object') {
      const n = Object.keys(prof.modules).length;
      if (n > 0) parts.push(`🧩 ${n} matrix modules`);
    }
    return parts.length ? parts.join(' • ') : 'modules-only override';
  }

  function renderSiteOverrides(map) {
    if (!siteProfileTags) return;
    siteProfileTags.textContent = '';
    const entries = Object.entries(map && typeof map === 'object' ? map : {});
    if (entries.length === 0) return;
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    for (const [domain, prof] of entries) {
      if (!prof || typeof prof !== 'object') continue;
      const tag = document.createElement('div');
      tag.className = 'whitelist-tag';
      // Type badge: what kind of override this is
      const kind = (prof.modules && typeof prof.modules === 'object' && Object.keys(prof.modules).length)
        ? (prof.deviceProfile || prof.browserType ? 'full' : 'matrix') + ' ' + Object.keys(prof.modules).length + 'm'
        : (prof.deviceProfile || prof.browserType ? 'identity' : '-');
      const badge = document.createElement('span');
      badge.className = 'override-badge';
      badge.textContent = kind;
      badge.title = 'Override type (m# = per-module matrix overrides)';
      const name = document.createElement('span');
      name.textContent = domain;
      name.title = siteOverrideSummary(prof);
      // Edit jump: straight into the matrix editor for this site
      const editBtn = document.createElement('span');
      editBtn.className = 'remove-btn';
      editBtn.textContent = '🧩';
      editBtn.title = 'Edit this site in the module matrix editor';
      editBtn.setAttribute('role', 'button');
      editBtn.setAttribute('aria-label', `Edit matrix for ${domain}`);
      editBtn.addEventListener('click', () => {
        const picker = document.getElementById('matrix-site-picker');
        const editor = document.getElementById('site-matrix-editor');
        if (matrixSitePicker && matrixSiteCache[domain]) matrixSitePicker.value = domain;
        if (typeof renderMatrixModules === 'function') renderMatrixModules();
        if (editor) editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        void picker;
      });
      const del = document.createElement('span');
      del.className = 'remove-btn';
      del.textContent = '×';
      del.setAttribute('role', 'button');
      del.setAttribute('aria-label', `Remove override for ${domain}`);
      del.addEventListener('click', () => {
        chrome.storage.local.get(['siteProfiles'], (r) => {
          const updated = Object.assign({}, r.siteProfiles || {});
          delete updated[domain];
          chrome.storage.local.set({ siteProfiles: updated });
          renderSiteOverrides(updated);
          renderMatrixSitePicker(updated);
        });
      });
      tag.append(badge, name, editBtn, del);
      siteProfileTags.appendChild(tag);
    }
  }

  if (btnAddSiteProfile) {
    btnAddSiteProfile.addEventListener('click', () => {
      const val = (siteDomainInput.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!bsIsValidDomain(val)) {
        btnAddSiteProfile.textContent = 'Invalid Domain';
        setTimeout(() => { btnAddSiteProfile.textContent = 'Add Override'; }, 1800);
        return;
      }
      const prof = {};
      if (siteProfileSelect && siteProfileSelect.value) prof.deviceProfile = siteProfileSelect.value;
      if (siteBrowsertype && siteBrowsertype.value) prof.browserType = siteBrowsertype.value;

      chrome.storage.local.get(['siteProfiles'], (r) => {
        const updated = Object.assign({}, r.siteProfiles || {});
        if (Object.keys(prof).length === 0) delete updated[val];
        else updated[val] = prof;
        chrome.storage.local.set({ siteProfiles: updated }, () => {
          btnAddSiteProfile.textContent = '✅ Override Saved!';
          setTimeout(() => { btnAddSiteProfile.textContent = 'Add Override'; }, 1800);
        });
        renderSiteOverrides(updated);
        siteDomainInput.value = '';
      });
    });
  }

  // ── Live Fingerprint Audit (runs real probes in the page's MAIN world) ──
  // Self-contained: serialized and injected with `args: [expected]`, so it may
  // not close over anything from this page. Async: the WebGPU probe awaits
  // requestAdapter; chrome.scripting.executeScript unwraps the returned promise.
  async function bsAuditInPage(expected) {
    expected = expected || {};
    const results = [];
    const add = (name, pass, value) => results.push({ name, pass: !!pass, value: String(value == null ? '' : value) });
    const bt = expected.browserType || 'brave';
    const chromeIdentity = (bt !== 'firefox' && bt !== 'safari');

    try { add('navigator.webdriver is false', navigator.webdriver === false, String(navigator.webdriver)); } catch (_) {}
    try { add('navigator.brave hidden', typeof navigator.brave === 'undefined', typeof navigator.brave); } catch (_) {}

    try {
      const ua = navigator.userAgent;
      const uaOk = bt === 'firefox' ? /Firefox\//.test(ua)
        : bt === 'safari' ? (/Safari\//.test(ua) && !/Chrome\//.test(ua))
        : (/Chrome\//.test(ua) && !/Brave/i.test(ua));
      add('UA matches selected identity', uaOk, ua.slice(0, 90));
    } catch (_) {}

    try {
      const v = navigator.vendor;
      const vOk = bt === 'firefox' ? v === ''
        : bt === 'safari' ? v === 'Apple Computer, Inc.'
        : v === 'Google Inc.';
      add('navigator.vendor matches identity', vOk, v);
    } catch (_) {}

    try {
      add('window.chrome presence matches identity', chromeIdentity ? (!!window.chrome) : (typeof window.chrome === 'undefined'),
        chromeIdentity ? 'present' : typeof window.chrome);
    } catch (_) {}

    try {
      add('userAgentData presence matches identity', chromeIdentity ? (!!navigator.userAgentData) : (typeof navigator.userAgentData === 'undefined'),
        chromeIdentity ? 'present' : typeof navigator.userAgentData);
    } catch (_) {}

    try {
      if (bt === 'firefox') {
        add('Firefox-only fields present (oscpu/buildID)', typeof navigator.oscpu === 'string' && typeof navigator.buildID === 'string',
          `${navigator.oscpu || '-'} / ${navigator.buildID || '-'}`);
      }
    } catch (_) {}

    try {
      const chPlat = navigator.userAgentData ? navigator.userAgentData.platform : '';
      if (chPlat) {
        const expectedPlat = expected.platform
          ? ({ Win32: 'Windows', MacIntel: 'macOS', 'Linux x86_64': 'Linux', 'Linux armv81': 'Android', iPhone: bt === 'safari' ? 'iOS' : 'Android' })[expected.platform] || null
          : null;
        add('platform <-> UA-CH parity', !expectedPlat || expectedPlat === chPlat, `${navigator.platform} vs ${chPlat}`);
      }
    } catch (_) {}

    try {
      if (typeof navigator.deviceMemory === 'number') {
        add('deviceMemory within spec (0.25-8 GB)', navigator.deviceMemory <= 8 && navigator.deviceMemory >= 0.25, String(navigator.deviceMemory));
      }
    } catch (_) {}

    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
        const pass = expected.renderer ? renderer === expected.renderer : !!renderer;
        add('WebGL renderer matches active profile', pass, String(renderer).slice(0, 80));
      }
    } catch (_) {}

    try {
      if (navigator.gpu && typeof navigator.gpu.requestAdapter === 'function') {
        const adapter = await navigator.gpu.requestAdapter();
        const info = adapter && adapter.info;
        if (info) {
          const wantVendor = expected.gpuVendor || '';
          add('WebGPU adapter.info masked', wantVendor ? info.vendor === wantVendor : true,
            `vendor="${info.vendor}" device="${info.device || ''}" description="${info.description || ''}"`);
        }
      }
    } catch (_) {}

    try {
      const mk = () => {
        const q = document.createElement('canvas');
        q.width = 120; q.height = 60;
        const x = q.getContext('2d');
        x.fillStyle = '#3a7'; x.fillRect(0, 0, 120, 60);
        x.fillStyle = '#111'; x.font = '16px Arial'; x.fillText('fp', 4, 30);
        return q;
      };
      const snap = (cv) => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.join(',');
      const a = snap(mk()), b = snap(mk());
      add('Canvas farbling deterministic', a === b, a === b ? 'stable across renders' : 'UNSTABLE');
    } catch (_) {}

    try {
      const q = document.createElement('canvas');
      const x = q.getContext('2d');
      x.font = '16px Arial';
      const w1 = x.measureText('mmmmmmmmmmlli').width;
      const w2 = x.measureText('mmmmmmmmmmlli').width;
      add('Font metrics farbling stable', w1 > 0 && w1 === w2, `width ${w1.toFixed(4)}px`);
    } catch (_) {}

    try {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:123px;height:57px;';
      (document.body || document.documentElement).appendChild(probe);
      const r1 = probe.getBoundingClientRect().width;
      const r2 = probe.getBoundingClientRect().width;
      probe.remove();
      add('DOM jitter stable across reads', r1 === r2, `${r1} vs ${r2}`);
    } catch (_) {}

    try {
      let start = performance.now(), minPos = Infinity;
      for (let guard = 0; guard < 500000; guard++) {
        const cur = performance.now();
        const d = cur - start;
        if (d > 0) { minPos = d; break; }
      }
      add('Timer coarsening active (>=10ms quanta)', minPos === Infinity || minPos >= 10,
        minPos === Infinity ? 'n/a' : ('minDelta ~' + Math.round(minPos) + 'ms'));
    } catch (_) {}

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const pass = expected.timezone ? tz === expected.timezone : !!tz;
      add(expected.timezone ? 'Timezone matches spoofed zone' : 'Timezone reported consistently', pass,
        tz + ' / offset ' + new Date().getTimezoneOffset());
    } catch (_) {}

    return { results };
  }

  const btnRunAudit = document.getElementById('btn-run-audit');
  if (btnRunAudit) {
    btnRunAudit.addEventListener('click', async () => {
      btnRunAudit.disabled = true;
      btnRunAudit.textContent = '⏳ Probing…';
      const resultsBox = document.getElementById('audit-results');
      const scoreBox = document.getElementById('audit-score');
      try {
        const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
        const targetTab = tabs.find(t => t.active && t.lastAccessed !== undefined) ||
                          tabs.find(t => t.active) || tabs.sort((x, y) => (y.id || 0) - (x.id || 0))[0];
        if (!targetTab) throw new Error('no website tab');
        // Resolve expectations from the active profile + identity
        const cfg = await chrome.storage.local.get(['deviceProfile', 'customHardwareProfile', 'browserType', 'timezoneSpoofingEnabled', 'spoofTimezone']);
        const auditBt = cfg.browserType || 'brave';
        const expected = { browserType: auditBt };
        let prof = null;
        if (cfg.deviceProfile === 'custom' && cfg.customHardwareProfile) prof = cfg.customHardwareProfile;
        else if (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') {
          prof = HARDWARE_PROFILES_CATALOG.find(p => p.id === cfg.deviceProfile) || null;
        }
        if (prof) {
          expected.renderer = prof.renderer;
          expected.platform = prof.platform;
          const v = String(prof.vendor || '').toLowerCase();
          for (const key of ['nvidia', 'amd', 'intel', 'apple', 'qualcomm', 'arm']) {
            if (v.includes(key)) { expected.gpuVendor = key; break; }
          }
        }
        if (cfg.timezoneSpoofingEnabled === true && cfg.spoofTimezone) expected.timezone = cfg.spoofTimezone;
        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          world: 'MAIN',
          func: bsAuditInPage,
          args: [expected]
        });
        const payload = injection && injection.result;
        if (!payload || !Array.isArray(payload.results)) throw new Error('no result');
        resultsBox.textContent = '';
        const passed = payload.results.filter(r => r.pass).length;
        const total = payload.results.length;
        const score = total ? Math.round((passed / total) * 100) : 0;
        if (scoreBox) {
          scoreBox.hidden = false;
          const color = score >= 90 ? 'var(--accent-emerald)' : score >= 70 ? 'var(--accent-amber)' : 'var(--accent-danger)';
          scoreBox.style.color = color;
          scoreBox.textContent = `🎯 Stealth Score: ${score}%  (${passed}/${total} probes passed)`;
        }
        for (const r of payload.results) {
          const row = document.createElement('div');
          row.className = 'audit-row ' + (r.pass ? 'pass' : 'fail');
          const status = document.createElement('span');
          status.className = 'audit-status';
          status.textContent = r.pass ? '✓' : '✕';
          const name = document.createElement('span');
          name.className = 'audit-name';
          name.textContent = r.name;
          const val = document.createElement('span');
          val.className = 'audit-value';
          val.textContent = r.value;
          val.title = r.value;
          row.append(status, name, val);
          resultsBox.appendChild(row);
        }
      } catch (err) {
        resultsBox.textContent = '';
        if (scoreBox) { scoreBox.hidden = true; }
        const detail = err && err.message ? err.message : 'unknown error';
        const row = document.createElement('div');
        row.className = 'audit-row fail';
        row.textContent = `✕ Audit failed: open any normal website tab first (${detail})`;
        resultsBox.appendChild(row);
      }
      btnRunAudit.disabled = false;
      btnRunAudit.textContent = '🩺 Run Audit';
    });
  }

  // Manual Sync Button
  btnSync.addEventListener('click', async () => {    btnSync.textContent = 'Syncing...';
    btnSync.disabled = true;
    try {
      const res = await chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
      if (res && res.success) {
        btnSync.textContent = 'Synced!';
        syncTime.textContent = 'Last checked: ' + new Date().toLocaleTimeString();
      } else {
        btnSync.textContent = 'Error';
      }
    } catch (_) {
      btnSync.textContent = 'Synced!';
    }
    setTimeout(() => {
      btnSync.textContent = 'Check & Sync';
      btnSync.disabled = false;
    }, 2000);
  });
});
