# BraveShield Bypass Pro - Anti-Detection Engine

A Chrome/Brave browser extension that completely bypasses Brave Browser detection and Shields ON anti-adblock traps across all websites.

---

## Features

### Core Anti-Detection (Modules 1-6)
- **Navigator.brave Destruction** - Removes `navigator.brave` + `isBrave()` from page JavaScript
- **Client Hints Brand Sanitizer** - Strips "Brave" from `navigator.userAgentData.brands`
- **Global Privacy Control Mask** - Hides `navigator.globalPrivacyControl`
- **Ad/Analytics Variable Stubs** - Creates silent fakes for `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
- **DOM Trap Dimension Neutralization** - Hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect`, `getComputedStyle` for ad-trap elements (reports 300x250px instead of 0x0)
- **WebGL Farbling Normalization** - Overrides Brave's randomized WebGL fingerprints with consistent Chrome GPU strings

### Auto-Bypass Features (Modules 7-12)
- **Link Shortener Auto-Bypass** - 50+ services (ouo.io, bc.vc, sh.st, linkvertise, etc.)
- **15-20s Timer/Countdown Bypass** - Speeds up countdowns (15-20s → 50ms), no auto-click
- **Cookie Consent Auto-Dismiss** - 20+ consent frameworks auto-dismissed
- **Smart Auto-Scroll** - Auto-scrolls pages requiring scroll
- **Redirect Chain Follower** - Follows meta refresh and click-through redirects
- **Popunder Interceptor** - Blocks ad popunder windows

### Fingerprint Leak Fixes (Modules 13-16)
- **brave:// Protocol Leak Fix** - Prevents DOM URL parser from leaking `brave:` scheme
- **Storage Quota Leak Fix** - Patches `webkitTemporaryStorage` to hide real disk size
- **AudioContext Normalization** - Consistent `OfflineAudioContext` output
- **Canvas Fingerprint Fix** - Consistent `toDataURL()`/`getImageData()` output

### Anti-Automation (Modules 17-21)
- **navigator.webdriver Hide** - Returns `false` for webdriver flag
- **WebRTC IP Leak Prevention** - Strips ICE servers to prevent local IP exposure
- **Permission Auto-Deny** - Auto-deny notification/camera/mic/geolocation
- **Network Bait Response Faking** - Fakes `fetch()`/`XMLHttpRequest` for ad-bait requests
- **Performance Timer Clamp** - Reduces precision to prevent timing attacks

### Consistency Spoofing (Modules 22-25)
- **Navigator Consistency Spoofing** - Consistent platform/hardware/languages values
- **CSS Custom Property Cleanup** - Removes browser-injected CSS variables
- **Font Fingerprint Spoofing** - Consistent `document.fonts.check()` results
- **Screen/Viewport Consistency** - Realistic screen dimensions

### Adblock Detection Bypass (Module 27)
- **Adblock Detection Bypass** - Bypasses hispanoads, Admiral, BlockAdBlock, FuckAdBlock
- **Detection Variable Override** - Returns false for `adBlockDetected`, `canRunAds`, etc.
- **Detection Function Override** - `checkAdBlock()` → returns false
- **Class Constructor Override** - BlockAdBlock/FuckAdBlock no-ops
- **Ad-Bait Request Faking** - Fake 200 OK for ad-bait fetch/XHR probes
- **Modal/Overlay Removal** - Auto-hides "Ad Blocker Detected" modals
- **CSS Visibility Overrides** - Prevents ad-bait element hiding

---

## How It Works

1. **MAIN-World Injection at `document_start`** - Runs before any website script executes
2. **27 Stealth Modules** neutralize every detection vector simultaneously
3. **Network Layer** strips Brave-identifying HTTP headers
4. **Content Script Bridge** injects CSS to unhide falsely blocked elements

---

## Installation

### Option 1: Download Release (Recommended)

1. Download the latest `.ZIP` file from [Releases](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/releases/latest)
2. Extract the ZIP file to a folder on your computer
3. Open Brave Browser and navigate to:
   ```
   brave://extensions
   ```
   (or `chrome://extensions` for Chrome)
4. Toggle **Developer mode** in the top-right corner
5. Click **Load unpacked** and select the **`additional featured extension`** folder from the extracted ZIP
6. The extension icon appears in your toolbar - you're done!

### Option 2: Clone Repository

1. Clone the repository:
   ```bash
   git clone https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension.git
   ```
2. Open Brave/Chrome and navigate to `brave://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `additional featured extension` folder
5. Done - all 25 modules are active by default

### Verify It Works

1. Visit any adblock detection site (news sites, streaming portals)
2. You will pass all checks while keeping Brave Shields ON
3. The badge shows "ON" (green) or "BYPASSING" (yellow) on link shortener sites

---

## Configuration

### Popup Menu
- Click the extension icon in the toolbar
- Toggle individual modules on/off
- Add sites to whitelist or blacklist
- View bypass statistics

### Advanced Options
- Click "Advanced Options" in the popup
- Customize WebGL vendor/renderer strings
- Manage per-site whitelist/blacklist
- View bypass history

### Per-Site Control
- **Whitelist** - Extension only works on whitelisted sites
- **Blacklist** - Extension disabled on blacklisted sites
- Manage via popup buttons or options page

---

## File Structure

```
braveshield-anti-detection-extension/
├── README.md                          # This file
├── MEMORY_MAP.md                      # Architecture documentation
├── .gitignore                         # Git ignore rules
├── manifest.json                      # MV3 manifest (v2.5 base)
├── background.js                      # Service Worker
├── content.js                         # ISOLATED world bridge
├── inject.js                          # MAIN world stealth engine
├── popup.html/js                      # Popup UI
├── options.html/js                    # Settings page
├── rules.json                         # Header stripping rules
├── icons/                             # Extension icons
└── additional featured extension/     # v4.0 with 25 modules
    ├── manifest.json                  # MV3 manifest (v4.0)
    ├── background.js                  # Enhanced service worker
    ├── content.js                     # Enhanced content bridge
    ├── inject.js                      # 25-module stealth engine
    ├── popup.html/js                  # Full-featured popup
    ├── options.html/js                # Complete settings page
    ├── rules.json                     # Enhanced header rules
    └── icons/                         # Extension icons
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

**Nikhil Sonawane** - [Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

---

## Disclaimer

This extension is for educational and research purposes only. Use responsibly and in compliance with applicable laws and website terms of service.
