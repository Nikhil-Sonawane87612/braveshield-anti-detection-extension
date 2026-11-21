import fs from 'fs';
const manifest = JSON.parse(fs.readFileSync('manifest.json','utf8'));
const version = manifest.version || '6.3.0';

let inject = fs.readFileSync('inject.js','utf8');
let contentJs = fs.readFileSync('content.js','utf8');

// --- Remove kill-switch bridge header from inject, will shim ---
// Keep inject core but replace BS_CONFIG initialization with shimmed version
// We'll build final file from scratch using templates for clarity, not string surgery

// Hardware subset 20 Android
const keepIds = new Set([
  'android-s24ultra','android-s24plus','android-s24','android-s23ultra',
  'android-zfold6','android-zflip6',
  'android-pixel9pro-xl','android-pixel9pro','android-pixel9','android-pixel8pro','android-pixel8a','android-pixel7pro',
  'android-oneplus12','android-oneplus12r',
  'android-xiaomi14ultra','android-xiaomi14',
  'android-rog8pro','android-sony-xperia1vi',
  'android-tab-s9ultra','android-tab-pixel'
]);

const hwRaw = fs.readFileSync('hardware-profiles.js','utf8');
const entryRe = /\{\s*id:\s*'(.*?)'[\s\S]*?screen:\s*\{[^}]*\}\s*\}/g;
let hwEntries = [];
let m;
while ((m = entryRe.exec(hwRaw)) !== null) {
  if (keepIds.has(m[1])) {
    // clean up to single line
    let txt = m[0].trim();
    // ensure ends without trailing comma issues
    hwEntries.push('  ' + txt.replace(/\s+/g,' ').replace(/, \}/,' }'));
  }
}
if (hwEntries.length !== 20) console.warn('hardware subset not 20', hwEntries.length);

let androidJs = fs.readFileSync('braveshield-android.user.js','utf8');
// Extract audio booster and spotify sections (without stream sniffer)
function extractBetween(src, startMarker, endMarker){
  const s = src.indexOf(startMarker);
  const e = src.indexOf(endMarker, s);
  if (s===-1 || e===-1) return '';
  return src.slice(s, e);
}
const audioBoosterSection = extractBetween(androidJs, '// GROUP G2: MOBILE AUDIO BOOSTER', '// GROUP H: MOBILE DOWNLOAD');
const spotifySection = extractBetween(androidJs, '// GROUP D: SPOTIFY', '// GROUP E & G: YOUTUBE');

const header = `// ==UserScript==
// @name         BraveShield Mobile — Android Stealth + Adblock + Video Turbo + Spotify + Audio Booster
// @namespace    https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension
// @version      ${version}
// @description  Minimal Android build (20 profiles) — desktop adblocker, video adblocker (YouTube/Twitch/Spotify), 50x timer turbo & utilities (clean URL, right-click, video speed, auto-skip), fingerprint stealth, plus Spotify adblock & audio booster. No stream sniffer. Works in AdGuard (covers Brave), Via, Firefox+Violentmonkey, Edge Canary/Quetta.
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

// Read inject.js and content.js fragments we need to inline — for now embed key logic via direct copy with minimal transforms
// For mobile, replace chrome.storage bridge with GM shim; keep all spoof modules

// We'll create a shim header that defines WIN, DOC, host, GM shim, constants, ua-resolve, hardware, UA catalog

const constantsSnippet = fs.readFileSync('shared/constants.js','utf8')
  .replace(/'use strict';\s*/,'')
  .replace(/\/\/ Node test hook[\s\S]*/,'')
  .trim();

const uaResolveSnippet = `
// --- ua-resolve: SINGLE SOURCE OF TRUTH shared/ua-resolve.js ---
${fs.readFileSync('shared/ua-resolve.js','utf8')
  .replace(/'use strict';\s*/,'')
  .replace(/\/\/ Node test hook[\s\S]*/,'')
  .trim()}
`;

const hwCatalog = `const HARDWARE_PROFILES_CATALOG = [
${hwEntries.join(',\n')}
];
function getHardwareProfileById(id){ return HARDWARE_PROFILES_CATALOG.find(p=>p.id===id)||HARDWARE_PROFILES_CATALOG[0]; }
`;

const uaCatalog = fs.readFileSync('useragents.js','utf8').trim();

// For final, we will embed inject.js core but shim storage
// Simplify: take inject.js body between after BS_CONFIG and before final console.log, and wrap with shim

let injectBody = inject;
// Remove outer wrapper header we will replace
// Extract from after "let bsSiteDisabled" to before "console.log('[BraveShield"
const startIdx = inject.indexOf('let bsSiteDisabled');
const endIdx = inject.lastIndexOf("console.log('[BraveShield");
let coreInject = inject.slice(startIdx, endIdx);

// Content.js sweeps to merge — extract Paywall + Modal + Overlay + fastPass
let contentBody = contentJs;
const paywallStart = contentJs.indexOf('// Feature B: Universal Paywall');
const sweepEnd = contentJs.indexOf('let cScanTimer');
let contentSweeps = contentJs.slice(paywallStart, sweepEnd);

// Build final file
const final = `${header}
(function() {
  'use strict';
  const WIN = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const DOC = WIN.document;
  const host = (WIN.location && WIN.location.hostname) ? WIN.location.hostname.toLowerCase() : '';
  const path = (WIN.location && WIN.location.pathname) ? WIN.location.pathname : '';
  // Storage shim GM -> localStorage
  const BS_GM = (typeof GM_getValue !== 'undefined' && typeof GM_setValue !== 'undefined') ? { get: GM_getValue, set: GM_setValue } : null;
  function bsGMGet(k, d){ try{ if(BS_GM) return BS_GM.get(k,d); const v=WIN.localStorage.getItem('bs_'+k); return v==null?d:JSON.parse(v);}catch(_){ return d; } }
  function bsGMSet(k,v){ try{ if(BS_GM) return BS_GM.set(k,v); WIN.localStorage.setItem('bs_'+k, JSON.stringify(v)); }catch(_){} }
  function bsGMGetAll(){ const keys=['masterEnabled','enabled','unshortenerEnabled','autoBypassTimers','gentleTurboEnabled','turboAllSites','paywallDefuserEnabled','bypassAdblockDetection','workerParityEnabled','maskBraveApi','clientHintsEnabled','webglSpoofingEnabled','canvasNoiseEnabled','audioNoiseEnabled','webrtcShieldEnabled','domJitterEnabled','timerCoarseningEnabled','mediaDevicesSanitizeEnabled','speechVoicesSanitizeEnabled','batteryMaskEnabled','networkInfoMaskEnabled','screenNormalizationEnabled','uaSpoofingEnabled','timezoneSpoofingEnabled','webgpuMaskingEnabled','fontEnumMaskingEnabled','fontEnsembleEnabled','devtoolsDefuseEnabled','cleanUrlEnabled','rightClickEnabled','videoSpeedEnabled','autoSkipIntrosEnabled','youtubeAds','spotifyUnlocked','twitchShieldEnabled','instagramReelsAdsEnabled','instagramAutoScrollEnabled','youtubeShortsEnabled','youtubeShortsAutoScroll','facebookReelsEnabled','permissionAutoDenyEnabled','deviceProfile','customHardwareProfile','browserType','spoofTimezone','spoofLocale','whitelist','siteProfiles','reelDwellSeconds','reelMaxAutoSeconds','customResolvers']; const out={}; for(const k of keys){ const v=bsGMGet(k, undefined); if(v!==undefined) out[k]=v; } return out; }

  // Constants
  ${constantsSnippet}

  // UA resolve
  ${uaResolveSnippet}

  // Hardware 20 profiles + UA catalog
  ${hwCatalog}
  ${uaCatalog}

  // Shimmed BS_CONFIG — loaded from GM/localStorage, defaults like background.js
  const BS_DEFAULTS = {
    masterEnabled: true, enabled: true, unshortenerEnabled: true, autoBypassTimers: true, gentleTurboEnabled: true, turboAllSites: false,
    paywallDefuserEnabled: true, bypassAdblockDetection: true, maskBraveApi: true, clientHintsEnabled: true, workerParityEnabled: false,
    webglSpoofingEnabled: true, canvasNoiseEnabled: true, audioNoiseEnabled: true, webrtcShieldEnabled: true,
    domJitterEnabled: true, timerCoarseningEnabled: true, mediaDevicesSanitizeEnabled: true, speechVoicesSanitizeEnabled: true,
    batteryMaskEnabled: true, networkInfoMaskEnabled: true, screenNormalizationEnabled: true, uaSpoofingEnabled: true,
    timezoneSpoofingEnabled: false, webgpuMaskingEnabled: true, fontEnumMaskingEnabled: true, fontEnsembleEnabled: true, devtoolsDefuseEnabled: true,
    cleanUrlEnabled: true, rightClickEnabled: true, videoSpeedEnabled: true, autoSkipIntrosEnabled: true,
    youtubeAds: true, spotifyUnlocked: true, twitchShieldEnabled: true,
    instagramReelsAdsEnabled: true, instagramAutoScrollEnabled: false,
    youtubeShortsEnabled: true, youtubeShortsAutoScroll: false, facebookReelsEnabled: true,
    permissionAutoDenyEnabled: true, reelDwellSeconds: 1, reelMaxAutoSeconds: 0, customResolvers: [],
    deviceProfile: 'android-pixel9pro', browserType: 'brave', customHardwareProfile: null, spoofTimezone: null, spoofLocale: null, whitelist: [], siteProfiles: {}, siteProtected: false, siteOverrideActive: false
  };
  const BS_CONFIG = Object.assign({}, BS_DEFAULTS, bsGMGetAll());
  // Resolve UA like background.js
  function bsRealChromeMajor(){ try{ const m=String(WIN.navigator.userAgent||'').match(/Chrome\\/(\\d+)/); return m?m[1]:null; }catch(_){ return null; } }
  function bsResolveIdentity(platformKey, browserType){
    try{
      const realMajor = bsRealChromeMajor();
      const resolved = bsResolveUaFromCatalog(USER_AGENTS, platformKey, browserType, realMajor);
      return resolved ? bsResolveBrowserIdentity(browserType||'brave', resolved) : null;
    }catch(_){ return null; }
  }
  function bsPlatformKeyForProfileShim(){ const dp=BS_CONFIG.deviceProfile||'android-pixel9pro'; const cp=BS_CONFIG.customHardwareProfile; if(dp==='custom') return (cp&&cp.platform)||'Win32'; const id=String(dp); if(id.startsWith('win-')) return 'Win32'; if(id.startsWith('mac-')) return 'MacIntel'; if(id.startsWith('linux-')) return 'Linux x86_64'; if(id.startsWith('android-')||id.startsWith('pixel-')) return 'Linux armv81'; if(id.startsWith('ios-')||id.startsWith('ipad-')) return 'iPhone'; return 'Win32'; }
  // Apply per-site override like content.js bsFindSiteOverride — modules-only
  // overrides are valid too (matrix sites with no identity change)
  function bsFindSiteOverride(profiles, hostname){
    if(!profiles||typeof profiles!=='object'||!hostname) return null;
    for(const [domain, prof] of Object.entries(profiles)){
      if(prof&&typeof prof==='object'&&(prof.deviceProfile||prof.browserType||prof.modules)&&bsDomainMatches(hostname, domain)) return prof;
    }
    return null;
  }
  // Merge site override into BS_CONFIG
  try{
    const override = bsFindSiteOverride(BS_CONFIG.siteProfiles, host);
    if(override){
      if(override.deviceProfile) BS_CONFIG.deviceProfile = override.deviceProfile;
      if(override.browserType) BS_CONFIG.browserType = override.browserType;
      if(override.modules && typeof override.modules === 'object'){
        for(const mk in override.modules){ if(mk in BS_CONFIG) BS_CONFIG[mk] = override.modules[mk]; }
      }
    }
  }catch(_){}
  // Resolve UA now
  try{
    const pk = bsPlatformKeyForProfile(BS_CONFIG.deviceProfile, BS_CONFIG.customHardwareProfile);
    const bt = BS_CONFIG.browserType||'brave';
    const resolved = bsGMGet('uaSpoofingEnabled', true)===false ? null : bsResolveIdentity(pk, bt);
    BS_CONFIG.resolvedUA = resolved;
  }catch(_){}

  // Captcha passthrough
  const isCaptchaHost = (typeof bsIsCaptchaHost === 'function') ? bsIsCaptchaHost(host, path) : false;
  if (isCaptchaHost) { console.log('[BraveShield Mobile] captcha host passthrough', host); return; }

${coreInject}

  // --- CONTENT SWEEPS (from content.js) merged, shimmed to BS_CONFIG gate ---
  const bsGate = { ready: true, master: BS_CONFIG.masterEnabled!==false && BS_CONFIG.enabled!==false, paywall: BS_CONFIG.paywallDefuserEnabled!==false, adblock: BS_CONFIG.bypassAdblockDetection!==false, timers: BS_CONFIG.autoBypassTimers!==false };
  // isWhitelisted check
  function bsIsWhitelisted(hostname, whitelist){
    if(!Array.isArray(whitelist)||!hostname) return false;
    return whitelist.some(d=> bsDomainMatches(hostname, d));
  }
  if (bsIsWhitelisted(host, BS_CONFIG.whitelist||[])) bsGate.master=false;

${contentSweeps}

  let cScanTimer = null;
  function debouncedContentScan(){
    if(cScanTimer) return;
    cScanTimer = setTimeout(()=>{ try{ annihilateAntiAdblockModals(); }catch(_){} try{ purgeInvisibleOverlays(); }catch(_){} try{ fastPassButtons(); }catch(_){} cScanTimer=null; }, 400);
  }
  try{ annihilateAntiAdblockModals(); purgeInvisibleOverlays(); fastPassButtons(); }catch(_){}
  const trapInterval = setInterval(debouncedContentScan, 800);
  setTimeout(()=> clearInterval(trapInterval), 30000);
  try{
    const trapObserver = new MutationObserver(debouncedContentScan);
    if(DOC.documentElement) trapObserver.observe(DOC.documentElement, { childList:true, subtree:true });
  }catch(_){}

  // --- Spotify adblock (from android script, no stream sniffer) ---
${spotifySection}

  // --- Audio Booster (from android script) ---
${audioBoosterSection}

  // --- Floating panel ---
  function bsCreatePanel(){
    if(DOC.getElementById('bs-mobile-panel')) return;
    const panel = DOC.createElement('div');
    panel.id='bs-mobile-panel';
    panel.innerHTML=\`
      <button id='bs-panel-toggle' style='position:fixed;bottom:14px;right:14px;z-index:2147483646;width:48px;height:48px;border-radius:50%;background:#0a0f19;border:1px solid rgba(0,255,204,0.4);color:#00ffcc;font-size:22px;box-shadow:0 4px 16px rgba(0,0,0,0.6);cursor:pointer;'>🛡️</button>
      <div id='bs-panel' style='display:none;position:fixed;bottom:72px;right:14px;z-index:2147483647;width:320px;max-height:75vh;overflow:auto;background:rgba(10,15,25,0.97);border:1px solid rgba(0,255,204,0.3);border-radius:12px;padding:14px;color:#e2e8f0;font-family:system-ui,sans-serif;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,0.8);backdrop-filter:blur(12px);'>
        <div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;'><b style='color:#00ffcc;'>BraveShield Mobile v\${version}</b><button id='bs-panel-close' style='background:transparent;border:none;color:#94a3b8;font-size:18px;cursor:pointer;'>✕</button></div>
        <div style='display:grid;gap:8px;'>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Master</span><input type='checkbox' id='bs-cfg-masterEnabled' \${BS_CONFIG.masterEnabled!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Adblock trap</span><input type='checkbox' id='bs-cfg-bypassAdblockDetection' \${BS_CONFIG.bypassAdblockDetection!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Paywall defuser</span><input type='checkbox' id='bs-cfg-paywallDefuserEnabled' \${BS_CONFIG.paywallDefuserEnabled!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>50x Turbo</span><input type='checkbox' id='bs-cfg-autoBypassTimers' \${BS_CONFIG.autoBypassTimers!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>YouTube 16x</span><input type='checkbox' id='bs-cfg-youtubeAds' \${BS_CONFIG.youtubeAds!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Spotify adblock</span><input type='checkbox' id='bs-cfg-spotifyUnlocked' \${BS_CONFIG.spotifyUnlocked!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Canvas noise</span><input type='checkbox' id='bs-cfg-canvasNoiseEnabled' \${BS_CONFIG.canvasNoiseEnabled!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>WebGL spoof</span><input type='checkbox' id='bs-cfg-webglSpoofingEnabled' \${BS_CONFIG.webglSpoofingEnabled!==false?'checked':''}></label>
          <label style='display:flex;justify-content:space-between;align-items:center;'><span>Audio booster</span><input type='checkbox' id='bs-cfg-audioBooster' checked></label>
          <label>Profile<select id='bs-cfg-profile' style='width:100%;margin-top:4px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:6px;'></select></label>
          <label>Browser<select id='bs-cfg-browserType' style='width:100%;margin-top:4px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:6px;'><option value='brave'>Brave</option><option value='chrome'>Chrome</option><option value='firefox'>Firefox</option><option value='safari'>Safari</option></select></label>
          <div style='font-size:11px;opacity:0.6;'>AdGuard covers Brave system-wide (HTTPS filtering ON). Via: open .user.js → Install. Kiwi archived → use Edge Canary/Quetta. Changes apply on next reload.</div>
        </div>
      </div>
    \`;
    (DOC.body||DOC.documentElement).appendChild(panel);
    const sel=panel.querySelector('#bs-cfg-profile');
    if(sel){
      HARDWARE_PROFILES_CATALOG.forEach(p=>{ const o=DOC.createElement('option'); o.value=p.id; o.textContent=p.name; sel.appendChild(o); });
      sel.value=BS_CONFIG.deviceProfile||'android-pixel9pro';
      sel.addEventListener('change',()=>{ bsGMSet('deviceProfile', sel.value); });
    }
    const btSel=panel.querySelector('#bs-cfg-browserType');
    if(btSel){ btSel.value=BS_CONFIG.browserType||'brave'; btSel.addEventListener('change',()=>{ bsGMSet('browserType', btSel.value); }); }
    panel.querySelectorAll('input[type=checkbox]').forEach(inp=>{
      inp.addEventListener('change',()=>{
        const k=inp.id.replace('bs-cfg-','');
        if(k==='audioBooster') return;
        const v=inp.checked;
        bsGMSet(k, v);
        if(k==='masterEnabled') BS_CONFIG.masterEnabled=v;
      });
    });
    panel.querySelector('#bs-panel-toggle').addEventListener('click',()=>{ const p=panel.querySelector('#bs-panel'); p.style.display=p.style.display==='none'?'block':'none'; });
    panel.querySelector('#bs-panel-close').addEventListener('click',()=>{ panel.querySelector('#bs-panel').style.display='none'; });
  }
  if(DOC.readyState==='loading') DOC.addEventListener('DOMContentLoaded', bsCreatePanel); else bsCreatePanel();
  // GM menu
  try{ if(typeof GM_registerMenuCommand!=='undefined') GM_registerMenuCommand('BraveShield: Toggle panel', ()=>{ const p=DOC.getElementById('bs-panel'); if(p) p.style.display=p.style.display==='none'?'block':'none'; }); }catch(_){}

  console.log('[BraveShield Mobile] v${version} armed — 20 Android profiles, adblock+video+turbo+utils, Spotify, audio booster (no sniffer). AdGuard covers Brave.');
})();
`;

fs.writeFileSync('braveshield-mobile.user.js', final);
console.log('wrote braveshield-mobile.user.js', final.length, 'bytes');
