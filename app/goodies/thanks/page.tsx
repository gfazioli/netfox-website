import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SkipNavContent } from 'nextra/components';
import { Anchor, Button, Container, Stack, Text, Title } from '@mantine/core';
import { checkSession, goodiesShop } from '@/lib/goodies';

const SUPPORT_EMAIL = 'hello@undolog.com';

/**
 * Where the Payment Link sends a buyer after paying, with the Checkout Session
 * id in `session_id`. The id is the buyer's key to the download, so the page
 * sends no referrer anywhere and stays out of search results.
 */
export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function GoodiesThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const shop = goodiesShop();
  if (!shop) {
    notFound();
  }

  const { session_id: raw } = await searchParams;
  const sessionId = typeof raw === 'string' ? raw : '';
  const check = sessionId ? await checkSession(shop, sessionId) : 'unpaid';

  return (
    <>
      <SkipNavContent />
      <main>
        <Container size="sm" py={64}>
          {check === 'paid' ? (
            <Stack gap="lg">
              <Title order={1}>Thank you!</Title>
              <Text size="lg">
                Netfox Goodies is yours, and your receipt is on its way by email.
              </Text>
              <div>
                <Button
                  component="a"
                  href={`/api/goodies/download?session_id=${encodeURIComponent(sessionId)}`}
                  size="lg"
                  rel="nofollow noreferrer"
                >
                  Download Netfox Goodies
                </Button>
              </div>
              <Text>
                The download includes instructions for installing the screen saver and setting the
                wallpapers. Bookmark this page: its link keeps working, and always serves the latest
                version of the pack.
              </Text>
              <Text c="dimmed" size="sm">
                {'Something wrong? Write to '}
                <Anchor href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Anchor>
                {' with your receipt number.'}
              </Text>
            </Stack>
          ) : (
            <Stack gap="lg">
              <Title order={1}>
                {check === 'unavailable' ? 'One moment, please' : 'We could not confirm a purchase'}
              </Title>
              <Text>
                {check === 'unavailable'
                  ? 'We could not check your payment just now. Reload this page in a minute.'
                  : 'This link does not match a completed purchase. If you have just paid, reload this page in a few seconds.'}
              </Text>
              <Text c="dimmed" size="sm">
                {'Still stuck? Write to '}
                <Anchor href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Anchor>
                {' with your receipt number.'}
              </Text>
            </Stack>
          )}
        </Container>
      </main>
    </>
  );
}
