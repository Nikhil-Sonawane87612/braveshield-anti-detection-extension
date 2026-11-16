#!/usr/bin/env node
// Build BraveShield Mobile userscript — bundles 20 Android profiles + desktop utilities + Spotify + Audio Booster (no stream sniffer)
import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('manifest.json','utf8'));
const version = manifest.version || '6.3.0';

// Read source fragments
const constantsJs = fs.readFileSync('shared/constants.js','utf8');
const uaResolveJs = fs.readFileSync('shared/ua-resolve.js','utf8');
const hardwareProfilesRaw = fs.readFileSync('hardware-profiles.js','utf8');

// Pick 20 Android profiles — all from Android Flagships & Tablets category
const keepIds = new Set([
  'android-s24ultra','android-s24plus','android-s24','android-s23ultra',
  'android-zfold6','android-zflip6',
  'android-pixel9pro-xl','android-pixel9pro','android-pixel9','android-pixel8pro','android-pixel8a','android-pixel7pro',
  'android-oneplus12','android-oneplus12r',
  'android-xiaomi14ultra','android-xiaomi14',
  'android-rog8pro','android-sony-xperia1vi',
  'android-tab-s9ultra','android-tab-pixel'
]);

// Extract catalog entries via regex on raw file
let catalogEntries = [];
const entryRegex = /\{ id: '(.*?)', category: '(.*?)', name: '(.*?)', platform: '(.*?)', vendor: '(.*?)', renderer: '(.*?)', concurrency: (\d+), memory: (\d+), devicePixelRatio: ([\d.]+), screen: \{ width: (\d+), height: (\d+), colorDepth: (\d+) \} \}/g;
let m;
while ((m = entryRegex.exec(hardwareProfilesRaw)) !== null) {
  const id = m[1];
  if (keepIds.has(id)) {
    catalogEntries.push(`  { id: '${m[1]}', category: '${m[2]}', name: '${m[3]}', platform: '${m[4]}', vendor: '${m[5]}', renderer: '${m[6]}', concurrency: ${m[7]}, memory: ${m[8]}, devicePixelRatio: ${m[9]}, screen: { width: ${m[10]}, height: ${m[11]}, colorDepth: ${m[12]} } }`);
  }
}

// Minimal UA catalog — latest per bucket (chrome_131_*) + templates already in ua-resolve
// We embed a tiny catalog covering win/mac/linux/android/iphone/ipad
const uaCatalogEntries = [
  `  "chrome_131_win": { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", brands: [{ brand: "Chromium", version: "131" }, { brand: "Not_A Brand", version: "24" }, { brand: "Google Chrome", version: "131" }], platform: "Windows", mobile: false, platformVersion: "10.0.0" }`,
  `  "chrome_131_mac": { ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", brands: [{ brand: "Chromium", version: "131" }, { brand: "Not_A Brand", version: "24" }, { brand: "Google Chrome", version: "131" }], platform: "macOS", mobile: false, platformVersion: "14.7.0" }`,
  `  "chrome_131_linux": { ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", brands: [{ brand: "Chromium", version: "131" }, { brand: "Not_A Brand", version: "24" }, { brand: "Google Chrome", version: "131" }], platform: "Linux", mobile: false, platformVersion: "6.11.0" }`,
  `  "chrome_131_android": { ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36", brands: [{ brand: "Chromium", version: "131" }, { brand: "Not_A Brand", version: "24" }, { brand: "Google Chrome", version: "131" }], platform: "Android", mobile: true, platformVersion: "15.0.0" }`,
  `  "chrome_131_iphone": { ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1", brands: [{ brand: "Google Chrome", version: "131" }, { brand: "Chromium", version: "131" }], platform: "iOS", mobile: true, platformVersion: "18.1" }`,
  `  "chrome_131_ipad": { ua: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1", brands: [{ brand: "Google Chrome", version: "131" }, { brand: "Chromium", version: "131" }], platform: "iOS", mobile: true, platformVersion: "18.1" }`,
];

// Extract pure JS from constants and ua-resolve (strip module.exports and 'use strict' duplication)
function stripModuleExports(s){
  return s.replace(/\/\/ Node test hook[\s\S]*?if \(typeof module[\s\S]*?\n\}/m,'').trim();
}
const constantsPure = stripModuleExports(constantsJs).replace("'use strict';",'').replace(/\/\/.*\n/g,'').trim();
// UA resolver is single-sourced from shared/ua-resolve.js. This build only emits
// the .user.js meta header; build-mobile-full.mjs inlines the shared file.


const header = `// ==UserScript==
// @name         BraveShield Mobile — Android Stealth + Adblock + Video Turbo + Spotify + Audio Booster
// @namespace    https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension
// @version      ${version}
// @description  Minimal Android build (20 profiles) — keeps desktop adblocker, video adblocker (YouTube/Twitch/Spotify), 50x timer turbo, utilities (clean URL, right-click, video speed, auto-skip), fingerprint stealth, plus Spotify adblock + audio booster. No stream sniffer. Works in AdGuard, Via, Firefox+Violentmonkey, Edge Canary/Quetta (covers Brave via AdGuard filtering).
// @author       Nikhil Sonawane
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      lrclib.net
// @connect      returnyoutubedislikeapi.com
// @connect      raw.githubusercontent.com
// @connect      *
// @noframes     false
// @updateURL    https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/braveshield-mobile.user.js
// @downloadURL  https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/braveshield-mobile.user.js
// ==/UserScript==
`;

fs.writeFileSync('braveshield-mobile.user.js.meta', header);
console.log('wrote meta, version', version);
console.log('catalog entries', catalogEntries.length);
