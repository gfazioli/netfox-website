# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **marketing, presentation, and download website** for **Netfox**, a native macOS app that monitors your home network — devices, history, and alerts.

**This is NOT a macOS application.** This is a Next.js web project deployed on Vercel.

- **Live URL** (TBD): https://netfox-website.vercel.app/
- **App repository** (private, Swift/SwiftUI): https://github.com/gfazioli/Netfox
- **Website repository** (this): https://github.com/gfazioli/netfox-website

The website serves as:
1. **Landing page** — hero section, feature showcase, download CTA
2. **Documentation** — user guides, getting started, FAQ
3. **Release notes** — pulled automatically from GitHub Releases API
4. **Download hub** — links to GitHub Releases for the macOS binary
5. **Sparkle appcast host** — `public/appcast.xml` is the EdDSA-signed update feed the app polls

## Tech Stack

- **Framework**: Next.js 16 + Nextra 4 (docs/MDX)
- **UI Library**: Mantine 9
- **Animations**: @gfazioli/mantine-scene, @gfazioli/mantine-text-animate, @gfazioli/mantine-marquee, and the site's own scroll reveals and fox (`components/Motion`, `components/Mascot`; see **Motion** and **The fox** below)
- **Icons**: @tabler/icons-react
- **Analytics**: @vercel/analytics
- **Hosting**: Vercel
- **Package Manager**: Yarn 4 (Berry) — do not use npm or pnpm

## Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start Next.js dev server |
| `yarn build` | Production build (Next.js + pagefind search index) |
| `yarn test` | Full suite: typegen, oxfmt, lint, typecheck, jest |
| `yarn jest` | Run Jest tests only |
| `yarn typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `yarn lint` | oxlint + Stylelint |
| `yarn format:write` | Auto-format all TS/TSX/CSS files (oxfmt) |
| `yarn storybook` | Storybook dev server on port 6006 |
| `yarn analyze` | Bundle analysis with `@next/bundle-analyzer` |

> **If `yarn <cmd>` fails with `command not found: oxfmt` / `next`** the Yarn PATH shim isn't wired on this machine — run the binary directly instead: `./node_modules/.bin/oxfmt`, `./node_modules/.bin/next dev`, `./node_modules/.bin/next build`. `yarn test` / `yarn jest` route through the npm-run shim and work regardless.

## Architecture

### Routing & Content

- **App Router** (`app/`): Next.js 16 app router with Nextra integration
- **Docs content** (`content/`): MDX files rendered via Nextra at `/docs/[[...mdxPath]]`
- Nextra is configured with `contentDirBasePath: '/docs'` — all MDX content is served under `/docs`
- `content/_meta.ts` controls sidebar navigation order and labels

### Layout & Theme Integration

- `app/layout.tsx` wraps the entire app in both `MantineProvider` and Nextra's `Layout`
- **The site is AT NIGHT, with no switch** (2026-09-23, after a light-only stint that followed lancetta-website): the home page first, then the docs (user: *"con lo scuro la doc risulta più leggibile e c'è meno cambio con la home page"*). The mechanism is deliberately split. **Mantine stays forced LIGHT** (`forceColorScheme="light"` on both `ColorSchemeScript` and `MantineProvider`) and the night is written over it as variables in `theme/global.css` (`html:root[data-mantine-color-scheme='light']`: text, dimmed, bright, orange text/light/anchor, default, gray-light, body). **Nextra runs its own DARK theme**, forced (`nextThemes={{ forcedTheme: 'dark' }}`, `darkMode={false}`), so its tables, callouts and code blocks use the variants drawn for a dark ground. `html { color-scheme: dark }`. Forcing `ColorSchemeScript` matters: without it a visitor who used the old toggle lands on Mantine's dark scheme, which nothing is written against.
- **The palette is the logo's**, sampled by k-means over `public/icon-512x512.png` and declared as tokens on `:root` (plate azure→indigo, fur navy→near-black, fox amber/orange/rust/cream). Surfaces: `--nf-page` #0d1230, `--nf-rule` and `--nf-card` as white at 11% and 5% (cards are glass), `--nf-footer` #070a1f. Accent is the fox's amber (`--nf-ink`); `theme.ts` overrides Mantine's `orange` scale with the fox's, amber as the filled shade, with `autoContrast` so a filled button carries dark text. **Tokens live on `:root`, not the body**: a `var()` inside a custom property resolves where it is declared, so a body-level override never reaches a variable html computed (Nextra's `--x-color-nextra-bg` did exactly that).
- **The home page has its own gradient** (`body:has(.nf-home)`): navy, the fur behind the hero, back down to `--nf-page` by 2800px and flat after, because every feathered section below dissolves into `--nf-page`. A section carrying a wash takes `className="nf-feather"` (`app/global.css`); `--nf-feather-top: 0px` where a side meets nothing. The hero title is white, its accent amber; the docs' h1-h3 are amber.
- **Every contrast claim here was measured element by element** against the background each text actually sits on (a DOM walk in a Chrome capture); the only thing under 4.5:1 is two 10px badges inside the mock app window. Things that looked fine and were not: Accordion rows read `--mantine-color-bright` (FAQ questions were black on navy), and a Table's hover and a Kbd's caps are light-scheme values declared on the element itself, so they are overridden by class, not on `:root`.

- Mantine theme overrides go in `theme.ts` (client-side `createTheme`)
- Global site configuration (metadata, GitHub API, search, Nextra layout) lives in `config/index.ts`
- Primary color: orange (matching Netfox app icon)
- Custom color palette: `netfox` (orange/foxy shades)

### Key Components (`components/`)

- `MantineNavBar` — top navigation with Netfox logo + GitHub link
- `MantineFooter` — 4-column footer with highlights, resources, ecosystem links
- `Welcome` — hero section with animated title, features grid, download CTA
- `Mascot` — the pixel fox that stands beside the hero's buttons and translates machine speak (**The fox**, below)
- `ReleaseNotes` — renders the releases `content/release-notes.mdx` fetched and compiled at BUILD time (`load-releases.ts`); only when the build got none does it fall back to fetching `/api/github-releases` in the browser
- `ProblemSection` / `SolutionSection` / `BuiltForMacSection` — marketing sections used by `Welcome`
- `FAQ` — accordion-style FAQ, content driven by an array prop

### API Routes (`app/api/`)

- `version/` — returns current package version
- `github-releases/` — proxies GitHub Releases API for Netfox (configured in `config/index.ts`). Uses `GITHUB_TOKEN` env var when set to raise the rate limit from 60/hr to 5000/hr.
- `search/` — pagefind-based full-text search endpoint

### Environment variables

- `GITHUB_TOKEN` (optional, recommended on Vercel) — fine-grained or classic token with `public_repo` read scope. Used by:
  - The `/api/github-releases` proxy (runtime, now only the fallback).
  - `content/release-notes.mdx`, which fetches the releases at build time, so Vercel needs the var available during deploys. (This line used to describe a build-time TOC fetch this page never had; it came over from findergit-website.)
  Without the token the app still works but may hit 60 req/hr GitHub rate limit on shared IPs.

### CSS Import Order

In `app/layout.tsx`, CSS imports must follow this order:
1. `@mantine/core/styles.css`
2. Mantine extension styles (marquee, text-animate, scene)
3. Global styles

### What a crawler gets is the served HTML

Measured 2026-09-24, when Search Console listed pages as *Crawled - currently not indexed*: two pages reached Google nearly empty, and neither looked wrong in a browser. Same defects, same fix, as findergit-website the same day.

- **`/docs/release-notes` was 45 words.** The releases were fetched in the browser from `/api/github-releases`, and that route answers **403 to any user agent containing `bot`** -- Googlebot's rendering service included. The hook never checked the status, so the 403 body threw inside it and even the JavaScript-rendered page stayed on the *Loading releases...* skeleton. Now `load-releases.ts` fetches and compiles them at build time (release.sh publishes the GitHub release BEFORE pushing the website commit, so the deploy after a release sees it); the browser makes no request at all. Bodies compile as `md`, one `try` each: a body is written on GitHub after the build, and a brace in MDX is a JavaScript expression.
- **`/docs/faq` was 174 words: the questions, no answers.** Mantine 9's Accordion keeps a closed panel in a React `<Activity>`, which renders nothing on the server. `keepMountedMode="display-none"` renders every answer and only hides it. The test for it uses `renderToString`, because a jsdom `render` mounts a hidden Activity's children and cannot see the defect.

Check a page the way a crawler gets it: `curl -A Googlebot` and count words in `<main>` with the scripts stripped. A number under a few hundred on a page that looks full in the browser is this class of defect.

### Motion: the home page reveals itself as it is scrolled

All of it is `components/Motion`, first built here (#77), taken by lancetta.app, fixed there in review, and brought back on 2026-09-29. Section headings rise; cards MORPH (squashed and low, then the landing spring), 110-120 ms apart; the tour's screens come in from the side they sit on, their copy rises and their figures pop, the numbers rolling (`ScrollNumber`); each conversion card lands and then its "Netfox tells you" materialises; the Built-for-macOS pills pop and its 100 rolls. The springs are `--nf-spring*` in `theme/global.css`, the film's closed-form spring sampled into `linear()` (lancetta-website's `springs.ts` regenerates all three to the last digit).

- **Nothing is hidden until a script has found it off screen.** A scope (`useReveal`) is at REST as served, ARMED (`data-armed`, its starting pose) once mounted and entirely off screen, REVEALED on the way into view; only a revealed item has a transition, and what is on screen at mount never moves. The first version hid every pose from the first paint behind `(scripting: enabled)`, and `SolutionSection` hid its four reads in plain CSS until its own observer ran. Measured on the live site with the scripts blocked (`scripts/shot.mjs <url> <out> --no-wake --block "*_next/static/chunks/*.js"`): 49 of 49 items at opacity 0, the four reads gone (the section was blank navy), every figure at zeros, *"00 releases since May 2026"* in the hero. Now 0, 0 and the values. Do not block on `*_next/static/chunks/*` alone: the CSS is served from the same folder, and the page comes back unstyled rather than broken.
- **`threshold` is 0.** At 0.15 a scope taller than about six viewports never fires; the FAQ is one at 500% zoom. `ScrollNumber` keeps 0.6, since a number is one line tall.
- **`<html data-scroll-behavior="smooth">`, because the reveals read the scroll at mount.** Measured on the live site without it: from `/docs/faq` scrolled to its bottom, a click on the logo mounted the home at y=8753, it was still scrolling 3.5 s later (y=40), and 30 scopes had been revealed out of sight on the way up. With it the home mounts at 0 and nothing is revealed. The release count sits at y=1092, so on a 900-tall screen it waits armed below the fold and rolls when scrolled to; on an 1100-tall one it is on screen at mount and never moves.
- **A scope per part where the parts do not arrive together.** The tour's screen, copy and figures each watch for themselves (the figures inside the copy: an item waits for every armed scope above it), and each conversion card is its own scope, since in one column the four are taller than a phone. Scrolled at 750 px/s, the old row-wide reveal found a row's copy up to 66 px and its figures 366-416 px below the fold on a 390x844 phone, and the figures 182-223 px below at 1440x900. Per part, every one starts 69-83 px above the bottom edge at both sizes (the `-8%` bottom margin, plus a frame of scroll).
- **The light is on the rim, as in the app** (`EdgeGlint`, Netfox 0.26.0): top right and bottom left, white, as in the app, but a glow held just inside the edge rather than the app's 1.5-point ring (user, 2026-09-29, choosing findergit.app's version: *"interno e sfumato"*): inset shadows on a layer 3 px in, a tight core and a wide bloom per corner, reach 104 px, still under 60% of the shortest card side here (236 px at 1440, 1024 and 390). A `Reveal` wrapper has no radius of its own, so a card inside one passes `radius`, and the wrapper must BE the card's box: the mock window's wrapper was full width with the window `maw={800}` inside, which would have put the light on the container's corners, out in the page.
- **A screen from the right waits 80 px past its column while armed.** The tour sits in the hero's box, which is `overflow: hidden`, so the page never widens: `scrollWidth == clientWidth` at 390, 1024 and 1440 with two screens armed. Move the tour out of that box and it needs `overflow-x: clip` of its own.
- **Reduce Motion and a failed script get the page as laid out**, and so does print, which never matches the `screen` query the poses sit in. Under Reduce Motion the scopes still arm, but nothing is hidden and nothing transitions (measured: 42 armed, 0 hidden, 0 transitions).
- **An armed item's `getBoundingClientRect` is its starting pose** (0.9 x 0.7 and 48 px down for a card): read layout sizes with `offsetWidth` / `offsetHeight`.

**To see it**, `scripts/shot.mjs` (cross-ported from findergit-website): `--no-wake`, or the page-wide wake scroll fires every one-shot reveal before the first frame; `--rate 0.4` slows the page's animations; `--frames 12 --every 200` for a strip; `--at <fraction>` for a section; `--reduce` for Reduce Motion; `--block` for a page whose scripts never arrive; `--eval` runs after the strip, with `awaitPromise`, so an expression can scroll the page itself and time what happens.

### The fox: a mascot that translates

Asked for on 2026-09-29, *"come fatto per Lancetta, octoscope e findergit, manca una mascotte, un pupazzetto per Netfox"*. Three sketches were shown (an orange chibi fox, this one, a fox in profile); the user picked the night fox, *"è quello che si avvicina di più al logo"*. It is this site's counterpart of lancetta.app's `PanelHint` and findergit.app's `CarouselGuide`, from which the stylesheet and the behaviour are ported.

- **The drawing is the grids in `sprite.ts`**, 22 x 18 cells at 4 px, in the icon's own colouring: navy fur at the edges, orange down the middle of the face, cream muzzle, amber eyes, and the icon's radar as an amber dot on the forehead. `sprite.test.ts` holds its colours to the `--nf-*` tokens, puts the ping on that dot, and checks that the raised arm is a staircase whose every step shares an edge and never touches the head (a diagonal of single cells reads as dots; an arm against the outline merges into it).
- **Its job is the hero's sentence, demonstrated.** Once the buttons come into view it walks in from the right, stops beside them, hops and pings its forehead radar, then raises a paw and says what a piece of machine speak means: `ESP-8A2F`, `_hap._tcp`, an Amazon device answering on 55442 and 55443, `0.0.0.0:5432`, two MACs answering one `.local` name. A click on it or on what it says pings again and translates the next one. **The translations are public claims**: each was checked against the app's source at 0.28.0 (`translations.ts` says where each comes from), so a release that changes one changes it there.
- **Every load**, like its siblings; dismissed, it stays away for the life of the page (module state) and hands the keyboard focus to "See what it does". Reduce Motion: it arrives already pointing, no walk, no rings. Nothing of it is in the served HTML, so a page whose scripts never run is unchanged (measured with `--block`).
- **It comes only where there is room for what it says.** It measures the room right of the row of buttons when it sets out, gives the bubble that width (`--nf-guide-room`, at most 260 px), and does not come with less than 200: below about 1230 px of window. A resize that takes the room away sends it off. Measured on the built page: 306 px of room at 1440, 234 at 1280; no horizontal scroll at 1280, 1440 or 1920 during the walk, because the hero is `overflow: hidden`.
- **Its feet are the row's bottom edge**, measured to the pixel at 1280, 1440 and 1920. Two things had lifted it, both measured before the fix: the button's default `inline-block` sat on a line box's baseline, 7 px up, and a bubble in the flow, taller than the fox, lifted it by the difference, 25 px. The walker is a block and the bubble hangs off the fox, out of the flow.

**To see it**: the row sits just below the fold at 1440 x 900 and the fox points about 4 s after the row comes into view, so `scripts/shot.mjs <url> <out> --at 0.09 --frames 2 --every 5000 --no-wake` (the first frame is taken on arrival, before it has set out). `--eval` can click it: `document.querySelector('[class*=say]').click()`.

## Content Guidelines

- All website content is in **English**
- The app is described as: "A native network monitor for macOS"
- Key selling points: device discovery (Bonjour + ARP + active probing), per-device history timeline, alerts for new devices, native macOS UI, no cloud account required, no telemetry
- Target audience: home network users who want to know who's connected, when, and from where — at a glance
- Download links point to GitHub Releases on the **website** repo (the app repo is private): `https://github.com/gfazioli/netfox-website/releases/latest`

### No infrastructure leaks in user-facing copy

User-facing pages (`content/*.mdx`, the homepage, release notes hosted at `public/release-notes/<version>.html`, FAQ entries, marketing CTAs) **never name the underlying provider, model, or infrastructure**:

- ❌ "Groq", "Llama", "OpenAI", "Anthropic" — say "the AI" or "the AI provider"
- ❌ "Vercel proxy", "Next.js API route", "Cloudflare Worker" — say "Netfox handles the request on your behalf"
- ❌ "Sparkle", "AppKit's NSEvent monitor", framework names — say "the auto-update framework" / "macOS keyboard handling"
- ✅ User-relevant facts ARE allowed: "free", "no account required", "data never leaves your Mac", "macOS 15.6+ required"

**The macOS floor is 15.6, not 15.** Take it from `MACOSX_DEPLOYMENT_TARGET` in the app's pbxproj (it also drives `sparkle:minimumSystemVersion` in the appcast) — never from FinderGit, whose floor is different. Six places on this site said "macOS 15+" / "macOS 15 (Sequoia)" until 2026-08-05, which told anyone on 15.0–15.5 the app would run when Sparkle would never offer it and the binary would not launch. When the deployment target moves, grep the whole site for the old value rather than fixing the page you happen to be on.

Reasoning: end users care about what the feature does for them, not which vendor or library powers it. Naming the stack also paints us into a corner if we ever swap it — would force rewriting every page.

**Exceptions**:
- Developer-facing files (commit messages, this `CLAUDE.md`, `CHANGELOG.md`) — name infra freely
- "Under the hood" sections at the bottom of release notes — okay to be specific for power users who want to know, but prefer generic phrasing where it doesn't lose information
- **`SwiftUI` in `BuiltForMacSection` and the Welcome feature grid stays** (decided 2026-08-05). There naming it *is* the claim — a real Mac app rather than an Electron wrapper — and the section exists for exactly that. The test is whether the name carries the message or merely explains an implementation: an auto-reviewer flagged the same word in the FAQ, where it was being used to justify a minimum macOS version and told the reader nothing, and there it was correctly removed. Expect the flag to recur on these two; it has been considered.

## Tooling

- **Formatter**: oxfmt (`.oxfmtrc.json`)
- **Linter**: oxlint + stylelint
- **TypeScript**: 6.x
- **Package Manager**: Yarn 4 (Berry). Do not use npm or pnpm.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
