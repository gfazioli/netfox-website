'use client';

import { useEffect, useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconArrowsMaximize } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Text,
  UnstyledButton,
} from '@mantine/core';
import classes from './ScreenshotGallery.module.css';

export interface Screenshot {
  src: string;
  label: string;
  alt: string;
}

/**
 * The app's screens side by side, each one a button that opens it full size.
 *
 * A grid rather than a stack: the screens are the product, and a stack shows
 * one and hides three behind it. Two columns rather than four, because these
 * are dense windows: at a quarter of the container they fall to ~270px, where
 * nothing in them reads; at half they read as screens, and the modal is there
 * for the detail.
 *
 * `ratio` is the captures' own aspect, applied to every tile so a screen of a
 * different shape cannot make one row taller than the other.
 */
export function ScreenshotGallery({ screens, ratio }: { screens: Screenshot[]; ratio: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = (delta: number) =>
    setOpen((i) => (i === null ? i : (i + delta + screens.length) % screens.length));
  const current = open === null ? null : screens[open];

  // Arrow keys page through while the modal is open. On the window rather than
  // on the modal's body, because focus lands on the close button in the header
  // when the modal opens, outside anything a local handler would cover.
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // `step` closes over `screens.length` only, which the effect's own
    // dependency already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, screens.length]);

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
        {screens.map((screen, i) => (
          <UnstyledButton
            key={screen.src}
            className={classes.tile}
            onClick={() => setOpen(i)}
            aria-label={`Enlarge: ${screen.label}`}
          >
            <Box className={classes.frame} style={{ aspectRatio: ratio }}>
              <Image src={screen.src} alt={screen.alt} className={classes.image} />
              <span className={classes.zoom} aria-hidden>
                <IconArrowsMaximize size={16} />
              </span>
            </Box>
            <Text fw={600} size="sm" mt="sm" ta="center">
              {screen.label}
            </Text>
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <Modal
        opened={current !== null}
        onClose={() => setOpen(null)}
        size="90rem"
        centered
        radius="lg"
        title={current?.label}
        classNames={{ title: classes.modalTitle }}
        overlayProps={{ backgroundOpacity: 0.6, blur: 6 }}
      >
        {current && (
          <Box>
            <Image src={current.src} alt={current.alt} radius="md" />
            <Group justify="center" gap="md" mt="md">
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => step(-1)}
                aria-label="Previous screenshot"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Text c="dimmed" size="sm" w={60} ta="center">
                {`${(open ?? 0) + 1} / ${screens.length}`}
              </Text>
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => step(1)}
                aria-label="Next screenshot"
              >
                <IconArrowRight size={18} />
              </ActionIcon>
            </Group>
          </Box>
        )}
      </Modal>
    </>
  );
}
