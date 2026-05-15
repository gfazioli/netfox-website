'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    // Foxy orange palette derived from the app icon. Ten shades
    // ordered light → dark so Mantine can pick per-component
    // intensities (filled, light, outline, etc.) without
    // hand-holding.
    netfox: [
      '#fff4e6',
      '#ffe8cc',
      '#ffd8a8',
      '#ffc078',
      '#ffa94d',
      '#ff922b',
      '#fd7e14',
      '#f76707',
      '#e8590c',
      '#d9480f',
    ],
  },
  headings: {
    fontWeight: '600',
  },
  defaultRadius: 'md',
});
