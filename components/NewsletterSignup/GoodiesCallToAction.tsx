import NextImage from 'next/image';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, Stack, Text, Title } from '@mantine/core';
import { GOODIES_PRICE } from '@/lib/goodies';
import classes from './GoodiesCallToAction.module.css';

/** The app, as in "Netfox Goodies" and "keep Netfox free". */
const APP = 'Netfox';

/** What the pack's emoji are, in the line under the heading. */
const EMOJI = 'pixel-fox emoji';

/**
 * Three of the pack's wallpapers, the goods themselves: the one in front, and
 * the two dealt behind it to its left and right. Not the film's poster, whose
 * words repeat the heading under it.
 */
const PICTURES = {
  front: '/goodies/goodies-wallpaper-network-fox.jpg',
  left: '/goodies/goodies-wallpaper-connected-world.jpg',
  right: '/goodies/goodies-wallpaper-tech-waves.jpg',
};

/**
 * The fill of "See the Goodies": the fox's fire, from the filled buttons'
 * amber to a deeper cut of it. Both carry the button's dark words.
 */
const FILL = 'linear-gradient(90deg, #fdb02e, #f2740b)';

/**
 * The pack's light behind the pictures, for the dialog that holds them
 * (`PromptDialog` lays it on the dialog itself, so it reaches the top edge
 * behind the close button): the picture's own two lights, the ember to the
 * left and the night's indigo to the right. Placed in rem from the top.
 */
export const GOODIES_WASH =
  'radial-gradient(20rem 17rem at 16% 7rem, rgb(242 116 11 / 34%), transparent 72%), ' +
  'radial-gradient(20rem 17rem at 86% 9rem, rgb(91 81 172 / 55%), transparent 72%)';

/**
 * The Goodies in the scroll-triggered prompt (`PromptDialog`), above the
 * newsletter and as a promotion: asked for on 2026-11-27, *"aggiungendo la
 * pubblicità dei goodies oltre che l'iscrizione alla newsletter"*, then on
 * 2026-11-28 *"metti i Goodies prima della newsletter"* and *"deve essere una
 * promozione, quindi dovrebbe attirare l'attenzione e invitare l'utente a
 * cliccare"*. Three of the pack's pictures dealt as a fan, one line of what is
 * in the pack, and the one filled button of the prompt, to `/goodies`. The
 * apps' launch prompt draws the same (UndologUI's `SupportPrompt`), and the
 * stylesheet's header says what moves, once, and what never does.
 *
 * The link moves within the site, and the prompt lives in the root layout,
 * which a client navigation keeps: `onNavigate` closes it, or it would stay
 * open over the shop. It is Link's `onNavigate`, not `onClick`: a Cmd-click
 * opens the shop in a new tab and leaves this one where it was, prompt and
 * all, without starting the day it stays closed.
 *
 * The pictures are a second link to the shop, for the pointer alone: they are
 * decorative (the heading names the pack), so the link is hidden from a screen
 * reader and out of the Tab order, and the button under it is the one both
 * get. They load only when the prompt opens, since the dialog is a chunk of
 * its own.
 *
 * The line under the block divides it from the newsletter, and goes with it:
 * on the shop's own pages, where the Goodies are left out, there is none.
 */
export function GoodiesCallToAction({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Stack
      gap="xs"
      align="center"
      className={classes.goodies}
      style={{ '--goodies-fill': FILL } as React.CSSProperties}
    >
      <Link
        href="/goodies"
        prefetch={false}
        onNavigate={onNavigate}
        className={classes.fan}
        tabIndex={-1}
        aria-hidden
      >
        <Picture src={PICTURES.left} className={classes.left} sizes="16rem" />
        <Picture src={PICTURES.right} className={classes.right} sizes="16rem" />
        <Picture src={PICTURES.front} className={classes.front} sizes="16rem" />
        <Sparkle className={classes.sparkleOne} />
        <Sparkle className={classes.sparkleTwo} />
        <Sparkle className={classes.sparkleThree} />
      </Link>
      <Title order={2} size="h2" ta="center">
        {`${APP} Goodies`}
      </Title>
      <Text c="dimmed" ta="center" size="sm" maw={420}>
        {`Screen savers, wallpapers and ${EMOJI} for your Mac, ${GOODIES_PRICE} once. Every purchase helps keep ${APP} free.`}
      </Text>
      <Button
        component={Link}
        href="/goodies"
        prefetch={false}
        onNavigate={onNavigate}
        size="md"
        rightSection={<IconArrowRight size={18} className={classes.arrow} />}
        radius="xl"
        mt="xs"
        className={classes.cta}
      >
        See the Goodies
      </Button>
    </Stack>
  );
}

/** One card of the fan: a wallpaper at its own 16:9, cut to the card's corners. */
function Picture({ src, className, sizes }: { src: string; className: string; sizes: string }) {
  return (
    <span className={`${classes.card} ${className}`}>
      <NextImage
        src={src}
        alt=""
        width={1280}
        height={720}
        sizes={sizes}
        className={classes.picture}
      />
    </span>
  );
}

/** A four-pointed sparkle, in the current colour. */
function Sparkle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${classes.sparkle} ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12Z"
      />
    </svg>
  );
}
