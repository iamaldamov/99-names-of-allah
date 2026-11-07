# Analytics and privacy

The site uses Amplitude project `default` for optional, consent-based product analytics.

- Analytics is off until a visitor explicitly selects **Allow**.
- Selecting **Not now** keeps analytics disabled. The choice is stored on the device and can be changed by clearing the site's local storage.
- No autocapture, session replay, form capture, email, name, account ID, password, free-text answer, exact name ID, or raw answer is sent.
- IP address collection is disabled in the Browser SDK configuration.
- Events describe aggregate product actions only: app opened, lesson opened/completed, review started/answered, pronunciation played, exam started/answered/completed, and stage unlocked.
- Exam events contain only stage number, correctness boolean and final score. They never contain the selected answer or a Name ID.
- The Browser API key is public by design; never add an Amplitude Secret Key to the frontend or repository.


## Error diagnostics

- Diagnostic events are sent only after the visitor explicitly allows analytics.
- The event name is `diagnostic_error`; properties are limited to a fixed error category and a fixed source label.
- Captured categories cover uncaught JavaScript errors, unhandled promise rejections, catalogue loading, session checks, progress loading/sync/save, authentication, and sign-out failures.
- Error messages, stack traces, URLs, email addresses, account/user IDs, form values, passwords, tokens, answers, and name IDs are never sent.
- Visitors who choose **Not now** or have not made a choice do not send analytics or diagnostic events.
