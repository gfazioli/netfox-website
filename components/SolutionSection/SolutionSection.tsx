'use client';

import {
  IconArrowRight,
  IconBolt,
  IconDeviceLaptop,
  IconHome,
  IconPrinter,
  IconRouter,
  IconServer,
} from '@tabler/icons-react';
import { Badge, Box, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';

// Mock device snapshot that mirrors how Netfox renders the sidebar —
// but the point here is the ENRICHMENT: each row pairs the raw identity
// with a plain-English `detail` (what it is / what it exposes), and two
// rows show the signal Netfox surfaces that a router never would (a
// decoded mystery device with no auth, an accidentally-exposed dev DB).
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
    name: 'HomePod — Living Room',
    detail: 'Apple HomePod · AirPlay',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconBolt,
    name: 'Shelly relay',
    detail: 'was “ESP-8A2F” · web UI on :80',
    state: 'No auth',
    stateColor: 'red',
    online: true,
    risk: true,
  },
  {
    icon: IconServer,
    name: 'dev-server.local',
    detail: 'Postgres :5432 · reachable from the whole LAN',
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
  return (
    <Box
      py={80}
      style={{
        backgroundColor: 'var(--mantine-color-dark-8)',
      }}
    >
      <Container size="lg">
        <Stack align="center" gap="md" mb={40}>
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

        {/* Before → after: the literal "machine speak → humanese" translation */}
        <Group justify="center" gap="xl" mb={44} wrap="wrap">
          <Stack gap={4} align="center">
            <Text size="xs" tt="uppercase" fw={700} c="gray.5" style={{ letterSpacing: 2 }}>
              Your router shows
            </Text>
            <Text c="gray.5" fz={{ base: 14, sm: 18 }} style={{ fontFamily: 'monospace' }}>
              ESP-8A2F · 192.168.1.40
            </Text>
          </Stack>
          <IconArrowRight size={28} color="var(--mantine-color-orange-5)" />
          <Stack gap={4} align="center">
            <Text size="xs" tt="uppercase" fw={700} c="orange" style={{ letterSpacing: 2 }}>
              Netfox tells you
            </Text>
            <Text c="white" fw={600} fz={{ base: 14, sm: 18 }} style={{ fontFamily: 'monospace' }}>
              Shelly relay · web UI :80 · no auth
            </Text>
          </Stack>
        </Group>

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
                      device.risk
                        ? 'var(--mantine-color-red-4)'
                        : 'var(--mantine-color-dark-2)'
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
