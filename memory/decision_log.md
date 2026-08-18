# 📜 Architecture Decision Log

## ADR-001: MAIN World Execution vs Isolated World Injection
- **Date**: 2026-08-18
- **Context**: Content scripts in Chrome Extension Manifest V3 can run in `ISOLATED` world or `MAIN` world. Prototype poisoning and anti-fingerprinting hooks must run in `MAIN` world so webpage scripts share the same global objects (`window`, `navigator`, `HTMLCanvasElement`).
- **Decision**: Declare `inject.js` directly as a content script with `"world": "MAIN"` and `"run_at": "document_start"` in `manifest.json`. `content.js` runs in `"world": "ISOLATED"` to bridge `chrome.storage.local` to `sessionStorage`.
- **Status**: Accepted.

---

## ADR-002: Non-Destructive Mathematical Noise vs Direct Canvas Blocking
- **Date**: 2026-08-18
- **Context**: Direct canvas blocking (returning blank canvases or throwing errors) immediately triggers anti-bot suspicion flags (CreepJS / Cloudflare / DataDome) and breaks legitimate web apps (games, image editors, CAPTCHA rendering).
- **Decision**: Replace crude canvas blocking with deterministic `±1` RGB sub-pixel bit shifting on `getImageData`, `toDataURL`, and `toBlob`. Legitimate UI renders identically to human vision while fingerprint hashes vary across sessions.
- **Status**: Accepted.

---

## ADR-003: Unforgeable `makeNative` Proxy Architecture
- **Date**: 2026-08-18
- **Context**: Anti-bot engines inspect `Function.prototype.toString.call(fn)` and check if `.toString()` or custom wrapper properties are visible on hooked functions.
- **Decision**: Centralize native wrapping through `makeNative(fn, name, length)`. Proxy `Function.prototype.toString` to return standard native signatures and track hooked functions in a private `WeakSet` with zero property leakage.
- **Status**: Accepted.

---

## ADR-004: Client Hints (UA-CH) Synchronous & Async Consistency
- **Date**: 2026-08-18
- **Context**: Modern Chromium browsers use `navigator.userAgentData` (Client Hints API) in addition to `navigator.userAgent`. Mismatches between User-Agent strings and `getHighEntropyValues()` are primary signals for fingerprinting scripts.
- **Decision**: Overwrite `navigator.userAgentData` properties and `getHighEntropyValues()` to return consistent architecture, bitness, platform version, and brand lists matching the active hardware profile.
- **Status**: Accepted.
