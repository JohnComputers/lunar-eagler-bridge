import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');

test('launcher is a standalone static HTML document', () => {
  assert.ok(html.toLowerCase().includes('<!doctype html>'));
  assert.ok(html.includes('<script>'));
  assert.ok(!html.includes('<script src='));
});

test('correct world and hosted 26.3 browser game', () => {
  assert.ok(html.includes('chillice_.lunarclient.world'));
  assert.ok(html.includes('https://typethe0ry.github.io/Gaius/Gaius-26.3.html'));
});

test('does not promise authenticated login', () => {
  assert.ok(html.includes('authentication'));
  assert.ok(html.includes('not been verified'));
  assert.ok(html.includes('Invalid session'));
});

test('no credential input or token persistence', () => {
  assert.ok(!html.includes('type="password"'));
  assert.ok(!html.includes('sessionStorage'));
  assert.ok(!html.includes('localStorage'));
});

test('Chromebook feature checks, copy and relay input are available', () => {
  for (const id of ['wasm','webgl','secure','copyWorld','world','play','relay','customPlay']) {
    assert.ok(html.includes('id="' + id + '"'), 'Missing element: ' + id);
  }
});
