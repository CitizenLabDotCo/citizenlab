// Builds the workbench shell into .storybook/static/workbench, which Storybook
// copies into its output, so the shell is served at <storybook>/workbench/.
//
//   npm run ds:workbench
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = __dirname;

export default defineConfig({
  root,
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@ds': path.resolve(root, '../../app/design-system'),
    },
  },
  build: {
    outDir: path.resolve(root, '../static/workbench'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
});
