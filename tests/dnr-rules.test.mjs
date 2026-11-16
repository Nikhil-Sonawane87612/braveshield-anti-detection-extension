import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  BS_UA_RULE_ID,
  BS_UA_RULE_ID_MAX,
  BS_UA_LOCALE_RULE_ID,
  BS_UA_RESOURCE_TYPES,
  BS_CAPTCHA_EXCLUDED_INITIATORS,
  BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS,
  bsBuildUaRule,
  bsBuildLocaleRule
} = require('../shared/dnr-rules.js');

const CHROME_RESOLVED = {
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  brands: [{ brand: 'Chromium', version: '140' }, { brand: 'Google Chrome', version: '140' }],
  platform: 'Windows', mobile: false, platformVersion: '10.0.0', chromeLike: true
};

const ANDROID_RESOLVED = {
  ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  brands: [{ brand: 'Chromium', version: '131' }, { brand: 'Google Chrome', version: '131' }],
  platform: 'Android', mobile: true, platformVersion: '15.0.0', model: 'Pixel 9 Pro', chromeLike: true
};

const FIREFOX_RESOLVED = {
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  brands: [], platform: 'Windows', mobile: false, platformVersion: '10.15.7', chromeLike: false
};

function header(rule, name) {
  return rule.action.requestHeaders.find(h => h.header === name);
}

test('rule-ID layout: locale slot separate from the override band', () => {
  assert.equal(BS_UA_RULE_ID, 424242);
  assert.equal(BS_UA_LOCALE_RULE_ID, BS_UA_RULE_ID + 900);
  // Override slots + locale slot all fit below the MAX ceiling
  assert.equal(BS_UA_RULE_ID_MAX - BS_UA_RULE_ID, 1000);
  assert.ok(BS_UA_LOCALE_RULE_ID < BS_UA_RULE_ID_MAX);
  assert.notEqual(BS_UA_LOCALE_RULE_ID, BS_UA_RULE_ID + 500); // band boundary sanity
});

test('bsBuildUaRule: Chrome identity sets the full header parity set', () => {
  const rule = bsBuildUaRule(BS_UA_RULE_ID, 1, CHROME_RESOLVED);
  assert.equal(rule.id, BS_UA_RULE_ID);
  assert.equal(rule.priority, 1);
  assert.equal(rule.action.type, 'modifyHeaders');
  assert.deepEqual(
    rule.action.requestHeaders.filter(h => h.operation === 'set').map(h => h.header).sort(),
    ['Sec-CH-UA', 'Sec-CH-UA-Full-Version-List', 'Sec-CH-UA-Mobile', 'Sec-CH-UA-Platform', 'Sec-CH-UA-Platform-Version', 'User-Agent']
  );
  assert.equal(header(rule, 'User-Agent').value, CHROME_RESOLVED.ua);
  assert.equal(header(rule, 'Sec-CH-UA-Mobile').value, '?0');
  assert.equal(header(rule, 'Sec-CH-UA-Platform').value, '"Windows"');
  assert.equal(header(rule, 'Sec-CH-UA-Platform-Version').value, '10.0.0');
  // Real Chrome ALWAYS sends Full-Version-List — a missing header is detectable
  const fvl = header(rule, 'Sec-CH-UA-Full-Version-List').value;
  assert.equal(fvl.includes('"Google Chrome";v="140.0.0.0"'), true);
});

test('bsBuildUaRule: Sec-CH-UA-Model parity with Chrome ground truth', () => {
  // Mobile + model → header set with the derived model
  const android = bsBuildUaRule(1, 1, ANDROID_RESOLVED);
  assert.equal(header(android, 'Sec-CH-UA-Model').operation, 'set');
  assert.equal(header(android, 'Sec-CH-UA-Model').value, 'Pixel 9 Pro');
  assert.equal(header(android, 'Sec-CH-UA-Mobile').value, '?1');

  // Desktop → real Chrome never sends Model → header REMOVED
  const win = bsBuildUaRule(2, 1, CHROME_RESOLVED);
  assert.deepEqual(win.action.requestHeaders.find(h => h.header === 'Sec-CH-UA-Model'),
    { header: 'Sec-CH-UA-Model', operation: 'remove' });

  // Android "K" withholds its model (mobile but empty model) → removed, not faked
  const kModel = Object.assign({}, ANDROID_RESOLVED, { model: '' });
  const kRule = bsBuildUaRule(3, 1, kModel);
  assert.equal(header(kRule, 'Sec-CH-UA-Model').operation, 'remove');

  // Crafted quotes in a model cannot break the header value
  const evil = Object.assign({}, ANDROID_RESOLVED, { model: 'Pixel"9;Pro' });
  const evilRule = bsBuildUaRule(4, 1, evil);
  assert.equal(header(evilRule, 'Sec-CH-UA-Model').value, 'Pixel"9;Pro'); // verbatim, DNR-escaped by Chrome
});

test('bsBuildUaRule: Firefox/Safari identities remove ALL Client Hints', () => {
  const rule = bsBuildUaRule(7, 1, FIREFOX_RESOLVED);
  const removed = rule.action.requestHeaders.filter(h => h.operation === 'remove').map(h => h.header);
  assert.deepEqual(removed.sort(), [
    'Sec-CH-UA', 'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List',
    'Sec-CH-UA-Mobile', 'Sec-CH-UA-Model', 'Sec-CH-UA-Platform', 'Sec-CH-UA-Platform-Version'
  ]);
  // No forged flavor values ever ship for non-Chrome identities
  assert.equal(rule.action.requestHeaders.some(h => h.header.startsWith('Sec-CH') && h.operation === 'set'), false);
});

test('bsBuildUaRule: captcha exclusions always merged, never dropped by overrides', () => {
  const drops = { excludedInitiatorDomains: ['attacker.example'], excludedRequestDomains: [] };
  const rule = bsBuildUaRule(BS_UA_RULE_ID + 5, 2, CHROME_RESOLVED, drops);
  const conds = rule.condition;
  // Override additions present…
  assert.ok(conds.excludedInitiatorDomains.includes('attacker.example'));
  // …but captcha hosts were MERGED, not replaced
  for (const host of BS_CAPTCHA_EXCLUDED_INITIATORS) {
    assert.ok(conds.excludedInitiatorDomains.includes(host), `initiator kept: ${host}`);
  }
  for (const host of BS_CAPTCHA_EXCLUDED_REQUEST_DOMAINS) {
    assert.ok(conds.excludedRequestDomains.includes(host), `request-domain kept: ${host}`);
  }
  assert.equal(conds.urlFilter, '*');
  assert.deepEqual(conds.resourceTypes, BS_UA_RESOURCE_TYPES);
});

test('bsBuildLocaleRule: value format, base-tag q-ordering and rejection', () => {
  const pt = bsBuildLocaleRule(BS_UA_LOCALE_RULE_ID, 'pt-BR');
  assert.equal(pt.id, BS_UA_LOCALE_RULE_ID);
  assert.equal(pt.action.requestHeaders[0].header, 'Accept-Language');
  assert.equal(pt.action.requestHeaders[0].value, 'pt-BR,pt;q=0.8,en;q=0.7');
  // Captcha exclusions ride along here too
  assert.ok(pt.condition.excludedInitiatorDomains.includes('recaptcha.net'));

  // Trimming happens before validation/serialization
  const trimmed = bsBuildLocaleRule(2, '  en-US  ');
  assert.equal(trimmed.action.requestHeaders[0].value, 'en-US,en;q=0.8,en;q=0.7');

  assert.equal(bsBuildLocaleRule(1, ''), null);
  assert.equal(bsBuildLocaleRule(1, 'not a locale!!'), null);
  assert.equal(bsBuildLocaleRule(1, null), null);
  assert.equal(bsBuildLocaleRule(1, '<script>alert(1)</script>'), null);
});
