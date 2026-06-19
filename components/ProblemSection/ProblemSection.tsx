'use client';

import { IconRouter, IconTerminal2, IconCloud } from '@tabler/icons-react';
import { Box, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { AccentCard, GradientIcon, HighlightPill } from '@/components/AccentCard/AccentCard';
import accentClasses from '@/components/AccentCard/AccentCard.module.css';

/**
 * Each entry's `accent` is consumed by `AccentCard` as the
 * `--card-accent` CSS variable: it drives the radial gradient on
 * the card surface, the icon chip gradient, and the hover glow.
 *
 * Mantine theme tokens (`*-5`) sit in the middle of the shade ramp
 * — saturated enough to read on the dark backdrop without going
 * neon at the gentle mix percentages the CSS uses.
 */
const problems = [
  {
    icon: IconRouter,
    title: 'Router & eero apps',
    description: 'List devices by a cryptic name and IP, ',
    highlight: 'but never what they are',
    rest: ' — and never what they’re exposing.',
    accent: 'var(--mantine-color-blue-5)',
  },
  {
    icon: IconTerminal2,
    title: 'Terminal tools',
    description: 'Precise but raw — ',
    highlight: 'you decode the hex yourself',
    rest: ', one scan at a time, nothing kept or explained.',
    accent: 'var(--mantine-color-teal-5)',
  },
  {
    icon: IconCloud,
    title: 'Vendor cloud apps',
    description: 'Prettier dashboards, but they ',
    highlight: 'ship your network to the cloud',
    rest: ' and still only label devices, never explain them.',
    accent: 'var(--mantine-color-grape-5)',
  },
];

export function ProblemSection() {
  return (
    <Box py={80} className={accentClasses.sectionBackdrop}>
      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap="md" mb={48}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            The Problem
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            Seeing your network is easy. Understanding it is the hard part.
          </Title>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {problems.map((item) => (
            <AccentCard key={item.title} accent={item.accent}>
              <Stack gap="md">
                <GradientIcon icon={item.icon} />
                <Text fw={700} size="lg" c="white">
                  {item.title}
                </Text>
                <Text c="dimmed" size="sm">
                  {item.description}
                  <HighlightPill>{item.highlight}</HighlightPill>
                  {item.rest}
                </Text>
              </Stack>
            </AccentCard>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
