# netfox-website

The Next.js site for Netfox at https://netfox.app: landing page, docs, release notes and downloads. What the four app sites share is in the workspace's `.claude/rules/websites.md`.

`public/appcast.xml` is the live, EdDSA-signed Sparkle feed the app polls; Netfox's `release.sh` prepends each release to it.

## Architecture

### Theme

- The site is at night with no switch: Mantine is forced LIGHT and the night is written over it in variables (`theme/global.css`); Nextra is forced DARK (`app/layout.tsx`). The comments there say why. Tokens go on `:root`, never on `body`.
- A Mantine component can declare light-scheme values on its own element (Table hover, Kbd caps): override them by class, and measure contrast against the ground the text actually sits on.

### Environment

- `GITHUB_TOKEN` (Vercel, build and runtime): `load-releases.ts` fetches the releases at build time, and `/api/github-releases` (the browser fallback) and `/download` use it at runtime; without it GitHub allows 60 requests an hour.

### Performance

- **Baseline** (production build, Lighthouse mobile, devtools throttling): home perf 96-97, LCP 1.87-1.90 s, 644 KiB; docs 99, 622 KiB; SEO 100.

### Motion

`components/Motion`: nothing waits on a script to be seen. Read the headers of `useReveal.ts` and `Motion.module.css` before touching a pose; `Motion.css.test.ts` holds the shape. To fake scripts that never arrive (`scripts/shot.mjs --block`), block the JS only, never the whole chunks folder: the CSS is served from it too, and the page comes back unstyled rather than broken.

### The fox

`components/Mascot`: every behaviour is documented in its headers.
- **To drive it in `shot.mjs --eval`**: click Next by `[aria-label="Next translation"]`, scoped to the fox you mean (corner: `[data-phase][class*="corner"]`, card: `#sponsors [data-phase]`); an unscoped click hits the hero's off-screen copy, and `[class*=next]` matches Nextra's classes first.

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

Reasoning: end users care about what the feature does for them, not which vendor or library powers it. Naming the stack also paints us into a corner if we ever swap it — would force rewriting every page.

**Exceptions**:
- Developer-facing files (commit messages, this `CLAUDE.md`) — name infra freely
- "Under the hood" sections at the bottom of release notes — okay to be specific for power users who want to know, but prefer generic phrasing where it doesn't lose information
- **`SwiftUI` stays in `BuiltForMacSection` and the Welcome feature grid**: there the name is the claim (a real Mac app, not an Electron wrapper). Elsewhere drop it when it only explains an implementation. Reviewers flag it; it has been considered.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
