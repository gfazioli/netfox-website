'use client';

import type { ReactNode } from 'react';
import { IconBolt, IconChartArea } from '@tabler/icons-react';
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

// SIX places name these modules, not three. The count in this note used to
// say three -- here, the RoadmapTimeline component, and the app's own
// Optimization screen. Grepping the module names across both repos on
// 2026-09-03 found the rest:
//
//   1. Netfox/OptimizationSection.swift   the canonical list
//   2. Netfox/HomeSection.swift   the Overview's roadmap teaser
//   3. content/tools/optimization.mdx this table
//   4. components/RoadmapTimeline/RoadmapTimeline.tsx
//   5. content/index.mdx  "the upcoming module wave"
//   6. content/getting-started.mdxthe same phrase
//
// Two of them (2, and 5 with 6) were still calling Wi-Fi diagnostics
// upcoming a release after it shipped. content/keyboard-shortcuts.mdx makes
// the same claim without naming anything, so it cannot drift on names but
// does go stale on the premise.
//
// A comment enumerating the copies is itself a copy, and this one drifted
// the same way. Nothing here derives from a machine-readable fact, so the
// only net that finds them all is a grep for the module NAMES across both
// repos, run whenever one of them moves. A shipped module leaves the app's
// list entirely, since that one answers "what is not built yet" rather than
// "what happened".
const modules: { icon: ReactNode; title: string; tier: Tier; body: ReactNode }[] = [
  {
    icon: <IconChartArea size={18} />,
    title: 'Bandwidth monitor',
    tier: 'Up next',
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
    tier: 'Then',
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
