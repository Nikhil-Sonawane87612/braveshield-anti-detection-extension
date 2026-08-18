# 🧪 Test Matrix & Verification Protocols

## Automated Test Protocols
1. **JavaScript Syntax Verification**:
   ```bash
   node --check inject.js content.js settings.js hardware-profiles.js background.js popup.js options.js
   ```
2. **Manifest V3 JSON Schema Validation**:
   Validate `manifest.json` and `rules.json` with standard JSON parser.

---

## Fingerprint & Evasion Benchmark Targets
- **CreepJS (`https://abrahamjuliot.github.io/creepjs/`)**:
  - Test `Function.prototype.toString` deception resistance.
  - Test Canvas noise resistance and WebGL unmasked vendor/renderer matching.
  - Test AudioContext hash variance.
- **BrowserLeaks (`https://browserleaks.com/`)**:
  - Canvas Fingerprinting (`/canvas`): Verify distinct signature per session without blank/distorted renders.
  - WebGL Fingerprinting (`/webgl`): Verify unmasked GPU matches simulated device profile.
  - WebRTC Leak Test (`/webrtc`): Verify local LAN IP is masked/blocked.
- **PixelScan (`https://pixelscan.net/`)**:
  - Verify consistency across Navigator, Screen, User-Agent, and Client Hints.
- **Cloudflare Turnstile & reCAPTCHA**:
  - Verify zero-touch pass-through so challenges complete without interference.
