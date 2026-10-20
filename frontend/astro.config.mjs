// @ts-check
import 'dotenv/config';

import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import alpinejs from '@astrojs/alpinejs';

import node from '@astrojs/node';

const IMAGE_DOMAIN = process.env.IMAGE_DOMAIN || 'localhost';
const IMAGE_PROTOCOL = process.env.IMAGE_PROTOCOL || 'https';
const IMAGE_HOST = process.env.IMAGE_HOST || 'localhost';
const SITE_URL = process.env.SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

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
  }),

  image: {
    domains: [IMAGE_DOMAIN],
    remotePatterns: [
      {
        protocol: IMAGE_PROTOCOL === 'https' ? 'https' : 'http',
        hostname: IMAGE_HOST,
      },
    ],
  },
});