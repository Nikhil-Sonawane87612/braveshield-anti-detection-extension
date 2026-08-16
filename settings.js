// BraveShield Bypass Pro - Shared Settings Module
// Used by both popup.js and options.js for consistent settings management

const DEVICE_PROFILES = {
  'win-rtx4080': {
    id: 'win-rtx4080',
    name: 'Windows 11 + NVIDIA RTX 4080 (Chrome 131)',
    platform: 'Win32',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36',
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    mobile: false
  },
  'mac-m3pro': {
    id: 'mac-m3pro',
    name: 'macOS Sequoia + Apple M3 Pro (Chrome 131)',
    platform: 'MacIntel',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36',
    webglVendor: 'Google Inc. (Apple)',
    webglRenderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Version 15.0)',
    mobile: false
  },
  'android-pixel9': {
    id: 'android-pixel9',
    name: 'Android 15 + Google Pixel 9 (Chrome Mobile 131)',
    platform: 'Linux armv81',
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Mobile Safari/537.36',
    webglVendor: 'Google Inc. (ARM)',
    webglRenderer: 'ANGLE (ARM, Mali-G715, OpenGL ES 3.2)',
    mobile: true
  }
};

const SETTINGS_MAP = {
  // Auto Bypass & Advanced Unshorteners
  'auto-links': 'autoBypassLinks',
  'auto-timers': 'autoBypassTimers',
  'direct-unshortener': 'unshortenerEnabled',
  'click-wait': 'clickImageWait',
  'auto-cookies': 'autoDismissCookies',
  'auto-scroll': 'autoScroll',
  'auto-redirects': 'autoRedirects',
  'auto-popunder': 'interceptPopunders',
  // Adblock & Paywall Detection
  'adblock-detect': 'bypassAdblockDetection',
  'paywall-defuser': 'paywallDefuserEnabled',
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
  // Video, Streaming & Media
  'yt-ads': 'youtubeAds',
  'yt-sponsor': 'sponsorBlock',
  'twitch-shield': 'twitchShieldEnabled',
  'video-turbo-ad': 'videoTurboAdSpeed',
  'video-turbo-bg': 'videoTurboBgPlay',
  'video-turbo-pip': 'videoTurboPip',
  'devmode': 'devMode',
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
    label: 'Auto Bypass & Link Resolvers',
    icon: '⚡',
    settings: ['auto-links', 'direct-unshortener', 'auto-timers', 'click-wait', 'auto-cookies', 'auto-scroll', 'auto-redirects', 'auto-popunder', 'adblock-detect', 'paywall-defuser', 'fake-bait']
  },
  'stealth-core': {
    label: 'Stealth - Core Chrome Cloak',
    icon: '🛡️',
    settings: ['mask-brave', 'mask-brands', 'mask-gpc', 'stub-vars', 'bypass-traps', 'normalize-webgl']
  },
  'stealth-fingerprint': {
    label: 'Stealth - Fingerprint & Noise',
    icon: '🎭',
    settings: ['fix-braveleak', 'fix-storageleak', 'normalize-audio', 'normalize-canvas']
  },
  'stealth-anti-auto': {
    label: 'Stealth - Anti-Automation',
    icon: '🔒',
    settings: ['hide-webdriver', 'prevent-webrtc', 'deny-permissions', 'clamp-timers', 'spoof-navigator']
  },
  'stealth-consistency': {
    label: 'Stealth - Consistency',
    icon: '✨',
    settings: ['clean-css', 'spoof-fonts', 'screen-consistency']
  },
  'youtube': {
    label: 'Video & Streaming Turbo',
    icon: '🎬',
    settings: ['yt-ads', 'yt-sponsor', 'twitch-shield', 'video-turbo-ad', 'video-turbo-bg', 'video-turbo-pip']
  },
  'dev-tools': {
    label: 'Developer Tools',
    icon: '⚙️',
    settings: ['devmode']
  },
  'accessibility': {
    label: 'Accessibility & Unlocking',
    icon: '🔓',
    settings: ['enable-rightclick', 'enable-text-select', 'anti-scroll-lock', 'auto-close-popups']
  },
  'privacy': {
    label: 'Privacy Shield',
    icon: '👁️',
    settings: ['anti-clipboard-read', 'anti-notification-spam', 'anti-screenshot-detect']
  },
  'region': {
    label: 'Region & Location',
    icon: '🌐',
    settings: ['timezone-spoof', 'geolocation-spoof']
  }
};

// Human-readable labels for each setting
const SETTING_LABELS = {
  'auto-links': { title: 'Link Shortener Auto-Bypass', desc: 'Accelerates countdowns and arms destination buttons' },
  'direct-unshortener': { title: 'Instant Direct URL Unshortener', desc: 'Resolves destination URLs and renders 1-click jump bar' },
  'auto-timers': { title: 'Timer / Countdown Fast-Forward', desc: 'Safe 25x-50x countdown acceleration' },
  'click-wait': { title: 'Click Image Wait Bypass', desc: 'Ad click-and-wait patterns' },
  'auto-cookies': { title: 'Cookie Consent Auto-Dismiss', desc: '20+ frameworks' },
  'auto-scroll': { title: 'Smart Auto-Scroll', desc: 'Scroll-lock pages' },
  'auto-redirects': { title: 'Redirect Chain Follower', desc: 'Meta refresh + click-throughs' },
  'auto-popunder': { title: 'Popunder Interceptor', desc: 'Blocks ad windows' },
  'adblock-detect': { title: 'Adblock Detection Bypass', desc: 'Defuses modal blockers and dark backdrops' },
  'paywall-defuser': { title: 'Universal Paywall & Blur Defuser', desc: 'Unblurs Quora, Medium, Pinterest, and news paywalls' },
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
  'hide-webdriver': { title: 'webdriver Hide', desc: 'Returns false on Navigator.prototype' },
  'prevent-webrtc': { title: 'WebRTC IP Leak Prevention', desc: 'Strips ICE servers' },
  'deny-permissions': { title: 'Permission Auto-Deny', desc: 'Camera, mic, notifs' },
  'clamp-timers': { title: 'Performance Timer Clamp', desc: 'Prevents timing attacks' },
  'spoof-navigator': { title: 'Navigator Consistency', desc: 'Platform, HW, screen' },
  'clean-css': { title: 'CSS Property Cleanup', desc: 'Removes browser vars' },
  'spoof-fonts': { title: 'Font Fingerprint Spoof', desc: 'Consistent font check' },
  'screen-consistency': { title: 'Screen Resolution Guard', desc: 'Normalizes screen metrics' },
  'yt-ads': { title: 'YouTube Ad Fast-Forward', desc: '16x fast-forwards YouTube video ads' },
  'yt-sponsor': { title: 'SponsorBlock Engine', desc: 'Skips video sponsorships' },
  'twitch-shield': { title: 'Twitch & Streaming Ad Shield', desc: 'Auto-mutes and skips live stream mid-rolls' },
  'video-turbo-ad': { title: 'Video Turbo Speedup', desc: 'Fast-forwards generic video ads' },
  'video-turbo-bg': { title: 'Background Audio Playback', desc: 'Keeps media playing in bg tabs' },
  'video-turbo-pip': { title: 'Auto Picture-in-Picture', desc: 'Pip on tab switch' },
  'devmode': { title: 'Developer Debug Logging', desc: 'Logs telemetry in console' },
  'enable-rightclick': { title: 'Force Enable Right-Click', desc: 'Unblocks context menus' },
  'enable-text-select': { title: 'Force Enable Text Selection', desc: 'Unblocks copy-paste restrictions' },
  'anti-scroll-lock': { title: 'Anti-Scroll Lock', desc: 'Restores document scrolling' },
  'auto-close-popups': { title: 'Auto-Close Ad Popups', desc: 'Closes blank ad popups' },
  'anti-clipboard-read': { title: 'Block Clipboard Snooping', desc: 'Prevents sites reading clipboard' },
  'anti-notification-spam': { title: 'Block Notification Spam', desc: 'Suppresses notification prompts' },
  'anti-screenshot-detect': { title: 'Anti-Screenshot Detection', desc: 'Blocks print/screen hooks' },
  'timezone-spoof': { title: 'Timezone Consistency', desc: 'Matches IP timezone' },
  'geolocation-spoof': { title: 'Geolocation Consistency', desc: 'Normalizes geo coords' }
};

const ALL_SETTING_IDS = Object.keys(SETTINGS_MAP);

// Default Presets
const USER_PRESETS = {
  'stealth': {
    label: 'Standard',
    desc: 'Safe balanced anti-detection for everyday browsing',
    settings: {
      autoBypassLinks: true,
      unshortenerEnabled: true,
      autoBypassTimers: true,
      clickImageWait: true,
      autoDismissCookies: true,
      autoScroll: true,
      autoRedirects: true,
      interceptPopunders: true,
      bypassAdblockDetection: true,
      paywallDefuserEnabled: true,
      fakeNetworkBait: true,
      maskBraveApi: true,
      maskClientHints: true,
      maskGPC: true,
      stubAnalytics: true,
      bypassShieldsTraps: true,
      normalizeWebgl: true,
      fixBraveLeak: true,
      fixStorageLeak: true,
      normalizeAudio: true,
      normalizeCanvas: false,
      hideWebdriver: true,
      preventWebRTC: false,
      autoDenyPermissions: false,
      clampTimers: false,
      spoofNavigator: true,
      cleanCSS: false,
      spoofFonts: false,
      screenConsistency: false,
      youtubeAds: true,
      sponsorBlock: true,
      twitchShieldEnabled: true,
      videoTurboAdSpeed: true,
      videoTurboBgPlay: false,
      videoTurboPip: false,
      devMode: false,
      forceRightClick: true,
      forceTextSelect: true,
      antiScrollLock: true,
      autoClosePopups: true,
      blockClipboardRead: true,
      blockNotificationSpam: true,
      antiScreenshotDetect: false,
      timezoneSpoof: false,
      geolocationSpoof: false
    }
  },
  'pro': {
    label: 'Maximum Stealth',
    desc: 'Full titanium defense with all modules armed',
    settings: {
      autoBypassLinks: true,
      unshortenerEnabled: true,
      autoBypassTimers: true,
      clickImageWait: true,
      autoDismissCookies: true,
      autoScroll: true,
      autoRedirects: true,
      interceptPopunders: true,
      bypassAdblockDetection: true,
      paywallDefuserEnabled: true,
      fakeNetworkBait: true,
      maskBraveApi: true,
      maskClientHints: true,
      maskGPC: true,
      stubAnalytics: true,
      bypassShieldsTraps: true,
      normalizeWebgl: true,
      fixBraveLeak: true,
      fixStorageLeak: true,
      normalizeAudio: true,
      normalizeCanvas: true,
      hideWebdriver: true,
      preventWebRTC: true,
      autoDenyPermissions: true,
      clampTimers: true,
      spoofNavigator: true,
      cleanCSS: true,
      spoofFonts: true,
      screenConsistency: true,
      youtubeAds: true,
      sponsorBlock: true,
      twitchShieldEnabled: true,
      videoTurboAdSpeed: true,
      videoTurboBgPlay: true,
      videoTurboPip: true,
      devMode: true,
      forceRightClick: true,
      forceTextSelect: true,
      antiScrollLock: true,
      autoClosePopups: true,
      blockClipboardRead: true,
      blockNotificationSpam: true,
      antiScreenshotDetect: true,
      timezoneSpoof: true,
      geolocationSpoof: true
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEVICE_PROFILES, SETTINGS_MAP, MODULE_CATEGORIES, SETTING_LABELS, ALL_SETTING_IDS, USER_PRESETS };
}
