'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    // The fox, sampled from the app icon (k-means over public/icon-512x512.png):
    // amber #FC9F1B at 6, orange #DA5B06 at 7, rust #8B2F08 at 9. Overriding
    // Mantine's own `orange` rather than adding a colour, so every
    // color="orange" and every c="orange" on the site takes the logo's fire.
    // 6 is the FILLED shade: amber, which carries dark text (autoContrast)
    // at about 11:1, where white on the old orange-6 read 2.6.
    orange: [
      '#fff4e3',
      '#ffe6c2',
      '#ffd497',
      '#ffc066',
      '#fdae3e',
      '#fca22a',
      '#fc9f1b',
      '#da5b06',
      '#b04407',
      '#8b2f08',
    ],
  },
  autoContrast: true,
  headings: {
    fontWeight: '600',
  },
  defaultRadius: 'md',
});
