# Lunar ↔ Eagler Bridge (experimental)

> **Not a working Eaglercraft 26.3 login solution yet.** This repository contains a functioning restricted [Wisp](https://github.com/MercuryWorkshop/wisp-protocol) transport server and Minecraft Java status probe. The missing Eaglercraft 26.3 **client-side Wisp integration and authenticated Java session** mean you cannot simply paste this relay's URL into the stock Eaglercraft multiplayer screen.

## Target and status

| Item | Value |
| --- | --- |
| Target world | `chillice_.lunarclient.world` |
| Client goal | Eaglercraft/Eagler26 26.3 in ChromeOS |
| Java server status checker | Implemented |
| Wisp TCP relay restricted to target | Implemented |
| Custom server dashboard | Implemented |
| Client-side 26.3 integration | **Not implemented** |
| Microsoft/Minecraft authenticated login | **Not implemented** |
| End-to-end joining Lunar Hosted Worlds | **Not verified** |

Eagler26 speaks the *Eaglercraft WebSocket login protocol* to servers with EaglerXServer; [Wisp](https://github.com/MercuryWorkshop/wisp-js) carries arbitrary TCP streams inside WebSockets. They are **different protocols**. A plain Wisp server is not a substitute for EaglerXServer, and the URL `wss://your-host/wisp/` is **not** directly usable in stock Eaglercraft.

## Local run (computer or VPS, not GitHub Pages)

Requires Node 20+:

```bash
npm install
npm test
npm start
```

Open http://127.0.0.1:3000. The dashboard shows a live Java server status check.

```bash
npm run check
```

Checks the target from the server's network, including Java DNS SRV discovery. It does **not** authenticate or join the world.

Environment variables: `HOST` (default `127.0.0.1`) and `PORT` (default `3000`). A Dockerfile is provided:

```bash
docker build -t lunar-eagler-bridge .
docker run --rm -p 3000:3000 lunar-eagler-bridge
```

To use from a Chromebook, deploy the **Node service** on a web host with HTTP WebSocket upgrades and TLS (HTTPS/WSS). The normal `github.io` GitHub Pages service **cannot** run Node servers or accept WebSocket connections. Use a domain or platform-provided HTTPS URL, then the Wisp endpoint is `wss://YOUR-DEPLOYED-HOST/wisp/`.

### Security

The Wisp server is locked to `chillice_.lunarclient.world:25565`, with direct IP requests, loopback/private address targets, and UDP disabled. It is not intended for unrestricted traffic or school network bypass. Do not disable those restrictions when hosting a public endpoint. The Java server's Minecraft status check uses DNS SRV if present, but **Wisp traffic does not automatically follow SRV**, so a world using a nondefault port or an unusual SRV mapping may require additional trusted routing work.

### What is required for gameplay?

1. World owner opens Lunar Client Hosted Worlds and sets **World Privacy → Everyone**, then keeps their world open. [Lunar's instructions](https://www.lunarclient.com/news/how-to-use-hosted-worlds-on-lunar-client).
2. Adapt the Eagler26 26.3 client network stack to send/receive Java TCP packets through Wisp. An older proof of concept is [Wispcraft](https://github.com/MercuryWorkshop/wispcraft); it is **not confirmed compatible with 26.3**.
3. Properly handle the target's Minecraft version and Microsoft/Minecraft account authentication. No authentication bypass, account token harvesting, or password submission is implemented.
4. Test that the Lunar Hosted World accepts the resulting account and protocol, including any player limits and SRV/port handling.

If the host permits Bedrock players, a **legitimate Bedrock client** can instead use Lunar's published Bedrock port **19132**. An ordinary Eaglercraft browser client is **not** automatically a Bedrock client.

### Reference implementations

- [Eagler26 attribution / network protocol](https://client.goldhq.net/attribution)
- [Wispcraft (browser-to-Java research)](https://github.com/MercuryWorkshop/wispcraft)
- [Mercury Workshop Wisp JS](https://github.com/MercuryWorkshop/wisp-js)
- [Lunar Hosted Worlds](https://www.lunarclient.com/news/how-to-use-hosted-worlds-on-lunar-client)

## Legal

Does not distribute Minecraft game files, account credentials, proprietary assets, or a patched game client. Independent community experiment, unaffiliated with all upstream projects.
