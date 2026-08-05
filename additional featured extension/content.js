/**
 * BraveShield Bypass Pro v4.0 - Content Script Bridge
 * CSS injection, status bridge, link shortener detection, bypass notifications.
 */

(function() {
  'use strict';

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STATUS') {
      sendResponse({
        status: 'active',
        domain: window.location.hostname,
        timestamp: Date.now(),
        isLinkShortener: detectLinkShortener(),
        hasCookieConsent: detectCookieConsent(),
        hasCountdown: detectCountdown()
      });
    } else if (request.type === 'PING') {
      sendResponse({ pong: true });
    }
    return true;
  });

  function detectLinkShortener() {
    const HOSTS = [
      'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
      'linkvertise.com', 'clk.sh', 'tp.st', 'lr.in', 'rekonise.com',
      'work.ink', 'lootlinks.co', 'megalink.pro', 'linksfire.com',
      'cutt.ly', 'bit.ly', 'tinyurl.com', 'exe.io', 'droplink.co',
      'gplinks.co', 'xpshort.com', 'tnlink.in', 'za.gl', 'safelinku.com'
    ];
    return HOSTS.some(h => window.location.hostname.includes(h));
  }

  function detectCookieConsent() {
    const IDS = [
      'onetrust-banner-sdk', 'CybotCookiebotDialog',
      'cookieconsent', 'cookie-banner', 'gdpr-banner'
    ];
    return IDS.some(id => document.getElementById(id) !== null);
  }

  function detectCountdown() {
    const SELECTORS = ['.countdown', '.timer', '#timer', '[class*="countdown"]', '[class*="timer"]', '[data-countdown]'];
    for (const sel of SELECTORS) {
      if (document.querySelector(sel)) return true;
    }
    const bodyText = document.body ? document.body.innerText : '';
    return /wait\s+(?:for\s+)?\d+\s*(?:seconds?|sec)/i.test(bodyText) ||
           /your\s+link\s+(?:is\s+)?(?:almost\s+)?ready/i.test(bodyText);
  }

  // Inject enhanced styles
  const style = document.createElement('style');
  style.id = 'brave-shield-bypass-styles';
  style.textContent = `
    [data-adblock-trap] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .brave-bypass-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0f172a;
      color: #38bdf8;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #334155;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: brave-bypass-slide-in 0.3s ease-out;
    }
    .brave-bypass-toast .dot {
      width: 8px; height: 8px; background: #34d399; border-radius: 50%; flex-shrink: 0;
    }
    .brave-bypass-toast.warning .dot { background: #F59E0B; }
    .brave-bypass-toast.hiding {
      animation: brave-bypass-slide-out 0.3s ease-in forwards;
    }
    @keyframes brave-bypass-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes brave-bypass-slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  function showBypassToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'brave-bypass-toast' + (type === 'warning' ? ' warning' : '');
    toast.innerHTML = '<span class="dot"></span><span>' + message + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Notify on link shortener detection
  if (detectLinkShortener()) {
    showBypassToast('Link shortener detected - auto-bypassing...');
    chrome.runtime.sendMessage({ type: 'BYPASS_COMPLETE', hostname: window.location.hostname });
  }

  // Notify on countdown detection
  if (detectCountdown()) {
    showBypassToast('Countdown detected - accelerating...', 'warning');
  }

  // Pass selected UA to inject.js via custom event
  chrome.storage.local.get(['selectedUA'], (res) => {
    if (res.selectedUA && res.selectedUA !== 'random') {
      const UA_MAP = {
        'chrome_win131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'chrome_win130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'chrome_win129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_win128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_win124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'chrome_mac131': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'chrome_mac130': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'chrome_mac129': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'macOS', mobile: false, platformVersion: '15.0.0' },
        'chrome_mac124': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'macOS', mobile: false, platformVersion: '14.4.0' },
        'chrome_lin131': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0' },
        'chrome_lin130': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Linux', mobile: false, platformVersion: '6.6.0' },
        'chrome_lin124': { ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Linux', mobile: false, platformVersion: '6.5.0' },
        'edge131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'edge130': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'edge129': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '129' }, { brand: 'Chromium', version: '129' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'edge128': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '128' }, { brand: 'Chromium', version: '128' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'edge124': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0', brands: [{ brand: 'Microsoft Edge', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'firefox133': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'firefox132': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'firefox131': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', brands: [], platform: 'Windows', mobile: false, platformVersion: '10.0.0' },
        'firefox_mac133': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'firefox_mac132': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.0.0' },
        'safari18': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '15.1.0' },
        'safari17': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '14.6.0' },
        'safari16': { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15', brands: [], platform: 'macOS', mobile: false, platformVersion: '13.6.0' },
        'opera110': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/110.0.0.0', brands: [{ brand: 'Opera', version: '110' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'opera108': { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/108.0.0.0', brands: [{ brand: 'Opera', version: '108' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Windows', mobile: false, platformVersion: '15.0.0' },
        'mobile_chrome131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_chrome130': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '130' }, { brand: 'Chromium', version: '130' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_chrome124': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Google Chrome', version: '124' }, { brand: 'Chromium', version: '124' }, { brand: 'Not_A Brand', version: '99' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_samsung28': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/125.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '28' }, { brand: 'Chromium', version: '125' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'mobile_samsung25': { ua: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', brands: [{ brand: 'Samsung Browser', version: '25' }, { brand: 'Chromium', version: '121' }, { brand: 'Not_A Brand', version: '8' }], platform: 'Android', mobile: true, platformVersion: '13.0.0' },
        'mobile_firefox133': { ua: 'Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0', brands: [], platform: 'Android', mobile: true, platformVersion: '14.0.0' },
        'safari_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'safari_ios17': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0' },
        'chrome_ios18': { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'ipad_os18': { ua: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '18.0.0' },
        'ipad_os17': { ua: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', brands: [], platform: 'iOS', mobile: true, platformVersion: '17.6.0' },
        'android_tab131': { ua: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', brands: [{ brand: 'Google Chrome', version: '131' }, { brand: 'Chromium', version: '131' }, { brand: 'Not_A Brand', version: '24' }], platform: 'Android', mobile: true, platformVersion: '14.0.0' }
      };
      const uaData = UA_MAP[res.selectedUA];
      if (uaData) {
        // Store in localStorage for inject.js to read
        localStorage.setItem('braveshield_ua', JSON.stringify(uaData));
        // Also dispatch custom event
        window.dispatchEvent(new CustomEvent('braveshield_ua_update', { detail: uaData }));
      }
    }
  });

  console.log('[BraveShield Bypass] v4.0 Content script active on ' + window.location.hostname);
})();
