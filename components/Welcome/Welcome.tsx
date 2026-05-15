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
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from '@mantine/core';
import config from '@/config';
import { FAQ } from '../FAQ/FAQ';
import { ProblemSection } from '../ProblemSection/ProblemSection';
import { SolutionSection } from '../SolutionSection/SolutionSection';
import { BuiltForMacSection } from '../BuiltForMacSection/BuiltForMacSection';
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

const features = [
  {
    icon: IconRadar,
    title: 'Multi-Source Discovery',
    description:
      'Bonjour, ARP and active probing run together. Apple devices, dumb IoT, quiet hosts — all in the same list.',
    color: 'orange',
  },
  {
    icon: IconClock,
    title: 'Per-Device History',
    description:
      'First seen, last seen, every online/offline transition. Timeline survives across launches.',
    color: 'blue',
  },
  {
    icon: IconBell,
    title: 'New-Device Alerts',
    description:
      'In-app inbox plus native macOS notifications. Persistent log of everything that ever fired.',
    color: 'yellow',
  },
  {
    icon: IconDeviceDesktop,
    title: 'Native macOS',
    description: 'Built in SwiftUI for macOS 15+. Follows system appearance. Universal binary.',
    color: 'grape',
  },
  {
    icon: IconNetwork,
    title: 'No Account, No Cloud',
    description: 'Data stays on your Mac. No telemetry, no sign-up, no vendor lock-in.',
    color: 'cyan',
  },
  {
    icon: IconShieldLock,
    title: 'Signed & Notarized',
    description:
      'Developer ID + Apple notarization. Gatekeeper accepts it on first open, no security workarounds.',
    color: 'green',
  },
];

export function Welcome() {
  return (
    <>
      {/* ─── Hero ─── */}
      <Box pos="relative" style={{ overflow: 'hidden' }}>
        {/*
          Foxy mesh + a couple of warm glows so the hero reads on white
          (light mode) without becoming garish in dark mode. Mirrors the
          tuning approach from findergit-website's hero, retuned for the
          orange/yellow palette.
        */}
        <Scene lazy>
          <Scene.Mesh
            stops={[
              { color: 'orange', position: '20% 25%', spread: 55 },
              { color: 'yellow', position: '80% 70%', spread: 55 },
              { color: 'red', position: '50% 50%', spread: 70 },
            ]}
            opacity={0.22}
          />
          <Scene.Glow color="orange" size={560} blur={140} opacity={0.4} top="5%" left="-10%" />
          <Scene.Glow color="yellow" size={460} blur={120} opacity={0.32} top="65%" left="85%" />
          <Scene.DotGrid color="gray" opacity={0.14} spacing={32} />
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
      <Container size="lg">
        <Stack align="center" gap="md" mt={80} mb={48}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            Features
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            Everything you need, nothing you don&apos;t
          </Title>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mb={80}>
          {features.map((feature) => (
            <Paper key={feature.title} p="xl" radius="lg" withBorder>
              <Stack gap="xs" align="flex-start">
                <ThemeIcon size={48} radius="md" color={feature.color} variant="light">
                  <feature.icon size={26} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  {feature.title}
                </Text>
                <Text c="dimmed" size="sm">
                  {feature.description}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      {/* ─── Built for macOS ─── */}
      <BuiltForMacSection />

      {/* ─── Get Started CTA ─── */}
      <Box
        pos="relative"
        py={80}
        style={{
          backgroundColor: 'var(--mantine-color-dark-8)',
          overflow: 'hidden',
        }}
      >
        <Scene lazy>
          <Scene.StarField count={{ base: 60, md: 120 }} twinkle opacity={0.7} />
          <Scene.ShootingStar count={2} minInterval={5} maxInterval={12} opacity={0.5} />
          <Scene.Glow color="orange" size={500} blur={170} opacity={0.18} top="30%" left="50%" />
        </Scene>
        <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
          <Stack align="center" gap="lg">
            <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
              Get Started
            </Text>
            <Title order={2} ta="center" fz={{ base: 36, sm: 48 }} fw={900} c="white">
              Know your network. Always.
            </Title>
            <Text c="dimmed" ta="center" size="lg" maw={500}>
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
            <Text c="dimmed" size="sm">
              Free &middot; macOS 15 Sequoia or later
            </Text>
          </Stack>
        </Container>
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
