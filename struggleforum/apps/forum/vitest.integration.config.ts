import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.integration.test.ts"],
    setupFiles: ["./src/test/integration/setup.ts"],
    // Integration tests share one real database via a truncate-between-tests
    // reset, so they can't run concurrently with each other.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
