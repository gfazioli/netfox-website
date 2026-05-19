'use client';

import {
  IconEye,
  IconKeyboard,
  IconMenu2,
  IconCpu,
  IconDeviceDesktop,
  IconCode,
} from '@tabler/icons-react';
import { Badge, Container, Group, Stack, Text, Title } from '@mantine/core';

const techPills = [
  { label: 'SwiftUI', icon: IconCode },
  { label: 'macOS Notifications', icon: IconEye },
  { label: 'Keyboard Shortcuts', icon: IconKeyboard },
  { label: 'Context Menus', icon: IconMenu2 },
  { label: 'Universal Binary', icon: IconDeviceDesktop },
  { label: 'Apple Silicon', icon: IconCpu },
  { label: 'Intel Support', icon: IconDeviceDesktop },
];

/**
 * Inner content only. The outer `Box pos="relative"` and the `Scene`
 * composition (mesh + aurora + noise) live in `Welcome.tsx`, because
 * this section visually shares one continuous Scene with the "Get
 * Started" CTA that immediately follows. Splitting the scenes across
 * two components produced a visible seam between sections.
 */
export function BuiltForMacSection() {
  return (
    <Container size="lg" pos="relative" style={{ zIndex: 1 }} py={80}>
      <Stack align="center" gap="md">
        <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
          Built for macOS
        </Text>
        <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900} c="white">
          100% native SwiftUI. Fast. Familiar. Yours.
        </Title>

        <Group justify="center" gap="sm" mt="lg" maw={700}>
          {techPills.map((pill) => (
            <Badge
              key={pill.label}
              size="xl"
              variant="light"
              color="gray"
              radius="xl"
              leftSection={<pill.icon size={16} />}
              styles={{
                root: {
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              {pill.label}
            </Badge>
          ))}
        </Group>

        <Text c="white" ta="center" size="lg" maw={600} mt="lg">
          No Electron. No web views. A real macOS app that feels like it belongs on your Mac.
        </Text>
      </Stack>
    </Container>
  );
}
