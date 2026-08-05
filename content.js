/**
 * BraveShield Bypass Pro - Content Script Bridge
 * Manages configuration sync and communicates with background service worker.
 */

(function() {
  'use strict';

  // Listen for configuration updates from extension popup / background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_STATUS') {
      sendResponse({
        status: 'active',
        domain: window.location.hostname,
        timestamp: Date.now()
      });
    } else if (request.type === 'PING') {
      sendResponse({ pong: true });
    }
    return true;
  });

  // Inject additional dynamic styles if needed to un-hide falsely blocked content
  const style = document.createElement('style');
  style.id = 'brave-shield-bypass-styles';
  style.textContent = `
    /* Shield-proofing overrides for site functionality */
    [data-adblock-trap] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  console.log('[BraveShield Bypass] Content script active on ' + window.location.hostname);
})();
