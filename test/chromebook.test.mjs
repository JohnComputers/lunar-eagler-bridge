import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');

test('launcher is a static HTML file with no downloaded runtime required',()=>{
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<script>/i);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
});
test('world is accurate and browser client is official 26.3 Gaius Pages',()=>{
  assert.match(html, /chillice_\\.lunarclient\\.world/);
  assert.match(html, /https:\/\/typethe0ry\.github\.io\/Gaius\/Gaius-26\.3\.html/);
});
test('no false authenticated login or bypass claim',()=>{
  assert.match(html, /authentication/);
  assert.match(html, /not been verified/);
  assert.match(html, /Invalid session/);
});
test('does not expose user credentials to a third party',()=>{
  assert.doesNotMatch(html, /<input[^>]*type=["']password/i);
  assert.doesNotMatch(html, /sessionStorage|localStorage/);
});
test('browser support and world copying are implemented',()=>{
  for(const id of ['wasm','webgl','secure','copyWorld','world','play','relay','customPlay']) {
    assert.match(html,new RegExp('id=["\\x27]'+id+'["\\x27]'));
  }
});
