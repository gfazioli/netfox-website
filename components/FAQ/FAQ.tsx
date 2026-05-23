'use client';

import { Accordion, Anchor, Text } from '@mantine/core';

const faqItems = [
  {
    value: 'what',
    question: 'What is Netfox?',
    answer:
      'Netfox is a native macOS app that shows you a live list of every device on your home network, with first-seen / last-seen history and alerts when something new connects.',
  },
  {
    value: 'free',
    question: 'Is Netfox free?',
    answer: 'sponsor',
  },
  {
    value: 'macos',
    question: 'What macOS version do I need?',
    answer:
      'macOS 15 (Sequoia) or later. Netfox is built with SwiftUI and uses APIs available from macOS 15+.',
  },
  {
    value: 'how-detects',
    question: 'How does Netfox find devices?',
    answer:
      'Three discovery passes work in parallel: Bonjour/mDNS (Apple devices, AirPlay, HomeKit, printers), the system ARP cache (anything that has talked on the LAN recently), and active ICMP probing for known IPs (catches devices that are alive but quiet). Results merge into one device record per physical device.',
  },
  {
    value: 'privacy',
    question: 'Does Netfox send my data anywhere?',
    answer:
      'No. Everything Netfox sees lives on your Mac. No cloud account, no telemetry, no usage analytics. The app only talks to GitHub for update checks (no identifying information attached to that request).',
  },
  {
    value: 'modify',
    question: 'Does Netfox change anything on my network?',
    answer:
      "Read-only by default. The active-probing module sends ICMP echo (standard ping) — that's the only outbound traffic Netfox generates on its own. No port scans, no DHCP poking, nothing intrusive.",
  },
  {
    value: 'cross-network',
    question: 'Does Netfox work across VLANs / guest networks?',
    answer:
      "Only for networks the Mac is currently attached to (any interface — Wi-Fi, Ethernet, Thunderbolt bridge). Devices on an isolated guest network or a different VLAN are invisible to the Mac itself, so Netfox can't see them either — that's a router limitation, not a Netfox one.",
  },
  {
    value: 'bug',
    question: 'I found a bug. How do I report it?',
    answer: 'bug-report',
  },
  {
    value: 'feature',
    question: 'I have an idea for a new feature. Where can I suggest it?',
    answer: 'feature-request',
  },
];

export function FAQ() {
  return (
    <Accordion variant="separated" radius="md">
      {faqItems.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Control>{item.question}</Accordion.Control>
          <Accordion.Panel>
            {item.answer === 'sponsor' ? (
              <Text c="dimmed" size="sm">
                Yes, Netfox is currently free. If you find it useful, consider{' '}
                <Anchor href="https://github.com/sponsors/gfazioli" size="sm">
                  sponsoring the project
                </Anchor>
                .
              </Text>
            ) : item.answer === 'bug-report' ? (
              <Text c="dimmed" size="sm">
                Please open a{' '}
                <Anchor
                  href="https://github.com/gfazioli/netfox-website/issues/new?template=bug_report.yml"
                  size="sm"
                >
                  Bug Report
                </Anchor>{' '}
                on GitHub. Include your Netfox version, macOS version, and steps to reproduce the
                issue. Screenshots are very helpful!
              </Text>
            ) : item.answer === 'feature-request' ? (
              <Text c="dimmed" size="sm">
                We&apos;d love to hear your ideas! Open a{' '}
                <Anchor
                  href="https://github.com/gfazioli/netfox-website/issues/new?template=feature_request.yml"
                  size="sm"
                >
                  Feature Request
                </Anchor>{' '}
                on GitHub and describe what you&apos;d like Netfox to do. The more detail you
                provide, the better we can evaluate and prioritize it.
              </Text>
            ) : (
              <Text c="dimmed" size="sm">
                {item.answer}
              </Text>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
