'use client';

import { IconRouter, IconTerminal2, IconCloud } from '@tabler/icons-react';
import { Box, Container, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';

const problems = [
  {
    icon: IconRouter,
    title: 'Router admin pages',
    description: 'Show MACs and IPs, but ',
    highlight: 'dated UI and no history',
    rest: '. You only see what’s online right now.',
    color: 'blue',
  },
  {
    icon: IconTerminal2,
    title: 'Terminal tools',
    description: 'Give precise data, but ',
    highlight: 'no big picture',
    rest: '. One scan at a time, results never persist.',
    color: 'teal',
  },
  {
    icon: IconCloud,
    title: 'Vendor cloud apps',
    description: 'Beautiful, but ',
    highlight: 'send your data to the cloud',
    rest: ' and lock you into one router brand.',
    color: 'grape',
  },
];

export function ProblemSection() {
  return (
    <Box py={80}>
      <Container size="lg">
        <Stack align="center" gap="md" mb={48}>
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: 3 }} c="orange">
            The Problem
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            Seeing who&apos;s on your network shouldn&apos;t require a cloud account
          </Title>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {problems.map((item) => (
            <Paper key={item.title} p="xl" radius="lg" bg="var(--mantine-color-default)" withBorder>
              <Stack gap="md">
                <ThemeIcon size={48} radius="md" color={item.color} variant="filled">
                  <item.icon size={26} />
                </ThemeIcon>
                <Text fw={700} size="lg">
                  {item.title}
                </Text>
                <Text c="dimmed" size="sm">
                  {item.description}
                  <Text component="span" c="red" fw={600} size="sm" td="underline">
                    {item.highlight}
                  </Text>
                  {item.rest}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
