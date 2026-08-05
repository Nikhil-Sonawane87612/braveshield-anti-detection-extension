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

  console.log('[BraveShield Bypass] v4.0 Content script active on ' + window.location.hostname);
})();
