import { Kbd } from '@mantine/core';
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { DocsImage } from '@/components/DocsImage/DocsImage';
import { MascotNote } from '@/components/Mascot/MascotNote';
import { ShortcutsTable } from '@/components/ShortcutsTable/ShortcutsTable';

const docsComponents = getDocsMDXComponents();

export const useMDXComponents = (components?: any): any => ({
  ...docsComponents,
  Kbd,
  ShortcutsTable,
  MascotNote,
  img: DocsImage,
  ...components,
});
