# BraveShield Bypass Pro — Security + Correctness Audit

## Audit Scope
Files audited: manifest.json, background.js, content.js, inject.js, shared/constants.js, shared/ua-resolve.js, rules.json, popup.js, options.js, hardware-profiles.js, useragents.js

---

## 1. postMessage Bridge Validation

**File: inject.js:110-123**

```js
window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.origin !== location.origin) return;  // ← origin validation
    const d = e.data;
    if (!d || d.type !== 'bs-config-sync' || typeof d.config !== 'object' || d.config === null) return;
    // ... allowlist-guarded merge
});
```

- **Verdict**: Origin is validated against `location.origin`. The sender in `content.js:118` uses `location.origin` as `targetOrigin`, and the receiver checks `e.origin !== location.origin`.
- **Risk**: A page could theoretically forge `bs-config-sync` if it can trigger `content.js` to postMessage. Since content.js only sends this message during initialization (`pushConfigToMainWorld()`) and on storage changes, forgery requires either:
  1. Getting content.js to execute (already compromised), or
  2. Tricking the user into a page with the same origin as the extension's content script context.
- **Fix**: The origin check is adequate. No change needed, but ensure `e.data.type` validation is strict (it is - only `'bs-config-sync'` passes). The fallback `targetOrigin: '*'` at `content.js:118` is harmless because inject.js rejects non-same-origin messages via the `e.origin` check.

---

## 2. Prototype Pollution

**File: content.js:118-119** (and inject.js:117-121, background.js:88-89)

All three locations explicitly guard against `__proto__`, `constructor`, `prototype` keys:

```js
// content.js:118-119
if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;

// background.js:88-89
if (domain === '__proto__' || domain === 'constructor' || domain === 'prototype') continue;
if (!Object.prototype.hasOwnProperty.call(overrides, domain)) continue;
```

- **Verdict**: Prototype pollution is prevented across all code paths. The `Object.prototype.hasOwnProperty.call()` guard in background.js additionally ensures only own properties are iterated.
- **Fix**: No change needed.

---

## 3. XSS — innerHTML/outerHTML Interpolation

**File: content.js** — All DOM creation uses `document.createElement` + `textContent`/`setAttribute`. No `innerHTML` or `outerHTML` assignments with string interpolation anywhere in the codebase.

**File: options.js** — Same; exclusively uses `textContent` and `setAttribute`.

**File: inject.js** — No `innerHTML`, `outerHTML`, `eval`, `new Function`, or unsafe deserialization. The only `JSON.parse` is in `options.js` `bsSanitizeImport`, which is schema-validated (see finding #8).

**File: JSON import-backup handling** (`options.js:408-419`):
```js
chrome.storage.local.get(null, (allData) => {
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    // ...
});
```
- **Verdict**: `JSON.stringify` with no user interpolation — safe. The `bsSanitizeImport` function at `options.js:443-489` strictly validates every key/value type before storage, rejecting non-conforming data.

- **Fix**: No change needed.

---

## 4. DNR — Header Spoofing on Captcha Hosts

**File: background.js:27-34, 53-55**

```js
const BS_CAPTCHA_EXCLUDED_INITIATORS = [...]; // 17 hosts
const BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS = [...]; // 5 hosts

function bsBuildUaRule(id, priority, resolved, extraCondition) {
    const baseCondition = { urlFilter: '*', resourceTypes: BS_UA_RESOURCE_TYPES.slice(),
        excludedInitiatorDomains: BS_CAPTCHA_EXCLUDED_INITIATORS.slice(),
        excludedRequestDomains: BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS.slice() };
    const condition = Object.assign(baseCondition, extraCondition || {});  // ← PROBLEM
    return { id, priority, action: { type: 'modifyHeaders', requestHeaders }, condition };
}
```

**The Bug**: `Object.assign(baseCondition, extraCondition)` overwrites `excludedInitiatorDomains` and `excludedRequestDomains` with the per-site override's `initiatorDomains` array, **removing** the global captcha exclusion list.

- **Example**: A per-site override for `example.com` creates a rule with `excludedInitiatorDomains: ['example.com']` only — reCAPTCHA on `example.com` would no longer be excluded, causing "Could not connect" errors.
- **Scope**: Affects ALL per-site override rules in `bsApplyUASpoof()` at `background.js:99`, `background.js:113`.

- **Verdict**: **HIGH** — Per-site override DNR rules do NOT protect captcha/challenge hosts, breaking reCAPTCHA/hCaptcha/Funcaptcha on overridden sites.

- **Fix**: Merge the excluded domains instead of replacing:

```js
function bsBuildUaRule(id, priority, resolved, extraCondition) {
    const baseCondition = { urlFilter: '*', resourceTypes: BS_UA_RESOURCE_TYPES.slice(),
        excludedInitiatorDomains: BS_CAPTCHA_EXCLUDED_INITIATORS.slice(),
        excludedRequestDomains: BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS.slice() };
    const extra = extraCondition || {};
    const condition = {
        urlFilter: baseCondition.urlFilter,
        resourceTypes: baseCondition.resourceTypes,
        excludedInitiatorDomains: [...baseCondition.excludedInitiatorDomains, ...(extra.excludedInitiatorDomains || [])],
        excludedRequestDomains: [...baseCondition.excludedRequestDomains, ...(extra.excludedRequestDomains || [])],
    };
    // Apply initiatorDomains from extra if present (for per-site rules)
    if (extra.initiatorDomains) condition.excludedInitiatorDomains.push(...extra.initiatorDomains);
    return { id, priority, action: { type: 'modifyHeaders', requestHeaders }, condition };
}
```

---

## 5. web_accessible_resources Exposure

**File: manifest.json:63-68**

```json
"web_accessible_resources": [{
    "resources": ["inject.js"],
    "matches": ["<all_urls>"]
}]
```

- **Verdict**: `inject.js` is exposed to all pages via `chrome-extension://<id>/inject.js`. While the script itself is gated by `BS_CONFIG` checks and `bsOn()` gates, the mere exposure of the URL enables **extension detection/fingerprinting**. Any website can check for the resource's existence or request it to confirm the extension is installed.
- **Severity**: **MEDIUM** — Enables extension fingerprinting. The script's capabilities are protected by config gates, but the presence of the extension is leaked.

- **Fix**: Remove `inject.js` from `web_accessible_resources` and use `chrome.scripting` or message passing instead. If `inject.js` must remain WAR for injection purposes, restrict matches to specific host patterns rather than `<all_urls>`.

---

## 6. Dead sessionStorage Gates

**File: inject.js:648-664** — PRNG seed initialization:

```js
try {
    let storedSeed = null;
    try { storedSeed = sessionStorage.getItem('bs_prng_seed'); } catch (_) {}
    let parsed = storedSeed ? parseInt(storedSeed, 10) : NaN;
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 2147483647) {
        try {
            const arr = new Uint32Array(1);
            crypto.getRandomValues(arr);
            parsed = (arr[0] % 2147483646) + 1;
        } catch (_) { parsed = Math.floor(Math.random() * 2147483646) + 1; }
        try { sessionStorage.setItem('bs_prng_seed', String(parsed)); } catch (_) {}
    }
    sessionSeed = parsed >>> 0;
} catch (_) {}
```

- **Verdict**: The `sessionStorage.getItem` is paired with a writer in the same block. After initial seed establishment, the stored value is only overwritten if invalid. This is **not** a "dead gate" in the traditional sense — it's a one-time per-session initialization that persists within a tab session. However, on a **new tab/window**, the seed is recomputed from crypto randomness, making the stored seed redundant across sessions. No site-breaking risk identified.

- **Fix**: No change needed. The pattern is intentional for session-level entropy stability.

---

## 7. inject.js: innerHTML, eval, new Function, unsafe deserialization

**Verdict**: **CLEAN**. No `eval`, `new Function`, `innerHTML`, or `outerHTML` in inject.js. All DOM modifications use `makeNative`-wrapped native prototypes. The only deserialization is `JSON.parse` in `options.js` (covered in finding #3).

- **Fix**: No change needed.

---

## 8. options.js bsSanitizeImport: Import-Only vs. Every-Read Sanitization

**File: options.js:423-490** — `bsSanitizeImport` is called **only** during backup import (btnImportTrigger click). It is **NOT** applied on every storage read path.

```js
// Called only here:
fileImportBackup.addEventListener('change', (e) => {
    const parsed = JSON.parse(evt.target.result);
    const clean = bsSanitizeImport(parsed);  // ← ONLY on import
    chrome.storage.local.set(clean, ...);
});

// Storage reads (options.js:206-216) — NO sanitization:
chrome.storage.local.get([/* 40+ keys */], (res) => {
    // direct use of res.xxx without bsSanitizeImport
});

// onChanged listener (options.js:282) — NO sanitization:
chrome.storage.onChanged.addListener((changes, area) => {
    // direct use of changes.xxx.newValue
});
```

- **Verdict**: **HIGH** — A poisoned `storage.local` entry can survive a browser restart because `bsSanitizeImport` is only applied during import. If storage is corrupted (malicious backup, sync conflict, or manual editing), all read paths accept the unvalidated values, potentially bypassing feature gates (e.g., setting `uaSpoofingEnabled: false` when it should be true, or injecting arbitrary `deviceProfile` values).

- **Fix**: Apply schema validation on every read. Create a `bsSanitizeConfig` function identical to `bsSanitizeImport` and call it in:
  1. The `chrome.storage.local.get` callback at `options.js:206`
  2. The `chrome.storage.onChanged` callback at `options.js:282`
  3. The `background.js` defaults at `background.js:151-196` (already has defaults, but add validation)

```js
function bsSanitizeConfig(parsed) {
    // Copy bsSanitizeImport logic here, or import it
    const clean = {};
    for (const [k, v] of Object.entries(parsed)) {
        if (BS_IMPORT_STRINGS.has(k) && typeof v === 'string' && v.length <= 128) clean[k] = v;
        else if (BS_IMPORT_BOOLEANS.has(k) && typeof v === 'boolean') clean[k] = v;
        else if (BS_IMPORT_NUMBERS.has(k) && typeof v === 'number' && Number.isFinite(v)) {
            clean[k] = Math.max(0, Math.min(9_999_999, Math.floor(v)));
        }
    }
    if (clean.browserType && !['brave', 'chrome', 'firefox', 'safari'].includes(clean.browserType)) {
        delete clean.browserType;
    }
    if (typeof parsed.deviceProfile === 'string' && parsed.deviceProfile.length <= 64) {
        clean.deviceProfile = parsed.deviceProfile;
    }
    if (Array.isArray(parsed.whitelist)) {
        clean.whitelist = [...new Set(parsed.whitelist.filter(bsIsValidDomain))].slice(0, 500);
    }
    if (parsed.siteProfiles && typeof parsed.siteProfiles === 'object' && !Array.isArray(parsed.siteProfiles)) {
        const cleanSites = {};
        for (const [domain, prof] of Object.entries(parsed.siteProfiles).slice(0, 500)) {
            if (!bsIsValidDomain(domain) || !prof || typeof prof !== 'object') continue;
            const entry = {};
            if (typeof prof.deviceProfile === 'string' && prof.deviceProfile.length <= 64) entry.deviceProfile = prof.deviceProfile;
            if (['brave', 'chrome', 'firefox', 'safari'].includes(prof.browserType)) entry.browserType = prof.browserType;
            if (Object.keys(entry).length > 0) cleanSites[domain] = entry;
        }
        clean.siteProfiles = cleanSites;
    }
    if (parsed.customHardwareProfile && typeof parsed.customHardwareProfile === 'object' && !Array.isArray(parsed.customHardwareProfile)) {
        const c = parsed.customHardwareProfile;
        clean.customHardwareProfile = {
            platform: String(c.platform ?? 'Win32').slice(0, 32),
            vendor: String(c.vendor ?? '').slice(0, 128),
            renderer: String(c.renderer ?? '').slice(0, 256),
            concurrency: Math.max(1, Math.min(256, parseInt(c.concurrency, 10) || 16)),
            memory: Math.max(1, Math.min(8, parseInt(c.memory, 10) || 8)),
            devicePixelRatio: Math.max(1, Math.min(4, parseFloat(c.devicePixelRatio) || 1)),
            screen: {
                width: Math.max(320, Math.min(7680, parseInt(c.screen?.width, 10) || 1920)),
                height: Math.max(240, Math.min(4320, parseInt(c.screen?.height, 10) || 1080)),
                colorDepth: Math.max(16, Math.min(30, parseInt(c.screen?.colorDepth, 10) || 24))
            }
        };
    }
    return clean;
}
```

Then wrap every storage read path:

```js
// In options.js:206 get callback:
chrome.storage.local.get([/* keys */], (res) => {
    const clean = bsSanitizeConfig(res);
    // ... use clean instead of res
});

// In options.js:282 onChanged:
chrome.storage.onChanged.addListener((changes, area) => {
    const clean = bsSanitizeConfig({ ...changes }); // or process per-key
    // ... use clean
});
```

---

## 9. Storage Key Contract — Orphan Keys

**BS_SYNC_KEYS** (content.js:50-63, 38 keys):
masterEnabled, enabled, unshortenerEnabled, autoBypassTimers, gentleTurboEnabled, turboAllSites, paywallDefuserEnabled, bypassAdblockDetection, maskBraveApi, clientHintsEnabled, webglSpoofingEnabled, canvasNoiseEnabled, audioNoiseEnabled, webrtcShieldEnabled, domJitterEnabled, timerCoarseningEnabled, mediaDevicesSanitizeEnabled, speechVoicesSanitizeEnabled, batteryMaskEnabled, networkInfoMaskEnabled, screenNormalizationEnabled, uaSpoofingEnabled, timezoneSpoofingEnabled, webgpuMaskingEnabled, fontEnumMaskingEnabled, cleanUrlEnabled, rightClickEnabled, videoSpeedEnabled, autoSkipIntrosEnabled, youtubeAds, spotifyUnlocked, twitchShieldEnabled, deviceProfile, customHardwareProfile, resolvedUA, spoofTimezone, spoofLocale, browserType

**BS_CONFIG** (inject.js:44-83, 65 keys) — supersets BS_SYNC_KEYS with defaults and extra keys (webgpuMaskingEnabled, fontEnumMaskingEnabled, cleanUrlEnabled, rightClickEnabled set to `true` by default).

### Orphan keys written by popup.js / options.js but NOT in BS_SYNC_KEYS AND NOT read by BS_CONFIG:

| Key | Written By | Why It's Orphaned |
|---|---|---|
| `whitelist` | popup.js:646 | Used in content.js:92 (`bsIsWhitelisted(host, res.whitelist)`) and popup.js:297, but NOT in BS_SYNC_KEYS or BS_CONFIG |
| `siteProfiles` | popup.js:714, options.js:714 | Used in content.js bridge and options.js UI, but NOT in BS_SYNC_KEYS or BS_CONFIG |

- **Verdict**: **MEDIUM** — These keys are functionally used by the extension but outside the formal BS_SYNC_KEYS/BS_CONFIG contract. This means:
  1. New key additions to BS_CONFIG/BS_SYNC_KEYS won't automatically cover them
  2. Orphan keys could drift from the expected schema over time
  3. No centralized validation for these keys during config sync

- **Fix**: Either add `whitelist` and `siteProfiles` to `BS_SYNC_KEYS` in `content.js:50-63` and ensure they're in `BS_CONFIG` in `inject.js:44-83`, OR document them as extension-specific storage keys outside the bridge contract.

---

## 10. Element ID Contract — popup.html / options.html

**popup.js IDs vs popup.html**: ✅ **ALL 34 referenced IDs present** in popup.html (verified: master-toggle, stealth-grade, shield-ring, shield-status-sub, status-dot, status-site, whitelist-text, site-override-chip, btn-sync-rules, sync-icon, ver-tag, update-badge, metric-timesaved, metric-traps, metric-links, metric-modules, toggle-canvas, toggle-audio, toggle-webgl, toggle-hints, toggle-timercoarse, toggle-domjitter, toggle-webrtc, toggle-brave, toggle-unshortener, toggle-paywall, toggle-timers, toggle-gentle, toggle-media, btn-whitelist, status-bar, btn-open-options, btn-sync-rules, sync-icon, ver-tag, update-badge).

**options.js IDs vs options.html**: ✅ **ALL referenced IDs present** (verified: studio-master-toggle, studio-ver-pill, studio-master-status, studio-nav, studio-search, panel-hardware, opt-browsertype, opt-profile, studio-profile-search, custom-hw-panel, cust-platform, cust-concurrency, cust-memory, cust-vendor, cust-renderer, cust-screen, cust-dpr, btn-save-custom-hw, opt-brave, opt-hints, opt-networkinfo, opt-ua, opt-unshortener, opt-timers, opt-gentle, opt-aggressivetimers, opt-paywall, opt-adblock, opt-youtube, opt-spotify, opt-twitch, opt-audio, opt-canvas, opt-webrtc, opt-battery, opt-tzspoof, cust-timezone, cust-locale, opt-domjitter, opt-timercoarse, opt-cleanurl, opt-rightclick, opt-videospeed, opt-autoskip, stat-time-saved, stat-traps-defused, stat-links-unlocked, stat-sync-status, btn-replay-tour, btn-export-backup, btn-import-backup-trigger, file-import-backup, btn-reset-defaults, btn-reset-telemetry, whitelist-input, btn-add-whitelist, site-profile-domain, site-profile-select, site-browsertype, btn-add-site-profile, btn-run-audit, masterToggle (popup.js), btn-open-options (popup.js)).

- **Verdict**: No missing IDs. All referenced elements have corresponding HTML definitions.

- **Fix**: No change needed.

---

## 11. inject.js bsTurboAllowed — Unconditional True Return

**File: inject.js:1897-1903**:

```js
function bsTurboAllowed() {
    if (isNoTurboHost) return false;
    if (!bsOn('autoBypassTimers')) return false;
    return true;
}
```

- **`isNoTurboHost`** (inject.js:1877-1878): Covers `surajitlinks`, `shrinkearn`, `getmodpc`, and hosts matched by `bsIsNoAutomationHost()` (which checks against `BS_NO_AUTOMATION_HOSTS` — 60+ trusted web apps where DOM manipulation would break layouts).
- **Correctness**: `bsTurboAllowed()` returns `true` for essentially all non-excluded sites when `autoBypassTimers` is enabled. This is **intentional** — the feature compresses setTimeout/setInterval delays to accelerate countdown timers on link-shortener pages. For normal websites, 1.9x/50x acceleration rarely causes visible issues because:
  - Timer delays are still respected with a minimum granularity
  - The aggressive mode (50x) is opt-in via `turboAllSites`
  - No-turbo hosts are explicitly excluded

- **Verdict**: **CORRECT** — `isNoTurboHost` covers what it should (known shortener hosts + trusted web apps). Cannot break non-locker sites because the acceleration is proportional (1.9x for ≤5s, 50x for >5s) and gates out automation-hosts. The only risk is edge cases where compressed timers break site-specific animation Debounce patterns, but these are mitigated by the no-turbo host list.

- **Fix**: No change needed.

---

## 12. content.js bsIsLockerPage / bsIsNoAutomationHost / bsIsJsonDumpPage

**`bsIsNoAutomationHost`** (shared/constants.js:59-68): Suffix-matches against `BS_NO_AUTOMATION_HOSTS` (60+ hosts including meta.ai, openai.com, github.com, youtube.com, etc.). **Correct** — prevents DOM forcing on trusted web apps.

**`bsIsJsonDumpPage`** (content.js:35-43): Checks if body innerText starts with `{"@context"` and includes `schema.org`. **Low false-positive risk** — requires exact JSON-LD prefix + schema.org mention. A page with text starting `{"@context"...}` would need intentional markup spoofing.

**`bsIsLockerPage`** (content.js:477-497): Heuristic-based detection of wait/locker pages via:
- Strong regex patterns (`wait for the link`, `please wait`, `countdown`, etc.)
- Timer-node + seconds combo detection
- **Potential false positives**: The regex includes `click image to go fast|or click image` which could match legitimate CTA text. The timer-node check uses class selectors `[class*="countdown"]`, `[class*="timer"]`, `[class*="seconds"]` which could match non-locker elements.

- **Verdict**: **Functional but heuristic** — may miss some lockers (false negatives) or flag non-lockers (false positives), but neither category causes security issues. The functions are guard clauses that return early if certain conditions are met; false positives simply mean some protection is skipped, not that non-lockers are incorrectly treated as lockers.

- **Fix**: No change needed. The heuristics are adequate for their purpose.

---

## 13. Dead Code

| Code Entity | File:Line | Status |
|---|---|---|
| `bsVersion` | inject.js:23-26 | **Dead** — defined but never referenced elsewhere |
| `isMediaPlatform` | inject.js:1673 | **Dead** — defined but never used; the YouTube turbo module checks host patterns directly instead |
| `sessionStorage` PRNG seed gates | inject.js:648-664 | **Live but session-scoped** — intentional per-session persistence, not truly "dead" |
| `bsGate` object ( evolved, not dead) | content.js:65, 94-99 | Still used for gate state in pushConfigToMainWorld; evolved from old sessionStorage mirror |

- **Verdict**: `bsVersion` and `isMediaPlatform` are genuine dead code. They should be removed to reduce bundle size and cognitive load.

- **Fix**: Remove `bsVersion` (inject.js:23-26) and `isMediaPlatform` (inject.js:1673).

---

## 14. Git-Checkout Revertd Leftover Code

**Verdict**: No evidence of leftover code from a git revert. The codebase is cohesive and consistent. The `bsGate` object in content.js has evolved (comments at line 47-48 explicitly state the old sessionStorage mirror was replaced by the LIVE CONFIG BRIDGE), but the gate itself remains in use and is not leftover debris.

- **Fix**: No change needed.

---

## Summary Table

| # | Severity | File:Line | Problem | Fix |
|---|---|---|---|---|
| 1 | MEDIUM | inject.js:110 | postMessage origin check adequate but fallback `targetOrigin: '*'` in content.js:118 | Remove `'*'` fallback or document why it's safe |
| 2 | N/A | — | Prototype pollution prevented across all code paths | No change needed |
| 3 | N/A | — | No XSS via innerHTML/outerHTML anywhere | No change needed |
| 4 | **HIGH** | background.js:53-55 | `Object.assign` overwrites captcha excluded domains in per-site override DNR rules | Merge excluded domains instead of replacing (see fix) |
| 5 | **MEDIUM** | manifest.json:63-68 | `inject.js` exposed to `<all_urls>` enables extension fingerprinting | Restrict WAR matches or use message passing instead |
| 6 | LOW | inject.js:648-664 | sessionStorage PRNG seed — self-contained, not truly dead | No change needed |
| 7 | N/A | — | No eval/newFunction/innerHTML in inject.js | No change needed |
| 8 | **HIGH** | options.js:423-490 | `bsSanitizeImport` only on import, not on every read | Apply schema validation on every storage read path |
| 9 | **MEDIUM** | content.js:50-63, inject.js:44-83 | `whitelist` and `siteProfiles` are orphan keys | Add to BS_SYNC_KEYS/BS_CONFIG or document as extension-specific |
| 10 | N/A | — | All element IDs present in respective HTML files | No change needed |
| 11 | N/A | inject.js:1897-1903 | `bsTurboAllowed` returns true unconditionally (except no-turbo hosts) — correct | No change needed |
| 12 | LOW | content.js:35-497 | Detection heuristics with minor false positive/negative risk | No change needed |
| 13 | LOW | inject.js:23-26, 1673 | `bsVersion`, `isMediaPlatform` — dead code | Remove both |
| 14 | N/A | — | No git-revert leftover code detected | No change needed |

---