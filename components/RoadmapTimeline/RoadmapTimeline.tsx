'use client';

import type { ReactNode } from 'react';
import { IconBolt, IconChartArea, IconPlugConnected, IconWifi } from '@tabler/icons-react';
import { Badge, Group, Text, Timeline } from '@mantine/core';

/**
 * The committed module sequence, rendered as a vertical timeline — the
 * same Mantine `<Timeline>` primitive the Release Notes use, so the two
 * pages read as a pair: release notes are the versioned *past*, this is
 * the de-versioned *future*. No version numbers or dates by design —
 * "the order is the promise". The first item (Up next) is the active
 * one; the rest dim out ahead of it. Vaguer "Further out" directions
 * stay as prose in the MDX, below this timeline.
 */
type Tier = 'Up next' | 'Then' | 'Later' | 'Backlog';

const tierColor: Record<Tier, string> = {
  'Up next': 'orange',
  Then: 'blue',
  Later: 'grape',
  Backlog: 'gray',
};

const modules: { icon: ReactNode; title: string; tier: Tier; body: ReactNode }[] = [
  {
    icon: <IconWifi size={18} />,
    title: 'Wi-Fi diagnostics',
    tier: 'Up next',
    body: (
      <>
        The Wi-Fi tab today is a basic neighbour list. The next module turns it into a real
        diagnostics tool: signal-strength history, channel usage, congestion warnings, hidden
        network detection. Goal: answer &ldquo;is my Wi-Fi the problem?&rdquo; without leaving
        Netfox.
      </>
    ),
  },
  {
    icon: <IconPlugConnected size={18} />,
    title: 'Link diagnostics',
    tier: 'Then',
    body: (
      <>
        Physical-layer health. Cable speed negotiation, duplex mismatch warnings, NIC stats, route
        latency. For people who plug their Mac in and want to know whether the wall jack is letting
        them down.
      </>
    ),
  },
  {
    icon: <IconChartArea size={18} />,
    title: 'Bandwidth monitor',
    tier: 'Later',
    body: (
      <>
        Per-device traffic accounting in real time. The biggest single lift on the roadmap because
        it needs a privileged background helper to read packet metadata — the helper itself is
        reusable for several follow-up features, so the slot also unlocks more advanced security
        signals. (The menu bar&rsquo;s traffic chart already shows your <em>Mac&rsquo;s</em>{' '}
        throughput — this module extends that to every device on the network.)
      </>
    ),
  },
  {
    icon: <IconBolt size={18} />,
    title: 'Speed test',
    tier: 'Backlog',
    body: (
      <>
        A built-in speed test (download / upload / latency / jitter / packet loss). Nice to have,
        but not the differentiator — Netfox&rsquo;s job is what&rsquo;s on <em>your</em> network,
        and free speed-test sites already do this well. We&rsquo;ll fold it in when the surrounding
        modules need a reference for &ldquo;what should this look like?&rdquo;.
      </>
    ),
  },
];

export function RoadmapTimeline() {
  return (
    <Timeline active={0} bulletSize={32} lineWidth={4} color={tierColor[modules[0].tier]} mt={24}>
      {modules.map((m) => (
        <Timeline.Item
          key={m.title}
          bullet={m.icon}
          title={
            <Group gap={8} wrap="nowrap" align="center">
              <Text fw={700}>{m.title}</Text>
              <Badge size="sm" variant="light" color={tierColor[m.tier]}>
                {m.tier}
              </Badge>
            </Group>
          }
        >
          <Text size="sm" c="dimmed" mt={4}>
            {m.body}
          </Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
