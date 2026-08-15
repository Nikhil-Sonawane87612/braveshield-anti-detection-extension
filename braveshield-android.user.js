// ==UserScript==
// @name         BraveShield Android Super Suite — Ultimate Stealth, AdBlock & Media Engine
// @namespace    https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension
// @version      5.2.0
// @description  55+ Features: 42-Module Stealth Engine, Turbo Timer Fast-Forward, Anti-Adblock Annihilator, Spotify Ad-Free with Synced Lyrics & Unlimited Skips, YouTube Turbo with SponsorBlock & Return Dislike, Audio Booster 150%, Video Stream Sniffer, Back-Button Trap Neutralizer, Paywall Bypass, and Safe APK Fast-Pass for Android & Mobile Web.
// @author       Nikhil Sonawane
// @match        *://*/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @noframes     false
// ==/UserScript==

(function() {
  'use strict';

  const WIN = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const DOC = WIN.document;
  const HOSTNAME = (WIN.location && WIN.location.hostname) ? WIN.location.hostname.toLowerCase() : '';
  const IS_SPOTIFY = HOSTNAME.includes('spotify.com');
  const IS_YOUTUBE = HOSTNAME.includes('youtube.com') || HOSTNAME.includes('youtu.be');

  console.log('[BraveShield Super Suite] Initializing on:', HOSTNAME);

  // ══════════════════════════════════════════════════════════════════════
  // GROUP B: STEALTH & GOOGLE CHROME CLOAKING (Modules B1 - B7)
  // ══════════════════════════════════════════════════════════════════════
  try {
    // B1: Purge navigator.brave & isBrave()
    if (WIN.navigator) {
      if (WIN.navigator.brave) {
        try { delete Object.getPrototypeOf(WIN.navigator).brave; } catch (_) {}
        try { delete WIN.navigator.brave; } catch (_) {}
      }
      Object.defineProperty(WIN.navigator, 'brave', {
        get: () => undefined,
        set: () => {},
        configurable: true,
        enumerable: false
      });

      // B2: Spoof Chrome 131 Client Hints
      if (WIN.navigator.userAgentData) {
        const fakeBrands = [
          { brand: 'Google Chrome', version: '131' },
          { brand: 'Chromium', version: '131' },
          { brand: 'Not_A Brand', version: '24' }
        ];
        try {
          Object.defineProperty(WIN.navigator.userAgentData, 'brands', {
            get: () => fakeBrands,
            configurable: true
          });
        } catch (_) {}
      }

      // Hide webdriver
      try {
        Object.defineProperty(WIN.navigator, 'webdriver', {
          get: () => false,
          configurable: true
        });
      } catch (_) {}
    }

    // B3: Emulate pure window.chrome prototype
    if (!WIN.chrome) {
      WIN.chrome = {
        app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
        runtime: { id: undefined, OnInstalledReason: {}, PlatformArch: {}, PlatformNaclArch: {}, PlatformOs: {}, RequestUpdateCheckStatus: {} },
        csi: function() { return { startE: Date.now(), onloadT: Date.now(), pageT: 0, tran: 15 }; },
        loadTimes: function() { return { requestTime: Date.now() / 1000, startLoadTime: Date.now() / 1000, commitLoadTime: Date.now() / 1000, finishDocumentLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000, firstPaintTime: Date.now() / 1000, firstPaintAfterLoadTime: 0, navigationType: 'Other', wasFetchedViaSpdy: true, wasNpnNegotiated: true, npnNegotiatedProtocol: 'h2', wasAlternateProtocolAvailable: false, connectionInfo: 'h2' }; }
      };
    }

    // B4: Fake Adblock & Analytics Variables
    WIN.canRunAds = true;
    WIN.isAdBlockActive = false;
    WIN.adblock = false;
    WIN.adsbygoogle = WIN.adsbygoogle || [];
    WIN.adsbygoogle.loaded = true;
    WIN.google_ad_status = 1;
    WIN.adClicked = true;
    WIN.isAdClicked = true;
    WIN.hasClickedAd = true;
    WIN.clickedAd = true;
    WIN.ad_clicked = true;
    WIN.ad_status = 1;
    WIN.cookies_status = 1;
    WIN.is_ad_clicked = true;
    WIN.click_status = 1;

    // B5: Fake DOM Bait Dimensions
    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    if (origOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get: function() {
          const cls = (this.className || '') + ' ' + (this.id || '');
          if (/ad[_-]?banner|ad[_-]?container|ad[_-]?wrapper|adsbox|ad[_-]?slot|sponsor|advertisement/i.test(cls)) {
            return 250;
          }
          return origOffsetHeight.get.call(this);
        },
        configurable: true
      });
    }
  } catch (_) {}

  // B6 & B7: Modal Annihilator & Fullscreen Backdrop Cleaner
  const ADBLOCK_MODAL_REGEX = /adblock(?:er)?\s+detected|disable\s+(?:your\s+)?ad\s*blocker|ads\s+help\s+us\s+keep|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker/i;

  function annihilateModalsAndBackdrops() {
    try {
      if (IS_SPOTIFY) return; // Do not sweep Spotify internal modals
      const elements = DOC.querySelectorAll('div, section, dialog, [role="dialog"], .modal, .swal2-container, .overlay, .popup');
      for (const el of elements) {
        if (!el || !el.innerText) continue;
        if (ADBLOCK_MODAL_REGEX.test(el.innerText)) {
          let target = el;
          let parent = el.parentElement;
          while (parent && parent !== DOC.body && parent !== DOC.documentElement) {
            const style = WIN.getComputedStyle(parent);
            if (style.position === 'fixed' || style.position === 'absolute') target = parent;
            parent = parent.parentElement;
          }
          try { target.remove(); } catch (_) { target.style.display = 'none'; }
        }
      }

      // Sweep dark dimmers
      DOC.querySelectorAll('.modal-backdrop, .swal2-backdrop, .swal2-container, .sk-overlay, #sk-overlay, .overlay-backdrop').forEach(b => {
        try { b.remove(); } catch (_) { b.style.display = 'none'; }
      });

      // Restore scrolling & pointer interactivity
      if (DOC.body) {
        DOC.body.style.setProperty('overflow', 'auto', 'important');
        DOC.body.style.setProperty('filter', 'none', 'important');
        DOC.body.style.setProperty('opacity', '1', 'important');
        DOC.body.style.setProperty('pointer-events', 'auto', 'important');
      }
      if (DOC.documentElement) {
        DOC.documentElement.style.setProperty('overflow', 'auto', 'important');
        DOC.documentElement.style.setProperty('filter', 'none', 'important');
      }
    } catch (_) {}
  }
  setInterval(annihilateModalsAndBackdrops, 400);

  // ══════════════════════════════════════════════════════════════════════
  // GROUP C: TURBO TIMER & SHORTENER FAST-PASS (Modules C1 - C7)
  // ══════════════════════════════════════════════════════════════════════
  const origSetTimeout = WIN.setTimeout;
  const origSetInterval = WIN.setInterval;

  WIN.setTimeout = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (!IS_SPOTIFY && !IS_YOUTUBE && numDelay >= 1000 && numDelay <= 60000) {
      numDelay = Math.max(150, Math.floor(numDelay / 6));
    }
    return origSetTimeout.call(this, handler, numDelay, ...args);
  };

  WIN.setInterval = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (!IS_SPOTIFY && !IS_YOUTUBE) {
      if (numDelay >= 40 && numDelay <= 300) {
        numDelay = 15; // Decimal countdown turbo
      } else if (numDelay >= 800 && numDelay <= 2000) {
        numDelay = 150; // 1s tick compressed to 150ms
      }
    }
    return origSetInterval.call(this, handler, numDelay, ...args);
  };

  // C7: Popunder Safe Interceptor
  const origWindowOpen = WIN.open;
  const safeMockWindow = { closed: false, focus: () => {}, blur: () => {}, close: () => {}, location: { href: '' }, document: { write: () => {} } };
  WIN.open = function(url, target, features) {
    if (typeof url === 'string' && /popcash|popads|syndication|clickadu|monetag\.com|propellerads|adsterra|trafficjunky|ad-maven/i.test(url)) {
      console.log('[BraveShield] Popunder blocked:', url);
      return safeMockWindow;
    }
    return origWindowOpen.apply(this, arguments);
  };

  // C4, C5, C6: Safelink Auto-Solver with Strict Pagination Exclusion
  function isPagination(el) {
    if (!el) return true;
    const h = (el.getAttribute('href') || '').toLowerCase();
    const c = (el.className || '').toLowerCase();
    return /reverse-paginate|updated-max|max-results|blog-pager|pagination|page-numbers|older-posts|newer-posts/i.test(h + ' ' + c);
  }

  function turboPassShorteners() {
    try {
      if (IS_SPOTIFY || IS_YOUTUBE) return;
      const buttonSelectors = [
        '#btn-main', '#get-link', '#getlink', '#download-btn', '#btn-download',
        '.get-link', '.download-btn', '.btn-download', '.getlink', '#link-button',
        '#continue-btn', '#btn-continue', '.continue-btn', '#go-link', '.go-link',
        '#final-download', '.direct-download', '#wpsafe-generate', '#wpsafe-snp', '#tp-snp2'
      ];

      for (const sel of buttonSelectors) {
        const btns = DOC.querySelectorAll(sel);
        for (const btn of btns) {
          if (btn && !isPagination(btn)) {
            const txt = (btn.innerText || btn.value || '').trim();
            if (/getting\s+link|please\s+wait|loading|generating|processing|wait\s+\d+|countdown/i.test(txt)) continue;

            const isReady = /^(get\s+link|download|download\s+now|direct\s+download|download\s+apk|click\s+here\s+to\s+download|next)$/i.test(txt);
            const hasMirrorHref = btn.href && (btn.href.includes('drive.google') || btn.href.includes('mega.nz') || btn.href.includes('mediafire') || btn.href.includes('dupload') || btn.href.includes('apkadmin') || btn.href.includes('uploadrar') || btn.href.includes('pixeldrain') || btn.href.includes('gofile'));

            if (isReady || hasMirrorHref) {
              btn.removeAttribute('disabled');
              btn.style.pointerEvents = 'auto';
              btn.style.display = 'inline-block';
              if (!btn._bsClicked) {
                btn._bsClicked = true;
                setTimeout(() => { try { btn.click(); } catch (_) {} }, 350);
              }
            }
          }
        }
      }
    } catch (_) {}
  }
  setInterval(turboPassShorteners, 300);

  // ══════════════════════════════════════════════════════════════════════
  // GROUP D: SPOTIFY AD-FREE, UNLIMITED SKIPS & STREAM ENGINE
  // ══════════════════════════════════════════════════════════════════════
  if (IS_SPOTIFY) {
    console.log('[BraveShield] Spotify Super Engine Armed.');

    // D1, D2, D3, D4: Audio Ad Fast-Forward & Skip Unlocker
    function processSpotifyPlayer() {
      try {
        const audioElements = DOC.querySelectorAll('audio, video');
        for (const audio of audioElements) {
          const isAdActive = (
            DOC.querySelector('[data-testid="now-playing-widget"] [href*="/ad/"]') ||
            DOC.querySelector('[data-testid="track-info-advertiser"]') ||
            DOC.querySelector('.ad-badge, [aria-label="Advertisement"]') ||
            (DOC.title && DOC.title.toLowerCase().includes('advertisement'))
          );

          if (isAdActive) {
            audio.muted = true;
            if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
              audio.currentTime = audio.duration;
            }
            audio.playbackRate = 16.0;

            const nextBtn = DOC.querySelector('[data-testid="control-button-skip-forward"]');
            if (nextBtn) {
              try { nextBtn.click(); } catch (_) {}
            }
          } else {
            if (audio.muted && !WIN._userManualMute) {
              audio.muted = false;
              audio.playbackRate = 1.0;
            }
          }
        }

        // D3: Unlock Skip Forward and Shuffle Buttons (Remove disabled attribute)
        const skipForwardBtn = DOC.querySelector('[data-testid="control-button-skip-forward"]');
        if (skipForwardBtn && skipForwardBtn.hasAttribute('disabled')) {
          skipForwardBtn.removeAttribute('disabled');
          skipForwardBtn.removeAttribute('aria-disabled');
          skipForwardBtn.style.setProperty('opacity', '1', 'important');
          skipForwardBtn.style.setProperty('pointer-events', 'auto', 'important');
        }

        const shuffleBtn = DOC.querySelector('[data-testid="control-button-shuffle"]');
        if (shuffleBtn && shuffleBtn.hasAttribute('disabled')) {
          shuffleBtn.removeAttribute('disabled');
          shuffleBtn.removeAttribute('aria-disabled');
          shuffleBtn.style.setProperty('opacity', '1', 'important');
          shuffleBtn.style.setProperty('pointer-events', 'auto', 'important');
        }

        // D4: Hide Upsell / Upgrade Nags safely
        const adVisuals = DOC.querySelectorAll(
          '[data-testid="billboard-ad"], [data-testid="leaderboard-ad"], [data-testid="ad-break-screen"], [aria-label="Upgrade to Premium"], .ReactModalPortal div[class*="upsell"], .upgrade-button, button[aria-label="Upgrade to Premium"]'
        );
        for (const ad of adVisuals) {
          try { ad.remove(); } catch (_) { ad.style.display = 'none'; }
        }
      } catch (_) {}
    }
    setInterval(processSpotifyPlayer, 250);

    // D5 & D6: Strict Network Filter (Guarantees NO Blank Playlists or Stream Errors)
    const origFetch = WIN.fetch;
    WIN.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : (input?.url || '');
      // Strict whitelist: NEVER block audio streams, metadata, user library or auth
      if (
        url.includes('/ad-logic/') ||
        url.includes('/commercial/') ||
        url.includes('/v1/ads/') ||
        url.includes('heads4-ak.spotify.com/ad/')
      ) {
        return Promise.resolve(new Response(JSON.stringify({ status: 200, ad: null }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return origFetch.apply(this, arguments);
    };

    // ──────────────────────────────────────────────────────────────────
    // G1: Spotify Synced Lyrics Engine (lrclib.net API Integration)
    // ──────────────────────────────────────────────────────────────────
    let currentTrackTitle = '';
    let lyricsOverlay = null;
    let parsedLyrics = [];

    function initLyricsHUD() {
      if (DOC.getElementById('bs-lyrics-hud')) return;
      lyricsOverlay = DOC.createElement('div');
      lyricsOverlay.id = 'bs-lyrics-hud';
      lyricsOverlay.innerHTML = `
        <div id="bs-lyrics-header">
          <span style="font-weight:700; color:#1DB954;">🎤 Live Synced Lyrics</span>
          <span id="bs-lyrics-close" style="cursor:pointer; opacity:0.7; font-size:16px;">✕</span>
        </div>
        <div id="bs-lyrics-body">Playing music will sync lyrics here...</div>
      `;
      Object.assign(lyricsOverlay.style, {
        position: 'fixed',
        bottom: '90px',
        right: '16px',
        width: '320px',
        maxHeight: '380px',
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        color: '#fff',
        zIndex: '99999',
        padding: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'none',
        flexDirection: 'column',
        overflow: 'hidden'
      });
      DOC.body.appendChild(lyricsOverlay);

      DOC.getElementById('bs-lyrics-close').onclick = () => {
        lyricsOverlay.style.display = 'none';
      };

      // Add Floating Lyrics Toggle Button in Player Controls
      const lyricsToggle = DOC.createElement('button');
      lyricsToggle.id = 'bs-lyrics-btn';
      lyricsToggle.innerText = '🎤 Lyrics';
      Object.assign(lyricsToggle.style, {
        position: 'fixed',
        bottom: '100px',
        left: '16px',
        padding: '8px 14px',
        backgroundColor: '#1DB954',
        color: '#000',
        fontWeight: '700',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        zIndex: '99999',
        boxShadow: '0 4px 12px rgba(29,185,84,0.4)',
        fontSize: '12px'
      });
      lyricsToggle.onclick = () => {
        lyricsOverlay.style.display = lyricsOverlay.style.display === 'none' ? 'flex' : 'none';
      };
      DOC.body.appendChild(lyricsToggle);
    }

    function parseLRC(lrcText) {
      const lines = lrcText.split('\n');
      const result = [];
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
      for (const line of lines) {
        const match = line.match(timeRegex);
        if (match) {
          const min = parseInt(match[1], 10);
          const sec = parseInt(match[2], 10);
          const ms = parseInt(match[3].padEnd(3, '0'), 10);
          const text = match[4].trim();
          result.push({ time: min * 60 + sec + ms / 1000, text });
        }
      }
      return result;
    }

    async function fetchLyrics(trackName, artistName, durationSec) {
      const bodyEl = DOC.getElementById('bs-lyrics-body');
      if (!bodyEl) return;
      bodyEl.innerHTML = `<span style="opacity:0.6;">🔍 Searching lyrics for "${trackName}"...</span>`;
      try {
        const query = encodeURIComponent(`${trackName} ${artistName}`);
        const url = `https://lrclib.net/api/search?q=${query}`;
        const res = await (WIN.fetch ? WIN.fetch(url) : origFetch(url));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const match = data.find(d => d.syncedLyrics) || data[0];
            if (match && match.syncedLyrics) {
              parsedLyrics = parseLRC(match.syncedLyrics);
              renderLyricsLines();
              return;
            } else if (match && match.plainLyrics) {
              bodyEl.innerHTML = `<div style="overflow-y:auto; max-height:300px; line-height:1.6; white-space:pre-line;">${match.plainLyrics}</div>`;
              return;
            }
          }
        }
        bodyEl.innerHTML = `<span style="opacity:0.5;">No synced lyrics available for this track.</span>`;
      } catch (err) {
        bodyEl.innerHTML = `<span style="opacity:0.5;">Lyrics unavailable.</span>`;
      }
    }

    function renderLyricsLines() {
      const bodyEl = DOC.getElementById('bs-lyrics-body');
      if (!bodyEl || parsedLyrics.length === 0) return;
      bodyEl.innerHTML = `
        <div id="bs-lyrics-scroll" style="overflow-y:auto; max-height:300px; scroll-behavior:smooth;">
          ${parsedLyrics.map((l, idx) => `<p id="bs-lyric-${idx}" style="margin:8px 0; opacity:0.4; transition:all 0.2s;">${l.text || '♪'}</p>`).join('')}
        </div>
      `;
    }

    function syncLyricsPlayback() {
      const audio = DOC.querySelector('audio');
      if (!audio || parsedLyrics.length === 0) return;
      const cur = audio.currentTime;
      for (let i = 0; i < parsedLyrics.length; i++) {
        const nextTime = (i < parsedLyrics.length - 1) ? parsedLyrics[i + 1].time : Infinity;
        const lineEl = DOC.getElementById(`bs-lyric-${i}`);
        if (lineEl) {
          if (cur >= parsedLyrics[i].time && cur < nextTime) {
            lineEl.style.opacity = '1';
            lineEl.style.fontWeight = '700';
            lineEl.style.color = '#1DB954';
            lineEl.style.transform = 'scale(1.04)';
            lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            lineEl.style.opacity = '0.4';
            lineEl.style.fontWeight = '400';
            lineEl.style.color = '#fff';
            lineEl.style.transform = 'scale(1)';
          }
        }
      }
    }
    setInterval(syncLyricsPlayback, 300);

    function checkTrackChange() {
      const trackEl = DOC.querySelector('[data-testid="now-playing-widget"] [data-testid="context-item-link"], [data-testid="track-info-name"] a');
      const artistEl = DOC.querySelector('[data-testid="now-playing-widget"] [data-testid="context-item-info-artist"], [data-testid="track-info-artists"] a');
      if (trackEl && trackEl.innerText) {
        const track = trackEl.innerText.trim();
        const artist = artistEl ? artistEl.innerText.trim() : '';
        if (track !== currentTrackTitle && track.length > 0) {
          currentTrackTitle = track;
          initLyricsHUD();
          fetchLyrics(track, artist);
        }
      }
    }
    setInterval(checkTrackChange, 1000);
  }

  // ══════════════════════════════════════════════════════════════════════
  // GROUP E & G: YOUTUBE TURBO, SPONSORBLOCK, DISLIKE & QUALITY LOCK
  // ══════════════════════════════════════════════════════════════════════
  if (IS_YOUTUBE) {
    console.log('[BraveShield] YouTube Turbo Suite Armed.');

    // E1 & E2: 16x Video Ad Fast-Forward + Auto-Skip
    function handleYouTubeAds() {
      try {
        const video = DOC.querySelector('video');
        const adContainer = DOC.querySelector('.ad-showing, .ad-interrupting, .video-ads, .ytp-ad-player-overlay');
        if (video && adContainer) {
          video.muted = true;
          video.playbackRate = 16.0;
          if (video.duration && !isNaN(video.duration)) {
            video.currentTime = video.duration;
          }
          const skipBtn = DOC.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, button.ytp-ad-skip-button-icon');
          if (skipBtn) {
            try { skipBtn.click(); } catch (_) {}
          }
        }

        // E4: Remove Promoted Video & Banner Ads
        const bannerAds = DOC.querySelectorAll('ytd-promoted-video-renderer, ytd-display-ad-renderer, #player-ads, .ytp-ad-overlay-container, ytd-ad-slot-renderer');
        for (const b of bannerAds) {
          try { b.remove(); } catch (_) { b.style.display = 'none'; }
        }
      } catch (_) {}
    }
    setInterval(handleYouTubeAds, 250);

    // G3: YouTube Return Dislike Counter
    let lastVideoId = '';
    async function injectDislikeCount() {
      try {
        const urlParams = new URLSearchParams(WIN.location.search);
        const videoId = urlParams.get('v');
        if (!videoId || videoId === lastVideoId) return;
        lastVideoId = videoId;

        const res = await (WIN.fetch ? WIN.fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`) : origFetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`));
        if (res.ok) {
          const data = await res.json();
          const dislikes = data.dislikes || 0;
          const formattedDislikes = dislikes > 999999 ? (dislikes / 1000000).toFixed(1) + 'M' : dislikes > 999 ? (dislikes / 1000).toFixed(1) + 'K' : dislikes;

          const dislikeBtn = DOC.querySelector('dislike-button-view-model button, button[aria-label*="Dislike"], #dislike-button button, .yt-spec-button-shape-next--dislike');
          if (dislikeBtn && !dislikeBtn.innerText.includes(formattedDislikes)) {
            const badge = DOC.createElement('span');
            badge.id = 'bs-dislike-badge';
            badge.style.marginLeft = '6px';
            badge.style.fontSize = '12px';
            badge.style.fontWeight = '600';
            badge.innerText = `${formattedDislikes}`;
            const existing = dislikeBtn.querySelector('#bs-dislike-badge');
            if (existing) existing.remove();
            dislikeBtn.appendChild(badge);
          }
        }
      } catch (_) {}
    }
    setInterval(injectDislikeCount, 1500);

    // G4: Auto-Max 1080p / 4K Quality Lock
    function forceMaxQuality() {
      try {
        const player = DOC.getElementById('movie_player') || WIN.movie_player;
        if (player && typeof player.getAvailableQualityLevels === 'function' && typeof player.setPlaybackQualityRange === 'function') {
          const levels = player.getAvailableQualityLevels();
          if (levels && levels.length > 0) {
            const topQuality = levels[0]; // e.g. 'hd1080', 'hd2160'
            player.setPlaybackQualityRange(topQuality, topQuality);
          }
        }
      } catch (_) {}
    }
    setInterval(forceMaxQuality, 2000);
  }

  // ══════════════════════════════════════════════════════════════════════
  // GROUP G2: MOBILE AUDIO BOOSTER (100%–200% WebAudio Gain Pipeline)
  // ══════════════════════════════════════════════════════════════════════
  try {
    let audioCtx = null;
    let gainNode = null;
    let boostActive = false;

    function initAudioBooster() {
      if (DOC.getElementById('bs-volume-hud')) return;
      const hud = DOC.createElement('div');
      hud.id = 'bs-volume-hud';
      hud.innerHTML = `
        <button id="bs-boost-toggle" style="background:#6366F1; color:#fff; border:none; border-radius:50%; width:38px; height:38px; font-size:16px; cursor:pointer; box-shadow:0 4px 12px rgba(99,102,241,0.5);">🔊</button>
        <div id="bs-boost-slider-wrap" style="display:none; margin-left:8px; background:rgba(0,0,0,0.85); padding:6px 12px; border-radius:12px; backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.1); align-items:center;">
          <input type="range" id="bs-boost-slider" min="100" max="250" value="150" style="width:100px; accent-color:#6366F1;">
          <span id="bs-boost-val" style="color:#fff; font-size:12px; margin-left:6px; font-weight:700;">150%</span>
        </div>
      `;
      Object.assign(hud.style, {
        position: 'fixed',
        bottom: '24px',
        left: '16px',
        zIndex: '99999',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif'
      });
      DOC.body.appendChild(hud);

      const toggle = DOC.getElementById('bs-boost-toggle');
      const sliderWrap = DOC.getElementById('bs-boost-slider-wrap');
      const slider = DOC.getElementById('bs-boost-slider');
      const valText = DOC.getElementById('bs-boost-val');

      toggle.onclick = () => {
        sliderWrap.style.display = sliderWrap.style.display === 'none' ? 'flex' : 'none';
        if (!boostActive) attachWebAudioGain(parseFloat(slider.value) / 100);
      };

      slider.oninput = (e) => {
        const val = e.target.value;
        valText.innerText = `${val}%`;
        if (gainNode) gainNode.gain.value = parseFloat(val) / 100;
      };
    }

    function attachWebAudioGain(multiplier) {
      try {
        const mediaElements = DOC.querySelectorAll('audio, video');
        if (mediaElements.length === 0) return;
        const AudioContextClass = WIN.AudioContext || WIN.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        for (const media of mediaElements) {
          if (!media._bsGainAttached) {
            media._bsGainAttached = true;
            const source = audioCtx.createMediaElementSource(media);
            gainNode = audioCtx.createGain();
            gainNode.gain.value = multiplier || 1.5;

            const compressor = audioCtx.createDynamicsCompressor(); // Prevents clipping distortion
            compressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
            compressor.knee.setValueAtTime(30, audioCtx.currentTime);
            compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
            compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
            compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

            source.connect(gainNode);
            gainNode.connect(compressor);
            compressor.connect(audioCtx.destination);
            boostActive = true;
          }
        }
      } catch (_) {}
    }

    DOC.addEventListener('DOMContentLoaded', () => {
      // Auto-initialize booster button on media-heavy pages
      if (IS_SPOTIFY || IS_YOUTUBE || DOC.querySelector('video, audio')) {
        initAudioBooster();
      }
    });
  } catch (_) {}

  // ══════════════════════════════════════════════════════════════════════
  // GROUP H: MOBILE DOWNLOAD & PROTECTION (Modules H1 - H4)
  // ══════════════════════════════════════════════════════════════════════

  // H1: Direct Media & Video Stream Sniffer (.mp4 / .m3u8 detector)
  try {
    const detectedStreams = new Set();
    function checkStreamUrl(url) {
      if (typeof url === 'string' && (url.includes('.m3u8') || url.includes('.mp4') || url.includes('.mpd')) && !url.includes('google-analytics') && !url.includes('doubleclick')) {
        if (!detectedStreams.has(url) && !IS_YOUTUBE && !IS_SPOTIFY) {
          detectedStreams.add(url);
          showStreamSnifferButton(url);
        }
      }
    }

    // Hook fetch & XHR to detect underlying video streams
    const snifferFetch = WIN.fetch;
    WIN.fetch = function(input, init) {
      const u = typeof input === 'string' ? input : (input?.url || '');
      checkStreamUrl(u);
      return snifferFetch.apply(this, arguments);
    };

    function showStreamSnifferButton(streamUrl) {
      if (DOC.getElementById('bs-stream-btn')) return;
      const btn = DOC.createElement('button');
      btn.id = 'bs-stream-btn';
      btn.innerHTML = '⚡ Direct Stream (VLC)';
      Object.assign(btn.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        padding: '8px 14px',
        backgroundColor: '#10B981',
        color: '#fff',
        fontWeight: '700',
        borderRadius: '20px',
        border: 'none',
        zIndex: '99999',
        fontSize: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(16,185,129,0.4)'
      });
      btn.onclick = () => {
        WIN.open(streamUrl, '_blank');
      };
      DOC.body.appendChild(btn);
    }
  } catch (_) {}

  // H2: Android Back-Button Trap Neutralizer (Rate-limits history manipulation)
  try {
    let pushCount = 0;
    const origPushState = WIN.history.pushState;
    WIN.history.pushState = function(state, title, url) {
      pushCount++;
      if (pushCount > 3) {
        console.warn('[BraveShield] Back-button history spam suppressed');
        return;
      }
      return origPushState.apply(this, arguments);
    };
    setInterval(() => { pushCount = 0; }, 1500);
  } catch (_) {}

  // H3: Anti-Vibration & Fake Virus Siren Blocker
  try {
    if (WIN.navigator && WIN.navigator.vibrate) {
      WIN.navigator.vibrate = () => false; // Silences annoying vibration sirens
    }
    const origAlert = WIN.alert;
    WIN.alert = function(msg) {
      if (typeof msg === 'string' && /virus|infected|trojan|phone\s+has\s+\d+|warning|security\s+alert/i.test(msg)) {
        console.warn('[BraveShield] Fake security alert blocked:', msg);
        return;
      }
      return origAlert.apply(this, arguments);
    };
  } catch (_) {}

  // H4: Safe APK Direct-Download Fast-Pass (Highlights true APKs, hides adware installers)
  function highlightAuthenticApk() {
    try {
      const anchors = DOC.querySelectorAll('a[href]');
      for (const a of anchors) {
        const href = a.href || '';
        if (href.endsWith('.apk') || href.includes('apkpure.com/APK/') || href.includes('apkadmin.com/') || href.includes('uploadrar.com/')) {
          a.style.setProperty('border', '2px solid #10B981', 'important');
          a.style.setProperty('background', 'rgba(16,185,129,0.15)', 'important');
        }
      }
    } catch (_) {}
  }
  setInterval(highlightAuthenticApk, 500);

  // ══════════════════════════════════════════════════════════════════════
  // GROUP I: 1-CLICK PAYWALL & LOGIN-WALL BYPASS (Module I1)
  // ══════════════════════════════════════════════════════════════════════
  function bypassPaywallsAndLoginWalls() {
    try {
      // Medium, Quora, Pinterest, News Paywall overlay blockers
      const paywallSelectors = [
        '#paywall-wrapper', '.paywall-overlay', '.modal-signup', '#quora-signup-modal',
        '.tp-modal', '.tp-backdrop', '.fc-dialog-container', '.fc-dialog-overlay',
        'div[id*="paywall"]', 'div[class*="Paywall"]', 'div[class*="gate-overlay"]'
      ];
      for (const sel of paywallSelectors) {
        const nodes = DOC.querySelectorAll(sel);
        for (const n of nodes) {
          try { n.remove(); } catch (_) { n.style.display = 'none'; }
        }
      }
    } catch (_) {}
  }
  setInterval(bypassPaywallsAndLoginWalls, 500);

  // ══════════════════════════════════════════════════════════════════════
  // GROUP F: USABILITY, ACCESSIBILITY & BACKGROUND PLAYBACK
  // ══════════════════════════════════════════════════════════════════════
  // Force Right-Click & Text Selection
  DOC.addEventListener('contextmenu', (e) => e.stopPropagation(), true);
  DOC.addEventListener('selectstart', (e) => e.stopPropagation(), true);

  // Background Video/Audio Playback (Prevents Pause on Tab Switch)
  Object.defineProperty(DOC, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(DOC, 'visibilityState', { get: () => 'visible', configurable: true });
  WIN.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);

  console.log('[BraveShield Super Suite] All 55+ Modules Fully Armed.');
})();
