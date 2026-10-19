import net from 'node:net';
import { resolveSrv } from 'node:dns/promises';

export function encodeVarInt(number) {
  if (!Number.isSafeInteger(number) || number < 0 || number > 0x7fffffff) throw new RangeError('Invalid VarInt');
  const bytes = [];
  do {
    let b = number & 127;
    number >>>= 7;
    if (number !== 0) b |= 128;
    bytes.push(b);
  } while (number !== 0);
  return Buffer.from(bytes);
}

export function decodeVarInt(buffer, offset = 0) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    if (offset + i >= buffer.length) return null;
    const byte = buffer[offset + i];
    value |= (byte & 127) << (7 * i);
    if ((byte & 128) === 0) {
      if (value < 0) throw new Error('Negative VarInt not allowed');
      return { value, bytes: i + 1 };
    }
  }
  throw new Error('Oversized VarInt');
}

function mcString(value) {
  const str = Buffer.from(value, 'utf8');
  return Buffer.concat([encodeVarInt(str.length), str]);
}

function packet(body) {
  return Buffer.concat([encodeVarInt(body.length), body]);
}

export function makeStatusRequest(hostname, port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('Invalid port');
  const portBytes = Buffer.alloc(2);
  portBytes.writeUInt16BE(port, 0);
  const handshake = Buffer.concat([
    encodeVarInt(0),         // packet id: handshake
    encodeVarInt(0),         // protocol version: status only
    mcString(hostname),
    portBytes,
    encodeVarInt(1)          // next state: status
  ]);
  return Buffer.concat([packet(handshake), packet(encodeVarInt(0))]);
}

export function parseStatusReply(buffer) {
  const frameLength = decodeVarInt(buffer);
  if (!frameLength) return null;
  if (frameLength.value > 1048576) throw new Error('Status response too large');
  const end = frameLength.bytes + frameLength.value;
  if (buffer.length < end) return null;
  let cursor = frameLength.bytes;
  const id = decodeVarInt(buffer, cursor);
  if (!id || id.value !== 0) throw new Error('Unexpected status packet ID');
  cursor += id.bytes;
  const len = decodeVarInt(buffer, cursor);
  if (!len) throw new Error('Incomplete status length');
  cursor += len.bytes;
  if (len.value > end - cursor) throw new Error('Invalid status JSON length');
  const json = buffer.subarray(cursor, cursor + len.value).toString('utf8');
  return JSON.parse(json);
}

export async function resolveMinecraftAddress(hostname) {
  try {
    const records = await resolveSrv(`_minecraft._tcp.${hostname}`);
    records.sort((a, b) => a.priority - b.priority);
    if (records.length > 0) {
      return { hostname: records[0].name.replace(/\.$/, ''), port: records[0].port, viaSrv: true };
    }
  } catch {
    // A direct host:25565 connection is conventional when no SRV record exists.
  }
  return { hostname, port: 25565, viaSrv: false };
}

export async function pingMinecraft(hostname, timeoutMs = 6000) {
  const target = await resolveMinecraftAddress(hostname);
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: target.hostname, port: target.port });
    let buffer = Buffer.alloc(0);
    let settled = false;
    const finish = (err, data) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve({ ...data, destination: target });
    };
    socket.setTimeout(timeoutMs, () => finish(new Error('Connection timed out')));
    socket.on('error', err => finish(err));
    socket.on('connect', () => socket.write(makeStatusRequest(hostname, target.port)));
    socket.on('data', chunk => {
      try {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length > 1048577) return finish(new Error('Status response too large'));
        const result = parseStatusReply(buffer);
        if (result) finish(null, result);
      } catch (err) {
        finish(err);
      }
    });
    socket.on('end', () => finish(new Error('Server closed before sending status')));
  });
}
