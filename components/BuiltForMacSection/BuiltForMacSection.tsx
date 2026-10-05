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
import { revealItem, revealScope } from '@/components/Motion/Reveal';
import { ScrollNumber } from '@/components/Motion/ScrollNumber';
import { useReveal } from '@/components/Motion/useReveal';

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
  // The heading lifts in, the 100 rolls up from zero, and the pills pop in one
  // after another, as if the list were being ticked off.
  const reveal = useReveal<HTMLDivElement>();
  const scope = revealScope(reveal);
  const heading = revealItem('rise');
  const closing = revealItem('rise', 300 + techPills.length * 70);

  return (
    <Container size="lg" pos="relative" style={{ zIndex: 1 }} py={80}>
      <Stack
        ref={reveal.ref}
        align="center"
        gap="md"
        className={scope.className}
        data-armed={scope['data-armed']}
        data-revealed={scope['data-revealed']}
      >
        <Text
          size="sm"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: 3, ...heading.style }}
          c="orange"
          className={heading.className}
          data-reveal={heading['data-reveal']}
        >
          Built for macOS
        </Text>
        <Title
          order={2}
          ta="center"
          fz={{ base: 32, sm: 42 }}
          fw={900}
          className={heading.className}
          data-reveal={heading['data-reveal']}
          style={heading.style}
        >
          <ScrollNumber value="100" delay={250} />% native SwiftUI. Fast. Familiar. Yours.
        </Title>

        <Group justify="center" gap="sm" mt="lg" maw={700}>
          {techPills.map((pill, k) => (
            <Badge
              key={pill.label}
              {...revealItem('pop', 300 + k * 70)}
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

        <Text
          c="dimmed"
          ta="center"
          size="lg"
          maw={600}
          mt="lg"
          className={closing.className}
          data-reveal={closing['data-reveal']}
          style={closing.style}
        >
          No Electron. No web wrapper. A real macOS app that feels like it belongs on your Mac.
        </Text>
      </Stack>
    </Container>
  );
}
