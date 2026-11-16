import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  BS_IMPORT_BOOLEANS,
  bsIsValidImportDomain,
  bsSanitizeImport
} = require('../shared/import-sanitize.js');

const MATRIX_KEYS = new Set(['canvasNoiseEnabled', 'youtubeAds', 'unshortenerEnabled']);

test('bsSanitizeImport: hostile / malformed top-level inputs', () => {
  assert.deepEqual(bsSanitizeImport(null), {});
  assert.deepEqual(bsSanitizeImport(undefined), {});
  assert.deepEqual(bsSanitizeImport('garbage'), {});
  assert.deepEqual(bsSanitizeImport(42), {});
  assert.deepEqual(bsSanitizeImport(['element']), {});
  assert.deepEqual(bsSanitizeImport({}), {});
});

test('bsSanitizeImport: unknown keys and prototype pollution dropped', () => {
  assert.deepEqual(bsSanitizeImport({ evilKey: 'yes', admin: true }), {});
  assert.deepEqual(bsSanitizeImport({ __proto__: { polluted: true } }), {});
  assert.deepEqual(bsSanitizeImport({ constructor: 'x', prototype: 'y' }), {});
});

test('bsSanitizeImport: boolean allowlist — types enforced, values copied', () => {
  assert.deepEqual(
    bsSanitizeImport({ canvasNoiseEnabled: true, domStructureDefuserEnabled: false, clientHintsEnabled: 1 }),
    { canvasNoiseEnabled: true, domStructureDefuserEnabled: false }   // numeric 1 is NOT a boolean
  );
  assert.ok(BS_IMPORT_BOOLEANS.has('gpcCloakEnabled'));
  assert.deepEqual(bsSanitizeImport({ masterEnabled: false }), { masterEnabled: false });
});

test('bsSanitizeImport: telemetry numbers are clamped and floored', () => {
  assert.deepEqual(
    bsSanitizeImport({ timeSavedSeconds: -50, trapsNeutralized: 12_000_000, directLinksUnlocked: 3.7 }),
    { timeSavedSeconds: 0, trapsNeutralized: 9_999_999, directLinksUnlocked: 3 }
  );
  // Non-finite floats are rejected outright
  assert.deepEqual(bsSanitizeImport({ timeSavedSeconds: '999' }), {});
  assert.deepEqual(bsSanitizeImport({ timeSavedSeconds: Infinity }), {});
  assert.deepEqual(bsSanitizeImport({ timeSavedSeconds: NaN }), {});
});

test('bsSanitizeImport: strings — browserType allowlist + length caps', () => {
  assert.deepEqual(
    bsSanitizeImport({ browserType: 'firefox', spoofTimezone: 'Europe/Berlin' }),
    { browserType: 'firefox', spoofTimezone: 'Europe/Berlin' }
  );
  assert.deepEqual(bsSanitizeImport({ browserType: 'tor' }), {});
  assert.deepEqual(bsSanitizeImport({ browserType: 'brave<script>' }), {});
  const long = 'x'.repeat(129);
  assert.deepEqual(bsSanitizeImport({ spoofLocale: long }), {});            // >128 dropped
  const name9 = 'dev-' + 'p'.repeat(56);                                   // 60 chars, ok
  assert.deepEqual(bsSanitizeImport({ deviceProfile: name9 }), { deviceProfile: name9 });
  assert.deepEqual(bsSanitizeImport({ deviceProfile: 'y'.repeat(65) }), {}); // >64 dropped
});

test('bsIsValidImportDomain: same validation as the whitelist UI', () => {
  assert.equal(bsIsValidImportDomain('example.com'), true);
  assert.equal(bsIsValidImportDomain('sub.deep.example.co.uk'), true);
  assert.equal(bsIsValidImportDomain('has space.com'), false);
  assert.equal(bsIsValidImportDomain('no-tld'), false);
  assert.equal(bsIsValidImportDomain('-starts-with-dash.com'), false);
  assert.equal(bsIsValidImportDomain('x'.repeat(254)), false);
  assert.equal(bsIsValidImportDomain(123), false);
});

test('bsSanitizeImport: whitelist deduped, validated, capped at 500', () => {
  const list = ['a.com', 'a.com', 'b.com', 'BAD--', '<script>', 'c.io'];
  assert.deepEqual(bsSanitizeImport({ whitelist: list }).whitelist, ['a.com', 'b.com', 'c.io']);
  const flood = Array.from({ length: 600 }, (_, i) => `site-${i}.example`);
  assert.equal(bsSanitizeImport({ whitelist: flood }).whitelist.length, 500);  // valid → capped
  const bad = ['BAD--', '<script>', 'no-tld', 'has space.com'];
  assert.deepEqual(bsSanitizeImport({ whitelist: bad }).whitelist, []);
  const many = Array.from({ length: 600 }, (_, i) => `s${i}.example.com`);
  assert.equal(bsSanitizeImport({ whitelist: many }).whitelist.length, 500);
});

test('bsSanitizeImport: siteProfiles modules survive restore ONLY inside the injected matrix', () => {
  const parsed = {
    siteProfiles: {
      'matrix.example': { modules: { canvasNoiseEnabled: true, notARealModule: false } },
      'nosite.example': { modules: { youtubeAds: false } }
    }
  };
  const clean = bsSanitizeImport(parsed, MATRIX_KEYS);
  assert.deepEqual(clean.siteProfiles['matrix.example'].modules, { canvasNoiseEnabled: true });
  assert.deepEqual(clean.siteProfiles['nosite.example'].modules, { youtubeAds: false });
  // Unknown module keys never pass through
  assert.deepEqual(
    bsSanitizeImport({ siteProfiles: { 'x.example': { modules: { stealthEnabled: true } } } }, MATRIX_KEYS),
    { siteProfiles: {} }
  );
  // No allowlist passed → module matrix rejected wholesale (safe default);
  // an arbitrary non-Set/non-array allowlist behaves the same
  assert.deepEqual(bsSanitizeImport(parsed).siteProfiles, {});
  assert.deepEqual(bsSanitizeImport(parsed, 'not-a-set').siteProfiles, {});
});

test('bsSanitizeImport: siteProfiles shape rules', () => {
  const clean = bsSanitizeImport({
    siteProfiles: {
      'ok.example': { deviceProfile: 'win-rtx4090', browserType: 'chrome' },   // full override
      'modules-only.example': { modules: { youtubeAds: true } },              // matrix-only override
      'baddomain': { browserType: 'chrome' },                                  // invalid domain
      'arrays.example': ['not', 'an', 'object'],                               // array value
      'ids.example': { browserType: 'kernel' }                                 // invalid identity
    }
  }, MATRIX_KEYS);
  assert.deepEqual(clean.siteProfiles['ok.example'], { deviceProfile: 'win-rtx4090', browserType: 'chrome' });
  assert.deepEqual(clean.siteProfiles['modules-only.example'], { modules: { youtubeAds: true } });
  assert.equal(clean.siteProfiles['baddomain'], undefined);
  assert.equal(clean.siteProfiles['arrays.example'], undefined);
  assert.equal(clean.siteProfiles['ids.example'], undefined);
  // Prototype-poison keys as site keys are skipped (own enum check)
  const poison = JSON.parse('{"siteProfiles":{"__proto__":{"browserType":"chrome"},"safe.example":{"browserType":"brave"}}}');
  assert.deepEqual(Object.keys(bsSanitizeImport(poison, MATRIX_KEYS).siteProfiles), ['safe.example']);
});

test('bsSanitizeImport: siteProfiles caps (500 sites, 64 modules) + matrix type validation', () => {
  const sites = {};
  for (let i = 0; i < 520; i++) sites[`s${i}.example.com`] = { browserType: 'brave' };
  const clean = bsSanitizeImport({ siteProfiles: sites }, MATRIX_KEYS);
  assert.equal(Object.keys(clean.siteProfiles).length, 500);

  // 80 allowed module keys → sliced to the 64-cap
  const bigAllow = new Set(Array.from({ length: 90 }, (_, i) => `mod${i}Enabled`));
  const mods = {};
  for (let i = 0; i < 80; i++) mods[`mod${i}Enabled`] = true;
  const capped = bsSanitizeImport({ siteProfiles: { 'm.example.com': { modules: mods } } }, bigAllow);
  assert.equal(Object.keys(capped.siteProfiles['m.example.com'].modules).length, 64);

  // All-unknown module keys → empty entry → whole override dropped
  const dropped = bsSanitizeImport({ siteProfiles: { 'm.example.com': { modules: mods } } }, MATRIX_KEYS);
  assert.deepEqual(dropped.siteProfiles, {});
});

test('bsSanitizeImport: customHardwareProfile shape + clamps', () => {
  const c = bsSanitizeImport({
    customHardwareProfile: {
      platform: 'MacIntel', vendor: 'v'.repeat(500), renderer: 'r'.repeat(999),
      concurrency: 10000, memory: 0, devicePixelRatio: 99,
      screen: { width: 99999, height: -5, colorDepth: 99 }
    }
  }).customHardwareProfile;
  assert.equal(c.platform, 'MacIntel');
  assert.equal(c.vendor.length, 128);
  assert.equal(c.renderer.length, 256);
  assert.equal(c.concurrency, 256);
  assert.equal(c.memory, 8);              // 0 → falsy → default 8, then clamped within [1,8]
  assert.equal(c.devicePixelRatio, 4);
  assert.equal(c.screen.width, 7680);
  assert.equal(c.screen.height, 240);
  assert.equal(c.screen.colorDepth, 30);
});

test('bsSanitizeImport: customHardwareProfileMalformed input does not poison the rest', () => {
  const clean = bsSanitizeImport({ canvasNoiseEnabled: true, customHardwareProfile: null });
  assert.deepEqual(clean, { canvasNoiseEnabled: true });
  assert.deepEqual(bsSanitizeImport({ customHardwareProfile: 'string' }), {});
  assert.deepEqual(bsSanitizeImport({ customHardwareProfile: [1] }), {});
  // Under-sized values clamp to minimums
  const c = bsSanitizeImport({ customHardwareProfile: { screen: { width: 10, height: 10, colorDepth: 1 } } }).customHardwareProfile;
  assert.equal(c.screen.width, 320);
  assert.equal(c.screen.height, 240);
  assert.equal(c.screen.colorDepth, 16);
});

// ── v6.6.0 feature keys ──────────────────────────────────────────────────────

test('bsSanitizeImport: new feature booleans (font ensemble, identity rotation) pass through', () => {
  assert.ok(BS_IMPORT_BOOLEANS.has('fontEnsembleEnabled'));
  assert.ok(BS_IMPORT_BOOLEANS.has('identityRotationEnabled'));
  assert.deepEqual(
    bsSanitizeImport({ fontEnsembleEnabled: false, identityRotationEnabled: true, reelDwellSeconds: 'x' }),
    { fontEnsembleEnabled: false, identityRotationEnabled: true }
  );
});

test('bsSanitizeImport: Auto-Pilot + rotation numbers are range-clamped', () => {
  assert.deepEqual(
    bsSanitizeImport({ reelDwellSeconds: 25, reelMaxAutoSeconds: -5, identityRotationPeriodHours: 0 }),
    { reelDwellSeconds: 10, reelMaxAutoSeconds: 0, identityRotationPeriodHours: 1 }
  );
  assert.deepEqual(
    bsSanitizeImport({ reelDwellSeconds: 3.9, reelMaxAutoSeconds: 999_999_999, identityRotationPeriodHours: 48.7 }),
    { reelDwellSeconds: 3, reelMaxAutoSeconds: 86400, identityRotationPeriodHours: 48 }
  );
  // Non-numbers are dropped outright
  assert.deepEqual(bsSanitizeImport({ reelDwellSeconds: '5' }), {});
  assert.deepEqual(bsSanitizeImport({ reelMaxAutoSeconds: Infinity }), {});
});

test('bsSanitizeImport: protectedSites deduped, validated, capped at 300', () => {
  const clean = bsSanitizeImport({ protectedSites: ['mybank.com', 'mybank.com', 'BAD--', 'portal.example.co.uk'] });
  assert.deepEqual(clean.protectedSites, ['mybank.com', 'portal.example.co.uk']);
  const flood = Array.from({ length: 400 }, (_, i) => `p${i}.example.com`);
  assert.equal(bsSanitizeImport({ protectedSites: flood }).protectedSites.length, 300);
  assert.deepEqual(bsSanitizeImport({ protectedSites: 'not-an-array' }), {});
});

test('bsSanitizeImport: customResolvers shape rules (pattern/action/value caps, ≤20 rules)', () => {
  const clean = bsSanitizeImport({
    customResolvers: [
      { pattern: '*.link.example', action: 'click', value: '#btn-get-link' },
      { pattern: 'pass.example', action: 'redirect', value: 'target_url' },
      { pattern: 'turbo.example', action: 'turbo', value: '' },
      { pattern: 'off.example', action: 'click', value: '.continue', enabled: false }
    ]
  });
  assert.deepEqual(clean.customResolvers, [
    { pattern: '*.link.example', action: 'click', value: '#btn-get-link' },
    { pattern: 'pass.example', action: 'redirect', value: 'target_url' },
    { pattern: 'turbo.example', action: 'turbo', value: '' },
    { pattern: 'off.example', action: 'click', value: '.continue', enabled: false }
  ]);
  // Malformed rules dropped, good ones kept
  const mixed = bsSanitizeImport({
    customResolvers: [
      null,
      { pattern: '', action: 'click', value: '#x' },
      { pattern: 'a.example', action: 'explode', value: '#x' },
      { pattern: 42, action: 'click', value: '#x' },
      { pattern: 'b.example', action: 'click', value: 123 },
      ['not', 'an', 'object'],
      { pattern: 'c.example', action: 'turbo' }
    ]
  });
  assert.deepEqual(mixed.customResolvers, [{ pattern: 'c.example', action: 'turbo', value: '' }]);
  // Cap: 25 rules → 20 kept
  const flood = { customResolvers: [] };
  for (let i = 0; i < 25; i++) flood.customResolvers.push({ pattern: `r${i}.example`, action: 'turbo', value: '' });
  assert.equal(bsSanitizeImport(flood).customResolvers.length, 20);
  // Long pattern/value truncated, not dropped
  const long = bsSanitizeImport({ customResolvers: [{ pattern: 'x'.repeat(400) + '.com', action: 'click', value: 'v'.repeat(500) }] });
  assert.equal(long.customResolvers[0].pattern.length, 200);
  assert.equal(long.customResolvers[0].value.length, 300);
});
