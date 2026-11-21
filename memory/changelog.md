# 📦 Semantic Version Changelog

## [v6.7.0] - 2026-11-16 (DevTools Detection Defuser)

### Module 1.8 — defeats the "Developer Tools Detected" pause overlay
Three independent signals, installed by inject.js at `document_start` (before any site script can read them), all live-gated on the new `devtoolsDefuseEnabled` key (default ON):

1. **Dimension clamp (`outerWidth` / `outerHeight`)** — the getters are re-wrapped around whatever the screen-normalization module installed earlier (both modules compose; each stays independently live-gated). The reported value is capped at `inner + 150` whenever `outer − inner > 150`, so:
   - real browser chrome (≈80–110px delta) passes through untouched,
   - a docked DevTools console (≈300–400px delta) can never cross the 160px `devtools-detect` threshold,
   - the **false positive normalization itself creates** is also killed: a 1920px profile `outerWidth` vs a 1400px real `innerWidth` is a 520px delta with nothing open at all — this was very likely the actual trigger on Animerulz.
   Wrapped getters go through `makeNative(..., 'get outerWidth', 0)` so `Function.prototype.toString` still reads native. Skips captcha hosts.
2. **`window.__devtoolsDetected` pinned to `false`** — a **non-configurable** accessor pair: the getter answers `false` while the module is enabled (falls through to the last written value when force-off), plain assignment lands in a swallowing setter, and the library's own `Object.defineProperty` redefinition fails outright.
3. **Event swallow** — `devtools-change` **and** `devtoolschange` (both spellings in the wild) are `stopImmediatePropagation`ed at **capture phase** on `window` + `document`, registered before any site listener can exist.

The debugger-statement timing vector was already dead: Module 1.4's 20ms timer coarsening caps `performance.now()` resolution.

### Wiring
- `devtoolsDefuseEnabled: true` added to: inject `BS_CONFIG` defaults (merge allowlist), `background.js` defaults seed, `content.js` `BS_SYNC_KEYS` + `BS_MATRIX_MODULES` + `BS_PROTECTED_OFF_KEYS` (protected sites force it off — zero behavioral touch there), `shared/import-sanitize.js` `BS_IMPORT_BOOLEANS`, options Defense-panel row (`#opt-devtoolsdef`) + matrix editor + restore + `storage.onChanged`, popup `BS_MODULE_KEYS` counter, mobile `bsGMGetAll` + `BS_DEFAULTS`.
- **Tests: 52/52 green** (+1: boolean-only acceptance — `true`/`false` pass, `'true'`/`1` dropped without poisoning the rest of the import).
- manifest.json + update.xml → **6.7.0** (CRX re-packed with the archived `keys/braveshield.pem` → extension ID stays `acdlacfmopkbpknfeajakplnjiiieemn`).

---

## [v6.6.0] - 2026-11-16 (Six-Feature Release: Extensible Resolver, Rotating Identity, Font Ensemble, Protected Sites, Auto-Pilot, Quick-Site Actions)

### ① Custom Resolver Rules — user-extensible bypass engine
- New `customResolvers` storage array (≤20 rules, shape-validated in `shared/import-sanitize.js`: pattern ≤200, value ≤300, action whitelist `click|redirect|turbo`, non-string value ⇒ rule dropped; missing value OK for turbo).
- `bsRuleHostMatch(pattern, host)` glob helper (top-scope inject.js): `example.com` = apex+subdomains, `*.example.com` = subdomains only, `*` = everywhere; scheme/path stripped.
- **click**: `sweepUnshortenLinks` now also runs click-rules — matched hosts auto-click the user's CSS selector once per element (`_bsRuleClicked` one-shot).
- **redirect**: `bsTryCustomRedirect` (via `bsOnConfigReady`) — a configured query param carrying an `http(s)` destination is decoded and `location.replace`d once; `sessionStorage` marker prevents bounce-back loops.
- **turbo**: `bsTurboFactor` treats matched hosts as 50x lockers (same tier as known shorteners).
- Options UI: rule builder row (pattern + action select + value) in the Bypass panel with toggle (▶/⏸) + delete tags; fully backup-compatible.

### ② Identity Rotation — background-owned, deterministic, coherent
- Rotation happens in **background.js** (it owns UA + DNR resolution — hardware, UA string and Sec-CH headers stay coherent end-to-end); `hardware-profiles.js` is DOM-free and now `importScripts`-safe in the worker.
- `bsStrSeed` (FNV-1a) + `bsRotationPeriodIndex(periodHours)` + `bsPickRotatedProfile`: **deterministic per window** (`periodIndex = floor(now / periodMs)`) — same window always yields the same profile, no churn across service-worker restarts; rotates ONLY within the same family prefix (win 45 / mac 20 / linux 10 / android 20 / ios 15).
- Skipped for `custom` profiles and never applied to per-site overrides (pinned identities stay pinned). `rotatedDeviceProfile` + `rotatedPeriodIndex` stored only on window rollover.
- `content.js` pushes `config.deviceProfile = rotatedDeviceProfile` BEFORE the override merge (override always wins); inject resolves hardware from it as usual.
- New alarm `BRAVESHIELD_IDENTITY_ROTATE` (20 min) re-resolves only when enabled; storage.onChanged triggers on `identityRotationEnabled`/`identityRotationPeriodHours`.
- Options UI: Identity Rotation switch + period input (1–720 h) in the Fingerprint panel.

### ③ Font Ensemble Spoofing — the missing font module
- Discovery: `fontEnumMaskingEnabled` had **no font hook at all** — only `measureText` width jitter seeded by text length, which is CONSTANT across fonts ⇒ cross-font width *ratios* still leaked the installed font list.
- New Module 1.6b in inject.js: realistic per-platform ensembles (win/mac/linux/android/ios sets), deterministic per-identity rotation+trim of the platform list (seed = platform|deviceProfile|browserType hash).
- `document.fonts.check` ensemble gate: true for ensemble members, **false for known-system-but-not-in-ensemble fonts**, passthrough for webfonts/generics (legit `@font-face` feature detection untouched).
- `window.queryLocalFonts` wrapper: rejects `NotAllowedError` without user activation (spec-correct), returns the ensemble on activation (real results filtered+deduped, synthetic PostScript-style entries if the native call fails).
- `measureText` jitter re-seeded per **(font, text)** — ratio leak closed.
- `queryLocalFonts` added to the Firefox/Safari identity strip (`BS_API_STRIP_WIN`) — Chromium-only API must not exist under those identities.

### ④ Protected Sites — zero-touch deny-list, full stealth
- `protectedSites` domain list (≤300, sanitized like whitelist).
- `content.js` computes `siteProtected` (never disabled by it — stealth stays armed), force-offs 20 BYPASS/behavior keys AFTER the matrix/override merge (even a per-site matrix cannot re-enable), pushes `config.siteProtected` to MAIN world.
- All 8 content-side bypass sweeps (anti-adblock annihilator, invisible-overlay purge, shell defuser, paywall defuser, fast-pass buttons, countdown fast-forward, fast-image click, consent dismissal) now guard on `bsGate.protected`.
- inject.js side: `bsTurboAllowed` hard-off (kills short-timer 1.9x too), `bsTurboFactor` → 1, unshortener sweep off.
- Options UI: Protected Sites section in the Sync panel (🛡 tags, 🛡-crimson add button).

### ⑤ Reels & Shorts Auto-Pilot — real controls
- `reelDwellSeconds` (0–10, default 1): minimum seconds on a reel before auto-advance.
- `reelMaxAutoSeconds` (0 = unlimited, default 0): auto-advance budget — the clock starts at the FIRST fired advance, manual watching never consumes it.
- Wired into `bsReelKit.bindLoopAdvance` (both timeupdate loop-boundary and `ended` paths).
- Options UI: two number inputs in the Streaming panel next to Shorts Auto-Scroll.

### ⑥ Popup Quick-Site Actions
- Popup footer: **🔗 Copy clean URL** (active tab URL, `BS_TRACKING_PARAMS` stripped, clipboard + tooltip feedback) and **🧩 Edit this site's matrix** (deep-link `options.html#bs-edit-site=<host>` → options preselects/scrolls to the matrix editor, prefills the Add-Override row for unpinned sites; hash cleared after use).
- `BS_MODULE_KEYS` += `fontEnsembleEnabled`, `identityRotationEnabled` (popup module counter updated).

### Infra
- `build-mobile-full.mjs`: `bsGMGetAll` keys + `BS_DEFAULTS` += new keys (font ensemble, auto-pilot, resolvers, siteProtected/siteOverrideActive); userscript regenerated (312,294 B), syntax-clean, all new modules verified inside the slice.
- **Tests: 51/51 green** (was 47): +4 cases for feature booleans, range-clamped numbers, protectedSites sanitize/cap, customResolvers shape rules (caps, truncation, malformed drop, non-string value rejection).
- manifest.json + update.xml → **6.6.0**; README refreshed (v6.6.0 feature table, CRX install path, updated architecture tree).

---

## [v6.5.0] - 2026-11-02 (Roadmap Execution Day — 10/10 Items + Auto-Scroll Hotfix)

### Phase 1 — inject.js quick wins
- **Visibility-gated turbo (item 5)**: ordinary-site 4x/50x acceleration stops when `document.visibilityState === 'hidden'` (factor 1 = original delay); shorteners/lockers, wait-pages and Turbo-All-Sites stay boosted (those countdowns never run hidden). Short-timer 1.9x path gated too. `bsWaitCache` invalidated when a tab becomes visible again.
- **`Object.prototype.stack` shadow hardening (item 4)**: `DOMException` joins the wrapped-error roster (Chromium instances always carry `.stack`); every wrapped class now guarantees an own cleaned `stack`, so a CreepJS-style prototype `stack` poison can never leak `chrome-extension://` frames.

### Phase 2 — Mobile identity model parity
- **`Sec-CH-UA-Model` live (item 2)**: new shared `bsDeriveUaModel()` derives the device model FROM the UA string itself (Android 3rd parenthesis component, iOS/iPadOS family) — header/UA coherence by construction, zero per-entry data drift. Empty model ⇒ the DNR layer REMOVES the header (desktop, Android "K" withholding, Firefox mobile are all header-less in real Chrome).
- background.js: mobile + real model → SET; otherwise REMOVE. inject.js `getHighEntropyValues` serves the same derived model (was hard-coded `''`).

### Phase 3 — Mobile userscript pipeline
- `build-mobile-full.mjs` ships `shared/ua-resolve.js` verbatim — the stale 30-line inline resolver (old iPad→Mac Safari bug, old brand logic) is deleted.
- UA catalog = real `useragents.js` (was 6 hardcoded `chrome_131_*` entries).
- Shim: 8 missing booleans added to `bsGMGetAll()` + `BS_DEFAULTS`; `bsFindSiteOverride` now honors modules-only per-site overrides.
- `build-mobile.mjs` stale dead snippet pruned. Artifact regenerated (293,877 B), syntax-clean, feature-verified.

### Phase 4 — UX & panels
- **Whitelist toggle (item 3)**: verified already-working (`storage.onChanged → pushConfigToMainWorld()`); no code change needed.
- **Brave-Detection Defense panel (item 7)**: new options panel + nav entry with GPC cloak switch (default ON, new `gpcCloakEnabled` — defaults, import allowlist, module counters) and status rows for always-on core probes, identity API trim, Brave-phrase defuser.
- **GPC → Chrome-truth**: probe now returns `undefined` (real Chrome/Firefox don't implement the property; a `false` answer was itself a "something is faking here" hit), re-evaluated per read — toggles apply live.
- **Sites manager (item 9)**: override tags show type badges (`identity` / `matrix Nm` / `full Nm`), 🧩 button jumps straight into the per-site matrix editor, delete re-syncs the picker, modules-only overrides documented in the editor hint.
- **Weekly trend (item 8)**: `timeSavedDaily` buckets (YYYY-MM-DD, pruned to 30 days) recorded in the telemetry incrementor; popup renders a real 7-bar chart + "≈Ns this week", live-refreshing, hidden until data exists.

### Phase 5 — Structural defuser & test lockdown
- **Structural Shell Defuser (item 6)**: second blanket-blocker pass `bsNeutralizeBlockingShells()` — fixed-position, ≥92%×≥92% viewport, z≥999, text-bearing, NO click affordance, no consent wording, persisting ≥8 s (WeakMap dwell) → defused + `trapsNeutralized`. Captcha/auth hosts, JSON pages and no-automation hosts stay zero-touch. New `domStructureDefuserEnabled` (default ON) across gates, matrix editor, import allowlist, options row and popup module count.
- **Extraction (item 10)**: `bsSanitizeImport` → `shared/import-sanitize.js` (pure, module.exports; the modules-matrix allowlist is INJECTED by options.js — no third copy of the key list; `deviceProfile`'s documented 64-cap is now actually enforced); DNR rule builders + rule-ID layout + captcha exclusion lists → `shared/dnr-rules.js` (`importScripts` in background.js).
- **Tests: 47/47 green** (was 25): new `tests/import-sanitize.test.mjs` (hostile inputs, prototype-pollution keys, type/length/clamp/cap enforcement, matrix injection failure-safe behavior) and `tests/dnr-rules.test.mjs` (rule-ID layout, Chrome header parity incl. Model set/remove truth, Firefox full CH removal, captcha-exclusion merge invariant, locale format + rejection), plus 6 new ua-resolve cases (catalog-key edges, version pick, hostile model inputs, re-base parity).

### Bonus hotfix — Reels & Shorts auto-scroll (user report: "doesn't work")
- **Root cause 1 (Shorts)**: next-pick searched the *first* sibling ≠ current ≡ the short ABOVE — the module bounced between the topmost shorts instead of advancing. Now: YT's own `#navigation-button-down` chevron → synthetic ArrowDown (native Shorts key nav) → DOM-order next renderer via `is-active`/on-screen detection; last short respected.
- **Root cause 2 (IG Reels)**: auto-scroll was gated on `bsOn('youtubeAds')` — the *YouTube* master silently killed IG auto-scroll when that toggle was off. Now gated only by its own opt-in. Advance order: IG next-chevron (aria-label `Next…` with svg) → ArrowDown → existing `bsNextReel()` scroll math.
- **Root cause 3 (both)**: reels and shorts auto-REPLAY — the `ended` event essentially never fires and the old near-end poll juggling double-fired. New shared `bsReelKit`: per-video `timeupdate` loop-boundary binding (tail→top jump = "finished"), `ended` fallback, 1.5 s global advance debounce, live gate re-check at fire time.
- **Layer 2 (IG report after first attempt still "not working")**: the ArrowDown was fired on `document.activeElement`/`document` — on a React app events fired *there* never descend into the app tree, so IG's delegated handlers saw nothing; also the `KeyboardEvent` init dict IGNORES `keyCode`/`which` (stayed 0). Fix: `(bsReelKit.key)` now dispatches at the reel's `<video>` (bubbled through React root container → document → window), with `keyCode`/`which` defined to 40; IG advance is a verified cascade — chevron → deep key → (700 ms receipt check: same reel still connected?) → deep wheel → container-scroll fallback. YT deep-key dispatch upgraded the same way. Fresh Event object per dispatch (a poisoned reused event can kill the second hop via stopPropagation).

---

## [v6.4.0] - 2026-11-01 (Stealth Repair Wave & Brave-Detection Suite)

### 🩹 Core Engine Repairs (inject.js — MAIN world)
- **Dead Modules C/D/E revived**: all three referenced Module-1's private `bsHardware` closed over inside a sibling IIFE → `ReferenceError`, silently disabling matchMedia coherence, `performance.memory`/`storage.estimate` parity, and Worker cloak parity. Hardware baseline hoisted via `bsGetHardwareSafe()` with a static fallback.
- **Module C (matchMedia)** rewritten: real min/max resolution & device-pixel-ratio parsing, `pointer: fine/coarse` and `hover: hover/none` splits — the old version collapsed every hover query to "isMobile".
- **Module D values made realistic**: Chromium envelope heap limit (1 G / 2.17 G / 4.29 G by RAM tier), ~278 GiB storage quota with plausible usage breakdown (old stubs emitted used>limit, an instant tell).
- **Module E (Worker parity)**: async wrapper previously returned a Promise from `new Worker()` — breaking every postMessage-too-early site. Blob sources now read via synchronous XHR so the constructor stays synchronous; install is config-gated through `bsOnConfigReady` (the old document_start gate ran before the config ever arrived — module was doubly dead).
- **`navigator.bluetooth`/`usb`/`hid`/`serial` cloak fixed**: `getAvailability()` now resolves `false` (boolean) — the old `{ value: false }` object was TRUTHY and advertised devices as available. Same accessors now cover `keyboard.getLayoutMap` and `xr.isSessionSupported`.

### 🛡️ Detection-Leak Closures (stealth parity)
- Every previously bare getter is now `makeNative`-wrapped (`navigator.brave`, `webdriver`, UA-CH `platform`/`brands`, per-key `screen` instance getters, all `chrome.*` stub methods) — `descriptor.get.toString()` probes return `[native code]`.
- 8 built-in Error constructors wrapped: own-instance `stack` (V8 installs it as an own property, so prototype accessors never fired) gets cleaned; `new.target` handled so `class E extends Error` keeps `instanceof E`.
- `chrome.runtime.sendMessage`/`connect` stubs added — their absence on real Chrome pages is a first-order tell.
- `maxTouchPoints` now platform-aware (5 mobile / 0 desktop); `globalPrivacyControl` forced false when masked.
- Chromium-only APIs (`bluetooth/usb/hid/serial/keyboard/virtualKeyboard/ink/xr`, `SpeechRecognition`) stripped under Firefox/Safari identities with full restore support; iPhone/iPad UA-CH platform now reports `iOS`.

### 🌐 DNR / Header Parity (background.js)
- **`Sec-CH-UA-Full-Version-List` + `Sec-CH-UA-Platform-Version` now SET for chrome-like identities** (built from the resolved catalog brands/platformVersion) — real Chrome always sends them; a missing header was detectable. Firefox/Safari identities REMOVE all 7 Client Hint headers instead of just 4.
- **`Accept-Language` parity**: `spoofLocale` now drives a DNR set-header rule (`loc,loc-base;q=0.8,en;q=0.7`), re-applied on every storage change.
- Duplicate `chrome.runtime.onInstalled` listeners merged (defaults + context-menu tree + alarms in one).

### 🧶 Feature/UI Fixes
- **Turbo factor wired**: `turboAllSites` previously did nothing. Lockers/shorteners + wait-page heuristic (2.5 s cached innerText sweep) get 50×, ordinary sites a safe 4×, short timers keep 1.9× gentle turbo.
- **YouTube ad restore**: playbackRate/mute are reset after the ad passes (the 16× rate used to leak into the real video).
- **Right-click enabler moved to capture phase** (bubble-phase listeners lose to handlers that ran first). `copy`/`cut` deliberately NOT neutralized — breaking legitimate clipboardData writers; `selectstart`/`dragstart` only.
- **Plugin mock parity**: named lookups (`navigator.plugins['PDF Viewer']`, `[type]['application/pdf']`), index-based `item()`, and MIME `enabledPlugin` back-links.
- **UA resolver**: iPad profiles under a Safari identity now use the iPad template instead of silently falling back to Mac.

### 🧱 Defuser Suite (content.js)
- **Brave-detection modal phrases** added to the annihilator regex ("disable Brave Shields", "switch to Chrome", "use Chrome to continue", "we detected Brave", "shields detected", …).
- Trap scanner/MutationObserver lifetime extended 60 s → 150 s (lazy-injected SPA lockers landed outside the old window).

### 🗄️ Settings & Data Integrity
- **Backup restore no longer drops data**: 8 missing boolean keys added to the import allowlist and **per-site `modules` matrices are now preserved & validated** on restore (validated against the matrix catalog; modules-only overrides kept).
- `minimum_chrome_version: 121` pinned (UA-CH Full-Version-List DNR support), version bumped 6.3.0 → 6.4.0.

---

## [v6.2.1] - 2026-08-25 (Encoding Hotfix)

### 🩹 Fixes
- **Mojibake repair**: two PowerShell 5.1 text round-trips had double-encoded non-ASCII text in `options.html` (stat glyphs ⏱️🛡️⚡🔄, title, ± symbols, icons) and `content.js` comments; all restored byte-exact.
- Stray UTF-8 BOMs stripped from `options.html`, `content.js`, `useragents.js`.
- **Regression guard**: `scripts/check-mojibake.cjs` now fails CI and the packager on any double-encoded text or BOM, so corrupted files can never ship again.

---

## [v6.2.0] - 2026-08-25 (Stealth Consistency, Onboarding & Release Automation)

### 🛡️ Fingerprint Consistency Closes
- **Speech voices ↔ locale sync**: `speechSynthesis.getVoices()` now derives its primary voice from the spoofed locale instead of a hardcoded en-US trio.
- **WebGL `readPixels` farbling**: GPU pixel-readback hashes get deterministic ±1 sampling with a per-buffer stability cache — repeated reads stay identical instead of compounding.
- **AnalyserNode time-domain noise**: `getFloatTimeDomainData` / `getByteTimeDomainData` join their frequency siblings under fresh multiplicative variance.

### 🧭 Onboarding & Studio UX
- **First-run welcome wizard**: guided identity picker (5 curated hardware presets), module overview chips, master-switch confirmation; replayable via the Options "Tour" button.
- **Settings search**: live filtering across all option rows from the nav rail with match count.

### 🔧 Engineering & Release Automation
- **GitHub Actions**: `ci.yml` validates syntax, manifests/rulesets, BOM hygiene and runs a node:test suite for shared helpers on every push/PR; `release.yml` builds the ZIP via `build.ps1` and publishes the GitHub Release automatically on `v*` tags.
- 11-test suite covering `bsDomainMatches`/`bsIsCaptchaHost` edge cases (lookalike rejection, path specials).

---

## [v6.1.0] - 2026-08-25 (Kill-Switch Architecture, Stealth Parity & Release Engineering)

### 🔧 Kill-Switch & Reliability Overhaul
- **Live Config Bridge**: inject.js hooks now consult a mutable `BS_CONFIG` at call-time; content.js pushes effective per-site config through a validated postMessage channel the instant storage loads or changes. Master kill switch, whitelisting and every module toggle apply **without page reload**, and disabled sites are never spoofed even on first paint (previous race: sessionStorage mirror vs document_start).
- **Hardware presets actually work now**: `hardware-profiles.js` added to MAIN-world content_scripts — the 110+ catalog was previously undefined in the page world, so only custom profiles ever applied.
- Canvas noise re-encoded from perturbed offscreen copies (source canvas untouched; noise no longer compounds per call). AudioBuffer noise uses cached copies; analyser arrays use fresh multiplicative variance.
- deviceMemory spoof clamped to the 8 GB spec maximum.

### 🛡️ New Stealth Vectors
- **User-Agent string spoofing** wired to hardware profiles via the previously-dead `useragents.js` (60 KB): background resolves profile → newest matching Chrome UA, re-based onto the REAL engine major, applied to both request headers (DNR session rules incl. Sec-CH-UA) and JS APIs.
- **Timezone & locale parity** (opt-in): `getTimezoneOffset`, `Intl.resolvedOptions`, `Date.toString` GMT rendering and `navigator.languages` all align with the selected IANA zone.
- **WebGPU adapter masking**: `adapter.info` vendor/architecture/device/description normalized.
- **Canvas measureText farbling**: deterministic width variance defeats font enumeration.
- **50x timer turbo scoped to shortener hosts** with explicit all-sites opt-in (was globally breaking site timers).

### 🧹 Cleanup & Compliance
- Removed dead `settings.js` (conflicting defaults), stale hardcoded version strings everywhere.
- Local-first sync: runtime GitHub rule-fetching removed (CWS remote-hosted-code policy); update checker is notify-only.
- Security: cross-world postMessage validation (`e.source`), stat allowlist + delta clamps, XSS-proof direct-link HUD (DOM API construction), schema-validated backup import, domain-validated whitelist rendering.

### 🚀 Features & UX
- Live fingerprint self-audit panel (real in-page probes with pass/fail).
- Context menu (site whitelist toggle, copy cleaned URL), Alt+Shift+B master shortcut, per-tab badge states (armed/WL/OFF).
- Popup: working sync button, honest counters only, armed-module counter, dynamic version pill. Options: sticky section nav, factory reset, reduced-motion support.
- `build.ps1` release packager → root-level load-ready ZIPs (fixes nested-folder ZIP import failures); dev manifest drops `update_url`.

---

## [v6.0.1] - 2026-08-18 (Stitch Cyber-Dark UI & Dual Auto-Updater Release)

### 🎨 Stitch Cyber-Dark Design System & HUD Overhaul
- **Modern Security Dashboard Aesthetics**: Deep Obsidian Slate (`#0B0F17` / `#111827`) with glass surfaces (`rgba(22, 30, 46, 0.75)` + `backdrop-filter: blur(12px)`).
- **60 FPS Motion & Haptic Switches**: Smooth CSS transition curves (`cubic-bezier(0.4, 0, 0.2, 1)`) with glowing neon indicator states.
- **Pulsing Shield Status Matrix**: Real-time visual indicator animating between "100% STEALTH" (Emerald), "BYPASSED" (Amber), and "OFFLINE" (Crimson).
- **Live 2x2 Telemetry Counter Grid**: Smooth `requestAnimationFrame` animated counters for Canvas, Audio, WebGL, and WebRTC mitigation probes.
- **Instant Domain Whitelist Pill**: 1-Click bypass toggle with instant active tab domain resolution.

### 🔄 Dual Auto-Updater Engine
- **Native CRX Auto-Update Protocol**: Implemented `update.xml` compliant with Chrome Extension autoupdate specification (`gupdate protocol 2.0`) and linked via `manifest.json` `update_url`.
- **Background Release Checker**: Automated periodic GitHub release version checks with popup update alert ribbon.

---

## [v6.0.0] - 2026-08-18 (CreepJS & BrowserLeaks Evasion Pack)

### 🛡️ Prototype & Lie Detection Hardening
- **Reflect.apply & Reflect.construct Transparency**: Intercepted deep proxy traps to pass advanced JavaScript prototype validation checks without illegal invocation errors.
- **Error Stack Extension Masking**: Sanitized `Error.prototype.stack` and `Error.captureStackTrace` to strip internal extension URLs (`chrome-extension://...`) from error inspection traces.

### ⏱️ Side-Channel & Timing Protections
- **High-Resolution Timer Coarsening**: Clamped `performance.now()`, `Date.now()`, and `Event.prototype.timeStamp` to 20ms resolution, destroying micro-architectural CPU cache benchmarking and Spectre probes.

### 🖥️ Geometry, Font & Screen Normalization
- **DOM Rect Micro-Jitter**: Deterministic `±0.001px` sub-pixel noise on `Element.prototype.getBoundingClientRect` to defeat font measurement fingerprinting.
- **Screen & Monitor Masking**: Strictly normalized `window.screen` (`width`, `height`, `availWidth`, `availHeight`, `colorDepth`, `pixelDepth`), `window.devicePixelRatio`, `outerWidth`, and `outerHeight` to conform to selected hardware profile dimensions.

### 🔒 Network & Media Privacy
- **WebRTC Deep Shield**: Set `chrome.privacy.network.webRTCIPHandlingPolicy` to `disable_non_proxied_udp` and filtered SDP candidates on `createOffer`, `createAnswer`, and `setLocalDescription`.
- **Media Devices & Voices Sanitization**: Standardized `navigator.mediaDevices.enumerateDevices` and `speechSynthesis.getVoices`.

---

## [v5.6.0] - 2026-08-18 (Milestone Hardening Release)

### 🛡️ Core Anti-Fingerprinting & Stealth
- **Unforgeable `makeNative` Architecture**: Hardened `Function.prototype.toString` proxying with private `WeakMap` tracking.
- **Session-Seeded Canvas Noise**: Non-destructive `±1` RGB bit shifts on `toDataURL`, `toBlob`, and `getImageData`.
- **High-Precision Audio Noise**: `±1e-7` statistical float variance into `AnalyserNode`, `AudioBuffer`, and `OfflineAudioContext`.
- **Comprehensive WebGL & WebGL2 Spoofing**: Masked `UNMASKED_VENDOR_WEBGL`, `UNMASKED_RENDERER_WEBGL`, and shader precision formats.
- **Client Hints (UA-CH) Consistency**: Synchronized `navigator.userAgentData` and `getHighEntropyValues()`.

### 🎛️ User Interface & Control
- **Modernized Popup Cockpit**: Dedicated switches for Canvas Noise, Audio Stack Variance, WebGL Spoofing, UA-CH Parity, DOM Jitter, and WebRTC Shielding.
- **One-Click Whitelist Engine**: Instant per-domain bypass toggle with real-time UI indicator.
