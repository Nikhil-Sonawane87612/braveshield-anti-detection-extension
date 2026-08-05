# BraveShield Bypass Pro - Memory Map & Architecture Graph (v4.2)

## Project Structure

```
braveshield-anti-detection-extension/
├── .gitignore                         # Git ignore rules
├── MEMORY_MAP.md                      # This file
├── README.md                          # Project documentation
├── BraveShield-Bypass-Pro-v4.1.zip    # Release zip
│
├── manifest.json                      # MV3 manifest (v2.5 base)
├── background.js                      # Service Worker - badge, storage, messaging
├── content.js                         # ISOLATED world - CSS bridge, status responses
├── inject.js                          # MAIN world - Core stealth engine (6 modules)
├── popup.html                         # Popup UI - toggle, stats display
├── popup.js                           # Popup logic - read/write storage, tab info
├── options.html                       # Options page - settings UI (cosmetic)
├── options.js                         # Options logic - toast only (not wired)
├── rules.json                         # declarativeNetRequest - header stripping
├── icons/
│   ├── icon16.png                     # Toolbar icon
│   ├── icon48.png                     # Extension page icon
│   └── icon128.png                    # Store listing icon
│
└── additional featured extension/     # v4.2 - 27 modules + 170 UAs
    ├── manifest.json                  # MV3 manifest (v4.2)
    ├── background.js                  # Enhanced service worker + whitelist/blacklist
    ├── content.js                     # Enhanced content bridge + UA passthrough
    ├── inject.js                      # 27-module stealth engine (1400+ lines)
    ├── popup.html                     # Full-featured popup with UA selector
    ├── popup.js                       # Popup logic with all toggles
    ├── options.html                   # Complete settings page
    ├── options.js                     # All settings saveable + list management
    ├── rules.json                     # Enhanced header rules (2 rules)
    ├── useragents.js                  # 170+ user agents database (1800+ lines)
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

---

## Execution Flow (v4.1 Enhanced)

```
EXTENSION LOAD
    │
    ├─── rules.json ──────────────────────────► Network Layer
    │    Rule 1: Removes Sec-CH-UA-Brave, Sec-CH-UA-Model, X-Brave-Tracking
    │            Sets Sec-CH-UA-Arch="x86", Sec-CH-UA-Platform="Windows"
    │            Sets Sec-CH-UA-Full-Version-List (Chrome 124)
    │    Rule 2: Removes X-Brave-Shields response header
    │
    ├─── background.js ───────────────────────► Service Worker
    │    On install: init storage (30+ keys)
    │    On tab complete: badge "ON" (green) / "BYPASSING" (yellow) / "OFF" (red)
    │    Whitelist/Blacklist per-site control
    │    Message handlers: 15+ message types
    │    WebRequest listener for blocked request counting
    │
    ├─── content.js ──────────────────────────► ISOLATED World
    │    Injects: CSS to unhide [data-adblock-trap] elements
    │    Responds: CHECK_STATUS, PING messages
    │    Detects: link shorteners, cookie consent, countdown timers
    │    Shows: bypass toast notifications
    │    Passes: UA selection to inject.js via localStorage + CustomEvent
    │    Runs at: document_start, all frames
    │
    └─── inject.js ──────────────────────────► MAIN World
         Runs at: document_start, before ANY page script
         26 Modules:
         │
         ├── CORE ANTI-DETECTION (Modules 1-6)
         │   ├── 1. Navigator.brave ────────► delete + defineProperty → undefined + isBrave() → false
         │   ├── 2. Client Hints ───────────► filter brands, patch getHighEntropyValues
         │   ├── 3. GPC Mask ───────────────► hide navigator.globalPrivacyControl
         │   ├── 4. Ad/Analytics Stubs ─────► fake adsbygoogle, ga, gtag, googletag, pbjs
         │   ├── 5. DOM Trap Hooks ─────────► offsetHeight/Width, getBoundingClientRect, getComputedStyle
         │   └── 6. WebGL Normalization ────► spoof vendor/renderer (NVIDIA RTX 3060)
         │
         ├── AUTO-BYPASS FEATURES (Modules 7-12)
         │   ├── 7. Link Shortener ─────────► 50+ services, auto-click continue buttons
         │   ├── 8. Download Button Watcher ► watches DOM, auto-clicks download buttons when timer completes
         │   ├── 9. Cookie Consent ─────────► 20+ frameworks, auto-click "Accept All"
         │   ├── 10. Auto-Scroll ───────────► detect scroll requirements, auto-scroll
         │   ├── 11. Redirect Follower ─────► follow meta refresh + click-through redirects
         │   └── 12. Popunder Interceptor ──► block window.open ad popunders
         │
         ├── FINGERPRINT LEAK FIXES (Modules 13-16)
         │   ├── 13. brave:// Protocol ─────► override HTMLAnchorElement.href → chrome:
         │   ├── 14. Storage Quota ─────────► patch webkitTemporaryStorage → fake 2GB
         │   ├── 15. AudioContext ──────────► add consistent noise to OfflineAudioContext
         │   └── 16. Canvas Fingerprint ────► XOR micro-noise on toDataURL/getImageData
         │
         ├── ANTI-AUTOMATION (Modules 17-21)
         │   ├── 17. navigator.webdriver ───► return false on Navigator.prototype
         │   ├── 18. WebRTC IP Leak ────────► strip ICE servers from RTCPeerConnection
         │   ├── 19. Permission Auto-Deny ──► deny notification/camera/mic/geolocation/clipboard
         │   ├── 20. Network Bait Faking ───► fake fetch/XHR responses for ad-bait URLs
         │   └── 21. Performance Timer ─────► clamp precision to 0.01ms
         │
         ├── CONSISTENCY SPOOFING (Modules 22-25)
         │   ├── 22. Navigator Consistency ─► productSub, platform, languages, hardwareConcurrency, deviceMemory
         │   ├── 23. CSS Property Cleanup ──► remove --arc-*, --brave- CSS variables
         │   ├── 24. Font Fingerprint ──────► consistent document.fonts.check() results
         │   └── 25. Screen Consistency ────► realistic screen/outerWidth/outerHeight dimensions
         │
         └── USER AGENT SPOOFING (Module 26)
             └── 26. UA Spoofing ──────────► override navigator.userAgent, userAgentData, platform, vendor
                                             reads from localStorage (set by content.js)
                                             170+ UAs across 15 categories
         │
         └── ADBLOCK DETECTION BYPASS (Module 27)
             └── 27. Adblock Bypass ───────► bypass hispanoads, Admiral, BlockAdBlock, FuckAdBlock
                                             override detection vars/functions/classes
                                             fake ad-bait fetch/XHR, filter mutations
```

---

## Data Flow

```
┌─────────────────┐    chrome.storage    ┌──────────────────┐
│    popup.js     │ ◄──────────────────► │  background.js   │
│  (UA selector,  │    (30+ keys)        │  (badge, tabs,   │
│   toggles,      │                      │   whitelist,     │
│   whitelist)    │                      │   blacklist)     │
└─────────────────┘                      └──────────────────┘
        │                                        │
        │  chrome.tabs.sendMessage               │  chrome.webRequest
        ▼                                        ▼
┌─────────────────┐                      ┌──────────────────┐
│   content.js    │ ◄─── Page DOM ──────►│    rules.json    │
│  (ISOLATED)     │                      │  (Network Layer) │
│  UA passthrough │                      └──────────────────┘
│  toast UI       │
└─────────────────┘
        │
        │  localStorage + CustomEvent
        ▼
┌─────────────────┐
│    inject.js    │ ◄─── Page JS Context (MAIN World)
│  (26 modules)   │
│  before ANY     │
│  page script    │
└─────────────────┘
        │
        │  reads
        ▼
┌─────────────────┐
│  useragents.js  │  170+ categorized UAs
│  (15 categories)│  Desktop/Mobile/Tablet
└─────────────────┘
```

---

## Storage Schema (v4.1)

```javascript
chrome.storage.local = {
  // Core toggles
  enabled: true,                    // Master toggle
  bypassShieldsTraps: true,         // DOM trap bypass
  maskBraveApi: true,               // navigator.brave override
  spoofChromeUA: true,              // Client hints masking

  // Auto-bypass toggles
  autoBypassLinks: true,            // Link shortener bypass
  autoBypassTimers: true,           // 15-20s countdown bypass
  autoDismissCookies: true,         // Cookie consent dismiss
  autoScroll: true,                 // Smart auto-scroll
  interceptPopunders: true,         // Popunder interceptor

  // Stealth toggles
  fixBraveLeak: true,               // brave:// protocol fix
  fixStorageLeak: true,             // Storage quota fix
  normalizeAudio: true,             // AudioContext normalization
  normalizeCanvas: true,            // Canvas fingerprint fix
  hideWebdriver: true,              // navigator.webdriver hide
  preventWebRTC: true,              // WebRTC IP leak prevention
  autoDenyPermissions: true,        // Permission auto-deny
  fakeNetworkBait: true,            // Network bait response faking
  clampTimers: true,                // Performance timer clamp
  spoofNavigator: true,             // Navigator consistency
  screenConsistency: true,          // Screen/viewport consistency

  // Stats
  blockedCounter: 0,                // Blocked requests count
  bypassedSites: [],                // History of bypassed sites (max 200)

  // Per-site control
  whitelist: [],                    // Only work on these sites
  blacklist: [],                    // Disable on these sites

  // User Agent
  selectedUA: "random",             // Selected UA key from popup

  // Metadata
  version: "4.1.0"
}
```

---

## Message Types (15+)

| Message | Sender | Handler | Purpose |
|---------|--------|---------|---------|
| `GET_STATS` | popup.js | background.js | Get all stats + settings |
| `TOGGLE_ENABLED` | popup.js | background.js | Enable/disable extension |
| `TOGGLE_MODULE` | popup.js | background.js | Toggle individual module |
| `ADD_WHITELIST` | popup.js | background.js | Add site to whitelist |
| `REMOVE_WHITELIST` | options.js | background.js | Remove site from whitelist |
| `ADD_BLACKLIST` | popup.js | background.js | Add site to blacklist |
| `REMOVE_BLACKLIST` | options.js | background.js | Remove site from blacklist |
| `GET_CURRENT_TAB` | popup.js | background.js | Get active tab info |
| `BYPASS_COMPLETE` | content.js | background.js | Record bypassed site |
| `INCREMENT_COUNTER` | inject.js | background.js | Increment blocked counter |
| `GET_SITE_STATUS` | content.js | background.js | Check whitelist/blacklist |
| `CHECK_STATUS` | popup.js | content.js | Get content script status |
| `PING` | popup.js | content.js | Check if content script alive |
| `braveshield_ua_update` | content.js | inject.js | Pass UA via CustomEvent |

---

## Permissions Used

| Permission | Used By | Purpose |
|------------|---------|---------|
| `storage` | All JS files | Read/write settings |
| `scripting` | background.js | Script injection API |
| `activeTab` | background.js | Access current tab |
| `tabs` | background.js, popup.js | Query tab info |
| `declarativeNetRequest` | rules.json | Header modification |
| `declarativeNetRequestFeedback` | background.js | Rule feedback |
| `<all_urls>` | content.js, inject.js, rules.json | Run on all pages |

---

## 26 Module Details

### Module 1: Navigator.brave Destruction
- **Target:** `Navigator.prototype.brave`, `navigator.brave.isBrave()`
- **Method:** delete + defineProperty override + isBrave() → Promise.resolve(false)
- **Evasion:** Pages check `navigator.brave` existence and `isBrave()` method

### Module 2: Client Hints Brand Sanitizer
- **Target:** `navigator.userAgentData.brands`, `getHighEntropyValues()`
- **Method:** Filter "brave" entries, inject Chrome brands, patch getHighEntropyValues
- **Evasion:** Server-side and JS checks via User-Agent Client Hints

### Module 3: Global Privacy Control Mask
- **Target:** `navigator.globalPrivacyControl`
- **Method:** defineProperty → undefined
- **Evasion:** GPC is Brave-specific, signals Brave browser

### Module 4: Ad/Analytics Variable Stubs
- **Targets:** window.adsbygoogle, ga, gtag, googletag (with pubads API), pbjs
- **Method:** Create silent fake objects with working callbacks + cmd queue processing
- **Evasion:** Anti-adblock scripts check if these exist before flagging

### Module 5: DOM Trap Dimension Neutralization
- **Targets:** offsetHeight, offsetWidth, getBoundingClientRect, getComputedStyle
- **Method:** Hook prototypes, match 19 ad-related regex patterns
- **Patterns:** adsbygoogle, adblock, blockadblock, fuckadblock, admiral, taboola, outbrain, propeller, hilltop, etc.
- **Evasion:** Reports 300x250px instead of 0x0 for hidden trap elements

### Module 6: WebGL Farbling Normalization
- **Targets:** WebGLRenderingContext.getParameter, WebGL2RenderingContext.getParameter
- **Method:** Override vendor (37445) and renderer (37446) + GL_VERSION (0x1F01)
- **Spoofed:** NVIDIA GeForce RTX 3060 Direct3D11
- **Evasion:** Brave randomizes WebGL fingerprints; we return consistent strings

### Module 7: Link Shortener Auto-Bypass
- **Targets:** 50+ shortener hostnames
- **Services:** ouo.io, bc.vc, sh.st, adf.ly, linkvertise.com, clk.sh, tp.st, lr.in, rekonise.com, work.ink, exe.io, droplink.co, gplinks.co, etc.
- **Method:** Find and click Continue/Download/Get Link buttons via text and selector matching
- **Evasion:** Auto-clicks through link shortener wait pages

### Module 8: Download Button Watcher
- **Targets:** Download/get-link/continue buttons that appear after countdown
- **Method:**
  - MutationObserver watches DOM for new elements
  - Checks selectors: a[href*="download"], a[href*="get-link"], button.download, etc.
  - Validates visibility (offsetParent, offsetWidth, offsetHeight)
  - Auto-clicks when button appears and matches link patterns
  - Does NOT touch timers (lets site generate link server-side)
- **Evasion:** Auto-clicks download button when it appears after timer completes

### Module 9: Cookie Consent Auto-Dismiss
- **Targets:** 20+ consent framework selectors + text matching
- **Frameworks:** OneTrust, CookieBot, iubenda, Quantcast, Evidon, TrustArc, etc.
- **Method:** Click Accept All buttons + hide consent overlays
- **Evasion:** Auto-dismisses GDPR/cookie consent banners

### Module 10: Smart Auto-Scroll
- **Targets:** Pages with "scroll to bottom" requirements
- **Method:** Detect scroll text, auto-scroll smoothly, find "next page" links
- **Evasion:** Auto-scrolls pages requiring scroll before revealing links

### Module 11: Redirect Chain Follower
- **Targets:** meta[http-equiv="refresh"], click-through redirect links
- **Method:** Follow meta refresh URLs after delay, click "continue to link" buttons
- **Evasion:** Follows redirect chains automatically

### Module 12: Popunder Interceptor
- **Targets:** window.open calls to ad domains
- **Method:** Block window.open for ad-related URLs, return null
- **Evasion:** Blocks ad popunder/new-tab windows

### Module 13: brave:// Protocol Leak Fix
- **Target:** HTMLAnchorElement.href resolution for "brave:" scheme
- **Method:** Override document.createElement to patch href getter
- **Evasion:** `document.createElement('a').href='brave://x'` returns `brave:` in Brave, `chrome:` in Chrome

### Module 14: Storage Quota Leak Fix
- **Targets:** navigator.webkitTemporaryStorage.queryUsageAndQuota, webkitPersistentStorage
- **Method:** Override success callback to return fake 2GB quota
- **Evasion:** Brave only patches `navigator.storage.estimate()`, not webkit APIs

### Module 15: AudioContext Fingerprint Normalization
- **Target:** OfflineAudioContext.startRendering()
- **Method:** Add consistent sinusoidal noise (seed=12345) to audio buffer output
- **Evasion:** Audio fingerprinting uses OfflineAudioContext output hash

### Module 16: Canvas Fingerprint Normalization
- **Targets:** HTMLCanvasElement.toDataURL, CanvasRenderingContext2D.getImageData
- **Method:** XOR micro-noise (bit flip) on pixel data
- **Evasion:** Canvas fingerprinting uses toDataURL/getImageData output hash

### Module 17: navigator.webdriver Hide
- **Target:** navigator.webdriver, Navigator.prototype.webdriver
- **Method:** defineProperty → false
- **Evasion:** Chrome sets webdriver=true for automated sessions

### Module 18: WebRTC IP Leak Prevention
- **Target:** RTCPeerConnection constructor
- **Method:** Strip ICE servers from config, also override webkitRTCPeerConnection
- **Evasion:** RTCPeerConnection exposes local IPs via STUN

### Module 19: Permission Auto-Deny
- **Targets:** Notification, Geolocation, Clipboard, MediaDevices, IdleDetector
- **Method:** Override requestPermission/getCurrentPosition/getUserMedia to deny
- **Evasion:** Auto-deny permission prompts

### Module 20: Network Bait Response Faking
- **Targets:** fetch() and XMLHttpRequest for ad-bait URLs
- **Method:** Intercept requests to /ads/, /adserver/, doubleclick, adsystem paths
- **Returns:** Fake 200 OK responses with empty body
- **Evasion:** Anti-adblock scripts send bait requests and check if they succeed

### Module 21: Performance Timer Clamp
- **Target:** performance.now()
- **Method:** Clamp precision to 0.01ms (Math.round(t * 100) / 100)
- **Evasion:** High-precision timing reveals injected scripts

### Module 22: Navigator Consistency Spoofing
- **Targets:** navigator.productSub, platform, languages, hardwareConcurrency, deviceMemory
- **Method:** Return consistent values (20030107, Win32, [en-US,en], 8 cores, 8GB)
- **Evasion:** Cross-checks between navigator properties catch spoofing

### Module 23: CSS Custom Property Cleanup
- **Targets:** CSS variables starting with --arc- or --brave-
- **Method:** Remove injected CSS variables from document.documentElement.style
- **Evasion:** Arc browser injects --arc-palette-title, Brave may inject --brave-* variables

### Module 24: Font Fingerprint Spoofing
- **Target:** document.fonts.check()
- **Method:** Return true for common fonts (Arial, Helvetica, Times New Roman, etc.)
- **Evasion:** Font enumeration reveals installed fonts

### Module 25: Screen/Viewport Consistency
- **Targets:** screen.availWidth/Height, screen.width/height, window.outerWidth/Height
- **Method:** Return realistic dimensions (1920x1080) if zero
- **Evasion:** Headless browsers have zero outer dimensions

### Module 26: User Agent Spoofing (170+ UAs)
- **Targets:** navigator.userAgent, appVersion, platform, userAgentData, vendor, oscpu, connection
- **Method:**
  - Read selected UA from localStorage (set by content.js)
  - Override all navigator properties consistently
  - Override userAgentData.brands, mobile, platform
  - Override getHighEntropyValues for full consistency
  - Override navigator.vendor based on browser type
  - Override navigator.connection for network consistency
- **Categories (15):**
  1. Desktop Chrome (Windows) - 12 UAs
  2. Desktop Chrome (Mac) - 12 UAs
  3. Desktop Chrome (Linux) - 12 UAs
  4. Desktop Edge (Windows) - 12 UAs
  5. Desktop Firefox (Windows) - 6 UAs
  6. Desktop Firefox (Mac) - 6 UAs
  7. Desktop Safari (Mac) - 17 UAs
  8. Desktop Opera (Windows) - 11 UAs
  9. Mobile Chrome (Android) - 12 UAs
  10. Mobile Samsung (Android) - 7 UAs
  11. Mobile Firefox (Android) - 6 UAs
  12. Mobile Safari (iPhone) - 17 UAs
  13. Mobile Chrome (iPhone) - 12 UAs
  14. Tablet Safari (iPad) - 17 UAs
  15. Tablet Chrome (Android) - 12 UAs

### Module 27: Adblock Detection Bypass
- **Targets:** hispanoads, Admiral, BlockAdBlock, FuckAdBlock, and similar detection services
- **Methods:**
  - Override adblock detection variables (adBlockDetected, canRunAds, etc.)
  - Override detection functions (checkAdBlock, detectAdBlock, etc.)
  - Override BlockAdBlock/FuckAdBlock class constructors
  - Filter ad-bait mutations from MutationObserver
  - Fake ad-bait fetch/XHR responses (200 OK)
  - Neutralize ad-bait script creation via document.createElement override
  - CSS overrides for ad-bait element visibility
  - Hide adblock detection modals/overlays
  - MutationObserver to dynamically remove modals

---

## User Agent Database Structure

```javascript
// useragents.js
const USER_AGENTS = {
  "Chrome 131 (Win11)": {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...",
    brands: [{ brand: "Google Chrome", version: "131" }, ...],
    platform: "Windows",
    mobile: false,
    platformVersion: "15.0.0"
  },
  // ... 170+ entries
};

// popup.js UA_MAP (35 pre-configured selections)
const UA_MAP = {
  "random": { label: "Random Chrome" },
  "chrome_win131": { ua: "...", brands: [...], platform: "Windows", ... },
  // ... 35 entries
};
```

---

## Known Limitations (Addressed in v4.1)

| Issue | v2.5 Status | v4.1 Status |
|-------|-------------|-------------|
| Options page cosmetic | ❌ Not wired | ✅ All settings saveable |
| blockedCounter static | ❌ Fixed at 142 | ✅ Increments on blocked requests |
| No per-site toggle | ❌ Global only | ✅ Whitelist/Blacklist system |
| No link shortener bypass | ❌ Not handled | ✅ 50+ services auto-bypassed |
| No timer auto-click | ❌ Not handled | ✅ 15-20s countdowns accelerated |
| No cookie consent dismiss | ❌ Not handled | ✅ 20+ frameworks auto-dismissed |
| No redirect following | ❌ Not handled | ✅ Meta refresh + click-through |
| brave:// protocol leak | ❌ Not patched | ✅ Fixed in Module 13 |
| Storage quota leak | ❌ Not patched | ✅ Fixed in Module 14 |
| AudioContext fingerprint | ❌ Not patched | ✅ Normalized in Module 15 |
| Canvas fingerprint | ❌ Not patched | ✅ Normalized in Module 16 |
| navigator.webdriver | ❌ Not patched | ✅ Hidden in Module 17 |
| WebRTC IP leak | ❌ Not patched | ✅ Blocked in Module 18 |
| UA spoofing | ❌ Not available | ✅ 170+ UAs, 15 categories |

---

## File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| inject.js | 930+ | 26-module stealth engine |
| useragents.js | 1821 | 170+ user agent database |
| background.js | 200+ | Enhanced service worker |
| content.js | 175+ | Enhanced content bridge |
| popup.html | 175+ | Full popup with UA selector |
| popup.js | 240+ | All popup logic |
| options.html | 195+ | Complete settings page |
| options.js | 100+ | Settings persistence + lists |
| rules.json | 30+ | 2 header rules |

---

## GitHub Repository

- **URL:** https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension
- **Author:** Nikhil Sonawane
- **Current Release:** v4.1.0
- **Latest Asset:** BraveShield-Bypass-Pro-v4.1.zip

---

## Quick Reference: Module Numbers

| # | Module | Category |
|---|--------|----------|
| 1 | Navigator.brave | Core |
| 2 | Client Hints | Core |
| 3 | GPC Mask | Core |
| 4 | Ad/Analytics Stubs | Core |
| 5 | DOM Trap Hooks | Core |
| 6 | WebGL Normalization | Core |
| 7 | Link Shortener Bypass | Auto-Bypass |
| 8 | 15-20s Timer Bypass | Auto-Bypass |
| 9 | Cookie Consent | Auto-Bypass |
| 10 | Auto-Scroll | Auto-Bypass |
| 11 | Redirect Follower | Auto-Bypass |
| 12 | Popunder Interceptor | Auto-Bypass |
| 13 | brave:// Protocol Fix | Fingerprint Fix |
| 14 | Storage Quota Fix | Fingerprint Fix |
| 15 | AudioContext Normalization | Fingerprint Fix |
| 16 | Canvas Fingerprint Fix | Fingerprint Fix |
| 17 | navigator.webdriver | Anti-Automation |
| 18 | WebRTC IP Leak | Anti-Automation |
| 19 | Permission Auto-Deny | Anti-Automation |
| 20 | Network Bait Faking | Anti-Automation |
| 21 | Performance Timer Clamp | Anti-Automation |
| 22 | Navigator Consistency | Consistency |
| 23 | CSS Property Cleanup | Consistency |
| 24 | Font Fingerprint | Consistency |
| 25 | Screen Consistency | Consistency |
| 26 | User Agent Spoofing | UA Spoofing |
