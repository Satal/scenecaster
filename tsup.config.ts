import { defineConfig } from "tsup";

export default defineConfig([
  // Main library
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "node18",
    platform: "node",
    external: [
      "react",
      "react-dom",
      "remotion",
      "@remotion/bundler",
      "@remotion/renderer",
      "@remotion/media-utils",
      "playwright",
    ],
  },
  // CLI entry (with shebang)
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    sourcemap: true,
    target: "node18",
    platform: "node",
    banner: {
      js: "#!/usr/bin/env node",
    },
    external: [
      "react",
      "react-dom",
      "remotion",
      "@remotion/bundler",
      "@remotion/renderer",
      "@remotion/media-utils",
      "playwright",
    ],
  },
]);
