'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DepthSelect, type DepthSelectItem } from '@gfazioli/mantine-depth-select';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import {
  IconDownload,
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconClock,
  IconDeviceDesktop,
  IconLayoutNavbar,
  IconNetwork,
  IconRadar,
  IconShieldLock,
} from '@tabler/icons-react';
import {
  ActionIcon,
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
  Anchor,
} from '@mantine/core';
import config from '@/config';
import { FAQ } from '../FAQ/FAQ';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
import { AccentCard, GradientIcon } from '../AccentCard/AccentCard';
import accentClasses from '../AccentCard/AccentCard.module.css';
import classes from './Welcome.module.css';

/**
 * Hero screenshots, one per top-level tool. Kept as a flat data array
 * so it drives two things from one source: the `DepthSelect` card stack
 * (`heroSlides`) and the custom controls below it (which need the human
 * label + position). The screenshots are 3072×1886 PNGs — that ratio is
 * mirrored on the slideshow wrapper so each image fills its card exactly,
 * which is what lets the depth-stack peek read (a shorter card would hide
 * the scaled-down cards behind the front one).
 */
const HERO_SCREEN_RATIO = '3072 / 1886';

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

const heroScreens = [
  {
    value: 'overview',
    label: 'Overview',
    src: '/screenshot-overview.png',
    alt: 'Netfox — Overview dashboard',
  },
  // Hero uses a cleaner, glance-friendly Wi-Fi shot (hero aspect
  // ratio); the docs Wi-Fi page keeps the fuller detail-panel
  // screenshot (`/screenshot-wifi.png`).
  { value: 'wifi', label: 'Wi-Fi', src: '/screenshot-hero-wifi.png', alt: 'Netfox — Wi-Fi diagnostics' },
  {
    value: 'devices',
    label: 'Devices',
    src: '/screenshot-devices.png',
    alt: 'Netfox — Devices and history',
  },
  {
    value: 'security',
    label: 'Security',
    src: '/screenshot-security.png',
    alt: 'Netfox — Security findings',
  },
];

const heroSlides: DepthSelectItem[] = heroScreens.map((screen) => ({
  value: screen.value,
  view: (
    <Image
      src={screen.src}
      alt={screen.alt}
      display="block"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ),
}));

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
  {
    icon: IconRadar,
    title: 'Multi-Source Discovery',
    description:
      'Bonjour, ARP, SSDP, NetBIOS and active probing run together. Apple devices, smart-TVs, IoT, quiet hosts — all in the same list.',
    accent: 'var(--mantine-color-orange-5)',
    href: '/docs/tools/devices',
  },
  {
    icon: IconShieldLock,
    title: 'Risk-Aware Security',
    description:
      'One-click Scan All checks every reachable device against a curated set of home-network ports. Risk Inspector explains each finding in plain English.',
    accent: 'var(--mantine-color-red-5)',
    href: '/docs/tools/security',
  },
  {
    icon: IconClock,
    title: 'Per-Device History',
    description:
      'First seen, last seen, every online/offline transition, every IP/hostname/vendor change. Timeline survives across launches.',
    accent: 'var(--mantine-color-blue-5)',
    href: '/docs/tools/devices',
  },
  {
    icon: IconBell,
    title: 'Five Kinds of Alert',
    description:
      'New device, returning after long absence, risky arrival, port-state change, new service. Inbox + persistent log + per-device mute.',
    accent: 'var(--mantine-color-yellow-5)',
    href: '/docs/settings#alerts',
  },
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
    description: 'Built in SwiftUI for macOS 15+. Follows system appearance. Universal binary.',
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

export function Welcome() {
  // Slideshow is controlled so the custom controls below the stack can
  // drive it (the built-in controls are turned off). Prev/Next wrap
  // around the four screens.
  const [activeScreen, setActiveScreen] = useState(heroScreens[0].value);
  const activeIndex = Math.max(
    0,
    heroScreens.findIndex((s) => s.value === activeScreen)
  );
  const stepScreen = (delta: number) => {
    const count = heroScreens.length;
    const next = (activeIndex + delta + count) % count;
    setActiveScreen(heroScreens[next].value);
  };

  return (
    <>
      {/* ─── Hero ─── */}
      <Box pos="relative" style={{ overflow: 'hidden' }}>
        {/*
          Logo-anchored mesh: the Netfox icon's foxhead pulls warm
          (orange/yellow) on a deep-blue backdrop, so the hero palette
          mirrors that pairing — warm anchors top-of-frame, cool
          anchors bottom — with `violet` as the bridging hue between
          red and blue. `animate` rotates the whole mesh's hue slowly
          over 40s; the long duration keeps the brand colors
          recognisable instead of devolving into a rainbow. Two
          glows (warm top-left, violet bottom-right) + DotGrid +
          Noise stay as the secondary chrome.
        */}
        <Scene lazy>
          <Scene.Mesh
            stops={[
              { color: 'orange', position: '15% 20%', spread: 50 },
              { color: 'yellow', position: '82% 18%', spread: 45 },
              { color: 'red', position: '50% 50%', spread: 55 },
              { color: 'violet', position: '22% 82%', spread: 50 },
              { color: 'blue', position: '80% 78%', spread: 55 },
            ]}
            opacity={0.24}
            animate
            duration={40}
          />
          <Scene.Glow color="orange" size={560} blur={140} opacity={0.4} top="5%" left="-10%" />
          <Scene.Glow color="violet" size={460} blur={120} opacity={0.28} top="65%" left="85%" />
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
          <Stack align="center" gap="xl" py={80}>
            <Badge
              size="lg"
              variant="filled"
              color="orange"
              style={{
                boxShadow: '0 8px 22px -8px rgba(247, 103, 7, 0.45)',
              }}
            >
              Free for macOS 15+
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
                filter:
                  'drop-shadow(0 18px 26px rgba(247, 103, 7, 0.32)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))',
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
                  gradient={{ from: 'orange', to: 'yellow' }}
                >
                  in plain English.
                </TextAnimate>
              </Title>
            </Stack>

            <Text c="dimmed" ta="center" size="xl" maw={640} mx="auto">
              Netfox turns raw network data into plain words. That cryptic
              &quot;ESP-8A2F&quot; is a Shelly relay exposing a web UI on port 80 with no auth — and
              Netfox catches the dev server you accidentally opened to the whole LAN. No cloud, no
              account, all on your Mac.
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
                Free &middot; v{config.app.version} &middot; macOS 15+ &middot; Universal (Apple Silicon + Intel) &middot;
                Signed &amp; notarized
              </Text>
              <Anchor href="/docs/release-notes" c="dimmed" size="sm">
                Release notes
              </Anchor>
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
          </Stack>

          {/* ─── Hero slideshow ─── */}
          {/*
            Four-deep stack showing Overview → Wi-Fi → Devices →
            Security, driven by `@gfazioli/mantine-depth-select` (the
            3D-stack component the user maintains as a Mantine extension).

            Layout notes:
            - The wrapper mirrors the screenshots' 3072×1886 aspect ratio
              and the DepthSelect runs `h="100%"`, so each image fills its
              card exactly. This is what makes the depth peek read — with a
              taller fixed height the image sat top-aligned inside the card
              and the scaled-down cards behind hid entirely behind the front.
            - `translateYStep={72}` overrides the component default (30, tuned
              for short ~200px cards). At our ~675px card height the default
              offset was smaller than the per-level scale shrink, so nothing
              peeked; 72 restores a clear, monotonic upward fan (~31/48/50px
              peeks) that stays within the `mt` headroom above.
            - Built-in controls are off; custom Prev/Next controls sit below
              the stack (the docs' "Custom controls" pattern), driven by the
              controlled `value`/`onChange`.
            - `mt` leaves headroom for the cards that peek above the front one.
          */}
          <Box mt={72} mb={80} maw={1100} mx="auto">
            {/*
              position:relative + the DepthSelect pinned inset:0 inside an
              aspect-ratio box. A bare `h="100%"` doesn't resolve against a
              height that itself comes from `aspect-ratio`, so the stack
              collapsed to 0 — pinning with inset sidesteps the percentage
              chain entirely while still tracking the box's responsive height.
            */}
            <Box style={{ aspectRatio: HERO_SCREEN_RATIO, position: 'relative' }}>
              <DepthSelect
                data={heroSlides}
                value={activeScreen}
                onChange={(value) => setActiveScreen(String(value))}
                visibleCards={4}
                loop
                ariaLabel="Netfox screenshots"
                withControls={false}
                translateYStep={72}
                w="100%"
                h="100%"
                style={{ position: 'absolute', inset: 0 }}
              />
            </Box>

            {/* Custom controls — Prev · label · Next */}
            <Group justify="center" gap="md" mt="xl">
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => stepScreen(-1)}
                aria-label="Previous screenshot"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Text fw={600} c="dimmed" ta="center" w={110}>
                {heroScreens[activeIndex].label}
              </Text>
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => stepScreen(1)}
                aria-label="Next screenshot"
              >
                <IconArrowRight size={18} />
              </ActionIcon>
            </Group>
          </Box>
        </Container>
      </Box>

      {/* ─── The Problem ─── */}
      <ProblemSection />

      {/* ─── The Solution ─── */}
      <SolutionSection />

      {/* ─── Validation / testimonial ─── */}
      <Box py={64}>
        <Container size="sm">
          <Stack align="center" gap="md">
            <Text ta="center" fz={{ base: 24, sm: 30 }} fw={700} style={{ lineHeight: 1.35 }}>
              &ldquo;If you take machine speak and convert it into humanese,{' '}
              <Text span inherit c="orange">
                that&apos;s valuable.
              </Text>
              &rdquo;
            </Text>
            <Text c="dimmed" size="sm" fw={600}>
              Chris Messina &middot; inventor of the hashtag
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* ─── Features ─── */}
      <Box className={accentClasses.sectionBackdrop} py={80}>
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
                    <Text fw={700} size="lg" c="white">
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
        These two sections share a single dark canvas with one Scene
        composition: the logo-anchored mesh drifts across both halves
        (warm anchors top where "Built for macOS" sits, cool anchors
        bottom where the CTA sits), Aurora bands stay warm-only on
        top (the macOS-wallpaper cue for the section identity), and
        Noise adds texture across the whole canvas. The earlier
        StarField + ShootingStar composition under the CTA is removed:
        it visually competed with the mesh and felt like a separate
        world from the section above.
      */}
      <Box
        pos="relative"
        style={{
          backgroundColor: 'var(--mantine-color-dark-8)',
          overflow: 'hidden',
        }}
      >
        <Scene lazy>
          <Scene.Mesh
            stops={[
              { color: 'orange', position: '15% 15%', spread: 50 },
              { color: 'yellow', position: '82% 12%', spread: 45 },
              { color: 'red', position: '50% 40%', spread: 55 },
              // Cool anchors use brand-deep custom hex instead of
              // Mantine theme `violet`/`blue` — `#6d6585` is the
              // muted slate-purple bridge between the warm anchors
              // and the deep navy `#0b183e` which echoes the
              // Netfox logo backdrop.
              { color: '#6d6585', position: '22% 78%', spread: 55 },
              { color: '#0b183e', position: '80% 75%', spread: 60 },
            ]}
            opacity={0.22}
            animate
            duration={40}
          />
          <Scene.Aurora
            colors={['orange', 'yellow', 'red']}
            bands={3}
            position="top"
            opacity={0.22}
          />
          <Scene.Noise opacity={0.018} />
        </Scene>

        <BuiltForMacSection />

        {/* CTA sits in the lower half of the shared canvas, where the
            cool mesh anchors (#6d6585 + #0b183e) take over from the
            warm top. The extra `py={80}` separates it from the
            BuiltForMac content above. */}
        <Box pos="relative" py={80}>
          <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
            <Stack align="center" gap="lg">
              <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
                Get Started
              </Text>
              <Title order={2} ta="center" fz={{ base: 36, sm: 48 }} fw={900} c="white">
                Know your network. Always.
              </Title>
              <Text c="white" ta="center" size="lg" maw={500}>
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
              <Text c="white" size="sm">
                Free &middot; macOS 15 Sequoia or later
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
