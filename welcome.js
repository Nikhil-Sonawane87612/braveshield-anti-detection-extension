document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('profile-grid');
  const btnFinish = document.getElementById('btn-finish');
  const btnStudio = document.getElementById('btn-open-studio');
  const masterOn = document.getElementById('master-on');

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
    for (const p of picks) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'profile-card' + (p.id === selectedId ? ' selected' : '');
      card.setAttribute('aria-pressed', p.id === selectedId ? 'true' : 'false');

      const name = document.createElement('div');
      name.className = 'pc-name';
      name.textContent = p.name;

      const meta = document.createElement('div');
      meta.className = 'pc-meta';
      meta.textContent = `${p.concurrency}-core • ${p.memory}GB • ${p.screen.width}×${p.screen.height}`;

      card.append(name, meta);
      card.addEventListener('click', () => { selectedId = p.id; render(); });
      grid.appendChild(card);
    }
  }
  render();

  chrome.storage.local.get(['deviceProfile'], (res) => {
    if (res.deviceProfile && picks.some(p => p.id === res.deviceProfile)) {
      selectedId = res.deviceProfile;
      render();
    } else if (res.deviceProfile) {
      // Existing users keep their configured identity
      selectedId = res.deviceProfile;
    }
  });

  const chips = [
    '🎭 110+ hardware presets', '🌐 User-Agent + Client Hints parity',
    '🎨 Canvas & WebGL farbling', '🎵 Audio stack noise',
    '🌍 Timezone/locale parity', '🔒 WebRTC LAN shield',
    '⚡ Shortener turbo', '📰 Paywall defuser'
  ];
  const chipBox = document.getElementById('feature-chips');
  for (const text of chips) {
    const c = document.createElement('span');
    c.className = 'chip';
    c.textContent = text;
    chipBox.appendChild(c);
  }

  btnFinish.addEventListener('click', () => {
    const apply = () => {
      chrome.storage.local.set({ deviceProfile: selectedId, onboarded: true }, () => {
        window.close();
      });
    };
    if (masterOn.checked) chrome.storage.local.set({ masterEnabled: true, enabled: true }, apply);
    else apply();
  });

  btnStudio.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    chrome.storage.local.set({ onboarded: true });
  });
});
