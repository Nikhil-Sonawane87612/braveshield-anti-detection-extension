# 📌 Project State

## 🚀 Active Release Target: `v6.7.0` (DevTools Detection Defuser, 2026-11-16)
- **Branch**: `main`
- **Execution Stage (v6.7.0)**: new Module 1.8 in inject.js defeats the "Developer Tools Detected" pause overlay (Animerulz) with three signals — ① outerWidth/outerHeight clamp (cap `outer − inner` at 150px, wrapping the screen-normalization getters so both compose; also kills the 520px false positive normalization itself creates), ② non-configurable `__devtoolsDetected` pin (getter → false, setter swallowed, site `defineProperty` fails), ③ capture-phase swallow of `devtools-change` + `devtoolschange` on window + document. Key `devtoolsDefuseEnabled` default ON wired through inject BS_CONFIG, background defaults seed, content BS_SYNC_KEYS + matrix + protected-off, import-sanitize BOOLEANS, options Defense-panel row (`#opt-devtoolsdef`) + matrix + restore + onChanged, popup BS_MODULE_KEYS, mobile `bsGMGetAll` + `BS_DEFAULTS`. **52/52 tests green**, mobile userscript regenerated (316,437 B), manifest + update.xml → 6.7.0, README v6.7.0 section. CRX re-packed with archived `keys/braveshield.pem` → extension ID stays **`acdlacfmopkbpknfeajakplnjiiieemn`**.

### Previous: `v6.6.0` (Six-Feature Release, 2026-11-16) — SHIPPED
- **Execution Stage (v6.6.0)**: all six user-picked features shipped — ① Custom Resolver Rules (click/redirect/turbo, `bsRuleHostMatch` glob, sanitized `customResolvers`), ② Identity Rotation (background-owned, deterministic per period, family-coherent, override-pinned, `BRAVESHIELD_IDENTITY_ROTATE` 20-min alarm), ③ Font Ensemble Spoofing (per-platform realistic font sets, `document.fonts.check` gate, `queryLocalFonts` ensemble wrapper + Firefox/Safari strip, per-(font,text) measureText seeding closing the ratio leak), ④ Protected Sites (deny-list, 20 bypass keys force-off after matrix merge, stealth armed, all content sweeps + inject turbo gated), ⑤ Reels/Shorts Auto-Pilot (`reelDwellSeconds` 0–10 + `reelMaxAutoSeconds` 0=unlimited budget clock), ⑥ Popup Quick-Site Actions (🔗 copy clean URL, 🧩 edit-site matrix deep-link with hash-jump preselect). **51/51 tests green**, mobile userscript regenerated (312,294 B), manifest + update.xml → 6.6.0, README refreshed.
- **Release process (2026-11-16, user-approved git)**: ✅ DONE — 11 single-purpose commits pushed to `main` (existing credentials only), GitHub Release [`v6.6.0`](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/tag/v6.6.0) published with `BraveShield-v6.6.0.zip` (164,960 B) + signed `braveshield.crx` (165,812 B, Edge packer) + `braveshield-mobile.user.js` (322,686 B). CRX re-signed with a fresh key → extension ID **`acdlacfmopkbpknfeajakplnjiiieemn`**; `update.xml` appid updated to match and verified live (raw update feed serves 6.6.0; `releases/latest/download/braveshield.crx` returns HTTP 200). Signing key archived at `keys/braveshield.pem` (gitignored — NEVER commit or ship).
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
