import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  reporter: "list",
  timeout: 30000,
  outputDir: "./test-results",
  use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
  webServer: {
    command:
      "node ../../web/node_modules/vite/bin/vite.js --config ../../web/src/features/admin/vite.config.js",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: !process.env.CI,
  },
});
