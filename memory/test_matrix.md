# 🧪 Test Matrix & Verification Protocols

## Automated Test Protocols
1. **JavaScript Syntax Verification**:
   ```bash
   node --check inject.js content.js settings.js hardware-profiles.js background.js popup.js options.js
   ```
2. **Unit Tests (node:test, since v6.5.0)**:
   ```bash
   node --test tests\ua-resolve.test.mjs tests\constants.test.mjs tests\import-sanitize.test.mjs tests\dnr-rules.test.mjs
   ```
   - `tests/ua-resolve.test.mjs` — catalog parsing, version pick, UA re-basing, browser identity, `bsDeriveUaModel` (Pixel/Samsung/iPhone/iPad/K-withheld/hostile inputs).
   - `tests/constants.test.mjs` — shared constants integrity.
   - `tests/import-sanitize.test.mjs` — hostile backup JSON: unknown keys, prototype-pollution keys, type enforcement, string/length caps, numeric clamps, whitelist dedupe/caps, siteProfiles shape rules + injected matrix allowlist, custom-hardware clamps.
   - `tests/dnr-rules.test.mjs` — rule-ID layout (424242 base / +900 locale / +1000 max), Chrome header parity incl. `Sec-CH-UA-Model` set/remove truth, Firefox identity full CH removal, captcha-exclusion merge invariant ("overrides can never drop them"), locale rule format + rejection.
3. **Manifest V3 JSON Schema Validation**:
   Validate `manifest.json`, `rules.json` (JSON) and `update.xml` (XML) with standard parsers.

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
