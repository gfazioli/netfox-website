'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconArrowRight, IconArrowsMaximize, IconX } from '@tabler/icons-react';
import { ActionIcon, Group, Image, Modal, Text, UnstyledButton } from '@mantine/core';
import { revealItem, revealScope } from '@/components/Motion/Reveal';
import { ScrollNumber } from '@/components/Motion/ScrollNumber';
import { useReveal } from '@/components/Motion/useReveal';
import classes from './ToolTour.module.css';

export interface TourFrame {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Short facts under the body, each one taken from the tool's own docs page. */
  figures?: { value: string; label: string }[];
  href: string;
  linkLabel: string;
}

/**
 * The four tools, one row each: the screen on one side, what it is for on the
 * other, alternating. The shape lancetta-website's hero frames take, and for
 * the same reason: a column of identical image-over-caption blocks reads as a
 * gallery, and the alternation is what makes it read as an argument.
 *
 * Every screen is a button that opens it full size. The captures are dense
 * windows, and at half the container they read as screens, not as detail.
 *
 * No mat and no added shadow: the PNGs carry their own window shadow in a
 * transparent margin, and a second shadow cast from that silhouette spreads
 * into a grey smudge (measured on the sibling site).
 */
export function ToolTour({ frames }: { frames: TourFrame[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = (delta: number) =>
    setOpen((i) => (i === null ? i : (i + delta + frames.length) % frames.length));
  const current = open === null ? null : frames[open];

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
    // `step` closes over `frames.length` only, which the dependency tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, frames.length]);

  return (
    <>
      <div className={classes.frames}>
        {frames.map((frame, i) => (
          <TourRow key={frame.src} frame={frame} index={i} onOpen={() => setOpen(i)} />
        ))}
      </div>

      {/*
        A lightbox, not a dialog: no panel, no header, the screen floating on
        the dimmed page at the largest size the viewport holds, with its name
        and the paging under it. A white panel around a dark window was a
        second frame for a picture that already carries its own shadow.
        Clicking anywhere but the screen and its controls closes it, as the
        overlay alone did before.
      */}
      <Modal
        opened={current !== null}
        onClose={() => setOpen(null)}
        withCloseButton={false}
        size="auto"
        centered
        padding={0}
        classNames={{ content: classes.lightbox, body: classes.lightboxBody }}
        overlayProps={{ backgroundOpacity: 0.72, blur: 10 }}
        aria-label={current ? `${current.eyebrow} screenshot` : undefined}
      >
        {current && (
          // `data-autofocus` + tabIndex -1: the focus trap otherwise lands on
          // the close button, and Chrome draws that programmatic focus as a
          // ring, so every open showed the X outlined in orange.
          <div
            className={classes.stage}
            data-autofocus
            tabIndex={-1}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(null);
            }}
          >
            <ActionIcon
              className={classes.close}
              variant="transparent"
              radius="xl"
              size="xl"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              <IconX size={20} />
            </ActionIcon>

            <img src={current.src} alt={current.alt} className={classes.full} />

            <Group justify="center" gap="lg" className={classes.bar}>
              <ActionIcon
                className={classes.nav}
                variant="transparent"
                radius="xl"
                size="xl"
                onClick={() => step(-1)}
                aria-label="Previous screenshot"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div className={classes.caption}>
                <span className={classes.captionName}>{current.eyebrow}</span>
                <span
                  className={classes.captionCount}
                >{`${(open ?? 0) + 1} / ${frames.length}`}</span>
              </div>
              <ActionIcon
                className={classes.nav}
                variant="transparent"
                radius="xl"
                size="xl"
                onClick={() => step(1)}
                aria-label="Next screenshot"
              >
                <IconArrowRight size={20} />
              </ActionIcon>
            </Group>
          </div>
        )}
      </Modal>
    </>
  );
}

/**
 * One row of the tour, revealed as it scrolls into view: the screen slides in
 * from the side it sits on, the copy lifts in after it, and the figures pop in
 * last, their numbers rolling up from zero.
 */
function TourRow({
  frame,
  index,
  onOpen,
}: {
  frame: TourFrame;
  index: number;
  onOpen: () => void;
}) {
  const { ref, revealed } = useReveal<HTMLElement>({ threshold: 0.25 });
  const scope = revealScope(revealed);
  // Even rows put the screen on the left, odd rows on the right (the CSS
  // alternates the grid); below 62em it is one column and either reads fine.
  const shot = revealItem(index % 2 === 0 ? 'left' : 'right');
  const copy = revealItem('rise', 140);

  return (
    <section
      ref={ref}
      className={`${classes.frame} ${scope.className}`}
      data-revealed={scope['data-revealed']}
      aria-label={frame.title}
    >
      <UnstyledButton
        className={classes.shotButton}
        onClick={onOpen}
        aria-label={`Enlarge: ${frame.eyebrow}`}
      >
        <Image
          src={frame.src}
          alt={frame.alt}
          className={`${classes.shot} ${shot.className}`}
          data-reveal={shot['data-reveal']}
          style={shot.style}
        />
        <span className={classes.zoom} aria-hidden>
          <IconArrowsMaximize size={16} />
        </span>
      </UnstyledButton>

      <div
        className={`${classes.copy} ${copy.className}`}
        data-reveal={copy['data-reveal']}
        style={copy.style}
      >
        <Text className={classes.eyebrow}>{frame.eyebrow}</Text>
        <Text className={classes.title} fz={{ base: 26, md: 34 }} lh={1.15} mt={8}>
          {frame.title}
        </Text>
        <Text c="dimmed" fz="lg" lh={1.6} mt={12}>
          {frame.body}
        </Text>

        {frame.figures && (
          <div className={classes.figures}>
            {frame.figures.map((figure, k) => {
              const pop = revealItem('pop', 420 + k * 140);
              return (
                <div
                  key={figure.label}
                  className={`${classes.figure} ${pop.className}`}
                  data-reveal={pop['data-reveal']}
                  style={pop.style}
                >
                  <span className={classes.figureValue}>
                    <ScrollNumber value={figure.value} delay={560 + k * 140} />
                  </span>
                  <span className={classes.figureLabel}>{figure.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <Link href={frame.href} className={classes.link}>
          {frame.linkLabel}
          <IconArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
