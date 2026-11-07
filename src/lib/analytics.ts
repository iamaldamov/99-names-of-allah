import * as amplitude from '@amplitude/analytics-browser';

// Browser API keys are designed to be public. Never put an Amplitude Secret Key here.
const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '2573210735d7e437f404f97d02644e92';
let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  amplitude.init(API_KEY, {
    autocapture: false,
    defaultTracking: false,
    trackingOptions: { ipAddress: false },
  });
  initialized = true;
}

export function trackAnalytics(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!initialized) return;
  amplitude.track(event, properties);
}


export type DiagnosticErrorType =
  | 'javascript_error'
  | 'unhandled_rejection'
  | 'catalog_load_failed'
  | 'session_check_failed'
  | 'progress_load_failed'
  | 'progress_sync_failed'
  | 'progress_save_failed'
  | 'auth_failed'
  | 'signout_failed';

export function reportAnalyticsError(
  errorType: DiagnosticErrorType,
  source: 'window' | 'catalog' | 'session' | 'progress' | 'auth' | 'signout',
): void {
  if (!initialized) return;
  // Send only a fixed category and source. Never send messages, stack traces,
  // URLs, user identifiers, form values, tokens, or other user content.
  amplitude.track('diagnostic_error', { error_type: errorType, source });
}
