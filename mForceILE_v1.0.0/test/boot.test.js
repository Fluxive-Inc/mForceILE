#!/usr/bin/env node
// ILE-TEST-1 — the image must hold every module the server requires at boot.
//
// WHY THIS TEST AND NOT ANOTHER. package.json carried npm's default:
//     "test": "echo \"Error: no test specified\" && exit 1"
// so Step-06-TEST failed every build. The lazy fix is to make that line exit 0,
// which converts a red build into a green one that proves nothing — the exact
// fail-open shape fluxive-vision/standards/fail-closed-by-default.md forbids.
//
// So it tests the thing that has ACTUALLY broken apps on this fleet. Two sibling
// Dockerfiles record it in their own comments:
//   mForceCinema: "db.js MUST be here: server.js does require('./db') on line 3,
//     so without it the container throws MODULE_NOT_FOUND at boot and the
//     revision never becomes healthy. The old pipeline had no smoke test, so
//     this shipped silently."
//   mForceCinema again: "git shipping a file is not the same as the image
//     holding it."
// Both were found in production, after a deploy, by a revision that would not
// start. This asks the question at build time, in about a second.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const ENTRY = 'server.js';
let pass = 0;
const fail = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? '\n       ' + detail : '')); }
}

// ── 1. every local require, transitively, resolves on disk ─────────────────
function localRequires(file) {
  const src = fs.readFileSync(file, 'utf8').replace(/^\s*\/\/.*$/gm, '');
  return [...src.matchAll(/require\(\s*'(\.[^']+)'\s*\)/g)].map((m) => m[1]);
}
function resolveLocal(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const c of [base, base + '.js', base + '.json', path.join(base, 'index.js')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}
const seen = new Set();
const missing = [];
(function walk(file) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const spec of localRequires(file)) {
    const r = resolveLocal(file, spec);
    if (!r) missing.push(`${path.relative(ROOT, file)} requires '${spec}' — no such file`);
    else walk(r);
  }
})(path.join(ROOT, ENTRY));
ok(`every local require from ${ENTRY} resolves (${seen.size} module(s) reached)`,
   missing.length === 0, missing.join('\n       '));

// ── 2. the Dockerfile COPYs every one of them into the image ───────────────
// Git shipping a file is not the same as the image holding it. This is the
// check that would have caught the two defects the Cinema Dockerfile records.
const dockerfile = path.join(ROOT, 'Dockerfile');
if (fs.existsSync(dockerfile)) {
  const df = fs.readFileSync(dockerfile, 'utf8');
  const copied = new Set();
  for (const line of df.split('\n')) {
    const m = /^\s*COPY\s+(?!--from)(.+)$/i.exec(line);
    if (!m) continue;
    const parts = m[1].trim().split(/\s+/);
    parts.slice(0, -1).forEach((p) => copied.add(p.replace(/^\.\//, '')));
  }
  const wholeApp = [...copied].some((p) => p === '.' || p === './' || p === '*');
  const notCopied = [...seen]
    .map((f) => path.relative(ROOT, f))
    .filter((rel) => !rel.includes('/'))            // only top-level modules; subdirs copy as dirs
    .filter((rel) => !copied.has(rel))
    .filter((rel) => !wholeApp);
  ok('the Dockerfile COPYs every module the server requires',
     notCopied.length === 0,
     notCopied.length ? 'absent from every COPY: ' + notCopied.join(', ')
       + '\n       the container would throw MODULE_NOT_FOUND at boot' : '');
} else {
  console.log('  skip no Dockerfile beside server.js');
}

// ── 3. the entry point parses ──────────────────────────────────────────────
let parsed = true, perr = '';
try { new (require('vm').Script)(fs.readFileSync(path.join(ROOT, ENTRY), 'utf8'), { filename: ENTRY }); }
catch (e) { parsed = false; perr = e.message; }
ok(`${ENTRY} parses`, parsed, perr);

console.log(`\n${pass} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
