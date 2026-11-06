import type { Metadata } from 'next';
import NextImage from 'next/image';
import { notFound } from 'next/navigation';
import { SkipNavContent } from 'nextra/components';
import { Anchor, Box, Button, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import accentClasses from '@/components/AccentCard/AccentCard.module.css';
import classes from '@/components/Goodies/Goodies.module.css';
import { GoodiesFilm } from '@/components/Goodies/GoodiesFilm';
import { GoodiesInside } from '@/components/Goodies/GoodiesInside';
import config from '@/config';
import { GOODIES_PRICE, GOODIES_SUPPORT_EMAIL, goodiesRobots, goodiesShop } from '@/lib/goodies';
import { emailsPurchaseLink } from '@/lib/goodies-mail';

const DESCRIPTION =
  'Three screen savers, wallpapers for Mac and iPhone, video-call backgrounds and pixel-fox emoji from Netfox. Every purchase helps keep Netfox free.';

/**
 * The shop exists only where `lib/goodies.ts` finds its environment, and is
 * indexed only once it takes real payments: a test-mode preview stays out of
 * search results, and production answers 404 until the shop opens. The page
 * is built with the environment it finds, so a changed setting needs a
 * redeploy.
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Netfox Goodies: screen savers, wallpapers and emoji',
    description: DESCRIPTION,
    alternates: { canonical: '/goodies' },
    robots: goodiesRobots(),
    openGraph: {
      ...config.metadata.openGraph,
      url: '/goodies',
      title: 'Netfox Goodies',
      description: DESCRIPTION,
      images: [{ url: '/goodies/goodies-film-poster.jpg', width: 1280, height: 720 }],
    },
  };
}

const WALLPAPERS = [
  ['network-fox', 'Network Fox'],
  ['connected-world', 'Connected World'],
  ['christmas', 'Christmas'],
  ['tech-waves', 'Tech Waves'],
  ['drift-tunnel', 'Drift Tunnel'],
  ['constellation-fox', 'Constellation Fox'],
] as const;

/**
 * The gallery's column, in rem like the layout (Mantine's lg Container, its
 * padding and the grid's gap): one picture a row on a phone, two from 48em,
 * three from 75em, never wider than a third of the 71.25rem container.
 */
const GALLERY_SIZES =
  '(width < 48em) calc(100vw - 2rem), (width < 75em) calc(50vw - 2.5rem), 22rem';

const EYEBROW = {
  size: 'sm',
  fw: 700,
  tt: 'uppercase',
  c: 'orange',
  style: { letterSpacing: 3 },
} as const;

function BuyButton({ href }: { href: string }) {
  return (
    <Button component="a" href={href} size="xl" rel="nofollow">
      {`Buy for ${GOODIES_PRICE}`}
    </Button>
  );
}

export default function GoodiesPage() {
  const shop = goodiesShop();
  if (!shop) {
    notFound();
  }
  const emailsTheLink = emailsPurchaseLink();

  return (
    <>
      <SkipNavContent />
      <main>
        <Container size="lg" py={64}>
          <Stack align="center" gap="lg" ta="center">
            <Text {...EYEBROW}>Netfox Goodies</Text>
            <Title order={1} fz={{ base: 36, sm: 52 }} fw={900} maw={820}>
              Bring the fox to your whole Mac
            </Title>
            <Text c="dimmed" size="xl" maw={680}>
              Three screen savers, wallpapers for every screen, video-call backgrounds and pixel-fox
              emoji, made from Netfox’s world. Every purchase helps keep Netfox free.
            </Text>
            <BuyButton href={shop.paymentLinkUrl} />
            <Text c="dimmed" size="sm">
              {`${GOODIES_PRICE}, VAT included · One-time purchase · The screen savers need macOS 15.6 or later`}
            </Text>
          </Stack>
          <Box mt={48}>
            <GoodiesFilm />
          </Box>
        </Container>

        <Box className={accentClasses.sectionBackdrop} py={64}>
          <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
            <Stack align="center" gap="md" mb={40}>
              <Text {...EYEBROW}>In the pack</Text>
              <Title order={2} ta="center" fz={{ base: 30, sm: 40 }} fw={900}>
                One download, everything inside
              </Title>
            </Stack>
            <GoodiesInside />
          </Container>
        </Box>

        <Container size="lg" py={64}>
          <Stack align="center" gap="md" mb={40}>
            <Text {...EYEBROW}>The designs</Text>
            <Title order={2} ta="center" fz={{ base: 30, sm: 40 }} fw={900}>
              Six pictures, every screen
            </Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {WALLPAPERS.map(([id, name]) => (
              <Stack key={id} gap="xs">
                <NextImage
                  className={classes.picture}
                  src={`/goodies/goodies-wallpaper-${id}.jpg`}
                  alt={`The ${name} wallpaper`}
                  width={1280}
                  height={720}
                  sizes={GALLERY_SIZES}
                  loading="lazy"
                />
                <Text size="sm" fw={600}>
                  {name}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>

        <Container size="sm" py={64}>
          <Stack gap="lg">
            <Title order={2} fz={{ base: 28, sm: 34 }} fw={900}>
              How you get it
            </Title>
            <Text>
              <strong>Pay once.</strong> Checkout is secure, the price includes VAT, and your
              receipt comes by email.
            </Text>
            <Text>
              <strong>Download.</strong> You land on your download page: the Mac disk image holds
              everything, and the pictures also come on their own as a ZIP, for any other system.
            </Text>
            <Text>
              <strong>Come back any time.</strong>
              {emailsTheLink
                ? ' We email you the link to your download page, and it always serves the latest version of the pack.'
                : ' Bookmark your download page: it always serves the latest version of the pack.'}
            </Text>
            <Text>
              <strong>Yours to use.</strong> Everything is licensed for your own devices, for
              yourself and your own work. <Anchor href="/goodies/licence">Read the licence</Anchor>.
            </Text>
          </Stack>
        </Container>

        <Container size="sm" pb={80}>
          <Stack align="center" gap="md" ta="center">
            <Title order={2} fz={{ base: 28, sm: 34 }} fw={900}>
              Every purchase helps keep Netfox free
            </Title>
            <BuyButton href={shop.paymentLinkUrl} />
            <Text c="dimmed" size="sm">
              {'Questions? Write to '}
              <Anchor href={`mailto:${GOODIES_SUPPORT_EMAIL}`}>{GOODIES_SUPPORT_EMAIL}</Anchor>
              {'.'}
            </Text>
          </Stack>
        </Container>
      </main>
    </>
  );
}
