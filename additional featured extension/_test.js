const fs = require('fs');
const {execSync} = require('child_process');
let pass=0, fail=0;
function ok(msg){pass++;console.log('  PASS:',msg)}
function fail_(msg){fail++;console.log('  FAIL:',msg)}

// 1. Parse SETTINGS_MAP (scoped to the const block to avoid matching UI strings)
const code = fs.readFileSync('options.js','utf8');
const smBlock = code.match(/const SETTINGS_MAP\s*=\s*\{([\s\S]*?)\n\};/);
const sm = {};
if (smBlock) {
  for (const m of smBlock[1].matchAll(/'([a-z][a-z0-9_-]+)'\s*:\s*'([A-Za-z]+)'/g)) sm[m[1]]=m[2];
}
console.log('SETTINGS_MAP keys:', Object.keys(sm).length);

// 2. Check every key appears in MODULE_CATEGORIES
const catObj = {};
const catMatch = code.match(/const MODULE_CATEGORIES\s*=\s*\{([\s\S]*?)\n\};/);
if (catMatch) {
  for (const m of catMatch[1].matchAll(/'([a-z-]+)':\s*\{[^}]*settings:\s*\[([^\]]*)\]/g)) {
    catObj[m[1]] = m[2].split(',').map(s=>s.trim().replace(/'/g,''));
  }
}
const allCatSettings = [...Object.values(catObj).flat()];
const notInAnyCat = Object.keys(sm).filter(id => !allCatSettings.includes(id));
if (notInAnyCat.length===0) ok('All SETTINGS_MAP keys appear in MODULE_CATEGORIES');
else fail_('Keys missing from MODULE_CATEGORIES: '+JSON.stringify(notInAnyCat));

// 3. Check every cat-btn-sm data-category in options.html resolves
const optHtml = fs.readFileSync('options.html','utf8');
const htmlCats = [...optHtml.matchAll(/data-category="([a-z-]+)"/g)].map(m=>m[1]);
const uniqueCats = [...new Set(htmlCats)];
console.log('options.html category references:', uniqueCats.length);
const FLAT = {};
for (const [k,v] of Object.entries(catObj)) FLAT[k]=v;
FLAT['page-auto']=['auto-cookies','auto-scroll','auto-redirects','auto-popunder'];
FLAT['adblock-det']=['adblock-detect','fake-bait'];
FLAT['youtube-bypass']=['yt-ads','yt-sponsor'];
FLAT['stealth']=[...catObj['stealth-core'],...catObj['stealth-fingerprint'],...catObj['stealth-anti-auto'],...catObj['stealth-consistency']];
FLAT['extra']=[...catObj['accessibility'],...catObj['privacy']];
FLAT['sites']=[];
FLAT['profile']=[];
const badCats = uniqueCats.filter(c => !(c in FLAT));
if (badCats.length===0) ok('All options.html categories have valid mappings');
else fail_('Invalid option categories: '+JSON.stringify(badCats));

// 4. Check popup categories
const popupJs = fs.readFileSync('popup.js','utf8');
const popupCats = {};
const pcMatch = popupJs.match(/const POPUP_CATEGORIES\s*=\s*\{([\s\S]*?)\n\};/);
if (pcMatch) {
  for (const m of pcMatch[1].matchAll(/'([a-z-]+)':\s*\[([^\]]*)\]/g)) {
    popupCats[m[1]] = m[2].split(',').map(s=>s.trim().replace(/'/g,''));
  }
}
const popupHtml = fs.readFileSync('popup.html','utf8');
const popupHtmlCats = [...popupHtml.matchAll(/data-category="([a-z-]+)"/g)].map(m=>m[1]);
const badPopup = [...new Set(popupHtmlCats)].filter(c => !(c in popupCats));
if (badPopup.length===0) ok('All popup.html categories have valid mappings');
else fail_('Invalid popup categories: '+JSON.stringify(badPopup));

// 5. Check every popup toggle ID maps to a SETTINGS_MAP key
const toggleMapMatch = popupJs.match(/const POPUP_TOGGLE_MAP\s*=\s*\{([\s\S]*?)\n  \};/);
if (toggleMapMatch) {
  const tMap = {};
  for (const m of toggleMapMatch[1].matchAll(/'(toggle-[a-z]+)':\s*'([a-z-]+)'/g)) tMap[m[1]]=m[2];
  const badToggles = Object.entries(tMap).filter(([,sId])=>!(sId in sm));
  if (badToggles.length===0) ok('All POPUP_TOGGLE_MAP entries resolve to SETTINGS_MAP keys');
  else fail_('Invalid popup toggles: '+JSON.stringify(badToggles));
}

// 6. Manifest valid JSON
const manifest = JSON.parse(fs.readFileSync('manifest.json','utf8'));
ok('manifest.json valid, version='+manifest.version+', manifest_version='+manifest.manifest_version);

// 7. rules.json valid
JSON.parse(fs.readFileSync('rules.json','utf8'));
ok('rules.json valid');

// 8. Check inject.js safelist covers required modules
const inject = fs.readFileSync('inject.js','utf8');
const safelistMods = inject.match(/SAFELIST_DISABLED_MODULES\s*=\s*\[([^\]]*)\]/);
if (safelistMods) {
  const mods = safelistMods[1].split(',').map(s=>s.trim().replace(/'/g,''));
  const required = ['bypass-traps','auto-timers','adblock-detect','click-wait','enable-text-select','anti-scroll-lock'];
  const missingSafe = required.filter(m=>!mods.includes(m));
  if (missingSafe.length===0) ok('Safe-list covers all 6 required modules');
  else fail_('Safe-list missing: '+JSON.stringify(missingSafe));
}

// 9. Check YouTube API guard exists
const ytGuard = inject.includes('isYouTubeAPI') && (inject.includes('youtube\\.com\\/api\\/') || inject.includes('youtube.com/api/'));
if (ytGuard) ok('YouTube API skip guard present in inject.js');
else fail_('YouTube API skip guard missing');

// 10. Check SponsorBlock deferred (readyState >= 1)
if (inject.includes('readyState >= 1')) ok('SponsorBlock deferred until video readyState >= 1');
else fail_('SponsorBlock deferral not found');

// 11. Check redirect fallback in safeClick
if (inject.includes('window.location.href') && inject.includes('new MouseEvent')) ok('Redirect fallback navigation present in safeClick');
else fail_('Redirect fallback missing');

// 12. Check Navigator.prototype only for webdriver
if (inject.includes("Object.defineProperty(Navigator.prototype, 'webdriver'")) ok('Module 17 overrides only Navigator.prototype');
else fail_('Module 17 webdriver fix not found');

// 13. Check all JS files parse
const files = ['background.js','inject.js','content.js','popup.js','options.js','settings.js'];
let allParse=true;
for (const f of files) {
  try { execSync('node --check '+f, {stdio:'pipe'}); }
  catch(e) { allParse=false; fail_('JS parse error in '+f+': '+e.stderr.toString().split('\n')[0]); }
}
if (allParse) ok('All 6 JS files pass node --check');

// 14. Check all SETTINGS_MAP storage keys are in background.js onInstalled
const bg = fs.readFileSync('background.js','utf8');
const onInstalled = bg.match(/chrome\.storage\.local\.set\(\{([\s\S]*?)\}\);/);
if (onInstalled) {
  const bgKeys = [...onInstalled[1].matchAll(/([a-zA-Z]+):\s*true/g)].map(m=>m[1]);
  const missingBg = Object.values(sm).filter(k => !bgKeys.includes(k));
  if (missingBg.length===0) ok('All ' + Object.values(sm).length + ' module keys in onInstalled defaults');
  else fail_('Missing from onInstalled defaults: '+JSON.stringify(missingBg));
} else {
  fail_('Could not parse onInstalled storage.set');
}

// 15. Check icons exist
for (const size of [16,48,128]) {
  if (fs.existsSync('icons/icon'+size+'.png')) ok('icon'+size+'.png exists');
  else fail_('icon'+size+'.png missing');
}

// 16. Check _metadata folder is gone
if (!fs.existsSync('_metadata')) ok('_metadata/ folder removed');
else fail_('_metadata/ folder still present!');

console.log('\n=== RESULTS: '+pass+' passed, '+fail+' failed ===');
if (fail > 0) process.exit(1);
