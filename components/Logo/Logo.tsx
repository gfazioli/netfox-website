import NextImage from 'next/image';
import { Image } from '@mantine/core';

/**
 * The app icon at logo size, through next/image: a 36px mark was the 28 KB
 * 128px PNG, preloaded from the <head> of every page (2026-09-29 audit); served
 * at the size it is drawn it is a few KB of WebP. Lazy unless `eager`, which
 * only the navbar's copy, above the fold, asks for.
 */
export function Logo({ size = 36, eager = false }: { size?: number; eager?: boolean }) {
  return (
    <Image
      component={NextImage}
      src="/icon-128x128.png"
      alt="Netfox"
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      w={size}
      h={size}
      style={{ borderRadius: size > 48 ? 12 : 8 }}
    />
  );
}
