# BraveShield Bypass Pro v4.3 - Complete Anti-Detection Engine

**28 modules** that bypass everything: Brave Shields, adblock traps, link shorteners, cookie consents, countdown timers, click-image-wait patterns, WebRTC leaks, and auto-clicks download buttons.

---

## Installation

1. **Extract** the ZIP file (right-click → Extract All)
2. Open Brave/Chrome → go to `brave://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **"Load unpacked"** and select the extracted folder (the one with `manifest.json`)
5. Done!

> Do NOT drag-and-drop the ZIP. You must extract first, then use Load unpacked.

---

## Key Fix: 15-20 Second Download Button Bypass

**The Problem:** Many download sites show "Wait 15-20 seconds" with a countdown timer, then reveal a download button. Most extensions can't handle this.

**Our Solution:**
- Overrides `setInterval`/`setTimeout` to accelerate all countdowns from 15-20s to ~0.5s
- Monitors DOM for countdown elements and forces them to 0
- Auto-clicks the download/continue button as soon as it appears
- Uses MutationObserver to detect dynamically loaded buttons
- Handles multi-step sequences (click ad -> wait -> continue -> wait -> download)

---

## All 25 Modules

### Core Anti-Detection (Modules 1-6)
1. **Navigator.brave Destruction** - Removes `navigator.brave` + `isBrave()`
2. **Client Hints Brand Sanitizer** - Strips "Brave" from `navigator.userAgentData.brands`
3. **Global Privacy Control Mask** - Hides `navigator.globalPrivacyControl`
4. **Ad/Analytics Variable Stubs** - Fake `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
5. **DOM Trap Dimension Neutralization** - Hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect`
6. **WebGL Farbling Normalization** - Consistent GPU vendor/renderer strings

### Auto-Bypass Features (Modules 7-12)
7. **Link Shortener Auto-Bypass** - 50+ services (ouo.io, bc.vc, sh.st, linkvertise, etc.)
8. **Timer/Countdown Bypass** - Speeds up countdowns, auto-clicks Get Link
9. **Cookie Consent Auto-Dismiss** - 20+ consent frameworks
10. **Smart Auto-Scroll** - Auto-scrolls pages requiring scroll
11. **Redirect Chain Follower** - Follows meta refresh and click-through redirects
12. **Popunder Interceptor** - Blocks ad popunder windows

### Fingerprint Leak Fixes (Modules 13-16)
13. **brave:// Protocol Leak Fix** - `document.createElement('a').href='brave://x'` returns `chrome:`
14. **Storage Quota Leak Fix** - `webkitTemporaryStorage.queryUsageAndQuota()` returns fake 2GB
15. **AudioContext Normalization** - Consistent `OfflineAudioContext` output
16. **Canvas Fingerprint Fix** - Consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (Modules 17-21)
17. **navigator.webdriver Hide** - Returns `false` for webdriver flag
18. **WebRTC IP Leak Prevention** - Strips ICE servers to prevent local IP exposure
19. **Permission Auto-Deny** - Auto-deny notification/camera/mic/geolocation
20. **Network Bait Response Faking** - Fakes `fetch()`/`XMLHttpRequest` for ad-bait requests
21. **Performance Timer Clamp** - Reduces precision to prevent timing attacks

### Consistency Spoofing (Modules 22-25)
22. **Navigator Consistency Spoofing** - Consistent `productSub`, `platform`, `languages`, `hardwareConcurrency`
23. **CSS Custom Property Cleanup** - Removes browser-injected CSS variables
24. **Font Fingerprint Spoofing** - Consistent `document.fonts.check()` results
25. **Screen/Viewport Consistency** - Realistic screen dimensions

---

## Features

### Per-Site Whitelist/Blacklist
- Whitelist: Extension only works on whitelisted sites
- Blacklist: Extension disabled on blacklisted sites
- Manage via popup or options page

### Bypass Statistics Dashboard
- Total traps neutralized
- Sites bypassed count
- Current tab request count
- Bypass history log

### Popup UI
- Master on/off toggle
- Individual module toggles for all 12 categories
- Real-time status display
- Whitelist/blacklist buttons per site

### Options Page
- All 25 module toggles
- WebGL vendor/renderer customization
- Whitelist/blacklist management with add/remove
- Bypass history viewer

---

## Installation

1. Download or clone this repository
2. Open `brave://extensions` (or `chrome://extensions`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `additional featured extension` folder
5. All 25 modules are active by default

---

## Author

**Nikhil Sonawane** - [Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

## Disclaimer

This extension is for educational and research purposes only. Use responsibly.
