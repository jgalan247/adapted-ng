import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On GitHub Pages the site is served at /<repo-name>/, so we honour BASE_PATH at build time.
// For local dev and root-host deploys this falls back to '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
