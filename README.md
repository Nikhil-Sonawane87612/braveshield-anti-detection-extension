# BraveShield Bypass Pro v4.6.1 - Complete Anti-Detection Engine

**37 modules** that bypass everything: Brave Shields, adblock traps, link shorteners, cookie consents, countdown timers, click-image-wait patterns, WebRTC leaks, and auto-clicks download buttons.

---

## New in v4.6.1

### ✅ Icons Fixed (Load-Error Resolved)
- Replaced the corrupt/tiny extension icons with valid, logo-based PNGs (icon16 / icon48 / icon128)
- This resolves the Brave load error: *"Could not load icon 'icons/icon16.png' specified in 'action'"*
- All 40 module options now default to **ON** (recommended "Maximum" configuration) on both the Options page and in `background.js`

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

## All 37 Modules

### Core Anti-Detection (Modules 1-6)
1. **Navigator.brave Destruction** - Removes `navigator.brave` + `isBrave()`
2. **Client Hints Brand Sanitizer** - Strips "Brave" from `navigator.userAgentData.brands`
3. **Global Privacy Control Mask** - Hides `navigator.globalPrivacyControl`
4. **Ad/Analytics Variable Stubs** - Fake `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
5. **DOM Trap Dimension Neutralization** - Hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect`
6. **WebGL Farbling Normalization** - Consistent GPU vendor/renderer strings

### Auto-Bypass Features (Modules 7-15)
7. **Link Shortener Auto-Bypass** - 50+ services (ouo.io, bc.vc, sh.st, linkvertise, etc.)
8. **Timer/Countdown Bypass** - Speeds up countdowns, auto-clicks Get Link
9. **Click Image Wait Bypass** - Bypasses "click image wait 10 seconds" ad patterns
10. **Cookie Consent Auto-Dismiss** - 20+ consent frameworks (OneTrust, Cookiebot, etc.)
11. **Smart Auto-Scroll** - Auto-scrolls pages requiring scroll
12. **Redirect Chain Follower** - Follows meta refresh and click-through redirects
13. **Popunder Interceptor** - Blocks ad popunder windows
14. **Adblock Detection Bypass** - Bypasses Hispanoads, Admiral, BlockAdBlock, FuckAdBlock
15. **Network Bait Faking** - Fakes ad-bait fetch/XHR requests

### Fingerprint Leak Fixes (Modules 16-19)
16. **brave:// Protocol Leak Fix** - `document.createElement('a').href='brave://x'` returns `chrome:`
17. **Storage Quota Leak Fix** - `webkitTemporaryStorage.queryUsageAndQuota()` returns fake 2GB
18. **AudioContext Normalization** - Consistent `OfflineAudioContext` output
19. **Canvas Fingerprint Fix** - Consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (Modules 20-24)
20. **navigator.webdriver Hide** - Returns `false` for webdriver flag
21. **WebRTC IP Leak Prevention** - Strips ICE servers to prevent local IP exposure
22. **Permission Auto-Deny** - Auto-deny notification/camera/mic/geolocation
23. **Performance Timer Clamp** - Reduces precision to prevent timing attacks
24. **Navigator Consistency Spoofing** - Consistent `productSub`, `platform`, `languages`, `hardwareConcurrency`

### Consistency Spoofing (Modules 25-28)
25. **CSS Custom Property Cleanup** - Removes browser-injected CSS variables
26. **Font Fingerprint Spoofing** - Consistent `document.fonts.check()` results
27. **Screen/Viewport Consistency** - Realistic screen dimensions
28. **WebGL Vendor/Renderer Spoofing** - Customizable GPU strings

### Accessibility & Privacy (Modules 29-37)
29. **Force Right-Click** - Overrides site context menu blocks
30. **Force Text Selection** - Overrides copy/select blocks
31. **Anti-Scroll Lock** - Overrides `overflow:hidden` locks
32. **Auto-Close Popups** - Closes ad/spam popup windows
33. **Block Clipboard Read** - Prevents sites from reading clipboard
34. **Block Notification Spam** - Auto-denies notification permission prompts
35. **Anti-Screenshot Detection** - Blocks canvas-based screenshot detection
36. **Timezone Spoofing** - Matches UA region timezone
37. **Geolocation Spoofing** - Fakes GPS coordinates

---

## New Features in v4.6

### 🚀 Category Bulk Toggles (Popup + Options)
- **Enable All / Disable All per category** — Auto Bypass, Stealth, Extra, YouTube, Sites, Profile
- Category buttons in the popup header and per-panel buttons in Options
- Global Enable All / Disable All sync instantly between popup, Options, and All Modules tab

### 🎛️ All Modules Accordion (Options)
- Category groups are now **collapsible accordions** with +/- indicators
- Search bar filters across all modules in real time

### 🔄 Real-Time Sync
- `chrome.storage.onChanged` listener on both popup **and** options pages
- Changes made in either UI (or bulk toggles) reflect everywhere instantly

### 🐞 Critical Fixes (v4.6)
- **Fixed:** Category buttons (`page-auto`, `adblock-det`, `youtube-bypass`, `sites`, `profile`) referenced an undefined `POPUP_CATEGORIES` map in options.js and did nothing — now wired and guarded
- **Fixed:** Live sync missing in options page
- Module 17 overrides only `Navigator.prototype` (no instance override)
- Module 20 never intercepts YouTube API calls
- Safe-list (`isSafelistedHost()`) disables modules 5, 8, 27, 28, 31, 32 on AI sites
- SponsorBlock hooks deferred until video `readyState >= 1`; DOM scans batched/debounced
- Simulated click fallback navigation for TG mod APK download sites

### 📦 Extra Features (v4.6)
- Export / Import settings as JSON (Backup & Restore)
- Per-site profile presets
- Keyboard shortcuts: `Ctrl+Shift+E` enable all, `Ctrl+Shift+D` disable all, `Ctrl+Shift+F` focus search
- Stats dashboard (modules active, sites bypassed, traps bypassed, session time)

---

## New Features in v4.4

### 🔄 Settings Sync System
- **Real-time bidirectional sync** between Popup and Options page
- Changes made in either UI instantly reflect in the other
- Uses `chrome.storage.onChanged` listener for instant updates

### 🎛️ "All Modules" Section (Options Page)
- **Single unified view** of all 37 modules organized by category
- **Search bar** - Filter modules by name or description in real-time
- **Enable All / Disable All** buttons - Bulk toggle all modules instantly
- Module count per category displayed
- Clean card-based layout matching other sections

### ⚡ Popup Bulk Actions
- **Enable All / Disable All** buttons in popup header
- One-click toggle for all modules from the main popup
- Changes sync immediately to Options page

### 🛡️ Safe-List Protection for AI Sites
- **Gemini, ChatGPT, Claude, DeepSeek, Perplexity** automatically excluded from aggressive ad-detection
- Prevents false positives that broke typing/scrolling on legitimate AI platforms
- Modules 5, 8, 27, 31, 32, 33 now respect the safe-list

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
- Individual module toggles for all 17 categories
- Real-time status display
- Whitelist/blacklist buttons per site
- **Enable All / Disable All** bulk actions

### Options Page
- All 37 module toggles organized in 6 tabs
- **"All Modules" tab** with search + bulk actions
- WebGL vendor/renderer customization
- Whitelist/blacklist management with add/remove
- Bypass history viewer (last 50 sites)

---

## Bug Fixes in v4.4

- ✅ **Fixed**: `Uncaught TypeError: Cannot read properties of null (reading 'appendChild')` - Added null guards for DOM append operations
- ✅ **Fixed**: `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'forEach')` - Inlined settings module to avoid dynamic import issues
- ✅ **Fixed**: `Uncaught (in promise) TypeError: Cannot convert undefined or null to object` - Added defensive checks for storage operations
- ✅ **Fixed**: Download buttons on TG mod / link shortener sites being hidden by overly aggressive selectors
- ✅ **Fixed**: Image buttons and clickable elements incorrectly removed by ad-detection
- ✅ **Fixed**: Duplicate module entries (yt-ads2, yt-sponsor2) in options
- ✅ **Fixed**: Gemini/ChatGPT/Claude layout issues (scroll, typing, content visibility)
- ✅ **Fixed**: Settings sync between popup and options page

---

## Installation

1. Download or clone this repository
2. Open `brave://extensions` (or `chrome://extensions`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `additional featured extension` folder
5. All 37 modules are active by default

---

## Author

**Nikhil Sonawane** - [Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

## Disclaimer

This extension is for educational and research purposes only. Use responsibly.