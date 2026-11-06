'use client';

import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconMoodSmile,
  IconPhoto,
  IconSunMoon,
  IconVideo,
} from '@tabler/icons-react';
import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { AccentCard, GradientIcon } from '../AccentCard/AccentCard';

/**
 * What the pack holds, one card per kind of thing. A client component only
 * because each card's icon is a component, and a server page cannot hand a
 * function to `GradientIcon`. The words match the pack's own release notes:
 * change them together.
 */
const INSIDE = [
  {
    icon: IconDeviceDesktop,
    accent: 'var(--mantine-color-orange-6)',
    title: 'Three screen savers',
    text: 'Netfox Drift 2.0, a flight through a luminous 3D world. Night Run, the pixel fox running through a landscape that follows your clock and your seasons. Constellation, an invented network written in stars. Drawn by your Mac’s graphics processor at full frame rate, with a preview app to try each one first.',
  },
  {
    icon: IconPhoto,
    accent: 'var(--mantine-color-blue-6)',
    title: 'Six wallpapers',
    text: 'Network Fox, Connected World, Christmas, Tech Waves, Drift Tunnel and Constellation Fox, sized for Mac 5K, Mac 4K and MacBook 16:10 screens.',
  },
  {
    icon: IconSunMoon,
    accent: 'var(--mantine-color-violet-6)',
    title: 'Five dynamic wallpapers',
    text: 'Night Run follows the sun where you are, from dawn to a starry night. Four more turn from day to night with your Mac’s Light and Dark appearance.',
  },
  {
    icon: IconDeviceMobile,
    accent: 'var(--mantine-color-cyan-6)',
    title: 'Four iPhone wallpapers',
    text: 'Network Fox, Connected World, Christmas and Tech Waves, sized for the iPhone’s screen.',
  },
  {
    icon: IconVideo,
    accent: 'var(--mantine-color-teal-6)',
    title: 'Six video-call backgrounds',
    text: 'Every design at 1920×1080, for the calls you take.',
  },
  {
    icon: IconMoodSmile,
    accent: 'var(--mantine-color-pink-6)',
    title: 'Pixel-fox emoji',
    text: 'The fox standing, waving and walking, with outlined versions for dark themes, for your chats and workspaces.',
  },
];

export function GoodiesInside() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
      {INSIDE.map((item) => (
        <AccentCard key={item.title} accent={item.accent} h="100%" still>
          <Stack gap="md" align="flex-start">
            <GradientIcon icon={item.icon} />
            <Title order={3} fz="lg" fw={700}>
              {item.title}
            </Title>
            <Text c="dimmed" size="sm">
              {item.text}
            </Text>
          </Stack>
        </AccentCard>
      ))}
    </SimpleGrid>
  );
}
