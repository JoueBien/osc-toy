import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      thresholds: {
        autoUpdate: true,
        lines: 85.21,
        functions: 79.54,
        branches: 72.22,
        statements: 85.21,
      },
    },
  },
});
