# 📌 Project State

## 🚀 Active Release Target: `v6.1.0` (Kill-Switch Architecture, Stealth Parity & Release Engineering)
- **Branch**: `main`
- **Execution Stage**: Shipped — live config bridge, UA/timezone/WebGPU parity, local-first sync, audit panel, build.ps1 packaging
- **Compliance**: Chrome Extension Manifest V3 (`world: "MAIN"`, `run_at: "document_start"`), CWS remote-hosted-code safe

---

## 📂 Active Core Files
- `manifest.json`: Manifest V3 declarative configuration, declarativeNetRequest ruleset, MAIN world injection (hardware-profiles + shared constants), commands, contextMenus.
- `update.xml`: Chrome Extension autoupdate XML for packed CRX installs (injected by build.ps1 -WithUpdateUrl).
- `shared/constants.js`: Captcha/shortener host suffix lists, tracking params, domain-match helpers loaded in BOTH worlds and pages.
- `inject.js`: MAIN execution world; every hook consults the live BS_CONFIG bridge at call-time (no reloads needed).
- `content.js`: ISOLATED world LIVE config bridge (postMessage), HUD with DOM-API construction, DOM modal/button defenses.
- `background.js`: Service worker managing defaults, WebRTC policy, per-profile UA resolution (useragents.js) via DNR session rules, notify-only update checker, context menus, commands, tab badges.
- `hardware-profiles.js`: 110+ presets catalog, loaded in MAIN world.
- `useragents.js`: UA database powering per-profile User-Agent spoofing.
- `rules.json`: Static DeclarativeNetRequest tracking-parameter stripper.
- `build.ps1`: Release packager producing root-level load-ready ZIPs.
- `popup.*` / `options.*`: Cyber-Dark HUD & Control Studio (honest counters, audit panel, nav rail).

---

## 📋 Task Backlog & Status
- [x] Batch A: shared constants, kill-switch live bridge, security hardening, popup fixes
- [x] Batch B: build.ps1, manifest update_url handling, settings.js removal, README import guide
- [x] Batch C: UA spoofing, timezone/locale parity, WebGPU masking + measureText farbling, turbo scoping
- [x] Batch D: local-first sync, fingerprint self-audit, context menu/shortcut/badges, options UX polish

### Next candidates (not started)
- [ ] Per-site profile overrides UI
- [ ] Weekly stats sparkline in options
- [ ] Onboarding first-run page
