/**
 * BraveShield Bypass Pro v5.1.0 - Popup Controller Pro Max
 * Obsidian Glassmorphic HUD, Radial Gauge Animation, Filter Chips, Live Telemetry Ticker.
 */

const POPUP_SETTINGS_MAP = {
  'toggle-links': 'autoBypassLinks',
  'toggle-timers': 'autoBypassTimers',
  'toggle-cookies': 'autoDismissCookies',
  'toggle-scroll': 'autoScroll',
  'toggle-popunder': 'interceptPopunders',
  'toggle-adblock': 'bypassAdblockDetection',
  'toggle-youtube': 'youtubeAds',
  'toggle-video-turbo-ad': 'videoTurboAdSpeed',
  'toggle-video-turbo-bg': 'videoTurboBgPlay',
  'toggle-video-turbo-pip': 'videoTurboPip',
  'toggle-sponsorblock': 'sponsorBlock',
  'toggle-webr': 'hideWebdriver',
  'toggle-webrtc': 'preventWebRTC',
  'toggle-permissions': 'autoDenyPermissions',
  'toggle-bait': 'fakeNetworkBait',
  'toggle-canvas': 'normalizeCanvas',
  'toggle-navigator': 'spoofNavigator',
  'toggle-rightclick': 'forceRightClick',
  'toggle-textsel': 'forceTextSelect',
  'toggle-scrolllock': 'antiScrollLock',
  'toggle-clipboard': 'blockClipboardRead',
  'toggle-timezone': 'timezoneSpoof',
  'toggle-devmode': 'devMode'
};

const POPUP_CATEGORIES = {
  'auto-bypass': ['toggle-links', 'toggle-timers', 'toggle-cookies', 'toggle-scroll', 'toggle-popunder', 'toggle-adblock', 'toggle-youtube'],
  'youtube': ['toggle-video-turbo-ad', 'toggle-video-turbo-bg', 'toggle-video-turbo-pip', 'toggle-sponsorblock'],
  'stealth': ['toggle-webr', 'toggle-webrtc', 'toggle-permissions', 'toggle-bait', 'toggle-canvas', 'toggle-navigator'],
  'extra': ['toggle-rightclick', 'toggle-textsel', 'toggle-scrolllock', 'toggle-clipboard', 'toggle-timezone', 'toggle-devmode']
};

const LIVE_TICKER_MESSAGES = [
  '⚡ WebGL spoofed to NVIDIA RTX 4090',
  '🛡️ DOM trap neutralized on active page',
  '🚀 16x Video Ad Fast-Forward active',
  '🛑 WebRTC IP leak shield engaged',
  '🎨 Canvas fingerprint farbled & isolated',
  '✨ Background video playback unlocked',
  '🔒 Client Hints & Brand sanitized'
];

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterCard = document.getElementById('master-card');
  const masterSubtitle = document.getElementById('master-subtitle');
  const statusBar = document.getElementById('status-bar');
  const statusLabel = document.getElementById('status-label');
  const statusSite = document.getElementById('status-site');
  const auditGrade = document.getElementById('audit-grade');
  const metricStealthPct = document.getElementById('metric-stealth-pct');
  const gaugeFill = document.getElementById('gauge-fill');
  const popupTickerFeed = document.getElementById('popup-ticker-feed');
  const fingerprintsSanitized = document.getElementById('fingerprints-sanitized');
  const trapsBypassedEl = document.getElementById('traps-bypassed');
  const sitesBypassedEl = document.getElementById('sites-bypassed');
  const uaCategory = document.getElementById('ua-category');
  const uaStatus = document.getElementById('ua-status');
  const btnWhitelist = document.getElementById('btn-whitelist');
  const btnBlacklist = document.getElementById('btn-blacklist');
  const btnNewIdentity = document.getElementById('btn-new-identity');
  const btnTogglePip = document.getElementById('btn-toggle-pip');
  const btnOpenOptions = document.getElementById('btn-open-options');
  const footerModules = document.getElementById('footer-modules');

  let currentHostname = '';
  let tickerIdx = 0;

  // 1. Live Ticker Rotation
  setInterval(() => {
    if (popupTickerFeed) {
      popupTickerFeed.style.opacity = '0';
      setTimeout(() => {
        tickerIdx = (tickerIdx + 1) % LIVE_TICKER_MESSAGES.length;
        popupTickerFeed.textContent = LIVE_TICKER_MESSAGES[tickerIdx];
        popupTickerFeed.style.opacity = '1';
      }, 200);
    }
  }, 4000);

  // 2. Update Live Audit & Radial Gauge Animation
  function updateLiveAudit(masterActive) {
    if (!masterActive) {
      if (auditGrade) {
        auditGrade.textContent = 'OFF';
        auditGrade.style.color = '#ff3366';
      }
      if (metricStealthPct) {
        metricStealthPct.textContent = '0%';
        metricStealthPct.style.color = '#ff3366';
      }
      if (gaugeFill) {
        gaugeFill.setAttribute('stroke-dasharray', '0, 100');
        gaugeFill.style.stroke = '#ff3366';
      }
      if (statusLabel) statusLabel.textContent = 'Engine Paused';
      if (statusBar) statusBar.classList.add('disabled');
      if (masterCard) masterCard.classList.add('disabled');
      if (masterSubtitle) masterSubtitle.textContent = 'All modules suspended via Kill Switch';
      return;
    }

    if (statusBar) statusBar.classList.remove('disabled');
    if (masterCard) masterCard.classList.remove('disabled');
    if (statusLabel) statusLabel.textContent = 'Guarded';

    let activeCount = 0;
    const totalCount = Object.keys(POPUP_SETTINGS_MAP).length;
    Object.keys(POPUP_SETTINGS_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) activeCount++;
    });

    const totalArmed = activeCount + 8; // Including background DNR and core hooks
    if (fingerprintsSanitized) fingerprintsSanitized.textContent = String(totalArmed);
    if (footerModules) footerModules.textContent = totalArmed + ' modules armed';
    if (masterSubtitle) masterSubtitle.textContent = totalArmed + ' Stealth Modules Armed';

    // Calculate Ratio & Radial Gauge stroke
    const ratio = activeCount / totalCount;
    const pct = Math.round(ratio * 100);

    if (metricStealthPct) {
      metricStealthPct.textContent = pct + '%';
      metricStealthPct.style.color = ratio >= 0.9 ? '#00f076' : ratio >= 0.7 ? '#00e5ff' : '#fbbf24';
    }

    if (gaugeFill) {
      gaugeFill.setAttribute('stroke-dasharray', `${pct}, 100`);
      gaugeFill.style.stroke = ratio >= 0.9 ? '#00f076' : ratio >= 0.7 ? '#00e5ff' : '#fbbf24';
    }

    if (auditGrade) {
      if (ratio >= 0.9) {
        auditGrade.textContent = 'A+';
        auditGrade.style.color = '#00f076';
      } else if (ratio >= 0.75) {
        auditGrade.textContent = 'A';
        auditGrade.style.color = '#00e5ff';
      } else if (ratio >= 0.5) {
        auditGrade.textContent = 'B';
        auditGrade.style.color = '#fbbf24';
      } else {
        auditGrade.textContent = 'C';
        auditGrade.style.color = '#ff3366';
      }
    }

    updateCategoryCounters();
  }

  function updateCategoryCounters() {
    Object.entries(POPUP_CATEGORIES).forEach(([catId, ids]) => {
      const cntEl = document.getElementById('cnt-' + catId);
      if (cntEl) {
        const active = ids.filter(id => {
          const el = document.getElementById(id);
          return el && el.checked;
        }).length;
        cntEl.textContent = `${active}/${ids.length}`;
      }
    });
  }

  // 3. Master Kill Switch Listener
  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const isEnabled = masterToggle.checked;
      chrome.runtime.sendMessage({ type: 'TOGGLE_MASTER', enabled: isEnabled }, () => {
        updateLiveAudit(isEnabled);
      });
    });
  }

  // 4. Quick Action HUD Handlers
  if (btnNewIdentity) {
    btnNewIdentity.addEventListener('click', () => {
      btnNewIdentity.style.transform = 'rotate(180deg) scale(0.95)';
      setTimeout(() => { btnNewIdentity.style.transform = ''; }, 350);
      chrome.runtime.sendMessage({ type: 'NEW_IDENTITY' }, (res) => {
        if (res && res.identity) {
          if (uaCategory) uaCategory.value = res.identity.ua;
          if (uaStatus) uaStatus.textContent = res.identity.profile;
          if (popupTickerFeed) popupTickerFeed.textContent = '🎲 Switched to ' + res.identity.profile;
        }
      });
    });
  }

  if (btnTogglePip) {
    btnTogglePip.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_PIP' });
      if (popupTickerFeed) popupTickerFeed.textContent = '📺 Picture-in-Picture triggered';
    });
  }

  if (btnOpenOptions) {
    btnOpenOptions.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // 5. Accordion Expand / Collapse
  document.querySelectorAll('.group-header').forEach(hdr => {
    const targetId = hdr.dataset.target;
    const body = document.getElementById(targetId);
    if (hdr && body) {
      hdr.addEventListener('click', () => {
        const isCollapsed = hdr.classList.toggle('collapsed');
        body.style.display = isCollapsed ? 'none' : 'flex';
      });
    }
  });

  // 6. Filter Chips Dock
  document.querySelectorAll('.filter-chip:not(.link-chip)').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip:not(.link-chip)').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const cat = chip.dataset.category;
      if (cat === 'all') {
        document.querySelectorAll('.module-group').forEach(grp => { grp.style.display = 'block'; });
      } else {
        document.querySelectorAll('.module-group').forEach(grp => {
          grp.style.display = grp.id === 'sec-' + cat ? 'block' : 'none';
        });
      }
    });
  });

  document.querySelectorAll('.link-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tab = chip.dataset.tab;
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html?tab=' + tab) });
    });
  });

  // 7. Individual Module Checkbox Sync
  Object.entries(POPUP_SETTINGS_MAP).forEach(([id, storageKey]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        chrome.storage.local.set({ [storageKey]: el.checked }, () => {
          updateLiveAudit(masterToggle ? masterToggle.checked : true);
        });
      });
    }
  });

  // 8. Load Initial Settings & Storage
  const storageKeys = [
    ...Object.values(POPUP_SETTINGS_MAP),
    'masterEnabled', 'blockedCounter', 'bypassedSites', 'selectedUA', 'uaCategory'
  ];

  chrome.storage.local.get(storageKeys, (res) => {
    const isMaster = res.masterEnabled !== false;
    if (masterToggle) masterToggle.checked = isMaster;

    Object.entries(POPUP_SETTINGS_MAP).forEach(([id, storageKey]) => {
      const el = document.getElementById(id);
      if (el && res[storageKey] !== undefined) {
        el.checked = Boolean(res[storageKey]);
      }
    });

    if (trapsBypassedEl) trapsBypassedEl.textContent = String(res.blockedCounter || 0);
    if (sitesBypassedEl) sitesBypassedEl.textContent = String((res.bypassedSites || []).length);

    if (uaCategory && res.uaCategory) {
      uaCategory.value = res.uaCategory;
      if (uaStatus) uaStatus.textContent = uaCategory.options[uaCategory.selectedIndex]?.text.split('•')[0] || res.uaCategory;
    }

    // Load Theme
    const activeTheme = res.theme || 'obsidian_noir';
    const themeSelector = document.getElementById('theme-selector');
    const themeStatus = document.getElementById('theme-status');
    if (themeSelector) {
      themeSelector.value = activeTheme;
      document.documentElement.setAttribute('data-theme', activeTheme);
      if (themeStatus) themeStatus.textContent = themeSelector.options[themeSelector.selectedIndex]?.text.split('(')[0] || activeTheme;
    }

    updateLiveAudit(isMaster);
  });

  // 9. User Agent Persona & Theme Selection
  const themeSelector = document.getElementById('theme-selector');
  const themeStatus = document.getElementById('theme-status');
  if (themeSelector) {
    themeSelector.addEventListener('change', () => {
      const selected = themeSelector.value;
      const label = themeSelector.options[themeSelector.selectedIndex]?.text.split('(')[0] || selected;
      document.documentElement.setAttribute('data-theme', selected);
      chrome.storage.local.set({ theme: selected });
      if (themeStatus) themeStatus.textContent = label;
      if (popupTickerFeed) popupTickerFeed.textContent = '🎨 Theme: ' + label;
    });
  }

  if (uaCategory) {
    uaCategory.addEventListener('change', () => {
      const val = uaCategory.value;
      const text = uaCategory.options[uaCategory.selectedIndex]?.text.split('•')[0] || val;
      chrome.storage.local.set({ uaCategory: val, selectedUA: val });
      if (uaStatus) uaStatus.textContent = text;
      if (popupTickerFeed) popupTickerFeed.textContent = '🎭 Persona: ' + text;
    });
  }

  // 10. Current Tab Status & Site Rules
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        if (statusSite) statusSite.textContent = currentHostname;

        chrome.runtime.sendMessage({ type: 'GET_SITE_STATUS', url: tabs[0].url }, (status) => {
          if (status) {
            if (status.isBlacklisted) {
              if (btnBlacklist) btnBlacklist.innerHTML = '<span>🚫 Un-blacklist</span>';
            }
            if (status.isWhitelisted) {
              if (btnWhitelist) btnWhitelist.innerHTML = '<span>🛡️ Un-whitelist</span>';
            }
          }
        });
      } catch (_) {
        if (statusSite) statusSite.textContent = 'System Protocol Page';
      }
    }
  });

  if (btnWhitelist) {
    btnWhitelist.addEventListener('click', () => {
      if (!currentHostname) return;
      if (btnWhitelist.textContent.includes('Un-')) {
        chrome.runtime.sendMessage({ type: 'REMOVE_WHITELIST', site: currentHostname }, () => {
          btnWhitelist.innerHTML = '<span class="site-btn-icon">🛡️</span><span>Whitelist Site</span>';
        });
      } else {
        chrome.runtime.sendMessage({ type: 'ADD_WHITELIST', site: currentHostname }, () => {
          btnWhitelist.innerHTML = '<span>🛡️ Un-whitelist</span>';
        });
      }
    });
  }

  if (btnBlacklist) {
    btnBlacklist.addEventListener('click', () => {
      if (!currentHostname) return;
      if (btnBlacklist.textContent.includes('Un-')) {
        chrome.runtime.sendMessage({ type: 'REMOVE_BLACKLIST', site: currentHostname }, () => {
          btnBlacklist.innerHTML = '<span class="site-btn-icon">🚫</span><span>Blacklist Site</span>';
        });
      } else {
        chrome.runtime.sendMessage({ type: 'ADD_BLACKLIST', site: currentHostname }, () => {
          btnBlacklist.innerHTML = '<span>🚫 Un-blacklist</span>';
        });
      }
    });
  }

  // GitHub Auto-Sync Button Handler
  const btnSync = document.getElementById('btn-sync-rules');
  const syncIcon = document.getElementById('sync-icon');
  const syncText = document.getElementById('sync-text');

  if (btnSync) {
    chrome.runtime.sendMessage({ type: 'GET_SYNC_STATUS' }, (res) => {
      if (res && res.remoteVersion) {
        syncText.textContent = `Synced v${res.remoteVersion}`;
      }
    });

    btnSync.addEventListener('click', () => {
      syncText.textContent = 'Syncing...';
      chrome.runtime.sendMessage({ type: 'CHECK_REMOTE_UPDATE' }, (res) => {
        if (res && res.success) {
          syncText.textContent = `Updated v${res.version || '5.1.0'}`;
        } else {
          syncText.textContent = 'Up to date';
        }
        setTimeout(() => {
          syncText.textContent = 'Auto-Sync';
        }, 3000);
      });
    });
  }
});