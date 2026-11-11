import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/offlister/",
  plugins: [
    react(),
    VitePWA({
      // Never update silently: the app shows an "Update available" dialog.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Offlister",
        short_name: "Offlister",
        description: "Offline to-do and shopping list",
        lang: "en",
        start_url: "/offlister/",
        scope: "/offlister/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#1A1F2B",
        background_color: "#1A1F2B",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // English UI: only latin font subsets are needed offline.
        globIgnores: ["**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2"],
        navigateFallback: "/offlister/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
