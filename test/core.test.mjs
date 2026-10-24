import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareVersions, VoteSet } from '../src/core.mjs';

test('compareVersions orders semantic versions numerically', () => {
  assert.ok(compareVersions('0.10.0', '0.9.9') > 0);
  assert.ok(compareVersions('1.0.0', '1.0.1') < 0);
  assert.equal(compareVersions('0.1.0', '0.1.0'), 0);
  assert.equal(compareVersions('0.1', '0.1.0'), 0);
  assert.ok(compareVersions('0.2.0', undefined) > 0);
});

test('VoteSet stays active while any module votes on', () => {
  const votes = new VoteSet();
  assert.equal(votes.active, false);
  assert.equal(votes.set('swipe-vtt', true), true);
  assert.equal(votes.set('crlngn-ui', true), true);
  assert.equal(votes.set('swipe-vtt', false), true);
  assert.deepEqual(votes.voters, ['crlngn-ui']);
  assert.equal(votes.set('crlngn-ui', false), false);
});

test('VoteSet ignores repeated votes from one module', () => {
  const votes = new VoteSet();
  votes.set('swipe-vtt', true);
  votes.set('swipe-vtt', true);
  assert.equal(votes.set('swipe-vtt', false), false);
});

test('index.mjs and package.json carry the same version', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const src = readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8');
  assert.match(src, new RegExp(`export const VERSION = '${pkg.version.replace(/\./g, '\\.')}'`));
});

/** Split a selector list on its top-level commas (commas inside :is(), :not() etc. stay). */
function splitSelectorList(list) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

test('every base.css and priority.css rule is scoped to marked windows under the body class', () => {
  for (const file of ['base.css', 'priority.css']) {
    const css = readFileSync(new URL(`../styles/${file}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...css.matchAll(/([^{}@]+)\{/g)].map((m) => m[1].trim()).filter((s) => s && !/^(container|supports|keyframes) /.test(s) && !/^(from|to|\d+%)/.test(s));
    for (const group of selectors) {
      for (const selector of splitSelectorList(group)) {
        assert.match(selector.trim(), /^body\.crlngn-ws \.application\.cws[.:]/, `${file}: ${selector.trim()}`);
      }
    }
  }
});

test('priority.css holds only !important declarations', () => {
  const css = readFileSync(new URL('../styles/priority.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const declarations = [...css.matchAll(/\{([^{}]*)\}/g)].flatMap((m) => m[1].split(';')).map((d) => d.trim()).filter(Boolean);
  for (const declaration of declarations) assert.match(declaration, /!important$/, declaration);
});
