'use client';

import { useState } from 'react';
import { Scene } from '@gfazioli/mantine-scene';
import { TextAnimate } from '@gfazioli/mantine-text-animate';
import {
  IconDownload,
  IconArrowRight,
  IconBell,
  IconClock,
  IconDeviceDesktop,
  IconNetwork,
  IconRadar,
  IconShieldLock,
} from '@tabler/icons-react';
import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import config from '@/config';
import { FAQ } from '../FAQ/FAQ';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
import { AccentCard, GradientIcon } from '../AccentCard/AccentCard';
import accentClasses from '../AccentCard/AccentCard.module.css';
import { RadarPulse } from '../RadarPulse/RadarPulse';
import classes from './Welcome.module.css';

/**
 * Click-to-zoom screenshot. The thumbnail uses a `drop-shadow` filter so
 * the soft halo follows the rounded macOS chrome already baked into the
 * PNG's alpha channel; clicking opens a fullscreen Modal where the same
 * image renders constrained to 95vw/95vh with `object-fit: contain` so
 * landscape and portrait shots both fit. Same pattern as findergit-website
 * — kept here in a slimmed form because all hero/feature shots will need
 * it.
 */
function ZoomableScreenshot({
  src,
  alt,
  shadowOpacity = 0.55,
}: {
  src: string;
  alt: string;
  shadowOpacity?: number;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened(true)}
        aria-label={`Open enlarged screenshot: ${alt}`}
        style={{ display: 'block', width: '100%', cursor: 'zoom-in' }}
      >
        <Image
          src={src}
          alt={alt}
          display="block"
          style={{
            width: '100%',
            height: 'auto',
            filter: `drop-shadow(0 30px 60px rgba(0, 0, 0, ${shadowOpacity}))`,
          }}
        />
      </UnstyledButton>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        fullScreen
        withCloseButton
        padding={0}
        radius={0}
        transitionProps={{ transition: 'fade', duration: 180 }}
        styles={{
          content: { backgroundColor: 'transparent', boxShadow: 'none' },
          body: {
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            minHeight: '100vh',
          },
          header: {
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            zIndex: 10,
            padding: 0,
            minHeight: 0,
          },
          close: { color: 'white' },
        }}
      >
        <Image
          src={src}
          alt={alt}
          onClick={() => setOpened(false)}
          style={{
            maxWidth: '95vw',
            maxHeight: '95vh',
            width: 'auto',
            height: 'auto',
            cursor: 'zoom-out',
            objectFit: 'contain',
          }}
        />
      </Modal>
    </>
  );
}

/**
 * Each feature's `accent` is consumed by `AccentCard` as the
 * `--card-accent` CSS variable — drives the radial gradient on
 * the card, the icon chip gradient, and the hover glow. Mantine
 * theme tokens (`*-5`) used uniformly so the cards stay in
 * lockstep with the project palette (a future theme tweak shifts
 * every accent automatically).
 */
const features = [
  {
    icon: IconRadar,
    title: 'Multi-Source Discovery',
    description:
      'Bonjour, ARP and active probing run together. Apple devices, dumb IoT, quiet hosts — all in the same list.',
    accent: 'var(--mantine-color-orange-5)',
  },
  {
    icon: IconClock,
    title: 'Per-Device History',
    description:
      'First seen, last seen, every online/offline transition. Timeline survives across launches.',
    accent: 'var(--mantine-color-blue-5)',
  },
  {
    icon: IconBell,
    title: 'New-Device Alerts',
    description:
      'In-app inbox plus native macOS notifications. Persistent log of everything that ever fired.',
    accent: 'var(--mantine-color-yellow-5)',
  },
  {
    icon: IconDeviceDesktop,
    title: 'Native macOS',
    description: 'Built in SwiftUI for macOS 15+. Follows system appearance. Universal binary.',
    accent: 'var(--mantine-color-grape-5)',
  },
  {
    icon: IconNetwork,
    title: 'No Account, No Cloud',
    description: 'Data stays on your Mac. No telemetry, no sign-up, no vendor lock-in.',
    accent: 'var(--mantine-color-cyan-5)',
  },
  {
    icon: IconShieldLock,
    title: 'Signed & Notarized',
    description:
      'Developer ID + Apple notarization. Gatekeeper accepts it on first open, no security workarounds.',
    accent: 'var(--mantine-color-green-5)',
  },
];

export function Welcome() {
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
          <Scene.Noise opacity={0.022} />
        </Scene>
        {/*
          Wi-Fi pulse — concentric arcs blooming upward from the
          bottom-centre of the hero. Fills the `Scene.Radar`-shaped
          gap in mantine-scene; lives inline here for now so we
          can iterate before deciding whether to upstream it.
        */}
        <RadarPulse
          origin="50% 100%"
          shape="arc"
          color="var(--mantine-color-orange-4)"
          count={4}
          interval={1.5}
          duration={6}
          maxRadius="1400px"
          strokeWidth={2}
          peakOpacity={0.4}
        />
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
              w={{ base: 120, sm: 160, md: 200 }}
              h={{ base: 120, sm: 160, md: 200 }}
              style={{
                filter:
                  'drop-shadow(0 18px 26px rgba(247, 103, 7, 0.32)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))',
              }}
            />

            <Title maw="90vw" mx="auto" className={classes.title} ta="center">
              Know who&apos;s on your network —{' '}
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
                always.
              </TextAnimate>
            </Title>

            <Text c="dimmed" ta="center" size="xl" maw={640} mx="auto">
              Netfox is a native macOS network monitor. Every connected device, when it joined, and
              what&apos;s new — at a glance. No cloud, no account, no telemetry.
            </Text>

            <Group justify="center" mt="md">
              <Button
                href={config.app.downloadUrl}
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
          </Stack>

          {/* ─── Hero screenshot ─── */}
          {/*
            Hero screenshot pulled from /public/screenshot-hero.png. The
            release motion (scripts/release.sh) is wired to auto-stage
            anything matching public/screenshot-*.png so swapping the
            shot in a future build doesn't need a separate commit.
          */}
          <Box mt={32}>
            <ZoomableScreenshot
              src="/screenshot-hero.png"
              alt="Netfox — Network monitor for macOS"
              shadowOpacity={0.7}
            />
          </Box>
        </Container>
      </Box>

      {/* ─── The Problem ─── */}
      <ProblemSection />

      {/* ─── The Solution ─── */}
      <SolutionSection />

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
              <AccentCard key={feature.title} accent={feature.accent}>
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
        Waves at the bottom pan cool tones underneath the CTA — the
        bottom-up horizon line gives the CTA a "ride this in" feel.
        The earlier StarField + ShootingStar composition under the
        CTA is removed: it visually competed with the mesh + felt
        like a separate world from the section above.
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
          <Scene.Aurora colors={['orange', 'yellow', 'red']} bands={3} position="top" opacity={0.22} />
          <Scene.Noise opacity={0.018} />
        </Scene>

        <BuiltForMacSection />

        {/* CTA content sits in the lower half so the Waves anchor it */}
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
              href={config.app.downloadUrl}
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
