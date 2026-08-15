/**
 * BraveShield Bypass Pro v5.1.0 - Popup Controller
 * Master Kill Switch, Video Turbo, Live Privacy Audit, Disposable Identity HUD.
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

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('master-toggle');
  const masterCard = document.getElementById('master-card');
  const masterSubtitle = document.getElementById('master-subtitle');
  const statusBar = document.getElementById('status-bar');
  const statusLabel = document.getElementById('status-label');
  const statusSite = document.getElementById('status-site');
  const auditGrade = document.getElementById('audit-grade');
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

  // 1. Update Live Audit Grade and Counters
  function updateLiveAudit(masterActive) {
    if (!masterActive) {
      if (auditGrade) {
        auditGrade.textContent = 'OFF';
        auditGrade.style.color = '#ef4444';
      }
      if (statusLabel) statusLabel.textContent = 'Engine Disabled';
      if (statusBar) statusBar.classList.add('disabled');
      if (masterCard) masterCard.classList.add('disabled');
      if (masterSubtitle) masterSubtitle.textContent = 'All modules paused via Kill Switch';
      return;
    }

    if (statusBar) statusBar.classList.remove('disabled');
    if (masterCard) masterCard.classList.remove('disabled');
    if (statusLabel) statusLabel.textContent = 'Active & Guarded';

    let activeCount = 0;
    const totalCount = Object.keys(POPUP_SETTINGS_MAP).length;
    Object.keys(POPUP_SETTINGS_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) activeCount++;
    });

    if (fingerprintsSanitized) fingerprintsSanitized.textContent = String(activeCount + 8); // Include background core stubs
    if (footerModules) footerModules.textContent = (activeCount + 8) + ' modules active';
    if (masterSubtitle) masterSubtitle.textContent = (activeCount + 8) + ' stealth modules active';

    // Calculate Grade
    const ratio = activeCount / totalCount;
    if (auditGrade) {
      if (ratio >= 0.9) {
        auditGrade.textContent = 'A+';
        auditGrade.style.color = '#00d26a';
      } else if (ratio >= 0.75) {
        auditGrade.textContent = 'A';
        auditGrade.style.color = '#00e5ff';
      } else if (ratio >= 0.5) {
        auditGrade.textContent = 'B';
        auditGrade.style.color = '#f59e0b';
      } else {
        auditGrade.textContent = 'C';
        auditGrade.style.color = '#ef4444';
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

  // 2. Master Kill Switch Listener
  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const isEnabled = masterToggle.checked;
      chrome.runtime.sendMessage({ type: 'TOGGLE_MASTER', enabled: isEnabled }, () => {
        updateLiveAudit(isEnabled);
      });
    });
  }

  // 3. Quick Action HUD Handlers
  if (btnNewIdentity) {
    btnNewIdentity.addEventListener('click', () => {
      btnNewIdentity.style.transform = 'rotate(180deg)';
      setTimeout(() => { btnNewIdentity.style.transform = ''; }, 300);
      chrome.runtime.sendMessage({ type: 'NEW_IDENTITY' }, (res) => {
        if (res && res.identity) {
          if (uaCategory) uaCategory.value = res.identity.ua;
          if (uaStatus) uaStatus.textContent = 'Identity switched: ' + res.identity.profile;
        }
      });
    });
  }

  if (btnTogglePip) {
    btnTogglePip.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_PIP' });
    });
  }

  if (btnOpenOptions) {
    btnOpenOptions.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // 4. Accordion Expand / Collapse
  document.querySelectorAll('.shdr').forEach(hdr => {
    const targetId = hdr.dataset.target;
    const body = document.getElementById(targetId);
    if (hdr && body) {
      hdr.addEventListener('click', () => {
        const isCollapsed = hdr.classList.toggle('collapsed');
        body.style.display = isCollapsed ? 'none' : 'flex';
      });
    }
  });

  // 5. Category Navigation & Scroll
  document.querySelectorAll('.cat-btn:not(.link-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      const targetSec = document.getElementById('sec-' + cat);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const hdr = targetSec.querySelector('.shdr');
        const body = targetSec.querySelector('.tlist');
        if (hdr && body && hdr.classList.contains('collapsed')) {
          hdr.classList.remove('collapsed');
          body.style.display = 'flex';
        }
      }
    });
  });

  document.querySelectorAll('.cat-btn-sm:not(.link-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cat = btn.dataset.category;
      const enable = btn.dataset.enable === 'true';
      const ids = POPUP_CATEGORIES[cat] || [];
      const updates = {};
      ids.forEach(id => {
        const key = POPUP_SETTINGS_MAP[id];
        if (key) {
          updates[key] = enable;
          const el = document.getElementById(id);
          if (el) el.checked = enable;
        }
      });
      chrome.storage.local.set(updates, () => {
        updateLiveAudit(masterToggle ? masterToggle.checked : true);
      });
    });
  });

  // Category Link buttons for Sites and Profile
  document.querySelectorAll('.link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html?tab=' + tab) });
    });
  });

  // 6. Individual Toggle Checkboxes
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

  // 7. Load Initial Settings & Tab Info
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
      if (uaStatus) uaStatus.textContent = uaCategory.options[uaCategory.selectedIndex]?.text || res.uaCategory;
    }

    updateLiveAudit(isMaster);
  });

  // 8. User Agent Selection
  if (uaCategory) {
    uaCategory.addEventListener('change', () => {
      const val = uaCategory.value;
      const text = uaCategory.options[uaCategory.selectedIndex]?.text || val;
      chrome.storage.local.set({ uaCategory: val, selectedUA: val });
      if (uaStatus) uaStatus.textContent = text;
    });
  }

  // 9. Current Tab Status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname;
        if (statusSite) statusSite.textContent = currentHostname;

        chrome.runtime.sendMessage({ type: 'GET_SITE_STATUS', url: tabs[0].url }, (status) => {
          if (status) {
            if (status.isBlacklisted) {
              if (btnBlacklist) btnBlacklist.textContent = 'Un-blacklist';
            }
            if (status.isWhitelisted) {
              if (btnWhitelist) btnWhitelist.textContent = 'Un-whitelist';
            }
          }
        });
      } catch (_) {
        if (statusSite) statusSite.textContent = 'System Page';
      }
    }
  });

  if (btnWhitelist) {
    btnWhitelist.addEventListener('click', () => {
      if (!currentHostname) return;
      if (btnWhitelist.textContent.includes('Un-')) {
        chrome.runtime.sendMessage({ type: 'REMOVE_WHITELIST', site: currentHostname }, () => {
          btnWhitelist.textContent = '🛡️ Whitelist Site';
        });
      } else {
        chrome.runtime.sendMessage({ type: 'ADD_WHITELIST', site: currentHostname }, () => {
          btnWhitelist.textContent = 'Un-whitelist';
        });
      }
    });
  }

  if (btnBlacklist) {
    btnBlacklist.addEventListener('click', () => {
      if (!currentHostname) return;
      if (btnBlacklist.textContent.includes('Un-')) {
        chrome.runtime.sendMessage({ type: 'REMOVE_BLACKLIST', site: currentHostname }, () => {
          btnBlacklist.textContent = '🚫 Blacklist Site';
        });
      } else {
        chrome.runtime.sendMessage({ type: 'ADD_BLACKLIST', site: currentHostname }, () => {
          btnBlacklist.textContent = 'Un-blacklist';
        });
      }
    });
  }
});