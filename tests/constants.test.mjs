import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  BS_CAPTCHA_HOSTS,
  BS_SHORTENER_HOSTS,
  BS_TRACKING_PARAMS,
  bsDomainMatches,
  bsIsCaptchaHost
} = require('../shared/constants.js');

test('bsDomainMatches: exact match', () => {
  assert.equal(bsDomainMatches('example.com', 'example.com'), true);
});

test('bsDomainMatches: subdomain match', () => {
  assert.equal(bsDomainMatches('sub.example.com', 'example.com'), true);
  assert.equal(bsDomainMatches('deep.nested.example.com', 'example.com'), true);
});

test('bsDomainMatches: rejects lookalikes and suffixes', () => {
  assert.equal(bsDomainMatches('notexample.com', 'example.com'), false);
  assert.equal(bsDomainMatches('badexample.com', 'example.com'), false);
  assert.equal(bsDomainMatches('example.com.evil.io', 'example.com'), false);
});

test('bsDomainMatches: case-insensitive and www-stripped domain', () => {
  assert.equal(bsDomainMatches('WWW.Example.COM', 'www.example.com'), true);
});

test('bsDomainMatches: empty inputs are safe', () => {
  assert.equal(bsDomainMatches('', ''), false);
  assert.equal(bsDomainMatches(null, 'example.com'), false);
  assert.equal(bsDomainMatches('example.com', undefined), false);
});

test('bsIsCaptchaHost: known captcha hosts match including subdomains', () => {
  for (const host of ['challenges.cloudflare.com', 'new.challenges.cloudflare.com']) {
    assert.equal(bsIsCaptchaHost(host, '/'), true, host);
  }
});

test('bsIsCaptchaHost: rejects prefix-lookalike hostnames', () => {
  // endsWith('.challenges.cloudflare.com') must not match a fused label
  assert.equal(bsIsCaptchaHost('evilchallenges.cloudflare.com', '/'), false);
});

test('bsIsCaptchaHost: google recaptcha and cloudflare cdn-cgi paths', () => {
  assert.equal(bsIsCaptchaHost('google.com', '/recaptcha/api.js'), true);
  assert.equal(bsIsCaptchaHost('www.google.com', '/recaptcha/anchor'), true);
  assert.equal(bsIsCaptchaHost('cloudflare.com', '/cdn-cgi/challenge-platform/h/b'), true);
  assert.equal(bsIsCaptchaHost('google.com', '/search?q=recaptcha'), false);
});

test('bsIsCaptchaHost: ordinary sites pass through', () => {
  assert.equal(bsIsCaptchaHost('example.com', '/page'), false);
  assert.equal(bsIsCaptchaHost('youtube.com', '/watch'), false);
});

test('catalog sanity: captcha list has no duplicates or empties', () => {
  assert.equal(new Set(BS_CAPTCHA_HOSTS).size, BS_CAPTCHA_HOSTS.length);
  assert.ok(BS_CAPTCHA_HOSTS.every(h => typeof h === 'string' && h.length > 3));
});

test('catalog sanity: shortener and tracking lists are non-empty and unique', () => {
  assert.ok(BS_SHORTENER_HOSTS.length >= 10);
  assert.equal(new Set(BS_SHORTENER_HOSTS).size, BS_SHORTENER_HOSTS.length);
  assert.ok(BS_TRACKING_PARAMS.includes('fbclid'));
  assert.ok(BS_TRACKING_PARAMS.includes('utm_source'));
});
