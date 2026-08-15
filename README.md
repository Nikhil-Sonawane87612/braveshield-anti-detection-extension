# 🛡️ BraveShield Bypass Pro — Anti-Detection Engine v5.1.0

**31 modules** that bypass everything: Brave Shields, adblock traps, link shorteners, cookie consents, countdown timers, click-image-wait patterns, WebRTC leaks, and auto-clicks download buttons — all from a single lightweight extension. Plus Master Kill Switch, Video Turbo Engine (16x ad fast-forward, background video playback, universal PiP), Live Privacy Audit Score (Grade A+), 1-Click Disposable Identity, and 14 WebGL GPU profiles.

> **v5.1.0** — Master Kill Switch & Video Turbo update. Added emergency Master Kill Switch, Option C (Video Turbo Engine with 16x ad acceleration, anti-tab-switch pause defeat, universal PiP), Option D (Live Privacy & Stealth Audit Score Grade A+, 1-Click Disposable Identity Switcher), 14 WebGL GPU profiles, and full Obsidian Glassmorphic UI redesign.

---

## ✨ Features at a Glance

| Area                          | Capabilities                                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Master Kill Switch**        | 1-click global emergency toggle in popup and options headers to instantly pause/arm all 31 stealth modules, DNR rules, and network hooks                                               |
| **Video Turbo Engine**        | 16x video ad fast-forwarder & auto-mute, background video playback (prevents pause on tab switch), universal Picture-in-Picture (PiP) on all players                                    |
| **Live Privacy & Stealth**    | Real-time Privacy & Stealth Audit Grade (A+ / 100%) in popup, live counter of defused traps, sanitized fingerprints, and bypassed sites                                                  |
| **Disposable Identity**       | 1-click "New Identity" HUD button that rolls random realistic modern User-Agent + WebGL GPU profiles and clears site tracking storage                                                    |
| **WebGL GPU Profiles**        | 14 authentic GPU profiles (RTX 4090, RTX 3080, RTX 3060, RX 7900 XTX, Apple M3 Max, Intel Iris Xe, Adreno 740) with dynamic unmasked vendor/renderer farbling                              |
| **Auto Bypass**               | Link shorteners (50+ services), countdown/timer bypass, click-image-wait, cookie consent auto-dismiss (20+ frameworks), smart auto-scroll, redirect chain follower, popunder interceptor |
| **Adblock Detection**         | Bypass Hispanoads, Admiral, BlockAdBlock, FuckAdBlock; fake ad-bait network requests                                                                                                     |
| **Stealth - Core**            | Remove `navigator.brave`, sanitize client-hint brands, mask Global Privacy Control, stub analytics, neutralize DOM traps, normalize WebGL                                                |
| **Stealth - Fingerprint**     | Fix `brave://` protocol leak, storage quota leak, AudioContext & Canvas fingerprint normalization                                                                                        |
| **Stealth - Anti-Automation** | Hide `webdriver`, WebRTC IP-leak prevention, permission auto-deny, performance timer clamp, navigator consistency                                                                        |
| **YouTube Tools**             | Ad blocking (video/display/overlays/promoted), SponsorBlock auto-skip                                                                                                                    |
| **Accessibility & Extra**     | Force right-click, force text selection, anti-scroll-lock, block clipboard read, block notification spam, timezone & geolocation spoofing, Undetectable Developer Mode                     |

---

## 🚀 Installation

1. **Extract** the ZIP file (right-click → Extract All)
2. Open Brave/Chrome → go to `brave://extensions` (or `chrome://extensions`)
 3. Enable **Developer mode** (top-right toggle)
 4. Click **"Load unpacked"** and select the extracted folder (the one containing `manifest.json`)
 5. Done! All 31 modules are active by default.

> ⚠️ Do NOT drag-and-drop the ZIP. You must extract first, then use **Load unpacked**.

---

## ⏱️ Key Fix: 15–20 Second Download Button Bypass

**The Problem:** Many download sites show "Wait 15–20 seconds" with a countdown timer, then reveal a download button. Most extensions can't handle this.

**Our Solution:**

- Overrides `setInterval`/`setTimeout` to accelerate countdowns from 15–20s to ~0.5s
- Monitors the DOM for countdown elements and forces them to 0
- Auto-clicks the download/continue button as soon as it appears
- Uses `MutationObserver` to detect dynamically loaded buttons
- Handles multi-step sequences (click ad → wait → continue → wait → download)

---

## 🧩 All 30 Modules

### Core Anti-Detection (1–6)

1. **Navigator.brave Destruction** — removes `navigator.brave` + `isBrave()`
2. **Client Hints Brand Sanitizer** — strips "Brave" from `navigator.userAgentData.brands`
3. **Global Privacy Control Mask** — hides `navigator.globalPrivacyControl`
4. **Ad/Analytics Variable Stubs** — fakes `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
5. **DOM Trap Dimension Neutralization** — hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect`
6. **WebGL Farbling Normalization** — consistent GPU vendor/renderer strings

### Auto-Bypass Features (7–15)

7. **Link Shortener Auto-Bypass** — 50+ services (ouo.io, bc.vc, sh.st, linkvertise, etc.)
8. **Timer/Countdown Bypass** — speeds up countdowns, auto-clicks Get Link
9. **Click Image Wait Bypass** — bypasses "click image wait 10 seconds" ad patterns
10. **Cookie Consent Auto-Dismiss** — 20+ frameworks (OneTrust, Cookiebot, etc.)
11. **Smart Auto-Scroll** — auto-scrolls pages requiring scroll
12. **Redirect Chain Follower** — follows meta refresh and click-through redirects
13. **Popunder Interceptor** — blocks ad popunder windows
14. **Adblock Detection Bypass** — bypasses Hispanoads, Admiral, BlockAdBlock, FuckAdBlock
15. **Network Bait Faking** — fakes ad-bait fetch/XHR requests

### Fingerprint Leak Fixes (16–19)

16. **`brave://` Protocol Leak Fix** — strips Brave protocol leak via `document.createElement('a').href`
17. **Storage Quota Leak Fix** — fake 2GB quota via `queryUsageAndQuota()`
18. **AudioContext Normalization** — consistent `OfflineAudioContext` output
19. **Canvas Fingerprint Fix** — consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (20–24)

20. **Navigator.webdriver Hide** — returns `false`
21. **WebRTC IP Leak Prevention** — strips ICE servers
22. **Permission Auto-Deny** — camera, mic, notifications, geolocation
23. **Performance Timer Clamp** — reduces timing precision
24. **Navigator Consistency Spoofing** — `productSub`, `platform`, `languages`, `hardwareConcurrency`

### Consistency & YouTube Spoofing (25–30)

25. **CSS Custom Property Cleanup** — removes browser-injected CSS variables
26. **Font Fingerprint Spoofing** — consistent `document.fonts.check()`
27. **Screen/Viewport Consistency** — realistic screen dimensions
28. **YouTube AdBlocker** — blocks video ads, player overlays, promoted videos, and intercepts ad requests
29. **YouTube SponsorBlock** — fetches sponsor segments from public API (sponsor.ajay.app) and auto-skips
30. **Undetectable Developer Mode** — bypasses CSP, disables anti-debug, overrides devtools restrictions

---

## 🎛️ UI & Controls

### Popup

- Master on/off toggle
- Individual module toggles across all categories
- **Enable All / Disable All** bulk actions
- Real-time bypass status
- Per-site Whitelist / Blacklist buttons
- YouTube Tools section: YT AdBlocker, SponsorBlock
- Developer Mode toggle (Extra Features)

### Options Page

- All 30 module toggles organized in categorized tabs
- **"All Modules"** tab with live search + bulk actions
- Collapsible category accordions
- WebGL vendor/renderer customization
- Whitelist / Blacklist management
- Bypass history viewer (last 50 sites)

### Data & Sync

- Real-time bidirectional sync between Popup and Options (`chrome.storage.onChanged`)
- Export / Import settings as JSON (backup & restore)
- Per-site profile presets
- Keyboard shortcuts:
  - `Ctrl+Shift+E` → Enable all
  - `Ctrl+Shift+D` → Disable all
  - `Ctrl+Shift+F` → Focus search

### Bypass Statistics Dashboard

- Total traps neutralized
- Sites bypassed count
- Current tab request count
- Bypass history log

---

## 🛡️ Safe-List Protection for AI Sites

**Gemini, ChatGPT, Claude, DeepSeek, Perplexity** are automatically excluded from aggressive ad-detection to prevent false positives that could break typing/scrolling on legitimate AI platforms. Modules 5, 8, 27, 31, 32, 33 respect this safe-list.

---

## 📦 Project Structure

```
├── manifest.json      # MV3 manifest (v4.7.0)
├── background.js      # Service worker: settings, badges, storage, messaging
├── content.js         # Content script (ISOLATED world)
├── inject.js          # Injection script (MAIN world)
├── settings.js        # Shared settings map (popup + options)
├── useragents.js      # 60+ user-agent strings
├── rules.json         # Declarative Net Request rules
├── popup.html/.css/.js# Popup UI
├── options.html/.css/.js # Options / Settings UI
└── icons/             # Logo-based icons (16/48/128)
```

---

### 🐛 v4.7.0 — Changelog

- ✅ **Hardened**: Removed extension-identifiable strings from CSS IDs (`brave-shield-bypass-styles` → anonymous), class names (`brave-bypass-toast` → `bs-toast`), localStorage keys (`braveshield_ua` → `bs_ua`), custom events (`braveshield_ua_update` → `bs_ua_update`), and console messages
- ✅ **Expanded**: 40+ link shortener hosts (up from 25)
- ✅ **Expanded**: 28+ cookie consent framework selectors
- ✅ **Expanded**: 18+ countdown/timer detection selectors
- ✅ **Fixed**: Manifest description module count corrected from 37 to 28
- ✅ **Fixed**: README module count corrected from 38 to 28

### 🐛 v5.0.0 — Changelog

- ✅ **New Module 28**: YouTube AdBlocker — blocks video ads, player overlays, promoted videos, ad breaks, and network ad requests on youtube.com
- ✅ **New Module 29**: YouTube SponsorBlock — integrates with public SponsorBlock API (sponsor.ajay.app), fetches sponsor segments, and auto-skips with 5s buffer
- ✅ **New Module 30**: Undetectable Developer Mode — bypasses Content-Security-Policy, disables anti-debugging, unblocks DevTools shortcuts behind a localStorage flag
- ✅ **Popup UI**: Added YouTube Tools section with dedicated toggles for AdBlocker and SponsorBlock
- ✅ **Popup UI**: Added Developer Mode toggle in Extra Features section
- ✅ **Popup UI**: Collapsible accordion sections with live counter badges and micro-animations
- ✅ **Messaging**: Added `TOGGLE_DEV_MODE` message handlers in content.js
- ✅ **Updated**: All module counts unified to 30 across popup.html, options.html, README, and inject.js
- ✅ All core module toggles default to **ON** (recommended configuration)

---

## 👤 Author

**Nikhil Sonawane** — [@Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

---

> ⚠️ **Disclaimer:** This extension is for educational and research purposes only. Use responsibly and in accordance with each website's terms of service.
