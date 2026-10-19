import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeVarInt, encodeVarInt, makeStatusRequest, parseStatusReply } from '../lib/minecraft-status.mjs';

test('VarInt encodes and decodes normal boundaries', () => {
  for (const number of [0, 1, 127, 128, 255, 2097151, 2147483647]) {
    const encoded=encodeVarInt(number);
    assert.deepEqual(decodeVarInt(encoded),{value:number,bytes:encoded.length});
  }
});
test('partial VarInt returns null', () => assert.equal(decodeVarInt(Buffer.from([128])), null));
test('status request contains handshake and status request', () => {
  const request=makeStatusRequest('chillice_.lunarclient.world',25565);
  assert.ok(request.includes(Buffer.from('chillice_.lunarclient.world')));
  assert.deepEqual(request.subarray(-2),Buffer.from([1,0]));
});
test('parse status response and incomplete frames', () => {
  const json=Buffer.from(JSON.stringify({version:{name:'26.3'},players:{online:2,max:8}}));
  const payload=Buffer.concat([Buffer.from([0]),encodeVarInt(json.length),json]);
  const frame=Buffer.concat([encodeVarInt(payload.length),payload]);
  assert.equal(parseStatusReply(frame.subarray(0,3)),null);
  assert.equal(parseStatusReply(frame).players.online,2);
});
test('reject invalid ports',()=> assert.throws(()=>makeStatusRequest('example.org',65536),RangeError));
