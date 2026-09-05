// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["mock-aws-s3", "aws-sdk", "nock", "bcrypt", "@mapbox/node-pre-gyp"],
      },
    },
    ssr: {
      external: ["mock-aws-s3", "aws-sdk", "nock", "bcrypt", "@mapbox/node-pre-gyp"],
    },
    server: {
      proxy: {
        // Proxy all /api requests to the Express backend
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log("[Proxy] Backend not reachable:", err.message);
            });
          },
        },
      },
    },
  },
});
