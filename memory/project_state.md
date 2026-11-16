# 📌 Project State

## 🚀 Active Release Target: `v6.6.0` (Six-Feature Release, 2026-11-16)
- **Branch**: `main`
- **Execution Stage (v6.6.0)**: all six user-picked features shipped — ① Custom Resolver Rules (click/redirect/turbo, `bsRuleHostMatch` glob, sanitized `customResolvers`), ② Identity Rotation (background-owned, deterministic per period, family-coherent, override-pinned, `BRAVESHIELD_IDENTITY_ROTATE` 20-min alarm), ③ Font Ensemble Spoofing (per-platform realistic font sets, `document.fonts.check` gate, `queryLocalFonts` ensemble wrapper + Firefox/Safari strip, per-(font,text) measureText seeding closing the ratio leak), ④ Protected Sites (deny-list, 20 bypass keys force-off after matrix merge, stealth armed, all content sweeps + inject turbo gated), ⑤ Reels/Shorts Auto-Pilot (`reelDwellSeconds` 0–10 + `reelMaxAutoSeconds` 0=unlimited budget clock), ⑥ Popup Quick-Site Actions (🔗 copy clean URL, 🧩 edit-site matrix deep-link with hash-jump preselect). **51/51 tests green**, mobile userscript regenerated (312,294 B), manifest + update.xml → 6.6.0, README refreshed.
- **Release process (2026-11-16, user-approved git)**: single-purpose commits → push to `main` (existing credentials only, no automation-abuse patterns) → GitHub Release `v6.6.0` with `BraveShield-v6.6.0.zip` + signed `braveshield.crx`.
- **Compliance**: Chrome Extension Manifest V3 (`world: "MAIN"`, `run_at: "document_start"`), CWS remote-hosted-code safe

---

## 🔮 NEXT SESSION CANDIDATES
1. **Manual smoke list (user device)**: bot.sannysoft.com, CreepJS (error/worker vectors), pixelsscan.net, browserleaks.com/canvas, a live shortener (turbo), a known Brave-blocker site (structural defuser), IG Reels + YT Shorts auto-scroll on-device, import→export roundtrip in Options.
2. **DNR override rule-id audit**: if per-site overrides ever exceed 499, re-check collision math vs the locale slot (base 424242, locale 424242+900); add a dedicated test if caps change.
3. **Panel polish**: `panel-bravedefense` could later host the worker-cloak control (`workerParityEnabled`, currently in Fingerprint panel).

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
