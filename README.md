# 🛡️ BraveShield Bypass Pro — Anti-Detection Engine v4.6.1

**38 modules** that bypass everything: Brave Shields, adblock traps, link shorteners, cookie consents, countdown timers, click-image-wait patterns, WebRTC leaks, and auto-clicks download buttons — all from a single lightweight extension.

> **v4.6.1** — Icons load-error fixed using a valid logo-based icon set. All 38 module toggles default to **ON** (recommended "Maximum" configuration).

---

## ✨ Features at a Glance

| Area                          | Capabilities                                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auto Bypass**               | Link shorteners (50+ services), countdown/timer bypass, click-image-wait, cookie consent auto-dismiss (20+ frameworks), smart auto-scroll, redirect chain follower, popunder interceptor |
| **Adblock Detection**         | Bypass Hispanoads, Admiral, BlockAdBlock, FuckAdBlock; fake ad-bait network requests                                                                                                     |
| **Stealth - Core**            | Remove `navigator.brave`, sanitize client-hint brands, mask Global Privacy Control, stub analytics, neutralize DOM traps, normalize WebGL                                                |
| **Stealth - Fingerprint**     | Fix `brave://` protocol leak, storage quota leak, AudioContext & Canvas fingerprint normalization                                                                                        |
| **Stealth - Anti-Automation** | Hide `webdriver`, WebRTC IP-leak prevention, permission auto-deny, performance timer clamp, navigator consistency                                                                        |
| **YouTube**                   | Ad blocking (video/display/overlays/promoted), SponsorBlock segment skipping                                                                                                             |
| **Accessibility**             | Force right-click, force text selection, anti-scroll-lock, auto-close popups                                                                                                             |
| **Privacy**                   | Block clipboard read, block notification spam, anti-screenshot detection, timezone & geolocation spoofing                                                                                |

---

## 🚀 Installation

1. **Extract** the ZIP file (right-click → Extract All)
2. Open Brave/Chrome → go to `brave://extensions` (or `chrome://extensions`)
3. Enable **Developer mode** (top-right toggle)
4. Click **"Load unpacked"** and select the extracted folder (the one containing `manifest.json`)
5. Done! All 38 modules are active by default.

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

## 🧩 All 38 Modules

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

16. **brave:// Protocol Leak Fix** — `document.createElement('a').href='brave://x'` returns `chrome:`
17. **Storage Quota Leak Fix** — fake 2GB quota via `queryUsageAndQuota()`
18. **AudioContext Normalization** — consistent `OfflineAudioContext` output
19. **Canvas Fingerprint Fix** — consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (20–24)

20. **navigator.webdriver Hide** — returns `false`
21. **WebRTC IP Leak Prevention** — strips ICE servers
22. **Permission Auto-Deny** — camera, mic, notifications, geolocation
23. **Performance Timer Clamp** — reduces timing precision
24. **Navigator Consistency Spoofing** — `productSub`, `platform`, `languages`, `hardwareConcurrency`

### Consistency Spoofing (25–28)

25. **CSS Custom Property Cleanup** — removes browser-injected CSS variables
26. **Font Fingerprint Spoofing** — consistent `document.fonts.check()`
27. **Screen/Viewport Consistency** — realistic screen dimensions
28. **WebGL Vendor/Renderer Spoofing** — customizable GPU strings

### Accessibility & Privacy (29–38)

29. **Force Right-Click** — overrides site context-menu blocks
30. **Force Text Selection** — overrides copy/select blocks
31. **Anti-Scroll Lock** — overrides `overflow:hidden` locks
32. **Auto-Close Popups** — closes ad/spam popup windows
33. **Block Clipboard Read** — prevents sites from reading the clipboard
34. **Block Notification Spam** — auto-denies notification prompts
35. **Anti-Screenshot Detection** — blocks canvas-based screenshot detection
36. **Timezone Spoofing** — matches UA region timezone
37. **(Optional) YouTube Ad Blocking** — video, display, overlays, promoted
38. **(Optional) SponsorBlock** — skips sponsored segments on YouTube

---

## 🎛️ UI & Controls

### Popup

- Master on/off toggle
- Individual module toggles across all categories
- **Enable All / Disable All** bulk actions
- Real-time bypass status
- Per-site Whitelist / Blacklist buttons

### Options Page

- All 38 module toggles organized in categorized tabs
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
├── manifest.json      # MV3 manifest (v4.6.1)
├── background.js      # Service worker: settings, badges, storage, messaging
├── content.js         # Content script (ISOLATED world)
├── inject.js          # Injection script (MAIN world)
├── settings.js        # Shared settings map (popup + options)
├── useragents.js      # 170+ user-agent strings
├── rules.json         # Declarative Net Request rules
├── popup.html/.css/.js# Popup UI
├── options.html/.css/.js # Options / Settings UI
└── icons/             # Logo-based icons (16/48/128)
```

---

## 🐛 v4.6.1 — Changelog

- ✅ **Fixed**: Corrupt/tiny icons replaced with valid logo-based PNGs — resolves _"Could not load icon 'icons/icon16.png'"_
- ✅ All 38 module toggles default to **ON** (recommended configuration)

---

## 👤 Author

**Nikhil Sonawane** — [@Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

---

> ⚠️ **Disclaimer:** This extension is for educational and research purposes only. Use responsibly and in accordance with each website's terms of service.
