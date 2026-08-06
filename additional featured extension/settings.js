// BraveShield Bypass Pro - Shared Settings Module
// Used by both popup.js and options.js for consistent settings management

const SETTINGS_MAP = {
  // Auto Bypass
  'auto-links': 'autoBypassLinks',
  'auto-timers': 'autoBypassTimers',
  'click-wait': 'clickImageWait',
  'auto-cookies': 'autoDismissCookies',
  'auto-scroll': 'autoScroll',
  'auto-redirects': 'autoRedirects',
  'auto-popunder': 'interceptPopunders',
  // Adblock Detection
  'adblock-detect': 'bypassAdblockDetection',
  'fake-bait': 'fakeNetworkBait',
  // Stealth - Core
  'mask-brave': 'maskBraveApi',
  'mask-brands': 'maskClientHints',
  'mask-gpc': 'maskGPC',
  'stub-vars': 'stubAnalytics',
  'bypass-traps': 'bypassShieldsTraps',
  'normalize-webgl': 'normalizeWebgl',
  // Stealth - Fingerprint Fixes
  'fix-braveleak': 'fixBraveLeak',
  'fix-storageleak': 'fixStorageLeak',
  'normalize-audio': 'normalizeAudio',
  'normalize-canvas': 'normalizeCanvas',
  // Stealth - Anti-Automation
  'hide-webdriver': 'hideWebdriver',
  'prevent-webrtc': 'preventWebRTC',
  'deny-permissions': 'autoDenyPermissions',
  'clamp-timers': 'clampTimers',
  'spoof-navigator': 'spoofNavigator',
  // Stealth - Consistency
  'clean-css': 'cleanCSS',
  'spoof-fonts': 'spoofFonts',
  'screen-consistency': 'screenConsistency',
  // YouTube
  'yt-ads': 'youtubeAds',
  'yt-sponsor': 'sponsorBlock',
  // Extra - Accessibility
  'enable-rightclick': 'forceRightClick',
  'enable-text-select': 'forceTextSelect',
  'anti-scroll-lock': 'antiScrollLock',
  'auto-close-popups': 'autoClosePopups',
  // Extra - Privacy
  'anti-clipboard-read': 'blockClipboardRead',
  'anti-notification-spam': 'blockNotificationSpam',
  'anti-screenshot-detect': 'antiScreenshotDetect',
  // Extra - Region
  'timezone-spoof': 'timezoneSpoof',
  'geolocation-spoof': 'geolocationSpoof'
};

// Module categories for UI organization
const MODULE_CATEGORIES = {
  'auto-bypass': {
    label: 'Auto Bypass',
    icon: 'Z',
    settings: ['auto-links', 'auto-timers', 'click-wait', 'auto-cookies', 'auto-scroll', 'auto-redirects', 'auto-popunder', 'adblock-detect', 'fake-bait']
  },
  'stealth-core': {
    label: 'Stealth - Core',
    icon: 'B',
    settings: ['mask-brave', 'mask-brands', 'mask-gpc', 'stub-vars', 'bypass-traps', 'normalize-webgl']
  },
  'stealth-fingerprint': {
    label: 'Stealth - Fingerprint',
    icon: 'F',
    settings: ['fix-braveleak', 'fix-storageleak', 'normalize-audio', 'normalize-canvas']
  },
  'stealth-anti-auto': {
    label: 'Stealth - Anti-Automation',
    icon: 'W',
    settings: ['hide-webdriver', 'prevent-webrtc', 'deny-permissions', 'clamp-timers', 'spoof-navigator']
  },
  'stealth-consistency': {
    label: 'Stealth - Consistency',
    icon: 'S',
    settings: ['clean-css', 'spoof-fonts', 'screen-consistency']
  },
  'youtube': {
    label: 'YouTube',
    icon: 'Y',
    settings: ['yt-ads', 'yt-sponsor']
  },
  'accessibility': {
    label: 'Accessibility',
    icon: 'X',
    settings: ['enable-rightclick', 'enable-text-select', 'anti-scroll-lock', 'auto-close-popups']
  },
  'privacy': {
    label: 'Privacy',
    icon: 'P',
    settings: ['anti-clipboard-read', 'anti-notification-spam', 'anti-screenshot-detect']
  },
  'region': {
    label: 'Region',
    icon: 'G',
    settings: ['timezone-spoof', 'geolocation-spoof']
  }
};

// Human-readable labels for each setting
const SETTING_LABELS = {
  'auto-links': { title: 'Link Shortener Auto-Bypass', desc: '50+ services' },
  'auto-timers': { title: 'Timer / Countdown Bypass', desc: 'Auto-clicks when ready' },
  'click-wait': { title: 'Click Image Wait Bypass', desc: 'Ad click-and-wait patterns' },
  'auto-cookies': { title: 'Cookie Consent Auto-Dismiss', desc: '20+ frameworks' },
  'auto-scroll': { title: 'Smart Auto-Scroll', desc: 'Scroll-lock pages' },
  'auto-redirects': { title: 'Redirect Chain Follower', desc: 'Meta refresh + click-throughs' },
  'auto-popunder': { title: 'Popunder Interceptor', desc: 'Blocks ad windows' },
  'adblock-detect': { title: 'Adblock Detection Bypass', desc: 'Hispanoads, Admiral, BlockAdBlock' },
  'fake-bait': { title: 'Network Bait Faking', desc: '200 OK for ad probes' },
  'mask-brave': { title: 'Navigator.brave Destruction', desc: 'Removes navigator.brave' },
  'mask-brands': { title: 'Client Hints Brand Sanitizer', desc: 'Strips Brave from brands' },
  'mask-gpc': { title: 'Global Privacy Control', desc: 'Hides GPC flag' },
  'stub-vars': { title: 'Ad/Analytics Stubs', desc: 'Fakes ga, gtag, pbjs' },
  'bypass-traps': { title: 'DOM Trap Neutralizer', desc: 'Hooks offsetHeight/Width' },
  'normalize-webgl': { title: 'WebGL Normalization', desc: 'GPU vendor/renderer strings' },
  'fix-braveleak': { title: 'brave:// Protocol Leak Fix', desc: 'DOM URL parser patch' },
  'fix-storageleak': { title: 'Storage Quota Leak Fix', desc: 'Hides real disk size' },
  'normalize-audio': { title: 'AudioContext Normalization', desc: 'Consistent output' },
  'normalize-canvas': { title: 'Canvas Fingerprint Fix', desc: 'Consistent toDataURL' },
  'hide-webdriver': { title: 'webdriver Hide', desc: 'Returns false' },
  'prevent-webrtc': { title: 'WebRTC IP Leak Prevention', desc: 'Strips ICE servers' },
  'deny-permissions': { title: 'Permission Auto-Deny', desc: 'Camera, mic, notifs' },
  'clamp-timers': { title: 'Performance Timer Clamp', desc: 'Prevents timing attacks' },
  'spoof-navigator': { title: 'Navigator Consistency', desc: 'Platform, HW, screen' },
  'clean-css': { title: 'CSS Property Cleanup', desc: 'Removes browser vars' },
  'spoof-fonts': { title: 'Font Fingerprint Spoof', desc: 'Consistent font check' },
  'screen-consistency': { title: 'Screen/Viewport', desc: 'Realistic dimensions' },
  'yt-ads': { title: 'YouTube Ad Blocking', desc: 'Video, display, overlays, promoted' },
  'yt-sponsor': { title: 'SponsorBlock', desc: 'Skip sponsored segments' },
  'enable-rightclick': { title: 'Force Right-Click', desc: 'Override site blocks' },
  'enable-text-select': { title: 'Force Text Selection', desc: 'Override copy blocks' },
  'anti-scroll-lock': { title: 'Anti-Scroll Lock', desc: 'overflow:hidden override' },
  'auto-close-popups': { title: 'Auto-Close Popups', desc: 'Close ad windows' },
  'anti-clipboard-read': { title: 'Block Clipboard Read', desc: 'Prevent site access' },
  'anti-notification-spam': { title: 'Block Notification Spam', desc: 'Auto-deny requests' },
  'anti-screenshot-detect': { title: 'Anti-Screenshot Detection', desc: 'Block detection' },
  'timezone-spoof': { title: 'Timezone Spoofing', desc: 'Match UA region' },
  'geolocation-spoof': { title: 'Geolocation Spoofing', desc: 'Fake GPS coordinates' }
};

// All setting IDs in order
const ALL_SETTING_IDS = Object.keys(SETTINGS_MAP);

// Export for use in popup.js and options.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SETTINGS_MAP, MODULE_CATEGORIES, SETTING_LABELS, ALL_SETTING_IDS };
}