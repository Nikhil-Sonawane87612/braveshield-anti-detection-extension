# 🧠 BraveShield Bypass Pro — Project Memory & Architecture Log

> **MANDATORY DIRECTIVE**: Consult this file BEFORE making any code changes. This document records all battle-tested architectural invariants, verified working features, lessons learned from bugs, and critical rules that must NEVER be violated or forgotten.

---

## 📌 1. Critical Project Invariants & Hard Rules

### 🚫 Rule 1: NEVER Auto-Click Shortener / Download Buttons
- **The Rule**: Always unhide, un-disable (`disabled = false`, `pointer-events: auto`, `opacity: 1`), and zero out countdown timers, but **NEVER automatically dispatch `.click()`** on `#btn-main`, `#get-link`, `.download-btn`, or `#wpsafe-generate`.
- **Reason**: Auto-clicking causes race conditions, triggers *"Bad Request"* / *"Premature Click"* server alerts, and forces unwanted tab redirects before the user is ready.

### 🧹 Rule 2: ZERO Explicit / 18+ Keywords Anywhere in Repo
- **The Rule**: Never use explicit words (`18+`, `adult`, `porn*`, etc.) in file names, code comments, regex identifiers, commit messages, documentation, or GitHub releases.
- **Wording Convention**: Always frame these features as **"Universal Consent, Terms & Disclaimer Fast-Pass"** or **"Compliance Verification Neutralizer"**.

### 🛡️ Rule 3: NEVER Break Spotify or Captcha / Auth Challenges
- **The Rule**: The modal annihilator (`annihilateAntiAdblockModals`) must ALWAYS check `isProtectedCaptchaOrAuth(el)`.
- **Exclusions**: Never remove or hide elements/iframes containing: `arkose`, `arkoselabs`, `funcaptcha`, `recaptcha`, `hcaptcha`, `turnstile`, `cf-chl`, `challenge-stage`, `accounts.spotify.com`, `challenge.spotify.com`.
- **Media Preservation**: Preserves Spotify audio streaming CDNs (`audio-fa.scdn.co`) in all DNS and network rules.

### 📄 Rule 4: Strictly Exclude Blog & Article Pagination Links
- **The Rule**: In shortener and link processors, check `isPaginationOrNavigation(el)`.
- **Exclusions**: Never touch links matching `/reverse-paginate|updated-max|max-results|blog-pager|pagination|page-numbers|older-posts|newer-posts/i`. Touching these causes infinite reload loops on Blogger / WordPress sites.

---

## ⚡ 2. Working Implementations & Architecture Reference

### ⏩ A. Turbo Timer & Countdown Fast-Pass Engine (Working Formula)
- **Files**: [`inject.js`](inject.js) (Module 32), [`content.js`](content.js), [`braveshield-android.user.js`](braveshield-android.user.js) (Group C).
- **Working Pattern**:
  ```javascript
  // Fast 25x-50x compression without breaking clocks
  window.setTimeout = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (numDelay >= 500 && numDelay <= 180000) numDelay = Math.max(10, Math.floor(numDelay / 25));
    return origSetTimeout.call(this, handler, numDelay, ...args);
  };

  window.setInterval = function(handler, delay, ...args) {
    let numDelay = typeof delay === 'number' ? delay : (parseInt(delay, 10) || 0);
    if (numDelay >= 40 && numDelay <= 300) numDelay = 10;
    else if (numDelay >= 800 && numDelay <= 2000) numDelay = 25; // 1s tick -> 25ms
    return origSetInterval.call(this, handler, numDelay, ...args);
  };
  ```
- **DOM Countdown Zeroer**: Target `.timer, #timer, .countdown, #countdown, [data-timer], .wait-time` and set `innerText = '0'` + dispatch `change` and `input` events.
- **Button Arming**: Strip `disabled`, `aria-disabled`, remove class `disabled`, set `style.pointerEvents = 'auto'`, `style.display = 'inline-block'`, `style.opacity = '1'`.

---

### 🕵️‍♂️ B. Anti-Brave & Anti-Adblock Defuser Engine
- **Files**: [`inject.js`](inject.js) (Module 0 & 2), [`content.js`](content.js), [`braveshield-android.user.js`](braveshield-android.user.js).
- **Key Techniques**:
  1. **Network Probe Mocking**: Intercept `fetch` and `XMLHttpRequest` targeting ad-script endpoints (`pagead2.googlesyndication.com`, `/ads.js`, `adservice.google.com`, `securepubads.g.doubleclick.net`, `prebid.js`) and return mock `200 OK` (`window.canRunAds=true;window.isAdBlockActive=false;`).
  2. **Bait Element Geometry & ComputedStyle Hook**:
     - `offsetHeight`, `offsetWidth`, `clientHeight`, `clientWidth` on bait classes (`.adsbox`, `#ad-banner`, `.ad-zone`) return `250px` / `300px`.
     - `window.getComputedStyle(baitEl)` returns Proxy with `display: 'block'`, `visibility: 'visible'`, `opacity: '1'`.
  3. **Global Ad & Commercial Detector Stubs**:
     - `window.FuckAdBlock`, `window.BlockAdBlock`, `window.fuckAdBlock`, `window.adblockDetector`, `window.canRunAds = true`, `window.isAdBlockActive = false`.
     - `window.adsbygoogle = []` with `loaded = true` and dummy `push()` handler.
  4. **Deep Brave Identity Purge**:
     - Delete `navigator.brave` and `Navigator.prototype.brave`.
     - Proxy `Object.getOwnPropertyDescriptor(Navigator.prototype, 'brave')` to return `undefined`.
     - Purge `window.ethereum.isBraveWallet`, `window.braveSolana`, `window.solanaBrave`.
     - Sanitize `navigator.userAgentData.brands` to remove the "Brave" brand.

---

### 🎨 C. 10 Premium Visual Themes & Real-Time Sync
- **Files**: [`theme.css`](theme.css), [`popup.html`](popup.html), [`popup.js`](popup.js), [`options.html`](options.html), [`options.js`](options.js).
- **The 10 Themes**:
  1. `obsidian_noir` (🖤 Dark Luxury Stealth)
  2. `cyberpunk_neon` (💜 Electric Hacker)
  3. `arctic_frost` (🧊 Clean Frosted Glass)
  4. `sunset_gradient` (🌅 Coral Magenta Energy)
  5. `ocean_depth` (🌊 Deep Sea Aqua)
  6. `forest_emerald` (🌿 Organic Matrix)
  7. `lavender_dream` (💜 Soft Plum)
  8. `solar_flare` (🔥 Ember Flame)
  9. `midnight_galaxy` (🌌 Cosmic Indigo)
  10. `rose_gold` (🌹 Pink Velvet Luxury)
- **Instant Pre-Render Script**: Embedded in `<head>` of both `popup.html` and `options.html` to prevent any theme flicker.
- **Two-Way Live Sync**: Both views listen to `chrome.storage.onChanged.addListener((changes, area) => { ... })` for instant synchronization without page reloads.

---

### 🔄 D. Remote Rule Auto-Sync Architecture
- **Files**: [`background.js`](background.js), [`filters/rules.txt`](filters/rules.txt).
- **Behavior**:
  - Alarms fire every 6 hours (`CHECK_RULE_UPDATES`).
  - Fetches latest `filters/rules.txt` raw from GitHub.
  - Automatically updates dynamic declarative rules in extension storage.

---

## 📦 3. Release & Packaging Procedure

Whenever changes are made:
1. Rebuild the clean `.zip` package:
   ```powershell
   Compress-Archive -Path manifest.json, background.js, content.js, inject.js, settings.js, rules.json, popup.html, popup.css, popup.js, options.html, options.css, options.js, theme.css, icons -DestinationPath BraveShield-Bypass-Pro-v5.2.1.zip -Force
   ```
2. Commit with clean, professional commit messages:
   ```powershell
   git add -A && git commit -m "fix/feat: ..." && git push origin main
   ```
3. Update GitHub release assets:
   ```powershell
   gh release upload v5.2.1 BraveShield-Bypass-Pro-v5.2.1.zip braveshield-android.user.js --clobber
   ```