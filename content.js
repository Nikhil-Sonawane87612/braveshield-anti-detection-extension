/**
 * BraveShield Bypass Pro — Content Script Bridge
 * Version: 5.3.0
 * Execution World: ISOLATED (document_start)
 * Purpose: Fast DOM modal annihilation, button unlocking, storage synchronization, and popup bridge.
 */

(() => {
  'use strict';

  // 1. Sync Settings into sessionStorage for MAIN world inject.js
  try {
    chrome.storage.local.get(['webglVendor', 'webglRenderer', 'masterEnabled'], (res) => {
      if (res && res.webglVendor) sessionStorage.setItem('bs_webgl_vendor', res.webglVendor);
      if (res && res.webglRenderer) sessionStorage.setItem('bs_webgl_renderer', res.webglRenderer);
      if (res && res.masterEnabled === false) {
        sessionStorage.setItem('bs_master_disabled', 'true');
      } else {
        sessionStorage.removeItem('bs_master_disabled');
      }
    });
  } catch (_) {}

  // 2. Message Listener from Extension Cockpit
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STATUS') {
      sendResponse({
        status: 'active',
        domain: window.location.hostname,
        timestamp: Date.now(),
        isLinkShortener: detectLinkShortener(),
        hasCountdown: detectCountdown()
      });
    } else if (request.type === 'PING') {
      sendResponse({ pong: true });
    } else if (request.type === 'SET_MASTER_STATE') {
      window.postMessage({ type: 'bs-set-master-state', enabled: request.enabled }, '*');
      sendResponse({ status: 'ok' });
    }
    return true;
  });

  function detectLinkShortener() {
    const HOSTS = [
      'ouo.io', 'ouo.us', 'bc.vc', 'sh.st', 'adf.ly', 'shorte.st',
      'linkvertise.com', 'linkvertise.de', 'clk.sh', 'tp.st', 'lr.in',
      'rekonise.com', 'work.ink', 'lootlinks.co', 'megalink.pro',
      'linksfire.com', 'cutt.ly', 'bit.ly', 'tinyurl.com', 'exe.io',
      'droplink.co', 'gplinks.co', 'xpshort.com', 'tnlink.in', 'za.gl',
      'safelinku.com', 'shrink.to', 'shrink.gg', 'shorturl.at', 'earn4link.in', '10drives.com'
    ];
    return HOSTS.some(h => (window.location.hostname || '').includes(h));
  }

  function detectCountdown() {
    const SELECTORS = ['.countdown', '.timer', '#timer', '[class*="countdown"]', '[class*="timer"]', '[data-countdown]', '[data-timer]', '.wait-time'];
    for (const sel of SELECTORS) {
      if (document.querySelector(sel)) return true;
    }
    return false;
  }

  // 3. Universal Anti-Adblock Modal Annihilator & Backdrop Cleaner
  const ADBLOCK_MODAL_TEXT_REGEX = /adblock(?:er)?\s+detected|browser\s+not\s+allowed|brave\s+browser\s+is\s+not\s+allowed|brave\s+browser\s+is\s+not\s+supported|open\s+this\s+page\s+in\s+google\s+chrome|disable\s+(?:your\s+)?ad\s*blocker|disable\s+(?:your\s+)?private\s+dns|ad\s*blocker\/vpn\/proxy|vpn\/proxy\/custom\s+dns|using\s+an\s+ad\s*blocker|custom\s+dns|please\s+consider\s+disabling\s+it|turn\s+off\s+adblock|ad\s*block\s+detected|please\s+whitelist|adblocker\s+is\s+detected|i've\s+disabled\s+adblocker|ad\s*blocker\s+found|ad\s*block\s+shield|block\s+adblock|adblocker\s+notice/i;

  function isProtectedCaptchaOrAuth(el) {
    if (!el) return false;
    const host = (window.location.hostname || '').toLowerCase();
    if (host.includes('accounts.spotify.com') || host.includes('challenge.spotify.com') || host.includes('arkoselabs.com')) return true;
    const htmlSnippet = (el.outerHTML || '').slice(0, 800).toLowerCase();
    const textSnippet = (el.innerText || '').toLowerCase();
    if (htmlSnippet.includes('arkose') || htmlSnippet.includes('funcaptcha') || htmlSnippet.includes('recaptcha') || htmlSnippet.includes('hcaptcha') || htmlSnippet.includes('turnstile') || htmlSnippet.includes('cf-chl') || htmlSnippet.includes('challenge-form')) return true;
    if (textSnippet.includes("make sure that you're a human") || textSnippet.includes('verify you are human') || textSnippet.includes('security check')) return true;
    if (el.querySelector && el.querySelector('iframe[src*="arkose"], iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[src*="turnstile"], #challenge-stage')) return true;
    return false;
  }

  function annihilateAntiAdblockModals() {
    try {
      const candidates = document.querySelectorAll('div, section, dialog, [role="dialog"], [role="alertdialog"], .modal, .swal2-container, .sweet-alert, .overlay, .popup, [class*="modal"], [class*="overlay"], [class*="popup"], [id*="modal"], [id*="overlay"], [id*="adblock"]');
      
      for (const el of candidates) {
        if (!el || !el.innerText || isProtectedCaptchaOrAuth(el)) continue;
        
        if (ADBLOCK_MODAL_TEXT_REGEX.test(el.innerText)) {
          let target = el;
          let parent = el.parentElement;
          while (parent && parent !== document.body && parent !== document.documentElement) {
            if (isProtectedCaptchaOrAuth(parent)) {
              target = null;
              break;
            }
            const style = window.getComputedStyle(parent);
            if (style.position === 'fixed' || style.position === 'absolute' || parent.classList.contains('modal') || parent.classList.contains('overlay') || parent.classList.contains('swal2-container')) {
              target = parent;
            }
            parent = parent.parentElement;
          }

          if (!target || isProtectedCaptchaOrAuth(target)) continue;

          // Auto-click "I've Disabled AdBlocker" button or close button
          const buttons = target.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
          for (const btn of buttons) {
            if (/disabled\s+adblocker|i've\s+disabled|close|ok|dismiss|i\s+understand/i.test(btn.innerText || btn.value || '')) {
              try { btn.click(); } catch (_) {}
            }
          }

          try {
            target.remove();
          } catch (_) {
            target.style.setProperty('display', 'none', 'important');
            target.style.setProperty('visibility', 'hidden', 'important');
            target.style.setProperty('opacity', '0', 'important');
            target.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      }

      // Sweep dark backdrops
      const backdropSelectors = [
        '.modal-backdrop', '.swal2-backdrop', '.swal2-container', '.overlay-backdrop',
        '[class*="backdrop"]', '[class*="overlay"]', '#overlay', '.overlay',
        '.popup-overlay', '#popup-overlay', '.fade.show', '.sk-overlay', '#sk-overlay',
        '[class*="adb-overlay"]', '#adb-overlay'
      ];
      for (const sel of backdropSelectors) {
        document.querySelectorAll(sel).forEach(b => {
          if (b && !isProtectedCaptchaOrAuth(b) && !b.querySelector('h1, h2, form, video, article, #stat-modules, .video-list, [class*="video"]')) {
            try { b.remove(); } catch (_) { b.style.display = 'none'; }
          }
        });
      }

      // Restore Page Scrolling
      if (document.body) {
        document.body.style.setProperty('overflow', 'auto', 'important');
        document.body.style.setProperty('position', 'static', 'important');
        document.body.style.setProperty('filter', 'none', 'important');
        document.body.style.setProperty('opacity', '1', 'important');
        document.body.style.setProperty('pointer-events', 'auto', 'important');
      }
      if (document.documentElement) {
        document.documentElement.style.setProperty('overflow', 'auto', 'important');
        document.documentElement.style.setProperty('filter', 'none', 'important');
        document.documentElement.style.setProperty('opacity', '1', 'important');
        document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
      }

      // Remove blur, dimming, and display:none from main content
      document.querySelectorAll('main, #main, .container, .card, body > div, [class*="content"], [id*="content"]').forEach(node => {
        if (node && node.style) {
          if (node.style.filter && (node.style.filter.includes('blur') || node.style.filter.includes('brightness'))) node.style.setProperty('filter', 'none', 'important');
          if (node.style.backdropFilter) node.style.setProperty('backdrop-filter', 'none', 'important');
          if (node.style.opacity && parseFloat(node.style.opacity) < 0.9 && !node.id.includes('stat-')) node.style.setProperty('opacity', '1', 'important');
          if (node.style.pointerEvents === 'none') node.style.setProperty('pointer-events', 'auto', 'important');
          if (node.style.display === 'none' && !node.classList.contains('modal') && !node.classList.contains('overlay') && !node.id.includes('stat-')) node.style.setProperty('display', 'block', 'important');
        }
      });
    } catch (_) {}
  }

  // 4. Shortener DOM Timer Zeroer & Button Unlocker
  function fastPassDOMTimersAndButtons() {
    try {
      function isPagination(el) {
        if (!el) return true;
        const href = (el.getAttribute('href') || '').toLowerCase();
        return /reverse-paginate|updated-max|max-results|blog-pager|pagination/i.test(href);
      }

      // Zero out countdown timers
      const timerEls = document.querySelectorAll('.timer, #timer, .countdown, #countdown, #wpsafe-time, #time, #seconds, [data-timer], [data-countdown], .wait-time');
      for (const tEl of timerEls) {
        if (tEl && tEl.innerText && /\d+\s*s?/i.test(tEl.innerText)) {
          tEl.innerText = '0';
          tEl.textContent = '0';
          try { tEl.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
        }
      }

      // Arm buttons (remove disabled, show button, set pointer-events: auto)
      const btns = document.querySelectorAll('#btn-main, #get-link, #getlink, #download-btn, #btn-download, .get-link, .download-btn, .btn-download, #wpsafe-generate, #continue-btn, #btn-continue, a.btn, button.btn');
      for (const btn of btns) {
        if (btn && !isPagination(btn)) {
          const txt = (btn.innerText || btn.value || '').trim();
          if (/getting\s+link|please\s+wait|loading|generating/i.test(txt)) continue;
          btn.removeAttribute('disabled');
          btn.removeAttribute('aria-disabled');
          if (btn.classList.contains('disabled')) btn.classList.remove('disabled');
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.style.setProperty('opacity', '1', 'important');
          btn.style.setProperty('display', 'inline-block', 'important');
        }
      }
    } catch (_) {}
  }

  // Run immediately and monitor DOM
  annihilateAntiAdblockModals();
  fastPassDOMTimersAndButtons();
  const trapInterval = setInterval(() => {
    annihilateAntiAdblockModals();
    fastPassDOMTimersAndButtons();
  }, 250);
  setTimeout(() => clearInterval(trapInterval), 15000);

  const trapObserver = new MutationObserver(() => {
    annihilateAntiAdblockModals();
    fastPassDOMTimersAndButtons();
  });
  if (document.documentElement) {
    trapObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
