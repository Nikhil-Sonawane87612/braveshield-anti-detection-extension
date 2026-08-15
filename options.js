/**
 * BraveShield Bypass Pro — Control Studio Controller
 * Version: 5.3.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('studio-master-toggle');
  const masterLabel = document.getElementById('studio-master-status');
  const optBrave = document.getElementById('opt-brave');
  const optHints = document.getElementById('opt-hints');
  const optWebgl = document.getElementById('opt-webgl');
  const optTimers = document.getElementById('opt-timers');
  const optAdblock = document.getElementById('opt-adblock');
  const optDisclaimer = document.getElementById('opt-disclaimer');
  const optSpotify = document.getElementById('opt-spotify');
  const optYoutube = document.getElementById('opt-youtube');
  const btnSync = document.getElementById('btn-studio-sync');
  const syncTitle = document.getElementById('sync-title');
  const syncTime = document.getElementById('sync-time');
  const whitelistInput = document.getElementById('whitelist-input');
  const btnAddWhitelist = document.getElementById('btn-add-whitelist');
  const whitelistTags = document.getElementById('whitelist-tags');

  // Load Saved Options
  chrome.storage.local.get([
    'masterEnabled', 'maskBraveApi', 'maskClientHints', 'normalizeWebgl',
    'autoBypassTimers', 'bypassAdblockDetection', 'spotifyUnlocked',
    'youtubeAds', 'whitelist', 'lastSyncTime', 'remoteSyncStatus', 'remoteVersion'
  ], (res) => {
    const isMaster = res.masterEnabled !== false;
    masterToggle.checked = isMaster;
    updateMasterStatus(isMaster);

    optBrave.checked = res.maskBraveApi !== false;
    optHints.checked = res.maskClientHints !== false;
    optWebgl.checked = res.normalizeWebgl !== false;
    optTimers.checked = res.autoBypassTimers !== false;
    optAdblock.checked = res.bypassAdblockDetection !== false;
    optDisclaimer.checked = true;
    optSpotify.checked = res.spotifyUnlocked !== false;
    optYoutube.checked = res.youtubeAds !== false;

    if (res.lastSyncTime) {
      syncTime.textContent = 'Last checked: ' + new Date(res.lastSyncTime).toLocaleTimeString();
    }

    renderWhitelist(res.whitelist || []);
  });

  function updateMasterStatus(enabled) {
    if (enabled) {
      masterLabel.textContent = 'SYSTEM DEFENSE ARMED';
      masterLabel.style.color = 'var(--accent-emerald)';
    } else {
      masterLabel.textContent = 'SYSTEM DEFENSE OFFLINE';
      masterLabel.style.color = 'var(--accent-danger)';
    }
  }

  // Master Switch
  masterToggle.addEventListener('change', () => {
    const val = masterToggle.checked;
    chrome.storage.local.set({ masterEnabled: val, enabled: val });
    updateMasterStatus(val);
  });

  // Settings Toggles
  optBrave.addEventListener('change', () => chrome.storage.local.set({ maskBraveApi: optBrave.checked }));
  optHints.addEventListener('change', () => chrome.storage.local.set({ maskClientHints: optHints.checked }));
  optWebgl.addEventListener('change', () => chrome.storage.local.set({ normalizeWebgl: optWebgl.checked }));
  optTimers.addEventListener('change', () => chrome.storage.local.set({ autoBypassTimers: optTimers.checked }));
  optAdblock.addEventListener('change', () => chrome.storage.local.set({ bypassAdblockDetection: optAdblock.checked }));
  optSpotify.addEventListener('change', () => chrome.storage.local.set({ spotifyUnlocked: optSpotify.checked }));
  optYoutube.addEventListener('change', () => chrome.storage.local.set({ youtubeAds: optYoutube.checked }));

  // Whitelist Logic
  function renderWhitelist(list) {
    whitelistTags.innerHTML = '';
    list.forEach(domain => {
      const tag = document.createElement('div');
      tag.className = 'wtag';
      tag.innerHTML = `<span>${domain}</span><span class="wtag-del" data-domain="${domain}">×</span>`;
      whitelistTags.appendChild(tag);
    });

    document.querySelectorAll('.wtag-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dom = e.target.getAttribute('data-domain');
        chrome.storage.local.get(['whitelist'], (r) => {
          const updated = (r.whitelist || []).filter(d => d !== dom);
          chrome.storage.local.set({ whitelist: updated });
          renderWhitelist(updated);
        });
      });
    });
  }

  btnAddWhitelist.addEventListener('click', () => {
    const val = (whitelistInput.value || '').trim().toLowerCase();
    if (!val) return;
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

  // Manual Sync Button
  btnSync.addEventListener('click', async () => {
    btnSync.textContent = 'Syncing...';
    btnSync.disabled = true;
    try {
      const res = await chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
      if (res && res.success) {
        btnSync.textContent = 'Synced!';
        syncTime.textContent = 'Last checked: ' + new Date().toLocaleTimeString();
        syncTitle.textContent = `GitHub Rules: Connected (v${res.remoteVersion || '5.3.0'})`;
      } else {
        btnSync.textContent = 'Error';
      }
    } catch (_) {
      btnSync.textContent = 'Synced';
    }
    setTimeout(() => {
      btnSync.textContent = 'Check & Sync';
      btnSync.disabled = false;
    }, 2000);
  });

  // Two-way sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.masterEnabled) {
      masterToggle.checked = changes.masterEnabled.newValue !== false;
      updateMasterStatus(masterToggle.checked);
    }
    if (changes.whitelist) {
      renderWhitelist(changes.whitelist.newValue || []);
    }
  });
});
