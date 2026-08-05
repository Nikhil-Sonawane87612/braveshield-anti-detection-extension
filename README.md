# BraveShield Bypass Pro - Anti-Detection Engine

A Chrome/Brave browser extension with **39 modules** that bypasses Brave Browser detection, adblock traps, YouTube ads, link shorteners, and adds privacy/utility features.

---

## Features (39 Modules)

### Core Anti-Detection (Modules 1-6)
- **Navigator.brave Destruction** — Removes `navigator.brave` + `isBrave()` from page JavaScript
- **Client Hints Brand Sanitizer** — Strips "Brave" from `navigator.userAgentData.brands`
- **Global Privacy Control Mask** — Hides `navigator.globalPrivacyControl`
- **Ad/Analytics Variable Stubs** — Creates silent fakes for `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
- **DOM Trap Dimension Neutralization** — Hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect` for ad-trap elements
- **WebGL Farbling Normalization** — Overrides Brave's randomized WebGL fingerprints with consistent Chrome GPU strings

### Auto-Bypass Features (Modules 7-12)
- **Link Shortener Auto-Bypass** — 50+ services (ouo.io, bc.vc, sh.st, linkvertise, etc.)
- **Timer/Countdown Auto-Bypass** — Auto-clicks "Get Link" when countdown finishes
- **Cookie Consent Auto-Dismiss** — 20+ consent frameworks auto-dismissed
- **Smart Auto-Scroll** — Auto-scrolls pages requiring scroll
- **Redirect Chain Follower** — Follows meta refresh and click-through redirects
- **Popunder Interceptor** — Blocks ad popunder windows

### Fingerprint Leak Fixes (Modules 13-16)
- **brave:// Protocol Leak Fix** — Prevents DOM URL parser from leaking `brave:` scheme
- **Storage Quota Leak Fix** — Patches `webkitTemporaryStorage` to hide real disk size
- **AudioContext Normalization** — Consistent `OfflineAudioContext` output
- **Canvas Fingerprint Fix** — Consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (Modules 17-21)
- **navigator.webdriver Hide** — Returns `false` for webdriver flag
- **WebRTC IP Leak Prevention** — Strips ICE servers to prevent local IP exposure
- **Permission Auto-Deny** — Auto-deny notification/camera/mic/geolocation
- **Network Bait Response Faking** — Fakes `fetch()`/`XMLHttpRequest` for ad-bait requests
- **Performance Timer Clamp** — Reduces precision to prevent timing attacks

### Consistency Spoofing (Modules 22-26)
- **Navigator Consistency Spoofing** — Consistent platform/hardware/languages values
- **CSS Custom Property Cleanup** — Removes browser-injected CSS variables
- **Font Fingerprint Spoofing** — Consistent `document.fonts.check()` results
- **Screen/Viewport Consistency** — Realistic screen dimensions
- **User Agent Spoofing** — 170+ user agents across 15 categories

### Adblock & Anti-Wall (Modules 27-29)
- **Adblock Detection Bypass** — Bypasses hispanoads, Admiral, BlockAdBlock, FuckAdBlock
- **Click Image Wait Bypass** — Handles "CLICK IMAGE WAIT 10 SECOND" ad patterns
- **YouTube Ad Block + SponsorBlock** — Blocks video ads, skips sponsored segments via SponsorBlock API

### Privacy & Utility (Modules 30-39)
- **Force Right-Click** — Override sites that block right-click context menu
- **Force Text Selection** — Override sites that disable text selection/copy
- **Anti-Scroll Lock** — Override `overflow:hidden` that blocks page scrolling
- **Auto-Close Popups** — Block popup windows from ads
- **Block Clipboard Read** — Prevent sites from reading your clipboard
- **Block Notification Spam** — Auto-deny notification permission requests
- **Timezone Spoofing** — Match timezone to selected user agent region
- **Geolocation Spoofing** — Fake GPS coordinates based on selected region
- **Force Dark Mode** — Force dark theme on all websites
- **Reader Mode** — Strip ads and clutter for clean reading view

---

## How It Works

1. **MAIN-World Injection at `document_start`** — Runs before any website script executes
2. **39 Stealth Modules** neutralize every detection vector simultaneously
3. **Network Layer** strips Brave-identifying HTTP headers
4. **Content Script Bridge** injects CSS to unhide falsely blocked elements
5. **170+ User Agents** for consistent identity spoofing

---

## Installation

### Option 1: Download Release (Recommended)

1. Download the latest `.ZIP` file from [Releases](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/latest)
2. **Right-click the ZIP file** and select **"Extract All"** (or use 7-Zip/WinRAR)
3. You will get a folder — open it, you should see `manifest.json` inside
4. Open Brave Browser and go to `brave://extensions`
5. Toggle **Developer mode** ON (top-right corner)
6. Click **"Load unpacked"** button (top-left)
7. **Select the extracted folder** (the one containing `manifest.json`)
8. Done! Extension icon appears in toolbar

> **Important:** Do NOT drag-and-drop the ZIP file. Chrome/Brave cannot load ZIP files directly. You MUST extract first, then use "Load unpacked".

### Option 2: Clone Repository

1. Clone the repository:
   ```bash
   git clone https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension.git
   ```
2. Open Brave/Chrome and navigate to `brave://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `additional featured extension` folder
5. Done — all 39 modules are active by default

---

## Configuration

### Popup Menu
- Click the extension icon in the toolbar
- Toggle individual modules on/off
- Select user agent from 170+ options (15 categories)
- Add sites to whitelist or blacklist

### Advanced Options
- Click "Advanced Options" in the popup
- Toggle all 39 modules individually
- Customize WebGL vendor/renderer strings
- Manage per-site whitelist/blacklist
- View bypass history

### Per-Site Control
- **Whitelist** — Extension only works on whitelisted sites
- **Blacklist** — Extension disabled on blacklisted sites
- Manage via popup buttons or options page

---

## User Agent Categories (170+)

| Category | Count |
|----------|-------|
| Desktop Chrome (Windows) | 12 |
| Desktop Chrome (Mac) | 12 |
| Desktop Chrome (Linux) | 12 |
| Desktop Edge (Windows) | 12 |
| Desktop Firefox (Windows) | 6 |
| Desktop Firefox (Mac) | 6 |
| Desktop Safari (Mac) | 17 |
| Desktop Opera (Windows) | 11 |
| Mobile Chrome (Android) | 12 |
| Mobile Samsung (Android) | 7 |
| Mobile Firefox (Android) | 6 |
| Mobile Safari (iPhone) | 17 |
| Mobile Chrome (iPhone) | 12 |
| Tablet Safari (iPad) | 17 |
| Tablet Chrome (Android) | 12 |

---

## File Structure

```
braveshield-anti-detection-extension/
├── README.md
├── .gitignore
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── additional featured extension/
    ├── manifest.json
    ├── background.js
    ├── content.js
    ├── inject.js              # 39-module stealth engine
    ├── popup.html/js
    ├── options.html/js
    ├── useragents.js           # 170+ user agents
    ├── rules.json
    └── icons/
```

---

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Read/write extension settings |
| `scripting` | Script injection API |
| `activeTab` | Access current tab |
| `tabs` | Query tab information |
| `declarativeNetRequest` | Header modification |
| `<all_urls>` | Run on all pages |

---

## Author

**Nikhil Sonawane** — [Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

---

## Disclaimer

This extension is for educational and research purposes only. Use responsibly and in compliance with applicable laws and website terms of service.
