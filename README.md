<div align="center">

<img src="icons/icon128.png" alt="BraveShield Bypass Pro Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 240, 118, 0.35);" />

# 🛡️ BraveShield Bypass Pro — Enterprise Anti-Fingerprinting Suite
### Manifest V3 Stealth Engine • CreepJS & BrowserLeaks Evasion • Multi-Device Hardware Spoofer

[![Version](https://img.shields.io/badge/version-v6.7.0-00f076?style=for-the-badge&logo=semver&logoColor=black)](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/latest)
[![Manifest](https://img.shields.io/badge/manifest-v3-10b981?style=for-the-badge&logo=googlechrome&logoColor=white)](#-desktop-installation)
[![CreepJS Evasion](https://img.shields.io/badge/CreepJS-A%2B%20Evasion-8b5cf6?style=for-the-badge&logo=shield&logoColor=white)](#-the-creepjs--browserleaks-evasion-pack)
[![Hardware Presets](https://img.shields.io/badge/Hardware%20Profiles-110%2B%20Presets-3b82f6?style=for-the-badge&logo=nvidia&logoColor=white)](#-multi-device-hardware-studio)
[![Privacy Grade](https://img.shields.io/badge/Privacy%20Grade-100%25%20A%2B-00f076?style=for-the-badge&logo=safari&logoColor=black)](#-live-privacy-audit-score)

<p align="center">
  <b>The enterprise-grade anti-fingerprinting and stealth engine compliant with Manifest V3.</b><br>
  Neutralize CreepJS, BrowserLeaks, and anti-bot heuristic detectors. Run with maximum Brave Shields strength while presenting a 100% authentic Google Chrome hardware profile, session-seeded canvas/audio mathematical noise, 20ms timer coarsening, WebRTC IP shielding, and unshortening automation.
</p>

[📥 Download Extension (.ZIP)](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/latest) • [📱 Android Userscript (`.user.js`)](braveshield-android.user.js) • [🛡️ AdGuard Filters (`rules.txt`)](filters/rules.txt) • [📖 Architecture Docs](memory/architecture.md)

---

</div>

## 📖 About The Project

Modern websites, streaming platforms, and bot-detection engines (Cloudflare, DataDome, Akamai, PerimeterX, CreepJS) utilize sophisticated fingerprinting heuristics:
1. **Prototype Inspection & Lie Detection**: Testing whether native methods have been wrapped or proxied via `Function.prototype.toString`, `Reflect.apply`, or invalid receiver invocations.
2. **Error Stack Analysis**: Checking `Error.prototype.stack` to uncover internal `chrome-extension://` or script URLs.
3. **Canvas & Audio Fingerprinting**: Rendering hidden 2D/WebGL scenes and synthesizing audio signals to compute cross-origin hardware hashes.
4. **Side-Channel Timing Probes**: Running sub-millisecond `performance.now()` loops to benchmark CPU caches (Spectre).
5. **Client Hints Mismatches**: Checking discrepancies between `navigator.userAgent` and `navigator.userAgentData.getHighEntropyValues()`.
6. **WebRTC Private IP Leaks**: Probing STUN/TURN servers to discover internal LAN IPs behind VPNs.

**BraveShield Bypass Pro v6.7.0** solves this comprehensively by injecting an unforgeable, mathematically robust stealth layer directly at `document_start` in the `MAIN` execution world.

---

## ✨ Architectural Highlights (v6.0.0)

```mermaid
graph TD
    A[Webpage / Anti-Bot Script] --> B[MAIN Execution Realm document_start]
    B --> C[Unforgeable makeNative Proxy & WeakMap Registry]
    C --> D[Reflect.apply & construct Transparency]
    C --> E[Error Stack Extension Masking]
    B --> F[Session-Seeded PRNG Mulberry32]
    F --> G[Non-Destructive Canvas ±1 RGB Bit Shift]
    F --> H[High-Precision Audio ±1e-7 Float Variance]
    F --> I[DOM Measurement Micro-Jitter ±0.001px]
    B --> J[20ms High-Res Timer Coarsening Spectre Defense]
    B --> K[Screen & Geometry Normalization Profile Engine]
    B --> L[WebGL / WebGPU Vendor & Shader Precision Masking]
    B --> M[Client Hints UA-CH getHighEntropyValues Sync]
    B --> N[WebRTC LAN IP Shield disable_non_proxied_udp]
    C --> O[100% Clean CreepJS / BrowserLeaks Audit Score]
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
```

---

## 🛡️ Core Stealth & Anti-Fingerprinting Pillars

### 1. Unforgeable Native Function Proxies (`makeNative`)
- Wraps overridden prototypes with `WeakMap`-backed tracking.
- `Function.prototype.toString.call(fn)` returns genuine `function [name]() { [native code] }`.
- `toString.toString()` returns `function toString() { [native code] }`.
- Transparent `Reflect.apply` and `Reflect.construct` forwarding ensures deep JavaScript reflection validation passes with zero illegal invocation errors.
- Sanitizes `Error.prototype.stack` and `Error.captureStackTrace` to strip internal extension URLs.

### 2. Session-Seeded Mathematical Noise (Non-Destructive)
- **Canvas Noise**: Injects non-destructive `±1` RGB sub-pixel bit shifts into `HTMLCanvasElement.prototype.toDataURL`, `toBlob`, and `CanvasRenderingContext2D.prototype.getImageData`. Human-visible images and CAPTCHAs render with zero flaws while cross-session hashes differ.
- **Audio Stack Variance**: Injects sub-audible `±1e-7` statistical float variance into `AnalyserNode`, `AudioBuffer`, and `OfflineAudioContext`.

### 3. Screen, Font, & Geometry Normalization
- **DOM Rect Micro-Jitter**: Injects `±0.001px` deterministic sub-pixel noise into `Element.prototype.getBoundingClientRect` to defeat font measurement tracking.
- **Screen Masking**: Standardizes `window.screen` (`width`, `height`, `availWidth`, `availHeight`, `colorDepth`, `pixelDepth`), `window.devicePixelRatio`, `outerWidth`, and `outerHeight` to match the selected active hardware profile.

### 4. High-Resolution Timing & Side-Channel Defense
- Clamps `performance.now()`, `Date.now()`, and `Event.prototype.timeStamp` to **20ms coarsened resolution**, destroying CPU cache benchmarking and Spectre timing probes.

### 5. WebGL, WebGPU, & Client Hints (UA-CH) Parity
- Masks `UNMASKED_VENDOR_WEBGL` (`0x9245`), `UNMASKED_RENDERER_WEBGL` (`0x9246`), `VENDOR`, `RENDERER`, `WEBGL_debug_renderer_info`, and `getShaderPrecisionFormat`.
- Fully synchronizes `navigator.userAgentData.brands`, `platform`, and `getHighEntropyValues(['architecture', 'bitness', 'model', 'platform', 'platformVersion', 'fullVersionList', 'wow64'])`.

### 6. WebRTC Deep Shield & Media Sanitization
- Enforces `chrome.privacy.network.webRTCIPHandlingPolicy` (`disable_non_proxied_udp`) in service worker.
- Filters private LAN candidates (`192.168.x.x`, `10.x.x.x`, `172.16.x.x`, `.local`) in SDP offers and answers.
- Standardizes virtual hardware arrays on `navigator.mediaDevices.enumerateDevices()` and voices on `speechSynthesis.getVoices()`.

### 7. DeclarativeNetRequest Tracking Query Parameter Stripper
- Automatically strips `utm_*`, `fbclid`, `gclid`, `mc_eid`, `igshid`, `msclkid`, and `yclid` query parameters via high-performance DNR rules.

---

## 🆕 What's New in v6.7.0

| Feature | What it does |
|---------|--------------|
| **🖥️ DevTools Detection Defuser** | Kills the "Developer Tools Detected" pause-overlay family (Animerulz & friends) before it can arm — three independent signals at `document_start`: **① dimension clamp** — `outerWidth`/`outerHeight` getters are wrapped so `outer − inner` never crosses the 160px detector threshold (real browser chrome ≈100px passes, a docked ≈300px console is clamped; also kills the false positive screen-normalization itself creates, where a 1920px profile vs a 1400px viewport reads as a 520px delta with nothing open); **② `__devtoolsDetected` pinned to `false`** — a non-configurable accessor swallows plain assignment and makes the library's own `defineProperty` redefinition fail; **③ `devtools-change` / `devtoolschange` swallowed** at capture phase on `window` + `document` before any site listener runs. Debugger-timing vectors stay dead under the existing 20ms timer coarsening. Per-site toggle in the Fingerprint matrix, force-off on Protected Sites, default ON. |

Plus everything from v6.6.0: user-extensible Custom Resolver Rules (click/redirect/turbo), deterministic family-coherent Identity Rotation, Font Ensemble Spoofing, Protected Sites, Reels/Shorts Auto-Pilot knobs, and Popup Quick-Site Actions.

## 🆕 What's New in v6.6.0

| Feature | What it does |
|---------|--------------|
| **🧩 Custom Resolver Rules** | Teach the resolver new lockers yourself — per host pattern (`*.example.com`, `example.com`, `*`): **click** auto-clicks a CSS selector once per element, **redirect** decodes the destination URL from a query param and jumps (loop-guarded), **turbo** treats the host as a 50x countdown locker. Max 20 rules, toggle/disable inline, survives JSON backup (shape-validated). |
| **🔄 Identity Rotation** | Auto-shuffles the hardware profile **within the same platform family** (win/mac/linux/android/ios) every N hours (1–720, default 24). Fully deterministic — the same rotation window always yields the same identity, so UA, Sec-CH-UA headers and hardware stay coherent. Per-site overrides stay pinned; `custom` profiles never rotate. A 20-minute alarm watches for window rollovers. |
| **🔤 Font Ensemble Spoofing** | Replaces plain enumeration masking with a **realistic per-identity font list** (Windows/macOS/Linux/Android/iOS sets): `document.fonts.check` is ensemble-gated (known-system-but-not-yours → `false`, webfonts pass through untouched), `window.queryLocalFonts` returns the ensemble (with spec-correct `NotAllowedError` without user activation), and `measureText` jitter is now seeded per **(font, text)** so cross-font width ratios no longer leak installed fonts. `queryLocalFonts` is also stripped under Firefox/Safari identities. |
| **🛡 Protected Sites** | A deny-list (max 300 hosts) where **every bypass/behavior module is force-disabled** — no turbo, no modal defusing, no button unlocking, no auto-clicking, no reels automation — while **full stealth keeps running** (canvas/audio/webgl/webgpu/fonts/UA/clock). Perfect for banking and support portals where a defuse could break real flows. |
| **🎬 Reels & Shorts Auto-Pilot** | Two knobs in the Streaming panel: **dwell seconds** per reel (0–10, default 1 — minimum seconds before advancing) and the **auto-advance budget** (0 = unlimited; the clock only runs while auto-advancing actually fires, not while you watch manually). Wired into the shared `bsReelKit` loop-boundary engine. |
| **⚡ Popup Quick-Site Actions** | The popup footer gains two one-click actions: **🔗 Copy clean URL** (active tab URL with all tracking params stripped) and **🧩 Edit this site's matrix** — deep-links into the per-site module matrix editor (`options.html#bs-edit-site=<domain>`), prefilling the override row when the site isn't pinned yet. |

Plus everything from v6.5.0: deep-node React event dispatch for IG Reels / YT Shorts auto-advance (synthetic `ArrowDown` fired at the reel's `<video>` with `keyCode` patched to 40 — events fired on `document` never reach React's delegated handlers), verified escalation cascades, loop-boundary detection, and popup→background sync fixes.

---

## 🎛️ Multi-Device Hardware Studio (110+ Presets)

The Options Studio features over 110 real-world device profiles and a custom hardware builder:
- **NVIDIA GeForce Series**: RTX 4090, RTX 4080, RTX 3080, RTX 3060.
- **AMD Radeon Series**: RX 7900 XTX, RX 6800 XT, Radeon RX 580.
- **Apple Silicon Series**: Apple M3 Max, Apple M2 Pro, Apple M1 Ultra.
- **Intel Arc & Iris Series**: Intel Arc A770, Intel Iris Xe Graphics.
- **Custom Hardware Builder**: Configure custom Platform, CPU Concurrency, RAM, Screen Resolution, DPR, and GPU strings with JSON backup export/import.

---

## 💻 Desktop Installation (Chrome / Brave / Edge / Opera)

### Option A — Release ZIP (recommended)
1. Download **`BraveShield-v6.6.0.zip`** from the [**Releases page**](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases).
2. Extract it — all extension files sit at the **root** of the extracted folder (`manifest.json` is immediately visible).
3. Open your browser's extensions page:
   - **Brave**: `brave://extensions`
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
4. Toggle **Developer mode** ON (top-right corner).
5. Click **"Load unpacked"** and select the **extracted folder itself** (the one containing `manifest.json`).
6. 🎉 **All stealth modules are armed and active!**

### Option A2 — Signed CRX (one drag-and-drop)
Download **`braveshield.crx`** from the Releases page, then:
1. Open `chrome://extensions` (Developer mode ON).
2. Drag the `.crx` file onto the page and confirm the install prompt (Chromium may gate drag-installed CRXes on some channels — if the install is refused, use the ZIP route above).

> Auto-updates: `update.xml` at the repo root points Chromium's enterprise/extension-update flow at the latest release CRX.

> Build your own ZIP any time with one command: `powershell -File build.ps1` → outputs `dist/BraveShield-v<version>.zip`.

### ⚠️ Import Troubleshooting
| Error | Cause | Fix |
|-------|-------|-----|
| *"Manifest file is missing or not accessible"* | Selected the wrong folder level, or used GitHub's **"Source code (ZIP)"** which nests everything inside `braveshield-anti-detection-extension-main/` | Select the folder that **directly contains** `manifest.json`. Prefer release ZIPs built by `build.ps1` |
| *Icon/ruleset load errors* | Partial extraction or moved files after loading | Re-extract fully and re-load |
| *Toggles don't seem to apply* | Extension was updated while pages were open | Reload the page once — after that every toggle applies live, no reloads needed |

### Option B — Clone for development
```bash
git clone https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension.git
# then chrome://extensions -> Developer mode -> Load unpacked -> select repo root
```

---

## 📂 Project Architecture

```
braveshield-anti-detection-extension/
├── manifest.json                 # Manifest V3 configuration (single source of truth for version)
├── update.xml                    # Chromium CRX auto-update manifest → latest release CRX
├── background.js                 # Service worker: defaults, Identity Rotation engine, UA/DNR sync, update checker
├── content.js                    # ISOLATED world: LIVE config bridge (instant toggles) + Protected-Sites gates + HUD + DOM defense
├── inject.js                     # MAIN world stealth engine + Font Ensemble + Custom Resolver Rules + bsReelKit Auto-Pilot
├── shared/constants.js           # Shared hosts/params/helpers loaded in BOTH worlds + pages
├── shared/ua-resolve.js          # UA resolver (unit-tested, dependency-free)
├── shared/dnr-rules.js           # DNR rule builders: UA-CH header parity (unit-tested)
├── shared/import-sanitize.js     # Backup-import sanitizer: allowlists, clamps, caps (unit-tested)
├── hardware-profiles.js          # Catalog of 110+ authentic hardware presets (DOM-free → SW + MAIN + pages)
├── useragents.js                 # UA database used to resolve per-profile User-Agents
├── tests/                        # node:test suite (52 tests across 4 shared-core modules)
├── build.ps1                     # Release packager -> root-level load-ready ZIP
├── build-mobile-full.mjs         # Bundles the ~312 KB Tampermonkey userscript from the extension core
├── braveshield-mobile.user.js    # Generated Android userscript (stealth-only, 20 device profiles)
├── rules.json                    # Declarative Net Request tracking parameter rules
├── filters/rules.txt             # AdGuard-compatible filter list
├── scripts/check-mojibake.cjs    # Encoding-hygiene gate for all shipped text
├── popup.html / .css / .js        # Glassmorphic Popup Dashboard + Quick-Site Actions (clean URL / edit matrix)
├── options.html / .css / .js      # Full-page Hardware Studio, Resolver Rules, Protected Sites & Custom Builder
├── memory/                       # Obsidian-compatible Context & Architecture Vault
│   ├── INDEX.md                  # Vault index and navigation
│   ├── project_state.md          # Active state, backlog, and release target
│   ├── architecture.md           # Low-level technical specifications
│   ├── decision_log.md           # Architectural Decision Records (ADRs)
│   ├── changelog.md              # Semantic Versioning release notes
│   └── test_matrix.md            # CreepJS & BrowserLeaks verification tests
├── icons/                        # High-res extension icons (16, 48, 128)
└── README.md                     # Main documentation
```

---

## 👤 Author & Contribution

Developed and maintained with ❤️ by **Nikhil Sonawane** ([@Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)).

- 🐛 **Found a bug or bypass gap?** Open an [Issue](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/issues).
- 💡 **Have a feature idea?** Submit a [Pull Request](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/pulls).

---

## ⚖️ Disclaimer

*Disclaimer: This extension and userscript suite is intended for educational, privacy research, and personal web accessibility purposes. Please adhere to the terms of service of the websites you visit.*
