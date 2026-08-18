# 📦 Semantic Version Changelog

## [v5.6.0] - 2026-08-18 (Milestone Hardening Release)

### 🛡️ Core Anti-Fingerprinting & Stealth
- **Unforgeable `makeNative` Architecture**: Hardened `Function.prototype.toString` proxying with private `WeakSet` tracking to evade heuristic inspection.
- **Session-Seeded Canvas Noise**: Replaced blocking with non-destructive `±1` RGB sub-pixel bit shifts on `toDataURL`, `toBlob`, and `getImageData`.
- **High-Precision Audio Noise**: Injected `±1e-7` statistical float variance into `AnalyserNode`, `AudioBuffer`, and `OfflineAudioContext`.
- **Comprehensive WebGL & WebGL2 Spoofing**: Masked `UNMASKED_VENDOR_WEBGL`, `UNMASKED_RENDERER_WEBGL`, and shader precision formats.
- **Client Hints (UA-CH) Consistency**: Synchronized `navigator.userAgentData` and `getHighEntropyValues()` with User-Agent profiles.

### ⚡ Extended Stealth & Security
- **DOM Rect Jitter**: Added deterministic `±0.001px` micro-jitter on `getBoundingClientRect` and `getClientRects` against font fingerprinting.
- **Timer Coarsening**: Clamped `performance.now()` resolution to defeat Spectre and CPU cache timing attacks.
- **Media & Speech Sanitization**: Standardized `navigator.mediaDevices.enumerateDevices` and `speechSynthesis.getVoices`.
- **Tracking Parameter Stripper**: Added DeclarativeNetRequest rules to remove `utm_*`, `fbclid`, `gclid`, and `mc_eid`.

### 🎛️ User Interface & Control
- **Modernized Popup Cockpit**: Dedicated switches for Canvas Noise, Audio Stack Variance, WebGL Spoofing, UA-CH Parity, DOM Jitter, and WebRTC Shielding.
- **One-Click Whitelist Engine**: Instant per-domain bypass toggle with real-time UI indicator.
