document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('profile-grid');
  const btnFinish = document.getElementById('btn-finish');
  const btnStudio = document.getElementById('btn-open-studio');
  const masterOn = document.getElementById('master-on');

  if (!grid || !btnFinish || !btnStudio || !masterOn) return;

  let selectedId = 'win-rtx4090';

  // Curated starter identities: known ids first, Linux fallback from catalog
  const PREFERRED = ['win-rtx4090', 'mac-m3max-40c', 'win-rx7900xtx', 'mac-air-m2-13', 'win-iris-xe-g7'];
  const catalog = (typeof HARDWARE_PROFILES_CATALOG !== 'undefined') ? HARDWARE_PROFILES_CATALOG : [];
  let picks = PREFERRED.map(id => catalog.find(p => p.id === id)).filter(Boolean);
  if (picks.length < 5) {
    const linuxPick = catalog.find(p => /linux/i.test(p.category)) ||
                      catalog.find(p => /^lin-/i.test(p.id));
    if (linuxPick && !picks.includes(linuxPick)) picks.push(linuxPick);
  }

  function render() {
    grid.textContent = '';
    picks.forEach((p, idx) => {
      const isSelected = p.id === selectedId;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'profile-card' + (isSelected ? ' selected' : '');
      // keep aria-pressed contract correct (additive: always sync with .selected)
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      card.setAttribute('aria-label', p.name);
      // stagger entrance — additive only, no layout change
      card.style.animationDelay = (idx * 42) + 'ms';

      const name = document.createElement('div');
      name.className = 'pc-name';
      name.textContent = p.name;
      name.title = p.name;

      const meta = document.createElement('div');
      meta.className = 'pc-meta';
      meta.textContent = `${p.concurrency}-core \u2022 ${p.memory}GB \u2022 ${p.screen.width}\u00D7${p.screen.height}`;
      meta.title = meta.textContent;

      card.append(name, meta);
      card.addEventListener('click', () => {
        selectedId = p.id;
        render();
      });
      grid.appendChild(card);
    });

    // defensive sync: ensure exactly one selected has aria-pressed=true
    // (no storage contract change, purely a11y)
    const cards = grid.querySelectorAll('.profile-card');
    cards.forEach(c => {
      const shouldBePressed = c.classList.contains('selected');
      if (c.getAttribute('aria-pressed') !== String(shouldBePressed)) {
        c.setAttribute('aria-pressed', shouldBePressed ? 'true' : 'false');
      }
    });
  }
  render();

  // restore persisted profile without mutating storage contract
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['deviceProfile'], (res) => {
        if (res && res.deviceProfile && picks.some(p => p.id === res.deviceProfile)) {
          selectedId = res.deviceProfile;
          render();
        } else if (res && res.deviceProfile) {
          // Existing users keep their configured identity even if not in picks
          selectedId = res.deviceProfile;
        }
      });
    }
  } catch (_) {}

  const chips = [
    '🎭 110+ hardware presets', '🌐 User-Agent + Client Hints parity',
    '🎨 Canvas & WebGL farbling', '🎵 Audio stack noise',
    '🌍 Timezone/locale parity', '🔒 WebRTC LAN shield',
    '⚡ Shortener turbo', '📰 Paywall defuser'
  ];
  const chipBox = document.getElementById('feature-chips');
  if (chipBox) {
    chipBox.textContent = '';
    chips.forEach(text => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.textContent = text;
      c.setAttribute('role', 'listitem');
      chipBox.appendChild(c);
    });
    chipBox.setAttribute('role', 'list');
  }

  btnFinish.addEventListener('click', () => {
    const apply = () => {
      try {
        chrome.storage.local.set({ deviceProfile: selectedId, onboarded: true }, () => {
          window.close();
          // fallback if window.close is blocked
          setTimeout(() => { if (!window.closed) window.location.href = 'options.html'; }, 300);
        });
      } catch (_) {
        window.close();
      }
    };
    try {
      if (masterOn.checked) chrome.storage.local.set({ masterEnabled: true, enabled: true }, apply);
      else apply();
    } catch (_) { apply(); }
  });

  btnStudio.addEventListener('click', () => {
    try {
      chrome.runtime.openOptionsPage();
      chrome.storage.local.set({ onboarded: true });
    } catch (_) {
      window.location.href = 'options.html';
    }
  });
});
