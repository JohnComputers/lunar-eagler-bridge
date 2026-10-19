# Lunar → Windows 11 + ChromeOS: browser-only Minecraft 26.3 entry point

**Live launcher:** https://johncomputers.github.io/lunar-eagler-bridge/  
**Target world:** `chillice_.lunarclient.world`

> **Status:** The launcher is browser-only and supports **Windows 11 (Microsoft Edge or Chrome)** and **ChromeOS (Chrome)** without installing software or running any separate .exe. It opens the working [Gaius Java 26.3 browser client](https://typethe0ry.github.io/Gaius/Gaius-26.3.html), using its existing public RelayNode. **Actual authenticated gameplay on this specific Lunar Hosted World is not yet verified**. This is not a promise to bypass Minecraft authentication.

## How to try it on Windows 11 or a school Chromebook

1. Open [the browser launcher](https://johncomputers.github.io/lunar-eagler-bridge/) in **Microsoft Edge or Chrome on Windows 11**, or **Chrome on a Chromebook**.
2. Run capability checks (WebGL 2 / WebAssembly / HTTPS).
3. Click **Play Minecraft 26.3**. This opens the existing Java 26.3 client directly in Chrome, without downloads, extensions, or a separate executable.
4. Choose **Multiplayer → Direct Connection**.
5. Paste `chillice_.lunarclient.world`; no `wss://` prefix.
6. Ask the host to set Lunar Hosted World's **Privacy = Everyone**, keep the world open, and ensure the world runs the same Minecraft version.

Gaius supports unmodified Java servers through a relay; no plugin is required on the owner's computer. The default registry currently lists `wss://ellan.site/tunnel`. It is a community service, may become unavailable, and may not accept every domain or session. [Gaius project](https://github.com/TypeThe0ry/Gaius) and [relay registry](https://github.com/TypeThe0ry/Gaius/blob/main/relay-nodes.json).

**Authentication matters:** Most Java multiplayer worlds use online-mode account verification. Gaius's offline profile is not equivalent to an authenticated Microsoft/Minecraft Java session. An **Invalid Session**, **Failed to verify username** or similar error means the relay transport alone cannot make the client join. Joining this specific world requires compatible authentication and permission from the server, not just a WebSocket bridge. We have not confirmed the exact world's authentication policy or that it is currently online.

If the host is on a different Java version, the client version must match; this launcher defaults to 26.3 because that is the user's browser version, **not because we verified the Lunar world runs 26.3**.

## What's inside

- `docs/index.html` — standalone Windows 11- and Chromebook-friendly HTML launcher, platform detection, platform-specific instructions, world address copier, browser capability tests, optional public Java status lookup, and Gaius browser link.
- `Dockerfile.gaius` — builds a restricted Gaius RelayNode using [Gaius v0.3.2](https://github.com/TypeThe0ry/Gaius/releases/tag/v0.3.2).
- `render.yaml` — optional Render blueprint to host the relay behind HTTPS; no process runs on either laptop.
- `server.mjs` — the original **Wisp** relay. **Wisp is NOT the Gaius transport and cannot be pasted as a Gaius relay URL.** This older proof of concept is preserved for comparison only.
- `lib/minecraft-status.mjs` and `check.mjs` — direct Java server-status implementation for Node hosts.
- `test/` — packet tests and static browser launcher tests.

## Optional private relay deployment

The public Gaius relay usually means nothing has to be deployed. **On Windows 11, use the already-installed Microsoft Edge browser:** no Minecraft launcher, JAR, PowerShell command, .exe download, Node.js installation, or admin rights are needed for the browser-only path. If needed, [deploy a Node.js service from this repository to Render](https://render.com/deploy?repo=https://github.com/JohnComputers/lunar-eagler-bridge) (requires your own Render account). The relay runs **in Render's cloud**, not on ChromeOS or Windows 11. The Dockerfile starts the actual upstream Gaius RelayNode rather than an incompatible Wisp server.

When the service is live, get its HTTPS URL, then convert it to `wss://YOUR-RENDER-SERVICE.onrender.com/tunnel`. On the launcher page, enter that address under **Optional: bring your own relay**, then click **Open with selected relay**. Alternatively, use Gaius Multiplayer → Relays.

Render free services can sleep, have quotas, or be unavailable; costs and availability can change. There is no deployment without authorization to your hosting account.

### Security

The Render blueprint restricts target hosts to `chillice_.lunarclient.world`, disallows private destinations, restricts browser origins to the Gaius host and downloaded local HTML, and limits active sockets. A public relay still consumes hosting resources. Don't enter Minecraft account passwords in this repo's launcher. The relay does not generate Minecraft Java ownership or valid authentication tokens.

DNS SRV records may point at a different hostname/port than the default Java 25565. Upstream RelayNode is SRV-aware but destination restrictions must still permit an authorized target. If it reports target blocked, verify DNS and adjust only to the specific legitimate target; never turn it into an unrestricted proxy.

## Troubleshooting

| Symptom | Meaning |
|---|---|
| Chrome cannot load Gaius | Site/network blocked; check school policy and browser access |
| WebGL 2 unavailable | Browser or laptop GPU limitation on Windows 11 or ChromeOS |
| Gaius multiplayer waits indefinitely | Public relay down, destination blocked, DNS routing, or version mismatch |
| Invalid session / Failed to verify username | Account authentication required; relay cannot bypass |
| Disconnected: Outdated client/server | Lunar world and client versions do not match |
| Server offline | Host must reopen their Lunar world and set Privacy to Everyone |
| Entering `wss://…` as game server | Incorrect; enter the Java world address without a WebSocket scheme |
| Using `/wisp/` URL in Gaius | Incorrect protocol; use Gaius RelayNode's `/tunnel` |

## Project boundaries

This repository does not host or redistribute Mojang game binaries, credentials, or the Gaius build. The browser client is linked from the original upstream project. This tool neither weakens school administrator controls nor impersonates Minecraft accounts.

Independent project. Not affiliated with Lunar Client, Minecraft, Mojang, Microsoft, Eaglercraft, Gaius or Mercury Workshop.
