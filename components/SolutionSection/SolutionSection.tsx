'use client';

import { IconDeviceLaptop, IconDeviceMobile, IconDeviceTv, IconHome, IconPrinter, IconRouter } from '@tabler/icons-react';
import { Badge, Box, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';

// Mock device snapshot that mirrors how Netfox itself renders the
// sidebar — kind icon, hostname, IP, online dot. Stays in sync with
// the actual app loosely; this is marketing, not a faithful clone.
const devices = [
  {
    icon: IconDeviceLaptop,
    name: 'Giovambattista’s Mac Studio',
    ip: '192.168.1.12',
    state: 'This Mac',
    stateColor: 'orange',
    online: true,
  },
  {
    icon: IconRouter,
    name: 'Router',
    ip: '192.168.1.1',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconHome,
    name: 'HomePod Living Room',
    ip: '192.168.1.33',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconDeviceTv,
    name: 'BRAVIA 4K',
    ip: '192.168.1.4',
    state: 'Online',
    stateColor: 'teal',
    online: true,
  },
  {
    icon: IconDeviceMobile,
    name: 'iPad Pro',
    ip: '192.168.1.191',
    state: 'Offline',
    stateColor: 'gray',
    online: false,
  },
  {
    icon: IconPrinter,
    name: 'HP ENVY 7640',
    ip: '192.168.1.27',
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
        <Stack align="center" gap="md" mb={48}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            The Solution
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900} c="white">
            One window. Every device. Live.
          </Title>
        </Stack>

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
            <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
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
                  <device.icon size={18} color="var(--mantine-color-dark-2)" />
                  <Stack gap={0}>
                    <Text size="sm" c="gray.3">
                      {device.name}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {device.ip}
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
                      backgroundColor: device.online
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
