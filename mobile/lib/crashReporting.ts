// Crash and error reporting with Sentry.
// Active only in store/preview builds AND when EXPO_PUBLIC_SENTRY_DSN is set
// (EAS environment variable or mobile/.env). Without a DSN it does nothing.
//
// Privacy: no personal data is sent (sendDefaultPii: false) — only the error,
// the screen, the phone model and the OS/app version.
import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
export const crashReportingEnabled = !__DEV__ && !!DSN;

if (crashReportingEnabled) {
  Sentry.init({
    dsn: DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,      // errors only, no performance tracing
    enableAutoSessionTracking: true, // "crash-free users" percentage
  });
}

/** Wraps the root component so render errors are reported (no-op when disabled). */
export function withCrashReporting(Component: React.ComponentType<Record<string, unknown>>) {
  return crashReportingEnabled ? Sentry.wrap(Component) : Component;
}
