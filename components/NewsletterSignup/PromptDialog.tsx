'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { NewsletterCallToAction } from './NewsletterCallToAction';
import { PROMPT_OPEN_ATTRIBUTE } from './prompt-open';

/**
 * The newsletter prompt's dialog, in a chunk of its own: `NewsletterModal`
 * loads it only when the prompt opens, and it opens as it mounts. Imported
 * with the page, Mantine's Modal (its transition, focus trap and scroll lock)
 * was 18 KiB of script on every page of the site (Lighthouse, local production
 * build, 2026-10-19), for a dialog most visits never open and a visitor who
 * has closed it never sees again.
 */
export default function PromptDialog({ onClose }: { onClose: () => void }) {
  // Mounted closed, then opened: a Mantine transition that starts open has
  // nothing to play, and the prompt would appear without its pop. No portal
  // for the same reason: a portal draws nothing until its own effect has run,
  // the same effect pass as this one, so the transition first rendered open
  // (measured in Chrome: scale 1 from the first frame, against findergit.app's
  // 0.9). The prompt is mounted at the end of <body> already.
  const [opened, setOpened] = useState(false);
  useEffect(() => setOpened(true), []);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }
    document.documentElement.setAttribute(PROMPT_OPEN_ATTRIBUTE, 'open');
    return () => document.documentElement.removeAttribute(PROMPT_OPEN_ATTRIBUTE);
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setOpened(false);
        onClose();
      }}
      withinPortal={false}
      centered
      size="md"
      radius="lg"
      overlayProps={{ blur: 2 }}
      transitionProps={{ transition: 'pop' }}
      // On the element with role="dialog", which has no title to be named by.
      // A plain `aria-label` lands on the modal's root <div>, where it names
      // nothing (read in Chrome, 2026-10-19).
      attributes={{ content: { 'aria-label': 'Subscribe to the Netfox newsletter' } }}
      // The button the focus lands on as it opens: an icon alone names nothing.
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <NewsletterCallToAction />
    </Modal>
  );
}
