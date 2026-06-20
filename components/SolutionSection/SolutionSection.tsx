'use client';

import { useEffect, useRef, useState } from 'react';
import {
  IconArrowDown,
  IconBolt,
  IconDeviceLaptop,
  IconHome,
  IconPrinter,
  IconRouter,
  IconServer,
} from '@tabler/icons-react';
import {
  Badge,
  Box,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import classes from './SolutionSection.module.css';

// The before → after conversion, as a sequence of cards (Chris Messina's
// note: show the transformation, don't just say it in text). Stored as
// plain data so the `·` / `—` / quotes read literally without JSX-entity
// escaping. Every "after" stays inside the shipped-app capability boundary
// (see Netfox DIRECTION.md): vendor from the MAC OUI, a coarse category,
// open ports from the catalog, and the HTTP `Server` banner — no
// product-level fingerprinting and no "no-auth" labels. The strongest two
// (a decoded mystery gadget, an accidentally-exposed dev database) lead.
const transforms = [
  {
    before: 'ESP-8A2F · 192.168.1.40',
    after: 'Espressif gadget · web server on :80 · lighttpd',
    pill: 'Open :80',
    pillColor: 'orange',
  },
  {
    before: 'dev-server.local · 0.0.0.0:5432',
    after: 'PostgreSQL exposed to the whole LAN — not just localhost',
    pill: 'Exposed',
    pillColor: 'red',
  },
  {
    before: 'HP ENVY 7640',
    after: 'HP printer · IPP + web admin open',
    pill: 'Online',
    pillColor: 'teal',
  },
  {
    before: 'unknown · Ac:DE:48:23:6f:1a',
    after: 'Apple · AirPlay speaker · “Living Room”',
    pill: 'Online',
    pillColor: 'teal',
  },
];

// Mock device snapshot that mirrors how Netfox renders the sidebar —
// but the point here is the ENRICHMENT: each row pairs the raw identity
// with a plain-English `detail` (what it is / what it exposes), and two
// rows show the signal Netfox surfaces that a router never would (a
// decoded mystery IoT device with an open web server, and an
// accidentally-exposed dev database).
// Marketing mock, not a faithful clone.
const devices = [
  {
    icon: IconDeviceLaptop,
    name: 'Giovambattista’s Mac Studio',
    detail: 'This Mac · 14 local services',
    state: 'This Mac',
    stateColor: 'orange',
    online: true,
  },
  {
    icon: IconRouter,
    name: 'eero',
    detail: 'Gateway · router',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconHome,
    name: 'Living Room',
    detail: 'Apple · AirPlay speaker',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconBolt,
    name: 'ESP-8A2F',
    detail: 'Espressif · web server on :80 · “lighttpd”',
    state: 'Open :80',
    stateColor: 'red',
    online: true,
    risk: true,
  },
  {
    icon: IconServer,
    name: 'dev-server.local',
    detail: 'PostgreSQL on :5432 · open on the LAN',
    state: 'Exposed',
    stateColor: 'red',
    online: true,
    risk: true,
  },
  {
    icon: IconPrinter,
    name: 'HP ENVY 7640',
    detail: 'HP printer · IPP, web admin',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
];

export function SolutionSection() {
  // One-shot reveal: a single observer on the grid flips `revealed`, then
  // CSS staggers each card's "after" via its inline --reveal-delay. Reveal
  // immediately when IntersectionObserver is unavailable so the content is
  // never stranded hidden.
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      py={80}
      style={{
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <Container size="lg">
        <Stack align="center" gap="md" mb={48}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            The Solution
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900} c="white">
            The same network — finally readable.
          </Title>
          <Text c="gray.5" ta="center" size="lg" maw={620} mx="auto">
            Netfox enriches every device — vendor, real identity, and what it’s exposing — and flags
            what your router never would. See it in a full window or right from the menu bar.
          </Text>
        </Stack>

        {/* Before → after, as a sequence of cards: the literal
            "machine speak → humanese" translation, shown not told. */}
        <SimpleGrid
          ref={gridRef}
          cols={{ base: 1, sm: 2, lg: 4 }}
          spacing="lg"
          mb={48}
          className={revealed ? classes.revealed : undefined}
        >
          {transforms.map((t, i) => (
            <Paper
              key={t.before}
              radius="lg"
              p="lg"
              bg="var(--mantine-color-dark-7)"
              style={{
                border: '1px solid var(--mantine-color-dark-5)',
                ['--reveal-delay' as string]: `${i * 120}ms`,
              }}
            >
              <Stack gap="md" h="100%">
                {/* before — raw machine data, deliberately cryptic */}
                <Box className={classes.before}>
                  <Text
                    size="xs"
                    tt="uppercase"
                    fw={700}
                    c="gray.6"
                    style={{ letterSpacing: 2 }}
                    mb={6}
                  >
                    Your router shows
                  </Text>
                  {/* Reserve two lines so the one-line values (ESP-8A2F,
                      HP ENVY) take the same height as the wrapping two-line
                      ones (dev-server.local, the MAC) — keeps the arrow
                      marker aligned across all four cards. */}
                  <Text
                    c="gray.5"
                    fz={14}
                    style={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                      lineHeight: 1.5,
                      minHeight: '3em',
                    }}
                  >
                    {t.before}
                  </Text>
                </Box>

                {/* transform marker */}
                <Group gap="xs" align="center" wrap="nowrap">
                  <Box
                    style={{ flex: 1, height: 1, backgroundColor: 'var(--mantine-color-dark-4)' }}
                  />
                  <ThemeIcon size="sm" radius="xl" variant="light" color="orange">
                    <IconArrowDown size={14} />
                  </ThemeIcon>
                  <Box
                    style={{ flex: 1, height: 1, backgroundColor: 'var(--mantine-color-dark-4)' }}
                  />
                </Group>

                {/* after — Netfox's plain-English read */}
                <Box className={classes.after} style={{ marginTop: 'auto' }}>
                  <Text
                    size="xs"
                    tt="uppercase"
                    fw={700}
                    c="orange"
                    style={{ letterSpacing: 2 }}
                    mb={6}
                  >
                    Netfox tells you
                  </Text>
                  {/* Reserve three lines so the shorter reads take the same
                      height as the longest (the exposed-Postgres card) —
                      keeps the "Netfox tells you" label and the pill aligned
                      across all four cards. */}
                  <Text
                    c="white"
                    fw={600}
                    fz={15}
                    style={{ lineHeight: 1.4, minHeight: '4.2em' }}
                    mb={10}
                  >
                    {t.after}
                  </Text>
                  <Badge variant="light" color={t.pillColor} size="sm" radius="sm">
                    {t.pill}
                  </Badge>
                </Box>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Mock window */}
        <Paper
          radius="lg"
          bg="var(--mantine-color-dark-7)"
          style={{ overflow: 'hidden', border: '1px solid var(--mantine-color-dark-5)' }}
          maw={800}
          mx="auto"
        >
          {/* Title bar */}
          <Group
            px="md"
            py="sm"
            bg="var(--mantine-color-dark-6)"
            style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
          >
            <Group gap={8}>
              <Box w={12} h={12} style={{ borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <Box w={12} h={12} style={{ borderRadius: '50%', backgroundColor: '#febc2e' }} />
              <Box w={12} h={12} style={{ borderRadius: '50%', backgroundColor: '#28c840' }} />
            </Group>
            <Text size="sm" c="gray.5" style={{ fontFamily: 'monospace' }}>
              Netfox — Your Network
            </Text>
          </Group>

          {/* Device list */}
          <Stack gap={0} px="lg" py="md">
            {devices.map((device) => (
              <Group
                key={device.name}
                justify="space-between"
                py="sm"
                style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}
              >
                <Group gap="sm">
                  <device.icon
                    size={18}
                    color={
                      device.risk ? 'var(--mantine-color-red-4)' : 'var(--mantine-color-dark-2)'
                    }
                  />
                  <Stack gap={0}>
                    <Text size="sm" c="gray.3">
                      {device.name}
                    </Text>
                    <Text size="xs" c="gray.5">
                      {device.detail}
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Badge variant="light" color={device.stateColor} size="sm" radius="sm">
                    {device.state}
                  </Badge>
                  <Box
                    w={10}
                    h={10}
                    style={{
                      borderRadius: '50%',
                      backgroundColor: device.risk
                        ? 'var(--mantine-color-red-5)'
                        : device.online
                          ? 'var(--mantine-color-teal-5)'
                          : 'var(--mantine-color-gray-6)',
                    }}
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
