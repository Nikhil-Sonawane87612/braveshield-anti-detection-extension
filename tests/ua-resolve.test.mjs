import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  bsParseUaCatalogKey,
  bsPickLatestUa,
  bsPlatformKeyForProfile,
  bsResolveUaFromCatalog,
  bsResolveBrowserIdentity,
  bsDeriveUaModel
} = require('../shared/ua-resolve.js');

const CATALOG = {
  chrome_120_win: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    brands: [{ brand: 'Chromium', version: '120' }, { brand: 'Google Chrome', version: '120' }],
    platform: 'Windows', mobile: false, platformVersion: '10.0.0'
  },
  chrome_131_win: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    brands: [{ brand: 'Chromium', version: '131' }, { brand: 'Google Chrome', version: '131' }],
    platform: 'Windows', mobile: false, platformVersion: '10.0.0'
  },
  chrome_131_mac: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    brands: [{ brand: 'Chromium', version: '131' }],
    platform: 'macOS', mobile: false, platformVersion: '10.15.7'
  },
  chrome_131_android_tablet: {
    ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    brands: [{ brand: 'Chromium', version: '131' }],
    platform: 'Android', mobile: true, platformVersion: '10.0.0'
  },
  chrome_131_android: {
    ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    brands: [{ brand: 'Chromium', version: '131' }],
    platform: 'Android', mobile: true, platformVersion: '15.0.0'
  },
  chrome_131_iphone: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/604.1',
    brands: [{ brand: 'Chromium', version: '131' }],
    platform: 'iOS', mobile: true, platformVersion: '17.0'
  }
};

test('bsParseUaCatalogKey: version/bucket split incl. underscore buckets', () => {
  assert.deepEqual(bsParseUaCatalogKey('chrome_120_win'), { version: 120, bucket: 'win' });
  assert.deepEqual(bsParseUaCatalogKey('chrome_131_android_tablet'), { version: 131, bucket: 'android_tablet' });
  assert.equal(bsParseUaCatalogKey('firefox_128_win'), null);
  assert.equal(bsParseUaCatalogKey('chrome_abc_win'), null);
  assert.equal(bsParseUaCatalogKey('chrome_noversion'), null);
  assert.equal(bsParseUaCatalogKey(undefined), null);
});

test('bsPickLatestUa: highest version wins per bucket', () => {
  assert.equal(bsPickLatestUa(CATALOG, 'win').ua.includes('131.0.0.0'), true);
  assert.equal(bsPickLatestUa(CATALOG, 'mac').platform, 'macOS');
  assert.equal(bsPickLatestUa(CATALOG, 'android_tablet').platform, 'Android');
  assert.equal(bsPickLatestUa(CATALOG, 'linux'), null);
  assert.equal(bsPickLatestUa(null, 'win'), null);
});

test('bsPlatformKeyForProfile: id prefixes and custom platform', () => {
  assert.equal(bsPlatformKeyForProfile('win-rtx4090'), 'Win32');
  assert.equal(bsPlatformKeyForProfile('mac-m3max-40c'), 'MacIntel');
  assert.equal(bsPlatformKeyForProfile('linux-arch-pc'), 'Linux x86_64');
  assert.equal(bsPlatformKeyForProfile('android-pixel8'), 'Linux armv81');
  assert.equal(bsPlatformKeyForProfile('ios-15-pro'), 'iPhone');
  assert.equal(bsPlatformKeyForProfile('custom', { platform: 'MacIntel' }), 'MacIntel');
  assert.equal(bsPlatformKeyForProfile('unknown-prefix'), 'Win32');
});

test('bsResolveUaFromCatalog: resolves and re-bases onto the real major', () => {
  const r = bsResolveUaFromCatalog(CATALOG, 'Win32', 'brave', '140');
  assert.ok(r, 'expected a resolved UA');
  assert.equal(r.ua.includes('Chrome/140.0.0.0'), true);
  assert.equal(r.brands.some(b => b.brand === 'Google Chrome' && b.version === '140'), true);
  assert.equal(r.platform, 'Windows');
});

test('bsResolveUaFromCatalog: does not mutate the shared catalog', () => {
  bsResolveUaFromCatalog(CATALOG, 'Win32', 'brave', '99');
  assert.equal(CATALOG.chrome_131_win.brands[1].version, '131');
});

test('bsResolveUaFromCatalog: firefox template by platform, CH dropped', () => {
  const r = bsResolveUaFromCatalog(CATALOG, 'Win32', 'firefox', '140');
  assert.ok(r);
  assert.equal(r.ua.includes('Firefox/128.0'), true);
  assert.equal(r.brands.length, 0);
  assert.equal(r.platform, 'Windows');
  const macR = bsResolveUaFromCatalog(CATALOG, 'MacIntel', 'firefox', null);
  assert.equal(macR.ua.includes('Intel Mac OS X 10.15'), true);
});

test('bsResolveUaFromCatalog: safari falls back to mac on non-Apple buckets', () => {
  const r = bsResolveUaFromCatalog(CATALOG, 'Win32', 'safari', '140');
  assert.ok(r);
  assert.equal(r.ua.includes('Version/17.0 Safari/605.1.15'), true);
  assert.equal(r.platform, 'macOS');
  const ipadR = bsResolveUaFromCatalog(CATALOG, 'iPhone', 'safari', null);
  assert.equal(ipadR.platform, 'iOS');
});

test('bsResolveUaFromCatalog: iphone bucket resolves and re-bases', () => {
  const r = bsResolveUaFromCatalog(CATALOG, 'iPhone', 'brave', '140');
  assert.ok(r);
  assert.equal(r.ua.includes('Chrome/140.0.0.0'), true);
  assert.equal(r.mobile, true);
});

test('bsResolveUaFromCatalog: empty/invalid inputs are safe', () => {
  assert.equal(bsResolveUaFromCatalog(null, 'Win32', 'brave'), null);
  assert.equal(bsResolveUaFromCatalog({}, 'Win32', 'brave'), null);
  // Unknown platforms fall back to the win bucket by design
  assert.ok(bsResolveUaFromCatalog(CATALOG, 'Bogus', 'brave'));
});

test('bsDeriveUaModel: device model derived from the UA string', () => {
  assert.equal(
    bsDeriveUaModel('Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', 'Android'),
    'Pixel 9 Pro'
  );
  assert.equal(
    bsDeriveUaModel('Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/122.0.0.0 Mobile Safari/537.36', 'Android'),
    'SM-S928B'
  );
  // Generic "K" UA → device withholds model → the DNR layer must REMOVE the header
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36', 'Android'), '');
  // Firefox mobile has no model component
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0', 'Android'), '');
  // iOS reports the device family, matching real iOS Chrome
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'iOS'), 'iPhone');
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'iOS'), 'iPad');
  // Desktop never carries a model
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Windows'), '');
  assert.equal(bsDeriveUaModel(undefined, 'Android'), '');
});

test('bsResolveUaFromCatalog: model field carried end-to-end', () => {
  const pixel = bsResolveUaFromCatalog(CATALOG, 'linux armv81', 'brave', null);
  assert.ok(pixel, 'android bucket should resolve');
  assert.equal(pixel.model, 'Pixel 9 Pro');
  const tablet = bsResolveUaFromCatalog(CATALOG, 'android_tablet', 'brave', null);
  assert.equal(tablet.model, '');                       // "K" withheld
  const iphone = bsResolveUaFromCatalog(CATALOG, 'iphone', 'brave', null);
  assert.equal(iphone.model, 'iPhone');
  const safariPhone = bsResolveUaFromCatalog(CATALOG, 'iphone', 'safari', null);
  assert.equal(safariPhone.model, 'iPhone');
});

test('bsResolveUaFromCatalog: safari on the android_tablet bucket uses the iPad template', () => {
  // iPad hardware profiles produce platformKey 'iPad' → bucket 'android_tablet'
  const r = bsResolveUaFromCatalog(CATALOG, 'iPad', 'safari', null);
  assert.ok(r);
  assert.equal(r.platform, 'iPadOS');
  assert.equal(r.ua.includes('(iPad;'), true);
  assert.equal(r.model, 'iPad');
});

test('bsResolveBrowserIdentity: chrome-like flag + brand mapping', () => {
  const resolved = bsResolveUaFromCatalog(CATALOG, 'Win32', 'brave', '140');
  const brave = bsResolveBrowserIdentity('brave', resolved);
  assert.equal(brave.chromeLike, true);
  assert.equal(brave.vendor, 'Google Inc.');

  const firefox = bsResolveBrowserIdentity('firefox', resolved);
  assert.equal(firefox.chromeLike, false);
  assert.equal(firefox.vendor, '');

  const safari = bsResolveBrowserIdentity('safari', resolved);
  assert.equal(safari.vendor, 'Apple Computer, Inc.');
  assert.equal(safari.chromeLike, false);
});

test('bsResolveBrowserIdentity: unknown type falls back to brave', () => {
  const resolved = bsResolveUaFromCatalog(CATALOG, 'Win32', 'brave', '140');
  const out = bsResolveBrowserIdentity('nonsense', resolved);
  assert.equal(out.chromeLike, true);
});

test('bsParseUaCatalogKey: malformed keys rejected', () => {
  assert.equal(bsParseUaCatalogKey('chrome_'), null);
  assert.equal(bsParseUaCatalogKey('chrome_abc_win'), null);          // non-numeric major
  assert.equal(bsParseUaCatalogKey('firefox_131_win'), null);         // wrong prefix
  assert.equal(bsParseUaCatalogKey(''), null);
  assert.equal(bsParseUaCatalogKey(null), null);
  const ok = bsParseUaCatalogKey('chrome_131_android_tablet');
  assert.deepEqual(ok, { version: 131, bucket: 'android_tablet' });   // bucket keeps its underscore
});

test('bsPickLatestUa: highest version wins, buckets isolated', () => {
  const cat = {
    chrome_120_win: { ua: 'x120' },
    chrome_131_win: { ua: 'x131' },
    chrome_131_android: { ua: 'a131' },
    chrome_99_win: { ua: 'x99' }
  };
  const win = bsPickLatestUa(cat, 'win');
  assert.equal(win, cat.chrome_131_win);
  const android = bsPickLatestUa(cat, 'android');
  assert.equal(android, cat.chrome_131_android);
  assert.equal(bsPickLatestUa(cat, 'iphone'), null);
  assert.equal(bsPickLatestUa(null, 'win'), null);
});

test('bsDeriveUaModel: hostile and edge inputs never throw', () => {
  assert.equal(bsDeriveUaModel('', 'Android'), '');
  assert.equal(bsDeriveUaModel('(Linux; Android 15; K)', 'Android'), '');
  // WebView marker "wv" is not a model
  assert.equal(bsDeriveUaModel('(Linux; Android 15; wv) AppleWebKit/537.36 Chrome/131.0.0.0', 'Android'), '');
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (Windows)', 'Windows'), '');
  assert.equal(bsDeriveUaModel('Mozilla/5.0 (Linux; Android 15)', 'Android'), ''); // no model slot
  // Odd model containing hyphen/underscore survives
  assert.equal(bsDeriveUaModel('(Linux; Android 15; SM-S928B_1-2)', 'Android'), 'SM-S928B_1-2');
});

test('bsResolveUaFromCatalog: realMajor re-bases UA and brand versions together', () => {
  const r = bsResolveUaFromCatalog(CATALOG, 'Win32', 'brave', '142');
  assert.ok(r);
  assert.equal(r.ua.includes('Chrome/142.0.0.0'), true);
  for (const b of r.brands) {
    assert.ok(['Chromium', 'Google Chrome'].includes(b.brand), `brand kept: ${b.brand}`);
    assert.equal(b.version, '142');
  }
  const ff = bsResolveUaFromCatalog(CATALOG, 'Win32', 'firefox', '142');
  assert.equal(ff.ua.includes('Firefox/128.0'), true);   // firefox template NOT re-based onto Chrome major
  assert.equal(ff.model, '');
});

