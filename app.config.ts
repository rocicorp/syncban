import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  tsr: {
    appDirectory: "src",
  },
  vite: {
    build: {
      target: "es2022",
    },
    worker: {
      format: "es", // This is the key part
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2022",
      },
      exclude: ["@journeyapps/wa-sqlite", "@powersync/web"],
      include: ["@powersync/web > js-logger"],
    },
    ssr: {
      noExternal: ["@powersync/web", "@powersync/react"],
    },
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
