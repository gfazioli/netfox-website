import { Box, type BoxProps } from '@mantine/core';
import config from '@/config';
import classes from './DirectoryBadges.module.css';

/**
 * The badges of the directories Netfox is listed on (`config.directoryBadges`),
 * ported from findergit.app, where it was built to move between the sites
 * unchanged: a new listing is one entry in the config.
 *
 * Lazy, unlike the rest of the hero: React 19 preloads, at the top of the
 * document, every `<img>` the server renders without `loading="lazy"`, and an
 * eager badge was fetched beside the hero's logo while it sat under the fold
 * on a laptop and on a phone alike (2026-09-29 audit). A lazy image near the
 * viewport is still fetched as soon as the page is laid out; it is just no
 * longer queued ahead of what the hero is made of.
 *
 * The links carry no `nofollow`, `sponsored` or `ugc`: a directory that checks
 * its backlink refuses a link marked with any of them. And no `noreferrer`,
 * the site's usual pairing: a directory counts the visits it sends, and not
 * every link here has UTM parameters to count them by.
 *
 * Style props (`mt`, ...) pass through; a `className` is not taken, since the
 * row's own class would replace it.
 */
export function DirectoryBadges(props: Omit<BoxProps, 'className'>) {
  return (
    <Box {...props} className={classes.badges}>
      {config.directoryBadges.map((badge) => (
        <a key={badge.name} href={badge.href} target="_blank" rel="noopener">
          <img
            className={classes.badge}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            loading="lazy"
          />
        </a>
      ))}
    </Box>
  );
}
