# 🏗️ Technical Architecture & Low-Level Specifications

## 1. Execution Context & Timing Model
- **World**: `MAIN` execution context configured via `manifest.json` content scripts.
- **Timing**: `run_at: "document_start"` ensuring scripts load before any page DOM or inline `<script>` tags can execute and capture pristine browser prototypes.
- **Bridge**: `content.js` runs in `ISOLATED` world at `document_start`, reading `chrome.storage.local` and writing atomic state flags to `sessionStorage`. `inject.js` reads these flags synchronously to determine feature activation.

---

## 2. Unforgeable Native Function Proxy (`makeNative`)
To evade anti-bot detection suites (e.g. CreepJS, DataDome, Cloudflare Bot Management):
1. **`Function.prototype.toString` Proxy**:
   - `toString` is wrapped using `makeNative`.
   - A private `WeakMap` or `WeakSet` tracks hooked functions.
   - When called on any hooked function `fn`, it returns: `function [fn.name]() { [native code] }`.
   - Calling `Function.prototype.toString.toString()` returns `function toString() { [native code] }`.
2. **Descriptor & Property Invariants**:
   - `.length` matches original native function length.
   - `.name` matches original native function name.
   - Property descriptor matches native function standards (`configurable: true`, `enumerable: false`, `writable: true`).
   - Function prototypes and prototype chains remain unpolluted by custom symbols or enumerable markers.

---

## 3. Non-Destructive Mathematical Noise Injection

### A. Canvas Spoofing (`HTMLCanvasElement` & `CanvasRenderingContext2D`)
- **Noise Model**: Deterministic Mulberry32/xoshiro PRNG seeded by session ID + origin hostname.
- **Target APIs**:
  - `CanvasRenderingContext2D.prototype.getImageData`: Injects subtle `±1` RGB bit shifts into select pixel bytes.
  - `HTMLCanvasElement.prototype.toDataURL`: Intercepts call, extracts backing buffer, applies minute bit shift if not previously perturbed, and encodes to data URL.
  - `HTMLCanvasElement.prototype.toBlob`: Applies identical mathematical perturbation before passing blob to callback.
- **Invariance**: Legitimate image rendering and UI layouts appear visually identical to the human eye while producing unique canvas fingerprint hashes across different sessions.

### B. Audio Stack Variance (`AudioContext` / `OfflineAudioContext`)
- **Target APIs**:
  - `AnalyserNode.prototype.getFloatFrequencyData`: Perturbs frequency float values by `±1e-7`.
  - `AnalyserNode.prototype.getByteFrequencyData`: Perturbs frequency byte values by `±1`.
  - `AudioBuffer.prototype.getChannelData`: Injects statistical float variance (`±1e-7`) on float channel data.
  - `AudioBuffer.prototype.copyFromChannel`: Injects identical statistical float variance.
  - `OfflineAudioContext.prototype.startRendering`: Post-processes the rendered `AudioBuffer` before resolving the promise.

---

## 4. WebGL & GPU Cloaking
- **Target APIs**:
  - `WebGLRenderingContext.prototype.getParameter` & `WebGL2RenderingContext.prototype.getParameter`:
    - `0x9245` (`UNMASKED_VENDOR_WEBGL`): Return simulated vendor (e.g. `Google Inc. (NVIDIA)`).
    - `0x9246` (`UNMASKED_RENDERER_WEBGL`): Return simulated renderer (e.g. `ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)`).
    - `0x1F00` (`VENDOR`), `0x1F01` (`RENDERER`), `0x1F02` (`VERSION`), `0x8B8C` (`SHADING_LANGUAGE_VERSION`).
  - `WebGLRenderingContext.prototype.getExtension`: Mask `WEBGL_debug_renderer_info` object to ensure it returns spoofed parameters.
  - `WebGLRenderingContext.prototype.getShaderPrecisionFormat`: Return standardized highp/mediump/lowp precision formats.

---

## 5. Synchronized Navigator & Client Hints (UA-CH)
- **Properties**:
  - `navigator.userAgent`, `navigator.appVersion`, `navigator.platform`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `navigator.maxTouchPoints`, `navigator.languages`.
- **NavigatorUAData API**:
  - Intercept `navigator.userAgentData.brands`, `navigator.userAgentData.mobile`, `navigator.userAgentData.platform`.
  - Intercept `navigator.userAgentData.getHighEntropyValues()` to return a promise resolving consistent values for `architecture`, `bitness`, `model`, `platformVersion`, `fullVersionList`, and `wow64`.

---

## 6. Extended Stealth & Protection Layer
- **DOM Rect Jitter**: Perturb `Element.prototype.getBoundingClientRect` and `getClientRects` by `±0.001px` to defeat sub-pixel font measurement fingerprinting.
- **Timer Coarsening**: Clamp `performance.now()` to 20ms or jitter microsecond intervals to prevent cache-timing attacks (Spectre).
- **Media Devices & Speech Synthesis**: Spoof `navigator.mediaDevices.enumerateDevices` (default camera/mic IDs) and `speechSynthesis.getVoices` (standard voice list).
- **WebRTC Protection**: Mask local IP addresses in SDP offers and set policy to `disable_non_proxied_udp`.
