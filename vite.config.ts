import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import "dotenv/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("s-"),
        },
      },
    }),
    nodePolyfills(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: "chunk-analysis.html",
    }),
    vueJsx(),
  ],
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks: {
          "function-plot": ["function-plot"],
          prettier: [
            "prettier",
            "prettier/plugins/babel",
            "prettier/plugins/estree",
          ],
          vendor: ["vue", "pinia", "vue-i18n", "vue-draggable-plus"],
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
    ],
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  server: {
    allowedHosts: [process.env.DEVHOST ?? "localhost"],
  },
});
