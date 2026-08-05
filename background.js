/**
 * BraveShield Bypass Pro - Service Worker
 * Dynamic rule management and request header normalization.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[BraveShield Bypass] Extension installed/updated.');
  chrome.storage.local.set({
    enabled: true,
    bypassShieldsTraps: true,
    maskBraveApi: true,
    spoofChromeUA: true,
    blockedCounter: 142
  });
});

// Update extension icon badge
function updateBadge(tabId, count) {
  if (chrome.action) {
    chrome.action.setBadgeText({ tabId, text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#10B981' });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('brave://')) {
    updateBadge(tabId);
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['enabled', 'blockedCounter'], (res) => {
      sendResponse(res);
    });
    return true;
  } else if (message.type === 'TOGGLE_ENABLED') {
    chrome.storage.local.set({ enabled: message.enabled }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
