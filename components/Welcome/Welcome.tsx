'use client';

import Link from 'next/link';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import {
  IconDownload,
  IconArrowRight,
  IconBell,
  IconClock,
  IconDeviceDesktop,
  IconLanguage,
  IconLayoutNavbar,
  IconLockOpen,
  IconNetwork,
  IconRadar,
  IconShieldLock,
  IconQuoteFilled,
} from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import config from '@/config';
import { ToolTour, type TourFrame } from '@/components/ToolTour/ToolTour';
import { ShareButtons } from '@/components/ShareButtons/ShareButtons';
import { ReleaseCadence } from '@/components/ReleaseCadence/ReleaseCadence';
import {
  fallbackReleaseCadence,
  type ReleaseCadence as Cadence,
} from '@/components/ReleaseCadence/release-cadence';
import { FAQ } from '../FAQ/FAQ';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
import { AccentCard, GradientIcon } from '../AccentCard/AccentCard';
import accentClasses from '../AccentCard/AccentCard.module.css';
import classes from './Welcome.module.css';

/**
 * Anchor chrome for the clickable feature cards: kill the default
 * underline/colour and fill the grid cell. Module-level so the seven
 * cards share one allocation instead of recreating the object per
 * render (CodeRabbit nitpick on PR #19).
 */
const FEATURE_LINK_STYLE = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
} as const;

/**
 * The four tools, as `ToolTour` rows. Every sentence and every figure here is
 * taken from that tool's own docs page (content/tools/*.mdx), which is what
 * the link under it opens: a claim on the homepage that the docs page does not
 * make is a claim nobody has checked.
 */
const tourFrames: TourFrame[] = [
  {
    src: '/screenshot-overview.png',
    alt: 'Netfox — the Overview: risk posture, devices online, public IP and the alert inbox as four cards, with the network settings and the link below',
    eyebrow: 'Overview',
    title: 'Your whole network, on one screen.',
    body: 'Four cards answer the four things you open it for: what is on the network, what looks risky, what your network looks like from outside, and what happened while you were away. Each card opens the tool behind it, and the one that asks you to act carries the Smart Scan that checks every device you have not tested yet.',
    figures: [
      { value: '4', label: 'cards, each one a door into its tool' },
      { value: 'Opt-in', label: 'public IP lookup, the only traffic it sends' },
    ],
    href: '/docs/tools/overview',
    linkLabel: 'Tour the Overview',
  },
  {
    // A cleaner, glance-friendly Wi-Fi shot; the docs page keeps the fuller
    // detail-panel screenshot (`/screenshot-wifi.png`).
    src: '/screenshot-hero-wifi.png',
    alt: 'Netfox — the Wi-Fi tool: every network in range with its security, channel and signal, and a live signal chart for the selected one',
    eyebrow: 'Wi-Fi',
    title: 'Every network in range, and how yours is holding up.',
    body: 'Every network your Mac can hear, its security graded by colour, its channel and band, and a live signal history for each one. A hidden network still tells you who made the access point. Location is asked for once, because macOS keeps network names behind it, and is used for nothing else.',
    href: '/docs/tools/wifi',
    linkLabel: 'How the Wi-Fi tool reads',
  },
  {
    src: '/screenshot-devices.png',
    alt: 'Netfox — the Devices tool: every device on the network in one list, with its name, vendor and state',
    eyebrow: 'Devices',
    title: 'Every device, named in plain English.',
    body: 'Bonjour, the ARP cache, SSDP, NetBIOS and an active ping run together and merge into one row per physical device, so the quiet ones show up beside the chatty ones — each with its identity, its history and the services it exposes. And when a device never speaks at all, Find silent devices asks your subnet instead of waiting.',
    figures: [
      { value: '5', label: 'discovery sources, one row per device' },
      { value: 'Read-only', label: 'discovery, until you ask for a scan' },
    ],
    href: '/docs/tools/devices',
    linkLabel: 'How devices are found',
  },
  {
    src: '/screenshot-security.png',
    alt: 'Netfox — the Security tool: findings grouped by risk, each one explained in plain English',
    eyebrow: 'Security',
    title: 'What looks wrong, and why it matters.',
    body: 'A quick check of every device you can reach, against the ports that matter at home: remote access, file sharing, databases, smart-home control, and the dev server you forgot was open to the LAN. Every finding comes in plain English, and every device it has checked earns a risk badge. Plain TCP connections, no root, and never anything outside your network.',
    figures: [
      { value: '6', label: 'families of port, from SSH to Redis' },
      { value: 'LAN only', label: 'it refuses to probe anything outside' },
    ],
    href: '/docs/tools/security',
    linkLabel: 'What gets checked',
  },
];

/**
 * Each feature's `accent` is consumed by `AccentCard` as the
 * `--card-accent` CSS variable — drives the radial gradient on
 * the card, the icon chip gradient, and the hover glow. Mantine
 * theme tokens (`*-5`) used uniformly so the cards stay in
 * lockstep with the project palette (a future theme tweak shifts
 * every accent automatically).
 *
 * `href` makes each card a deep link into the matching docs page —
 * the grid doubles as a visual table of contents, and the existing
 * hover-lift already reads as "clickable".
 */
const features = [
  // Row 1 — UNDERSTAND: the enrichment story leads.
  {
    icon: IconLanguage,
    title: 'Plain-English Identity',
    description:
      'A cryptic “ESP-8A2F” turns into “Espressif · web server on :80 · lighttpd” — vendor, category, open ports and the server banner, side by side. No hex to decode yourself.',
    accent: 'var(--mantine-color-green-5)',
    href: '/docs/tools/devices',
  },
  {
    icon: IconRadar,
    title: 'Multi-Source Discovery',
    description:
      'Bonjour, ARP, SSDP, NetBIOS and active probing run together. Apple devices, smart-TVs, IoT, quiet hosts — all in the same list.',
    accent: 'var(--mantine-color-orange-5)',
    href: '/docs/tools/devices',
  },
  {
    icon: IconClock,
    title: 'Per-Device History',
    description:
      'First seen, last seen, every online/offline transition, every IP/hostname/vendor change. Timeline survives across launches.',
    accent: 'var(--mantine-color-blue-5)',
    href: '/docs/tools/devices',
  },
  // Row 2 — PROTECT: read first, then act on what you read.
  {
    icon: IconShieldLock,
    title: 'Risk-Aware Security',
    description:
      'One-click Scan All checks every reachable device against a curated set of home-network ports. Risk Inspector explains each finding in plain English.',
    accent: 'var(--mantine-color-red-5)',
    href: '/docs/tools/security',
  },
  {
    icon: IconLockOpen,
    title: 'Spot Exposed Services',
    description:
      'Netfox scans your own Mac and the LAN for risky open ports — a dev database, a homelab dashboard, a port that just opened up — names each service and flags what’s worth a look. The exposure a router app never surfaces.',
    accent: 'var(--mantine-color-pink-5)',
    href: '/docs/tools/security',
  },
  {
    icon: IconBell,
    title: 'Five Kinds of Alert',
    description:
      'New device, returning after long absence, risky arrival, port-state change, new service. Inbox + persistent log + per-device mute.',
    accent: 'var(--mantine-color-yellow-5)',
    href: '/docs/settings#alerts',
  },
  // Row 3 — NATIVE & PRIVATE: how it lives on your Mac.
  {
    icon: IconLayoutNavbar,
    title: 'Menu Bar at a Glance',
    description:
      'A menu bar popover shows devices online, risk level, public IP and VPN, and active alerts — without opening the main window.',
    accent: 'var(--mantine-color-teal-5)',
    href: '/docs/menu-bar',
  },
  {
    icon: IconDeviceDesktop,
    title: 'Native macOS',
    description:
      'Built in SwiftUI for macOS 15.6+. Follows your system appearance and language — localized in 7 languages 🇬🇧 🇮🇹 🇫🇷 🇩🇪 🇪🇸 🇵🇹 🇳🇱. Universal binary.',
    accent: 'var(--mantine-color-grape-5)',
    href: '/docs/getting-started',
  },
  {
    icon: IconNetwork,
    title: 'No Account, No Cloud',
    description:
      'Data stays on your Mac. No telemetry, no sign-up, no vendor lock-in. One-keystroke Demo Mode masks names, MACs, IPv6 and SSIDs for safe screenshots.',
    accent: 'var(--mantine-color-cyan-5)',
    href: '/docs/settings#privacy',
  },
];

/**
 * `cadence` is fetched on the server in `app/page.tsx` so the release count
 * and date ship inside the initial HTML. It defaults to the config-derived
 * fallback, which keeps the strip rendering in tests and on any path that
 * mounts the hero without the server fetch.
 */
export function Welcome({ cadence = fallbackReleaseCadence() }: { cadence?: Cadence }) {
  return (
    <>
      {/* ─── Hero ─── */}
      <Box
        pos="relative"
        className="nf-feather nf-home"
        style={{ overflow: 'hidden', ['--nf-feather-top' as string]: '0px' }}
      >
        {/*
          The icon's own plate, read top-down: azure along the top edge
          (#B3C9FC), periwinkle through the middle (#868CD4), indigo at the
          bottom (#5344A8), with the fox's orange (#FE961E) as the one warm
          light, behind the icon. Sampled from public/icon-512x512.png.

          Not animated. `animate` on a Mesh is a hue-rotate over the whole
          layer, and on the light page a full turn walks the orange through
          green: the hero was seen mint-green in a live browser while a
          capture taken at another point of the cycle looked right.
        */}
        <Scene lazy>
          <Scene.Mesh
            stops={[
              { color: '#B3C9FC', position: '15% 12%', spread: 55 },
              { color: '#B3C9FC', position: '85% 15%', spread: 50 },
              { color: '#FE961E', position: '50% 30%', spread: 32 },
              { color: '#868CD4', position: '20% 80%', spread: 50 },
              { color: '#5344A8', position: '80% 85%', spread: 55 },
            ]}
            opacity={0.3}
          />
          <Scene.Glow color="#B3C9FC" size={560} blur={140} opacity={0.45} top="5%" left="-10%" />
          <Scene.Glow color="#5344A8" size={460} blur={120} opacity={0.2} top="65%" left="85%" />
          <Scene.DotGrid color="gray" opacity={0.14} spacing={32} />
          {/*
            Wi-Fi pulse — concentric arcs blooming upward from the
            bottom-centre of the hero. Previously hand-rolled as a
            sibling component (`RadarPulse`); mantine-scene 2.2+
            ships the same primitive natively, so it sits inside
            the `Scene` block now and inherits the same lazy /
            viewport-aware machinery as the other layers.
          */}
          <Scene.Radar
            origin="50% 100%"
            shape="arc"
            arcDirection="up"
            color="blue.4"
            count={4}
            interval={1.5}
            duration={6}
            size="1400px"
            strokeWidth={2}
            peakOpacity={0.4}
          />
          {/*
            Mirror radar at the top-centre, arcs opening downward.
            Pairs with the bottom radar for a "signal bouncing
            between top and bottom" feel. Parameters identical so
            the two layers read as the same effect, just mirrored —
            the only delta is `arcDirection="down"`, which also
            shifts the default `origin` to `50% 0%` automatically.
          */}
          <Scene.Radar
            shape="arc"
            arcDirection="down"
            color="blue.4"
            count={4}
            interval={1.5}
            duration={6}
            size="1400px"
            strokeWidth={2}
            peakOpacity={0.4}
          />
          <Scene.Noise opacity={0.022} />
        </Scene>
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="xl" py={80} className={classes.night}>
            <Badge
              size="lg"
              variant="filled"
              color="orange"
              style={{
                boxShadow: '0 8px 22px -8px rgba(247, 103, 7, 0.45)',
              }}
            >
              Free for macOS 15.6+
            </Badge>

            <Image
              src="/icon-512x512.png"
              alt="Netfox"
              // Hero logo is the above-the-fold LCP candidate — hint the
              // browser to fetch it eagerly and at high priority.
              fetchPriority="high"
              loading="eager"
              w={{ base: 120, sm: 160, md: 200 }}
              h={{ base: 120, sm: 160, md: 200 }}
              style={{
                // The plate's own indigo (#5344A8) rather than an orange glow:
                // the shadow reads as the icon's depth, not as a second light.
                filter:
                  'drop-shadow(0 22px 32px rgba(83, 68, 168, 0.42)) drop-shadow(0 6px 10px rgba(30, 27, 75, 0.2))',
              }}
            />

            <Stack gap="xs" align="center">
              <Text size="sm" fw={700} tt="uppercase" c="orange" style={{ letterSpacing: 3 }}>
                machine speak → humanese
              </Text>
              <Title maw="90vw" mx="auto" className={classes.title} ta="center">
                Your network,{' '}
                <TextAnimate
                  animate="in"
                  by="character"
                  inherit
                  variant="gradient"
                  component="span"
                  segmentDelay={0.12}
                  duration={1.5}
                  animation="scale"
                  animateProps={{ scaleAmount: 2 }}
                  // The fox's amber into its orange, on the night half of the
                  // page: 7.8:1 and 4.2:1 on navy, against 3 needed at this size.
                  gradient={{ from: 'var(--nf-amber)', to: 'var(--nf-orange)' }}
                >
                  in plain English.
                </TextAnimate>
              </Title>
            </Stack>

            <Text c="dimmed" ta="center" size="xl" maw={640} mx="auto">
              Netfox turns raw network data into plain words. That cryptic &quot;ESP-8A2F&quot;
              becomes an Espressif gadget running a web server on port 80 — and Netfox catches the
              dev server you accidentally left open on the LAN. No cloud, no account, all on your
              Mac.
            </Text>

            <Group justify="center" mt="md">
              <Button
                href="/download"
                component="a"
                leftSection={<IconDownload size={20} />}
                size="xl"
                radius="xl"
                px={40}
                color="orange"
              >
                Download for macOS
              </Button>
              <Button
                href="/docs"
                component="a"
                rightSection={<IconArrowRight size={18} />}
                variant="subtle"
                size="xl"
                color="orange"
              >
                See what it does
              </Button>
            </Group>

            <Stack gap={4} align="center" mt={8}>
              <Text c="dimmed" ta="center" size="sm">
                {/*
                  One interpolated string rather than JSX text, because the
                  JSX version shipped as "v0.17.1· macOS 15.6+": in a text
                  chunk spanning more than one line, the space between an
                  interpolation and a following HTML ENTITY is dropped.
                  Measured on the live site and reproduced in a probe route -
                  a plain character in the same position keeps its space, and
                  so does the entity while the chunk fits on one line, so it
                  takes both the entity and the wrap.

                  Fixing it with an explicit {' '} does not hold: oxfmt
                  removes it and rejoins the lines, which is why the defect
                  survived on the homepage. A template literal puts the
                  separators inside a string, where neither the formatter nor
                  the JSX whitespace rules can reach them.

                  Ported from findergit-website, where this was found.
                */}
                {`Free · v${config.app.version} · macOS ${config.app.minMacOS}+ · Universal (Apple Silicon + Intel) · Signed & notarized`}
              </Text>
              {/*
                Replaces a bare "Release notes" anchor that used to sit here.
                The strip links to the same page, and two links to it 30px
                apart was the only thing the old anchor added.
              */}
              <ReleaseCadence cadence={cadence} />
            </Stack>

            {/* ─── Product Hunt launch badge ─── */}
            {/*
              Featured badge from our Product Hunt launch. Rendered as a
              plain anchor wrapping the Mantine Image (not next/image) so
              the externally-hosted SVG with its cache-busting `t=` query
              param is served as-is, untouched by Next's optimizer. Fixed
              250×54 to match Product Hunt's canonical badge dimensions.
            */}
            <Group align="center" gap="md">
              <a
                href="https://www.producthunt.com/products/netfox?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-netfox"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Netfox on Product Hunt"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1156418&theme=light&t=1779880374909"
                  alt="Netfox - A native local macOS network monitor | Product Hunt"
                  w={250}
                  h={54}
                  fit="contain"
                />
              </a>
            </Group>
            <Group justify="center" mt="sm">
              <ShareButtons />
            </Group>
          </Stack>

          {/* ─── The four tools, screen beside copy ─── */}
          {/* The room between the share icons and the first tool is where the
              page turns from night to day (see the gradient's stops in
              theme/global.css): the tour's copy is dark and must start on the
              light page. */}
          <Box mt={120} mb={96}>
            <ToolTour frames={tourFrames} />
          </Box>
        </Container>
      </Box>

      {/* ─── The Solution — the conversion, right below the hero ─── */}
      {/*
        Per Chris Messina's feedback: the machine-speak→humanese conversion
        is the first content after the hero so it reads at a glance, and the
        before/after is shown as a sequence of cards, not buried as a single
        line of text deep down the page.
      */}
      <SolutionSection />

      {/* ─── Validation / testimonial (Chris Messina) ─── */}
      {/*
        An azure glow (the top of the icon's plate) on the page's own surface,
        feathered at both edges, in place of the dark slab between two rules it
        used to be. Not orange: a warm wash on this cool page turned to mud.
      */}
      <Box
        py={80}
        className="nf-feather"
        style={{
          background:
            'radial-gradient(60% 90% at 50% 50%, rgba(179, 201, 252, 0.55), transparent 70%)',
        }}
      >
        <Container size="sm" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="lg">
            <IconQuoteFilled size={44} color="var(--mantine-color-orange-5)" />
            <Text
              ta="center"
              fz={{ base: 24, sm: 30 }}
              fw={700}
              fs="italic"
              style={{ lineHeight: 1.4 }}
            >
              If you take machine speak and convert it into humanese,{' '}
              <Text span inherit c="var(--nf-display)">
                that&apos;s valuable.
              </Text>
            </Text>
            <Group gap="sm" justify="center" mt={4}>
              <Avatar src="/chris-messina.jpg" alt="Chris Messina" size="md" radius="xl" />
              <Text c="dimmed" size="sm" fw={600}>
                Chris Messina &middot; inventor of the hashtag
              </Text>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* ─── The Problem ─── */}
      <ProblemSection />

      {/* ─── Features ─── */}
      <Box
        id="features"
        className={accentClasses.sectionBackdrop}
        py={80}
        style={{ scrollMarginTop: 64 }}
      >
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="md" mb={48}>
            <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
              Features
            </Text>
            <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
              Everything you need, nothing you don&apos;t
            </Title>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {features.map((feature) => (
              // The whole card is the link target (not just the title):
              // the card's hover-lift + accent glow already signal
              // interactivity, so the anchor only needs to kill the
              // default underline/colour and fill the grid cell.
              <Link key={feature.title} href={feature.href} style={FEATURE_LINK_STYLE}>
                <AccentCard accent={feature.accent} h="100%">
                  <Stack gap="md" align="flex-start">
                    <GradientIcon icon={feature.icon} />
                    <Text fw={700} size="lg">
                      {feature.title}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {feature.description}
                    </Text>
                  </Stack>
                </AccentCard>
              </Link>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ─── Built for macOS  ⇣  Get Started CTA — one continuous Scene ─── */}
      {/*
        These two sections share a single canvas with one Scene
        composition: one mesh in the icon's colours spans both halves
        (the fox's orange on top where "Built for macOS" sits, the
        plate's indigo below where the CTA sits), and Noise adds texture
        across the whole canvas. One Scene rather than two, because
        splitting it produced a visible seam between the sections.
      */}
      <Box pos="relative" className="nf-feather" style={{ overflow: 'hidden' }}>
        <Scene lazy>
          {/*
            The same plate as the hero, the other way up: the fox's orange
            leads under "Built for macOS", the indigo takes over under the
            CTA. Not animated, for the reason the hero gives.
          */}
          <Scene.Mesh
            stops={[
              { color: '#FE961E', position: '50% 12%', spread: 40 },
              { color: '#B3C9FC', position: '15% 25%', spread: 50 },
              { color: '#B3C9FC', position: '85% 30%', spread: 50 },
              { color: '#868CD4', position: '22% 78%', spread: 55 },
              { color: '#5344A8', position: '80% 80%', spread: 55 },
            ]}
            opacity={0.26}
          />
          <Scene.Noise opacity={0.018} />
        </Scene>

        <BuiltForMacSection />

        {/* CTA sits in the lower half of the shared canvas, where the
            plate's periwinkle and indigo take over from the warm
            top. The extra `py={80}` separates it from the
            BuiltForMac content above. */}
        <Box pos="relative" py={80}>
          <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
            <Stack align="center" gap="lg">
              <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
                Get Started
              </Text>
              <Title order={2} ta="center" fz={{ base: 36, sm: 48 }} fw={900}>
                Know your network. Always.
              </Title>
              <Text c="dimmed" ta="center" size="lg" maw={500}>
                Download Netfox and see who&apos;s really connected.
              </Text>

              <Button
                href="/download"
                component="a"
                leftSection={<IconDownload size={20} />}
                size="xl"
                radius="xl"
                px={48}
                color="orange"
                mt="md"
              >
                Download for macOS
              </Button>
              <Text c="dimmed" size="sm">
                Free &middot; macOS 15.6 Sequoia or later
              </Text>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* ─── FAQ ─── */}
      <Container size="lg">
        <Stack align="center" gap="md" my={64}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            FAQ
          </Text>
          <Title order={2} ta="center">
            Frequently Asked Questions
          </Title>
          <Box w="100%" maw={700} mt="md">
            <FAQ />
          </Box>
        </Stack>
      </Container>
    </>
  );
}
