import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkipNavContent } from 'nextra/components';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { goodiesShop } from '@/lib/goodies';

/**
 * Kept out of search results and out of the sitemap while the shop is a test:
 * the page exists only where `lib/goodies.ts` finds its environment, which is
 * not production yet.
 */
export const metadata: Metadata = {
  title: 'Netfox Goodies',
  description:
    'Netfox Goodies: the Netfox Drift screen saver and wallpapers for your Mac, in one pack. Every purchase helps keep Netfox free.',
  robots: { index: false, follow: false },
};

export default function GoodiesPage() {
  const shop = goodiesShop();
  if (!shop) {
    notFound();
  }

  return (
    <>
      <SkipNavContent />
      <main>
        <Container size="sm" py={64}>
          <Stack gap="lg">
            <Title order={1}>Netfox Goodies</Title>
            <Text size="lg">
              A pack of extras made from Netfox&apos;s world: the Netfox Drift screen saver, an
              endless flight through a luminous 3D world with the pixel fox along for the ride, and
              a set of wallpapers for your Mac.
            </Text>
            <Text>
              Every purchase helps keep Netfox free. Your download page always serves the latest
              version of the pack.
            </Text>
            <Text c="dimmed" size="sm">
              €5, VAT included. One-time purchase. The screen saver requires macOS 15.6 or later.
            </Text>
            <div>
              <Button component="a" href={shop.paymentLinkUrl} size="lg" rel="nofollow">
                Buy Netfox Goodies
              </Button>
            </div>
          </Stack>
        </Container>
      </main>
    </>
  );
}
