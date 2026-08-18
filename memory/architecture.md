# 🏗️ Technical Architecture & Specifications

## 1. Execution Realms (Manifest V3)
- **`MAIN` World (`inject.js`)**:
  - `run_at: "document_start"`, `all_frames: true`.
  - Overwrites prototypes on global `window`, `navigator`, `HTMLCanvasElement`, `AudioBuffer`, `AnalyserNode`, `Element`, and `Screen` before any third-party or page tracking scripts execute.
- **`ISOLATED` World (`content.js`)**:
  - `run_at: "document_start"`, `all_frames: true`.
  - Bridges `chrome.storage.local` settings to `sessionStorage` (`bs_canvas_disabled`, `bs_audio_disabled`, etc.) and handles HUD overlays.
- **Service Worker (`background.js`)**:
  - WebRTC policy manager (`disable_non_proxied_udp`).
  - Declarative Net Request (DNR) rule manager and GitHub auto-update sync coordinator.

---

## 2. Stitch Cyber-Dark Design System Tokens
- **Background**: Deep Obsidian Slate (`#0B0F17` / `#111827`).
- **Glass Surfaces**: `rgba(22, 30, 46, 0.75)` with `backdrop-filter: blur(12px)`.
- **Accent / Stealth Active**: Neon Emerald (`#10B981`) & Cyber Cyan (`#06B6D4`).
- **Warning / Bypassed**: Electric Amber (`#F59E0B`).
- **Alert / Disabled**: Crimson Core (`#EF4444`).
- **Typography**: `Plus Jakarta Sans`, `Inter`, and `JetBrains Mono` for monospace data telemetry.
- **Motion Curves**: 60 FPS spring transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)` and `cubic-bezier(0.4, 0, 0.2, 1)`).

---

## 3. Dual Auto-Updater Engine
1. **CRX Protocol Channel**:
   - `manifest.json`: `"update_url": "https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/update.xml"`.
   - `update.xml`: Chrome `gupdate 2.0` specification targeting latest GitHub releases.
2. **GitHub API Channel**:
   - `background.js` checks remote `manifest.json` on alarm cycles.
   - Sets `updateAvailable = true` in `chrome.storage.local` which reveals the glowing update ribbon in `popup.html`.

---

## 4. Anti-Fingerprinting Mathematical Specifications
- **Canvas Noise**: `±1` RGB sub-pixel bit shift per 4th byte.
- **Audio Noise**: `±1e-7` statistical float variance on frequency and time-domain data.
- **Timer Coarsening**: 20ms precision clamping on `performance.now()`, `Date.now()`, and `Event.prototype.timeStamp`.
- **DOM Rect Jitter**: `±0.001px` deterministic sub-pixel noise on `Element.prototype.getBoundingClientRect`.
