# BraveShield Bypass Pro - Memory Map & Architecture Graph

## Project Structure

```
braveshield-anti-detection-extension/
├── manifest.json          # MV3 manifest - permissions, scripts, rules
├── background.js          # Service Worker - badge, storage, messaging
├── content.js             # ISOLATED world - CSS bridge, status responses
├── inject.js              # MAIN world - Core stealth engine (6 modules)
├── popup.html             # Popup UI - toggle, stats display
├── popup.js               # Popup logic - read/write storage, tab info
├── options.html           # Options page - settings UI (cosmetic)
├── options.js             # Options logic - toast only (not wired)
├── rules.json             # declarativeNetRequest - header stripping
├── icons/
│   ├── icon16.png         # Toolbar icon
│   ├── icon48.png         # Extension page icon
│   └── icon128.png        # Store listing icon
├── README.md              # Project documentation
└── _metadata/             # BUILD ARTIFACT (exclude from repo)
```

---

## Execution Flow

```
EXTENSION LOAD
    │
    ├─── rules.json ──────────────────────► Network Layer
    │    Removes: Sec-CH-UA-Brave
    │    Sets: Sec-CH-UA-Arch = "x86"
    │
    ├─── background.js ───────────────────► Service Worker
    │    On install: init storage {enabled, blockedCounter}
    │    On tab complete: set badge "ON" (green)
    │    Message handler: GET_STATS, TOGGLE_ENABLED
    │
    ├─── content.js ──────────────────────► ISOLATED World
    │    Injects: CSS to unhide [data-adblock-trap] elements
    │    Responds: CHECK_STATUS, PING messages
    │    Runs at: document_start, all frames
    │
    └─── inject.js ──────────────────────► MAIN World
         Runs at: document_start, before ANY page script
         Modules:
         │
         ├── 1. Navigator.brave ──────────► delete/override → undefined
         ├── 2. Client Hints ─────────────► filter brands, patch getHighEntropyValues
         ├── 3. GPC Mask ─────────────────► hide navigator.globalPrivacyControl
         ├── 4. Ad/Analytics Stubs ───────► fake adsbygoogle, ga, gtag, googletag, pbjs
         ├── 5. DOM Trap Hooks ───────────► offsetHeight/Width, getBoundingClientRect, getComputedStyle
         └── 6. WebGL Normalization ──────► spoof vendor/renderer strings
```

---

## Data Flow

```
┌─────────────┐     storage      ┌──────────────┐
│   popup.js  │ ◄──────────────► │ background.js│
└─────────────┘                  └──────────────┘
                                        │
                                  onMessage
                                        │
                                        ▼
                                  ┌──────────────┐
                                  │  content.js  │ ◄───► Page DOM
                                  └──────────────┘
                                        │
                                  inject into
                                        ▼
                                  ┌──────────────┐
                                  │   inject.js  │ ◄───► Page JS Context
                                  └──────────────┘
```

---

## Storage Schema

```javascript
chrome.storage.local = {
  enabled: true,           // Master toggle
  bypassShieldsTraps: true, // DOM trap bypass
  maskBraveApi: true,       // navigator.brave override
  spoofChromeUA: true,      // Client hints masking
  blockedCounter: 142       // Static display value (not incremented)
}
```

---

## Permissions Used

| Permission | Used By | Purpose |
|------------|---------|---------|
| `storage` | background.js, popup.js, options.js | Read/write settings |
| `scripting` | background.js | Script injection API |
| `activeTab` | background.js | Access current tab |
| `tabs` | background.js, popup.js | Query tab info |
| `declarativeNetRequest` | rules.json | Header modification |
| `declarativeNetRequestFeedback` | background.js | Rule feedback |
| `<all_urls>` | content.js, inject.js, rules.json | Run on all pages |

---

## Stealth Module Details

### Module 1: Navigator.brave Destruction
- **File:** inject.js (lines ~15-30)
- **Target:** `Navigator.prototype.brave`
- **Method:** delete + defineProperty override
- **Detection Evasion:** Pages check `navigator.brave` existence

### Module 2: Client Hints Brand Sanitizer
- **File:** inject.js (lines ~35-70)
- **Target:** `navigator.userAgentData.brands`
- **Method:** Filter "brave" entries, inject Chrome 124 brands
- **Detection Evasion:** Server-side and JS checks via User-Agent Client Hints

### Module 3: Global Privacy Control Mask
- **File:** inject.js (lines ~73-80)
- **Target:** `navigator.globalPrivacyControl`
- **Method:** defineProperty → undefined
- **Detection Evasion:** GPC is Brave-specific, signals Brave browser

### Module 4: Ad/Analytics Variable Stubs
- **File:** inject.js (lines ~85-180)
- **Targets:** window.adsbygoogle, ga, gtag, googletag, pbjs
- **Method:** Create silent fake objects with working callbacks
- **Detection Evasion:** Anti-adblock scripts check if these exist before flagging

### Module 5: DOM Trap Dimension Neutralization
- **File:** inject.js (lines ~185-280)
- **Targets:** offsetHeight, offsetWidth, getBoundingClientRect, getComputedStyle
- **Method:** Hook prototypes, match 12 ad-related regex patterns
- **Detection Evasion:** When Shields hide trap elements → report 300x250px instead of 0x0

### Module 6: WebGL Farbling Normalization
- **File:** inject.js (lines ~285-310)
- **Targets:** WebGLRenderingContext.getParameter, WebGL2RenderingContext.getParameter
- **Method:** Override vendor (37445) and renderer (37446) parameters
- **Detection Evasion:** Brave randomizes WebGL fingerprints; we return consistent strings

---

## Known Limitations

1. **Options page is cosmetic** - checkboxes/text fields don't save to storage
2. **blockedCounter is static** - initialized to 142, never incremented
3. **No per-site toggle** - can only enable/disable globally
4. **No link shortener bypass** - doesn't handle "wait X seconds" or "click ad" pages
5. **No timer auto-click** - can't auto-proceed through countdown pages
6. **No cookie consent auto-dismiss** - GDPR banners still appear
7. **No redirect chain following** - link shortener redirects not automated
