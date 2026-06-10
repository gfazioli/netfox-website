'use client';

import { Accordion, Anchor, Text } from '@mantine/core';

const faqItems = [
  {
    value: 'what',
    question: 'What is Netfox?',
    answer:
      'Netfox is a native macOS app that shows you a live list of every device on your home network, with first-seen / last-seen history, alerts when something new connects, port-probe risk badges, and a view of the Wi-Fi networks around you. Five focused tools (Overview, Wi-Fi, Devices, Security, Optimization) share the same store, so a finding in one shows up everywhere it matters.',
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
      'Five discovery passes work in parallel: Bonjour/mDNS (Apple devices, AirPlay, HomeKit, printers), the system ARP cache (anything that has talked on the LAN recently), SSDP (smart-TVs, media servers, UPnP devices), NetBIOS (Windows shares), and active ICMP probing for known IPs (catches devices that are alive but quiet). Results merge into one device record per physical device.',
  },
  {
    value: 'security',
    question: 'What does the Security tool actually check?',
    answer:
      'It opens a TCP connection to a curated list of well-known home-network ports (SSH, Telnet, RDP, VNC, SMB, AFP, NFS, HTTP, HTTPS, MQTT, AirPlay, Plex, MySQL, PostgreSQL, Redis, MongoDB, and a few more) on every device that responds on the LAN. Each open port is classified by risk, and the Risk Inspector explains in plain English what each finding means and what to do about it. You can also add your own custom ports to that list, or run a Full Scan over a wider range (up to all 65,535) on a single device when you want to dig deeper. No raw-socket scanning, no root access, no fingerprinting — just unprivileged TCP probes.',
  },
  {
    value: 'demo-mode',
    question: 'What is Demo Mode?',
    answer:
      'A one-keystroke privacy mask (⌘⇧D) for screenshots, screen-shares, and bug-report attachments. While Demo Mode is on, device names collapse to "Computer #1" / "Phone #2", MAC addresses lose their last three octets (vendor OUI stays), IPv6 loses everything past the first hextet, and Wi-Fi SSIDs become "Network #N". It only affects the UI — the underlying store is untouched, so flipping Demo Mode off restores every real value instantly.',
  },
  {
    value: 'wifi-location',
    question: 'Why does the Wi-Fi tool ask for Location permission?',
    answer:
      "Apple gates SSID details behind Location permission at the macOS level — without it, the system returns empty network names. Netfox uses location only to read the Wi-Fi neighbour list; it doesn't track or store your physical position. If you decline, the Wi-Fi tool shows a one-click button to open Location Settings and waits.",
  },
  {
    value: 'privacy',
    question: 'Does Netfox send my data anywhere?',
    answer:
      'No. Everything Netfox sees lives on your Mac. No cloud account, no telemetry, no usage analytics. The app only talks to GitHub for update checks (no identifying information attached to that request) and to a public-IP lookup service (only if you enable the "Show my public IP" toggle in Settings — off by default).',
  },
  {
    value: 'modify',
    question: 'Does Netfox change anything on my network?',
    answer:
      "Read-only by default. Discovery uses ICMP echo (standard ping) for active probing — that's the only outbound traffic the regular passes generate. The Security tool, when you run it, opens short TCP connections to well-known ports and closes them immediately; no scanning, no exploitation, nothing intrusive. Both checks only fire against devices on your own LAN (verified twice, in the UI and in the engine).",
  },
  {
    value: 'cross-network',
    question: 'Does Netfox work across VLANs / guest networks?',
    answer:
      "Only for networks the Mac is currently attached to (any interface — Wi-Fi, Ethernet, Thunderbolt bridge). Devices on an isolated guest network or a different VLAN are invisible to the Mac itself, so Netfox can't see them either — that's a router limitation, not a Netfox one.",
  },
  {
    value: 'updates',
    question: 'How do updates work?',
    answer:
      'Netfox checks for new releases in the background (every 24 hours by default) and prompts you when one is available. Builds are signed with Apple Developer ID and notarized by Apple, so the update installs without a Gatekeeper detour. You can disable the auto-check or trigger a manual one from Settings → Updates.',
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
                issue. Screenshots are very helpful — flip Demo Mode (⌘⇧D) on first if the
                screenshot would otherwise show your real device names.
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
