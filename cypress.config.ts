import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    includeShadowDom: true,
    watchForFileChanges: true,
    baseUrl: 'http://localhost:3000',
    video: false,
    screenshotOnRunFailure: false,
  },
})
