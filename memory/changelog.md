# 📦 Semantic Version Changelog

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
