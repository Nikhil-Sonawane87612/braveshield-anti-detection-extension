# 🗺️ Roadmap v6.5.0 — Execution Plan (10 Items)

> Status: **✅ EXECUTED 2026-11-02 — all 10 items done + bonus reels/shorts auto-scroll hotfix.**
> Ground truth for the result: `memory/changelog.md` (v6.5.0 section), `memory/project_state.md`.
> Tested state: 47/47 node --test (ua-resolve + constants + import-sanitize + dnr-rules), mojibake clean, JSON/XML parsed.
> NO git operations (user instruction) — everything is uncommitted working-tree state.

---

## Step 0 — Recon ✅
- helpers inside slice move ✅
- build-mobile.mjs had stale resolver → pruned ✅

---

## Phase 1 — inject.js quick wins ✅

### Item 5 — Visibility-gated timer turbo ✅
- `bsTabHidden()` added; ordinary turbo path returns 1 hidden; short-timer 1.9x gated; shorteners/lockers/turboAllSites/wait-page stay boosted; `bsWaitCache` invalidated on visibilitychange.

### Item 4 — `Object.prototype.stack` shadow hardening ✅
- `DOMException` added to `BS_ERROR_CLASSES` + prototype-shadow guarantee documented.

---

## Phase 2 — Identity data & header parity ✅

### Item 2 — `Sec-CH-UA-Model` for mobile identities ✅
- Design upgrade over the plan: **derived from the UA string itself** (`bsDeriveUaModel` in `shared/ua-resolve.js`, wired into both return paths + exports) — no per-entry data fields to maintain, coherent by construction (Pixel 9 Pro / SM-S928B / iPhone / iPad / K-withheld / Firefox-mobile / desktop all verified by tests).
- background.js `bsBuildUaRule` (in `shared/dnr-rules.js` now): mobile+model SET / else REMOVE.
- inject.js `getHighEntropyValues` serves the derived model.

---

## Phase 3 — Mobile/userscript port ✅

### Item 1 — Port to `braveshield-mobile.user.js` ✅ (12 build fixes)
- `uaResolveSnippet` → reads `shared/ua-resolve.js` verbatim (stale inline copy deleted); `build-mobile.mjs`: stale snippet pruned.
- Catalog → real `useragents.js` (36 mobile buckets).
- Shim: 8 booleans into `bsGMGetAll` + `BS_DEFAULTS`; modules-only override support in `bsFindSiteOverride`.
- Rebuilt: `node build-mobile-full.mjs` → 293,877 B, `node --check` clean, feature greps verified (helpers present, model derivation present, override.modules merge present).

---

## Phase 4 — UX & features ✅

### Item 3 — Whitelist toggle applies instantly ✅ (verified already-working)
- `content.js` postMessage → `storage.onChanged → pushConfigToMainWorld()` is already live-push; **no patch needed**. Verified by recon (add `bs-config-sync` message would be redundant).

### Item 7 — "Brave-Detection Defense" options panel ✅
- Panel name chosen by user: **Brave-Detection Defense**; nav entry `🛡️ Brave Defense`.
- **GPC cloak → Chrome-truth**: `gpcCloakEnabled` default ON (user choice); getter returns `undefined` while a Chrome/Firefox identity is claimed (a real Chrome has NO property — `false` was a detectable fake), evaluated per read; `maskBraveApi` preserve path reads genuine value. Rows: GPC, Structural Shell Defuser, Always-On Core Probes, Identity API Trim, Ad Modal Defuser pointer.
- `gpcCloakEnabled` across: background defaults, import allowlist, module counters, options binding/restore.

### Item 8 — Weekly "time saved" sparkline ✅
- content.js telemetry incrementor records `timeSavedDaily` (YYYY-MM-DD, ≤30 days, clamps); popup `bsRenderWeeklyTrend` builds 7 real bars + `≈Ns this week`, hidden until data exists, live refresh in onChanged; popup.css trend strip (DOM-only, no innerHTML).

### Item 9 — Sites manager upgrades ✅
- Tag badges (`identity` / `matrix 3m` / `full 3m`), 🧩 quick-jump to matrix editor, delete→picker resync, editor hint text, `.override-badge` css. Non-redundant upgrade of the existing tags (plan's separate panel dropped).

---

## Phase 5 — Defuser & hardening ✅

### Item 6 — Structural Shell Defuser ✅
- `bsNeutralizeBlockingShells()` in content.js: fixed + ≥92%×≥92% viewport + z≥999 + text-bearing + ZERO click affordances + no consent wording + WeakMap dwell ≥8 s → defuse (display/visibility/pointer-events) + unlock overflow + trapsNeutralized. Guards: captcha/auth hosts, no-automation list, JSON pages, body/html, bs- elements, empty/invisible.
- Wired into `debouncedContentScan`; `domStructureDefuserEnabled` (default ON) across: content gates + `BS_MATRIX_MODULES` + `BS_SYNC_KEYS`, background defaults, options panel row + binding/restore + import allowlist + matrix modules list, popup module counters.

### Item 10 — Test suite hardening ✅
- `bsSanitizeImport` → `shared/import-sanitize.js` (pure; module-matrix allowlist injected by options.js; `deviceProfile` ≤64 cap now enforced; pollution-key safe; `browserType` allowlist; whitelist/siteProfiles/clamps & caps; options.html adds `<script src="shared/import-sanitize.js">` before options.js).
- `bsBuildUaRule`/`bsBuildLocaleRule`/rule-IDs/captcha lists → `shared/dnr-rules.js`; background.js consumes via `importScripts`; `bsRealChromeMajor` stays local (service-worker navigator).
- **Tests: 47/47 green** (25 → 47): `tests/import-sanitize.test.mjs` (11 cases, hostile-first) + `tests/dnr-rules.test.mjs` (6 cases incl. captcha-exclusion "merge never drop" invariant) + 6 new ua-resolve cases. Verified heads-up the suite caught 2 real sanitizer bugs (deviceProfile 64-cap bypass, malformed-key edge).

---

## Bonus — Reels & Shorts auto-scroll hotfix ✅ (user report: "doesn't work")
- YT Shorts `6c`: sibling-pick bug (first sibling ≠ current ≡ the short ABOVE) fixed → `#navigation-button-down` chevron → deep ArrowDown → DOM-order next renderer; last-short respected; `_bsYtShortEnded` reset-bug removed.
- IG Reels `6b`: dead `youtubeAds` master-gate removed (own opt-in only); chevron → **deep-node ArrowDown (React-delegation fix)** → verified escalation (wheel → container scroll) with the reel-lives-on receipt check.
- Shared `bsReelKit`: 1.5 s advance debounce, timeupdate loop-boundary binding (reels/shorts auto-REPLAY so `ended` never fires), deep `key()` with keyCode/which patched to 40 (init-dict ignores them), `wheel()`, live gate re-check at fire time.
- User's second report ("still not working") → layer-2 analysis: dispatches on `body`/`document` never reach a React app's delegated handlers + `keyCode` was 0 → deep-dispatch cascade shipped (above).
- Mobile userscript regenerated with all kit fixes (296,970 B chars / disk bytes higher w/ emoji), `node --check` clean, 47/47 tests green.
- **Device test pending**: IG Reels (user retried, layer-2 fix shipped) + YT Shorts (untested by user).

---

## Close-out ✅
- ✅ `manifest.json` → 6.5.0 · ✅ `update.xml` → 6.5.0
- ✅ `memory/changelog.md` v6.5.0 · ✅ `memory/project_state.md` pointer rewritten · ✅ `memory/roadmap_v6.5.md` (this file) ticked
- ✅ Full sweep: node --check all touched JS, tests 47/47, JSON/XML parse, mojibake clean
- ⬜ Manual smoke (needs the user's device/browser): bot.sannysoft.com, CreepJS error+worker vectors, pixelsscan.net, browserleaks.com/canvas, shortener turbo, Brave-blocker site defuser, YouTube ad restore + Shorts auto-scroll, IG Reels auto-scroll, import→export roundtrip

---

## Execution order (done)
```
Step 0 (recon) ✅
Phase 1: 5 → 4              ✅
Phase 2: 2                  ✅ (25/25 gate)
Phase 3: 1                  ✅ (regenerate + verify artifact)
Phase 4: 3 → 7 → 9 → 8      ✅ (item 3 verified already-working; 25/25 gate)
Phase 5: 6 → 10             ✅ (47/47 gate)
BONUS: auto-scroll hotfix   ✅ (user-reported after Phase 4 verification)
Close-out: docs + bump      ✅
```
