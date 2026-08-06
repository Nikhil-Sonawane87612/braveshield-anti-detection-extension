# BraveShield Bypass Pro v4.6.0 — Implementation TODO

## Critical Fixes
- [x] Module 17: Override only `Navigator.prototype` (remove instance override)
- [x] Module 20: Keep `isYouTubeAPI()` skip (already present)
- [x] Module 27: Add YouTube API guard to fetch/XHR overrides
- [x] Module 5: Null guard `document.head || document.documentElement`
- [x] Module 15: Null guard for `document.createElement('a')` (verify present)

## Safe-List
- [x] `isSafelistedHost()` for AI sites (already present)
- [x] Disable modules 5, 8, 27, 28, 31, 32 on those hosts (already present)

## UI & Options
- [x] All Modules tab: search, bulk enable/disable, category accordion groups
- [x] Popup: bulk enable/disable in header (already present)
- [x] Per-category Enable All/Disable All buttons in popup + options
- [x] Fix sync: global/category toggles reflect in All Modules + category tabs

## Performance
- [x] Defer SponsorBlock hooks until video element ready
- [x] Batch/debounce YouTube DOM mutations
- [x] Rate-limit periodic DOM scans

## Redirect Fix
- [x] Fallback navigation logic for simulated clicks (TG mod APK sites)

## Extra Features
- [x] Export/import settings as JSON
- [x] Profile presets per site
- [x] Keyboard shortcuts for toggles
- [x] Stats dashboard (time spent, modules active)

## Deployment
- [x] Bump version in manifest.json to 4.6.0
- [x] Remove `_metadata/` before packaging
- [x] Update README.md + MEMORY files
