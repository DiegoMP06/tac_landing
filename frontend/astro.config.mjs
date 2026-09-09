// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import alpinejs from '@astrojs/alpinejs';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
    routing: {
      prefixDefaultLocale: true
    },
  },

  integrations: [react(), alpinejs({entrypoint: './src/entrypoint'})],

  adapter: node({
    mode: 'standalone'
  })
});