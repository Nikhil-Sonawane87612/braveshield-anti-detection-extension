#!/usr/bin/env node
/**
 * CP1252 mojibake detector.
 * Flags text that looks like UTF-8 bytes decoded as Windows-1252 and
 * re-encoded (e.g. an em dash becoming â€", ⚡ becoming âš¡).
 * Exit code 1 if any suspicious run is found.
 *
 * Usage: node scripts/check-mojibake.cjs <file> [<file> ...]
 */
'use strict';

const fs = require('fs');

const CP1252_HIGH = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
  0x9E: 0x017E, 0x9F: 0x0178
};
const REV = {};
for (const [b, c] of Object.entries(CP1252_HIGH)) REV[c] = Number(b);
for (let i = 0xA0; i <= 0xFF; i++) REV[i] = i;

let dirty = 0;
for (const file of process.argv.slice(2)) {
  if (!fs.existsSync(file)) continue;
  const s = fs.readFileSync(file, 'utf8');
  if (s.charCodeAt(0) === 0xFEFF) {
    console.error(`MOJIBAKE/CHECK: ${file} starts with a UTF-8 BOM`);
    dirty++;
  }
  const out = [];
  for (const c of s) {
    const b = REV[c.charCodeAt(0)];
    out.push(b === undefined ? null : b);
  }
  let i = 0;
  let hits = 0;
  while (i < out.length) {
    if (out[i] === null) { i++; continue; }
    let j = i;
    const bytes = [];
    while (j < out.length && out[j] !== null && bytes.length < 8) {
      bytes.push(out[j]); j++;
    }
    if (bytes.length >= 3) {
      try {
        const dec = Buffer.from(bytes).toString('utf8');
        if (/[^\x00-\x7F]/.test(dec) && !dec.includes('\uFFFD')) {
          hits++;
          if (hits <= 3) {
            const line = s.slice(0, i).split('\n').length;
            console.error(`MOJIBAKE: ${file}:${line} looks double-encoded (should be: ${JSON.stringify(dec)})`);
          }
          i = j;
          continue;
        }
      } catch (_) { /* not valid utf8 as decoded - fine */ }
    }
    i++;
  }
  if (hits > 3) console.error(`MOJIBAKE: ${file} ... and ${hits - 3} more runs`);
  if (hits > 0) dirty++;
}

if (dirty > 0) {
  console.error(`\nFAILED: ${dirty} file(s) contain double-encoded text. Fix encoding before shipping.`);
  process.exit(1);
}
console.log('mojibake check: all clean');
