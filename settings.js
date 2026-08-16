// BraveShield Bypass Pro - Shared Settings Module
// Used by both popup.js and options.js for consistent settings management

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
  'auto-deny-perm': 'autoDenyPermissions',
  'clamp-timers': 'clampTimers',
  // Media Enhancements
  'youtube-ads': 'youtubeAds',
  'spotify-unlocked': 'spotifyUnlocked',
  'twitch-shield': 'twitchShieldEnabled',
  'video-speed': 'videoTurboAdSpeed'
};

const CATEGORIES = {
  'auto-bypass': {
    title: 'Shortener & Link Auto-Bypass',
    description: 'Instant countdown acceleration and direct link resolution',
    icon: '⚡',
    settings: ['auto-links', 'auto-timers', 'direct-unshortener', 'click-wait', 'auto-cookies', 'auto-scroll', 'auto-redirects', 'auto-popunder']
  },
  'adblock-defense': {
    title: 'AdBlock Trap & Paywall Defusal',
    description: 'Destroys anti-adblock modals, overlays, and paywalls',
    icon: '🛡️',
    settings: ['adblock-detect', 'paywall-defuser', 'fake-bait']
  },
  'stealth-core': {
    title: 'Stealth & Identity Cloaking',
    description: '100+ hardware profiles, WebGL masking, and fingerprint parity',
    icon: '🎭',
    settings: ['mask-brave', 'mask-brands', 'mask-gpc', 'stub-vars', 'bypass-traps', 'normalize-webgl']
  },
  'fingerprint-fixes': {
    title: 'Hardware & Canvas Parity',
    description: 'Protects audio, canvas, and memory signatures',
    icon: '🔒',
    settings: ['fix-braveleak', 'fix-storageleak', 'normalize-audio', 'normalize-canvas']
  },
  'anti-automation': {
    title: 'Anti-Automation Defense',
    description: 'Neutralizes bot detection and WebRTC IP leak vectors',
    icon: '🤖',
    settings: ['hide-webdriver', 'prevent-webrtc', 'auto-deny-perm', 'clamp-timers']
  },
  'media-suite': {
    title: 'Media & Streaming Shield',
    description: 'YouTube 16x turbo skip, Spotify unlocked lyrics, and Twitch shield',
    icon: '🎵',
    settings: ['youtube-ads', 'spotify-unlocked', 'twitch-shield', 'video-speed']
  }
};

const DEFAULT_SETTINGS = {
  enabled: true,
  masterEnabled: true,
  autoBypassLinks: true,
  autoBypassTimers: true,
  unshortenerEnabled: true,
  clickImageWait: true,
  autoDismissCookies: true,
  autoScroll: false,
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
  youtubeAds: true,
  spotifyUnlocked: true,
  twitchShieldEnabled: true,
  videoTurboAdSpeed: true,
  deviceProfile: 'win-rtx4090',
  customHardwareProfile: null,
  timeSavedSeconds: 0,
  trapsNeutralized: 0,
  directLinksUnlocked: 0,
  whitelist: [],
  blacklist: [],
  remoteSyncStatus: 'synced',
  updateAvailable: false
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SETTINGS_MAP, CATEGORIES, DEFAULT_SETTINGS };
}
