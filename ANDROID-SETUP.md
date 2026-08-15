# 📱 BraveShield Super Suite — Android Setup & Deployment Guide

Welcome to the **BraveShield Android Super Suite**! This guide walks you through setting up the complete 55+ feature ecosystem on your Android device — covering system-wide DNS ad blocking, Spotify Web Player (ad-free + synced lyrics + unlimited skips), YouTube ad fast-forwarding, and timer turbo bypass across your favorite mobile browsers.

---

## 🎯 Architecture Overview: The 2-Layer Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    ANDROID DEVICE                           │
│                                                             │
│  Layer 1: Network & In-App Ads (System-Wide)                │
│  → Private DNS / AdGuard Filter                             │
│  → Blocks Spotify app ads, YouTube app ads, in-game ads,    │
│    and Xiaomi/Samsung/Oppo background telemetry             │
│                                                             │
│  Layer 2: Browser & In-Page Engine                          │
│  → braveshield-android.user.js                              │
│  → Fast-forwards timers, destroys anti-adblock traps,       │
│    unlocks Spotify Web Player with synced lyrics & boost,   │
│    auto-skips YouTube sponsors, sniffs direct video streams  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup 1: AdGuard for Android (Recommended — System-Wide All-In-One)

*Runs system-wide across Google Chrome, Brave Android, Samsung Internet, and all mobile games.*

1. **Install AdGuard for Android**: Download the standalone APK from [adguard.com](https://adguard.com/en/adguard-android/overview.html).
2. **Add the BraveShield Userscript**:
   - Open AdGuard → Go to **Settings (⚙️)** → **Extensions** → **Userscripts**.
   - Tap **+ Add Userscript** → Choose **From File / URL**.
   - Select [`braveshield-android.user.js`](file:///c:/Users/hinik/Downloads/braveshield-anti-detection-extension/braveshield-android.user.js) (or paste its GitHub raw link).
   - Toggle **Enable**.
3. **Add Custom DNS Blocklist**:
   - In AdGuard → Go to **DNS Protection** → **DNS Blocklists**.
   - Tap **+ Add Blocklist** → Import [`braveshield-dns-blocklist.txt`](file:///c:/Users/hinik/Downloads/braveshield-anti-detection-extension/braveshield-dns-blocklist.txt).
4. **Done!** Every browser on your phone now automatically runs the 55+ stealth engine!

---

## 🦊 Setup 2: Firefox Mobile / Mull Browser (100% Free Browser Setup)

1. Open **Firefox for Android** (or Mull Privacy Browser).
2. Tap the **three dots menu (⋮)** → **Add-ons** (or **Add-ons Manager**).
3. Search for and install **Tampermonkey** or **Violentmonkey**.
4. Open the Tampermonkey dashboard → Tap **+ Create a new script**.
5. Copy and paste the entire contents of [`braveshield-android.user.js`](file:///c:/Users/hinik/Downloads/braveshield-anti-detection-extension/braveshield-android.user.js) into the editor.
6. Tap **File** → **Save**.
7. **Done!** Navigate to any download site, Spotify, or YouTube to experience instant fast-forwarding and ad-free playback.

---

## 🌐 Setup 3: Android Private DNS (Zero Battery, System-Wide)

*Blocks ads in games and apps without needing any VPN app running.*

### Option A: NextDNS (1-Click Custom Profile)
1. Create a free account at [nextdns.io](https://nextdns.io).
2. Under **Privacy** → Enable **AdGuard Base**, **OISD**, and import [`braveshield-dns-blocklist.txt`](file:///c:/Users/hinik/Downloads/braveshield-anti-detection-extension/braveshield-dns-blocklist.txt).
3. Under **Setup** → Copy your personalized DNS-over-TLS endpoint (e.g. `your-id.dns.nextdns.io`).
4. On your Android phone:
   - Go to **Settings** → **Network & Internet** → **Private DNS**.
   - Choose **Private DNS provider hostname**.
   - Paste `your-id.dns.nextdns.io` → Tap **Save**.

### Option B: Cloudflare Zero Trust Gateway
1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Gateway** → **DNS Locations**.
2. Create a location to get your `xxxxxx.cloudflare-gateway.com` hostname.
3. Add policy rules blocking ad networks, telemetry, and game ad SDKs.
4. Enter your hostname into Android **Private DNS**.

---

## 🎵 Spotify Web Player Super Experience Guide

Because Spotify's native app enforces skip limits on its servers, the **Spotify Web Player** (`open.spotify.com`) gives you the full unlocked experience with our userscript:

1. Open your browser (with the userscript enabled) and go to [`open.spotify.com`](https://open.spotify.com).
2. Log in with your free Spotify account.
3. **Enjoy All Unlocked Features**:
   - 🚫 **Zero Audio Ads**: Ad breaks are automatically muted and skipped in under 100ms.
   - 🎤 **Live Synced Lyrics**: Tap the green **🎤 Lyrics** button at the bottom-left to toggle real-time karaoke lyrics.
   - ⏭️ **Unlimited Skips & Shuffles**: Skip forward as many times as you want.
   - 🔊 **Mobile Audio Booster**: Tap the floating **🔊** button to boost volume up to **200%** with built-in compression.
   - 🛡️ **Zero Errors**: Playlist metadata and audio CDNs are strictly preserved so you never see blank screens or loading spinners.
4. *(Optional)* Tap the browser menu (⋮) → **Add to Home screen** to install Spotify as a standalone full-screen Web App!

---

## 📺 YouTube Mobile Turbo Guide

1. Navigate to [`m.youtube.com`](https://m.youtube.com).
2. **Features Active Automatically**:
   - ⏩ **16x Video Ad Fast-Forward**: Ads finish in milliseconds with instant skip click.
   - 👎 **Return YouTube Dislike**: Real dislike count is displayed directly next to the Like button.
   - 🔒 **Auto-Max Quality**: Locks streams to 1080p60/4K instead of mobile-degraded 360p.
   - 🖼️ **Universal PiP & Background Play**: Video keeps playing smoothly when you switch tabs or minimize the browser.

---

## 📥 Link Shorteners & APK Download Turbo Guide

1. Open any link shortener (`gplinks`, `ouo.io`, `loan.gpvadnagar.org`, `droplink`).
2. **What Happens**:
   - Countdown timers are accelerated by **50x–100x** (15s timers finish in <0.3s).
   - Anti-adblock warning popups and dark backdrops are instantly erased.
   - Genuine download mirrors (`dupload.net`, Google Drive, MediaFire, Mega) are highlighted in green with auto-click navigation.
   - Blogger/WordPress pagination loops are safely ignored.
   - On video sites, a floating **⚡ Direct Stream (VLC)** button will appear allowing you to stream raw `.mp4`/`.m3u8` video files directly.

---

## 📋 Verification & Testing Checklist

- [x] **Chrome Spoofing**: `navigator.brave` returns `undefined`, `brands` reports Google Chrome 131.
- [x] **Timer Speedup**: Countdown timers jump from 15s to 0s within 300ms.
- [x] **Spotify Player**: Songs play without errors, ads are skipped, lyrics sync in real-time.
- [x] **YouTube**: Ads fast-forward, dislike badge is visible, videos don't pause on tab switch.
- [x] **Back Button**: Android Back gesture works smoothly without get trapped in redirect loops.
- [x] **OEM Telemetry**: Xiaomi, Samsung, and Oppo background analytics domains are blocked at the DNS layer.

---

*Developed by Nikhil Sonawane — [GitHub Repository](https://github.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension)*
