# Netfox

The marketing and download site for **Netfox** — a native macOS app that monitors your home network: every connected device, when it joined, and what's new.

[![Latest Release](https://img.shields.io/github/v/release/gfazioli/netfox-website?label=Download&color=orange)](https://github.com/gfazioli/netfox-website/releases/latest)
[![macOS](https://img.shields.io/badge/macOS-15%2B-blue)](https://www.apple.com/macos/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## What is Netfox?

Netfox is a native macOS app that gives you a live, honest view of who's on your network. Instead of a vendor router app or a stale ARP table, you get:

- **Live device list** — every machine on your network, with hostname, MAC, IPv4/IPv6, vendor, and online state
- **Bonjour + ARP + active probing** — three independent discovery passes cover Apple devices, dumb IoT, and quiet hosts
- **Per-device history** — first seen, last seen, every transition (online ↔ offline, IPv4 learned/changed, hostname changed) on a timeline that survives across launches
- **New-device alerts** — both in-app and as native macOS notifications, with a persistent log of everything that ever fired
- **Native macOS UI** — SwiftUI throughout, modern look, follows system appearance
- **No account, no cloud, no telemetry** — data stays on your Mac
- **Universal binary** — runs on Apple Silicon and Intel Macs
- **Auto-updates** — built in

## Download

[**→ Download the latest version**](https://github.com/gfazioli/netfox-website/releases/latest)

After downloading, open the DMG and drag Netfox into your Applications folder. Launch it normally — the app is signed with Apple Developer ID and notarized by Apple, so Gatekeeper accepts it on first open.

## Requirements

- macOS 15 Sequoia or later

## Documentation

Full documentation, screenshots and FAQ at the deployed website (URL TBD when first deployed).

## About this repository

This repo hosts the **marketing site** and **release downloads** for Netfox. The app source lives in a separate repository.

The site is built with [Next.js 16](https://nextjs.org/), [Mantine 9](https://mantine.dev/) and [Nextra 4](https://nextra.site/).

### Local development

```bash
yarn install
yarn dev
```

Then visit [http://localhost:3000](http://localhost:3000).

## License

MIT

---

[![Star History Chart](https://api.star-history.com/svg?repos=gfazioli/netfox-website&type=Timeline)](https://www.star-history.com/#gfazioli/netfox-website&Timeline)
