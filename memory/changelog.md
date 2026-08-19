# 📦 Semantic Version Changelog

## [v6.0.3] - 2026-08-19 (reCAPTCHA & Auth Provider Network Immunity)

### 🛡️ Zero-Touch Captcha Network Passthrough (`inject.js`)
- **Direct fetch & XHR Passthrough**: Implemented raw bypass in `window.fetch` and `XMLHttpRequest.prototype.open` for all URLs matching `recaptcha`, `hcaptcha`, `turnstile`, `arkose`, `funcaptcha`, `geetest`, `awswaf`, `smartcaptcha`, and `friendlycaptcha` without Promise manipulation, mock interception, or media sniffing interference.
- **Strict Header & Credential Preservation**: Guaranteed that credentials, origin headers, and CORS cookies are untouched across all auth verification requests.
- **Global Challenge Frame Escape**: Expanded `isCaptchaHost` at the top of `inject.js` to immediately halt all native function proxies and stealth hooks whenever executed inside a Captcha iframe, host, or security challenge interstitial.

### 🧩 Invisible Captcha Container Protection (`content.js`)
- **Ancestor & Descendant Immunity**: Hardened `isProtectedCaptchaOrAuth` with full selector hierarchy (`.matches`, `.closest`, `.querySelector`) protecting all Google reCAPTCHA (`.grecaptcha-badge`, `.g-recaptcha-bubble`, `#g-recaptcha-response`), hCaptcha, and Cloudflare Turnstile containers.
- **Preserved Invisible Token Layout**: Refactored `ensureCaptchasVisible` to avoid mutating layout coordinates or CSS positions of invisible badges and token elements.
- **Overlay Exemption**: Prevented `purgeInvisibleOverlays` from modifying or hiding any invisible full-page containers that house verification iframes or token fields.

---

## [v6.0.2] - 2026-08-19 (Screenshot/Focus Evasion Shield & Universal Media Sniffer HUD)

### 📸 Screenshot & Focus Loss Evasion Shield
- **Visibility Normalization**: Enforced `document.visibilityState` to always return `"visible"` and `document.hidden` to always return `false` with native-code wrapped getters.
- **Focus Loss Event Swallowing**: Intercepted `EventTarget.prototype.addEventListener` for `blur`, `visibilitychange`, `mouseleave`, and `focusout` to prevent tracking of backgrounding, alt-tabbing, or snipping tool activation.
- **Screenshot Hotkey Masking**: Intercepted `PrintScreen`, `Meta+Shift+S`, and `Cmd+Shift+3/4/5` key combinations to block web-based screen capture detectors while preserving native OS clipping functionality.

### 📹 Universal Media Sniffer HUD
- **Network Stream Sniffing**: Deeply hooked `window.fetch` and `XMLHttpRequest.prototype.open` to intercept active HLS (`.m3u8`), DASH (`.mpd`), MP4 (`.mp4`), WebM, and FLV video stream URLs.
- **Shadow DOM Video Pill**: Injected an isolated Shadow DOM pill overlay positioned at `top: 10px; right: 10px;` of all `<video>` element containers with 1-click clipboard stream URL copying and right-click open-in-tab actions.

### 🎛️ UI & Settings Sync
- **Cockpit Controls**: Added dedicated toggles for Screenshot & Focus Shield and Universal Media Sniffer HUD in both `popup.html` and `options.html` with bidirectional live storage sync.

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
