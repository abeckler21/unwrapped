import * as Sentry from '@sentry/nextjs'

// Client-side error tracking — lower priority than server-side.
// Set NEXT_PUBLIC_SENTRY_DSN in Vercel env vars to enable.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Low sample rate — client errors are high volume
  tracesSampleRate: 0.05,

  environment: process.env.VERCEL_ENV ?? 'development',

  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
})
