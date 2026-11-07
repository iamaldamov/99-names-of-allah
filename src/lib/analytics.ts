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
