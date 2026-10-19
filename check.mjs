import { pingMinecraft } from './lib/minecraft-status.mjs';
const target = process.env.LUNAR_HOST || 'chillice_.lunarclient.world';
console.log('Checking Minecraft Java status for', target);
try {
  const result = await pingMinecraft(target);
  console.log(JSON.stringify(result, null, 2));
  if (result.destination.viaSrv &&
      (result.destination.hostname !== target || result.destination.port !== 25565)) {
    console.warn('Note: SRV routing differs from the Wisp tunnel target; the Wisp relay does not automatically follow SRV records.');
  }
} catch (err) {
  console.error('Connection/status failed:', err.message);
  process.exitCode = 1;
}
