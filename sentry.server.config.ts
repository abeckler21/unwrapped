import * as Sentry from '@sentry/nextjs'

// Add your DSN from sentry.io to Vercel environment variables:
//   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
// Leave unset in dev — Sentry is a no-op when DSN is undefined.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of traces in production to stay within the free quota
  tracesSampleRate: 0.1,

  environment: process.env.VERCEL_ENV ?? 'development',

  // Only enable in production environments
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
})
