import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry CLI output during builds
  silent: true,

  // Do not upload source maps unless SENTRY_AUTH_TOKEN is explicitly set.
  // Add SENTRY_AUTH_TOKEN as a Vercel env var (Production only) if you want
  // stack traces resolved in the Sentry UI.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
