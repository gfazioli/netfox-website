import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import { FAQ, faqItems } from './FAQ';

/**
 * The defect lived on the SERVER, so this renders there. Mantine 9 keeps a
 * closed panel in a React <Activity>, which the server renders as nothing: the
 * page Google fetched carried every question and no answer. A jsdom `render`
 * cannot see it -- on the client a hidden Activity still mounts its children.
 * No `env="test"` either, because that switches Mantine's Collapse to a
 * different branch than the one the site runs.
 */
describe('FAQ server render', () => {
  it('carries every answer in the HTML, not only the questions', () => {
    const html = renderToString(
      <MantineProvider theme={theme}>
        <FAQ />
      </MantineProvider>
    );
    // A one-word answer is a key for an answer drawn with a link ('sponsor').
    const plain = faqItems.filter((i) => i.answer.includes(' '));
    expect(plain.length).toBeGreaterThan(5);
    for (const { question, answer } of plain) {
      expect(html).toContain(question.split(/['"&]/)[0]);
      // The opening words: no quote or ampersand, which renderToString escapes.
      expect(html).toContain(answer.split(/['"&]/)[0].slice(0, 40));
    }
  });
});
