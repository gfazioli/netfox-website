'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@mantine/core';
import { GOODIES_WASH, GoodiesCallToAction } from './GoodiesCallToAction';
import { NewsletterCallToAction } from './NewsletterCallToAction';
import { PROMPT_OPEN_ATTRIBUTE } from './prompt-open';

/**
 * The newsletter prompt's dialog, in a chunk of its own: `NewsletterModal`
 * loads it only when the prompt opens, and it opens as it mounts. Imported
 * with the page, Mantine's Modal (its transition, focus trap and scroll lock)
 * was 18 KiB of script on every page of the site (Lighthouse, local production
 * build, 2026-10-19), for a dialog most visits never open and a visitor who
 * has closed it does not see again for a day.
 *
 * The Goodies first, as the promotion (`GoodiesCallToAction`), and the
 * newsletter under them, quiet: except on the shop's own pages, where the
 * Goodies would point at the page behind the overlay and the newsletter is
 * alone, as it is in the footer.
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
  // Read as it opens and kept: the link to the shop closes the prompt as it
  // navigates there, and the Goodies must not vanish while it fades out.
  const pathname = usePathname();
  const [inShop] = useState(() => pathname?.startsWith('/goodies') ?? false);
  const close = () => {
    setOpened(false);
    onClose();
  };

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
      onClose={close}
      withinPortal={false}
      centered
      size="md"
      radius="lg"
      overlayProps={{ blur: 2 }}
      transitionProps={{ transition: 'pop' }}
      // On the element with role="dialog", which has no title to be named by.
      // A plain `aria-label` lands on the modal's root <div>, where it names
      // nothing (read in Chrome, 2026-10-19).
      attributes={{
        content: {
          'aria-label': inShop
            ? 'Subscribe to the Netfox newsletter'
            : 'The Netfox newsletter and Goodies',
        },
      }}
      // The button the focus lands on as it opens: an icon alone names nothing.
      closeButtonProps={{ 'aria-label': 'Close' }}
      // The pack's light, on the dialog itself so it reaches the top edge: the
      // header over it is clear, or its own ground would cut the light off
      // above the pictures.
      styles={
        inShop
          ? undefined
          : {
              content: { backgroundImage: GOODIES_WASH, backgroundRepeat: 'no-repeat' },
              header: { backgroundColor: 'transparent' },
            }
      }
    >
      {!inShop && <GoodiesCallToAction onNavigate={close} />}
      <NewsletterCallToAction quiet={!inShop} />
    </Modal>
  );
}
