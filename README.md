# BraveShield Bypass Pro - Anti-Detection Engine

A Chrome/Brave browser extension that completely bypasses Brave Browser detection and Shields ON anti-adblock traps across all websites.

---

## Features

- **Navigator.brave Destruction** - Removes `navigator.brave` from page JavaScript context
- **Client Hints Brand Sanitizer** - Strips "Brave" from `navigator.userAgentData.brands`
- **Global Privacy Control Mask** - Hides `navigator.globalPrivacyControl`
- **Ad/Analytics Variable Stubs** - Creates silent fakes for `adsbygoogle`, `ga`, `gtag`, `googletag`, `pbjs`
- **DOM Trap Dimension Neutralization** - Hooks `offsetHeight`, `offsetWidth`, `getBoundingClientRect`, `getComputedStyle` for ad-trap elements (reports 300x250px instead of 0x0)
- **WebGL Farbling Normalization** - Overrides Brave's randomized WebGL fingerprints with consistent Chrome GPU strings
- **Network Header Stripping** - Removes `Sec-CH-UA-Brave` and `Sec-CH-UA-Model` headers via declarativeNetRequest

## How It Works

1. **MAIN-World Injection at `document_start`** - Runs before any website script executes
2. **6 Stealth Modules** neutralize every detection vector simultaneously
3. **Network Layer** strips Brave-identifying HTTP headers
4. **Content Script Bridge** injects CSS to unhide falsely blocked elements

## Installation

### Chrome / Brave Browser

1. Download or clone this repository
2. Open `brave://extensions` (or `chrome://extensions`)
3. Enable **Developer mode** in the top-right corner
4. Click **Load unpacked** and select this folder
5. The extension icon appears in your toolbar

### Verify It Works

Visit any adblock detection site (e.g., news sites, streaming portals) - you will pass all checks seamlessly while keeping Brave Shields ON.

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Read/write extension settings |
| `scripting` | Script injection API |
| `activeTab` | Access current tab |
| `tabs` | Query tab information |
| `declarativeNetRequest` | Header modification |
| `<all_urls>` | Run on all pages |

## File Structure

```
├── manifest.json      # MV3 manifest
├── background.js      # Service Worker - badge, storage, messaging
├── content.js         # ISOLATED world - CSS injection, status bridge
├── inject.js          # MAIN world - Core stealth engine (6 modules)
├── popup.html/js      # Popup UI - toggle, stats
├── options.html/js    # Settings page
├── rules.json         # Header stripping rules
└── icons/             # Extension icons (16x16, 48x48, 128x128)
```

## Author

**Nikhil Sonawane** - [Nikhil-Sonawane87612](https://github.com/Nikhil-Sonawane87612)

## Disclaimer

This extension is for educational and research purposes only. Use responsibly and in compliance with applicable laws and website terms of service.
