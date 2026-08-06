# BraveShield Bypass Pro v4.6.1 — Implementation TODO

## Icon Fix (Critical)
- [x] Regenerate icons/icon16.png, icon48.png, icon128.png from `C:\Users\hinik\Downloads\logo.png`
- [x] Verify all 3 icons are valid PNGs and loadable

## Recommended Options
- [ ] Confirm all 39 module defaults are `true` in background.js onInstalled
- [ ] Ensure non-default toggles (anti-screenshot-detect, timezone-spoof, geolocation-spoof) are enabled

## New: User-Level Presets (Normal / Pro)
- [ ] Define preset configs: Normal, Moderate, Pro, Maximum (module mapping)
- [ ] Add preset dropdown in options.html (Profile tab)
- [ ] Add preset parsing/applying logic in options.js + settings.js

## Testing
- [ ] Fix brittle regexes in _test.js (YouTube API guard, category mapping)
- [ ] Run node _test.js and confirm all tests pass
- [ ] Run node --check on all JS files

## Packaging
- [ ] Remove _metadata/ folder
- [ ] Bump version in manifest.json + background.js to 4.6.1
- [ ] Update README.md + TODO.md

## Release
- [ ] Rebuild BraveShield-Bypass-Pro-4.6.1.zip
- [ ] Commit changes, push to origin/main
- [ ] Create tag v4.6.1 + GitHub release with zip attached

