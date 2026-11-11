# Validation report

Reviewed November 11, 2026. This is an implemented local MVP; owner review, a complete browser-suite run, and broader accessibility review remain before deployment approval.

## Passing checks

| Check | Result |
| --- | --- |
| TypeScript | `npm run typecheck` passes; also part of the application build |
| Unit/component/conversation/accessibility tests | `npm test`: 64 tests pass across 5 files |
| Production app | `npm run build` passes and emits `dist/` |
| Storybook documentation | `npm run build-storybook` passes and emits `storybook-static/` |
| Local application | Vite serves HTTP 200; rendered experience reviewed in the supported browser |
| Local Storybook | Starts and serves HTTP 200; documentation and variants render |
| Storybook interaction play functions in the supported browser | MessageComposer, ConfirmationCard, FeedbackControl, QuickReply, SuggestedPrompt all show PASS |
| Storybook browser accessibility scans | Those five interaction stories and the delivered ShipmentStatusCard show zero violations and zero inconclusive results |
| Structural accessibility | axe-core checks pass for supporting page, assistant dialog, and representative confirmation/error/status composition in jsdom |
| Text contrast | 10 main foreground/background combinations meet 4.5:1 normal-text contrast in automated ratio checks |

The local suite covers intent synonyms, entity extraction, unknown IDs, ambiguity, context, eligibility, confirmation, cancellation, pending-action protection, error retry, escalation, session restoration, layout transitions, focus containment, composer input, label uniqueness, read-only loading focus, and initial-state restoration.

## Browser review

Reviewed the launcher, desktop panel, expanded workspace, and narrow mobile layout. Confirmed a guided delay request, active shipment retention for a typed follow-up, expanded history preservation, and the persistent composer. Fixed welcome scrolling, small panel text, missing landmarks, duplicate composer IDs in multi-instance documentation, and focus-driven scrolling of the outer shell. The outer shell now uses `overflow: clip`; history has its own scroll container. Browser geometry after the fix placed the header at the viewport top with the composer inside the viewport.

Preview images in the parent outputs directory show the desktop assistant, mobile assistant, and Storybook. They contain fictional demo conversations only.

## Execution limits

`npm run test:stories` was attempted with the Playwright Chromium browser installed. The host macOS sandbox denied Chromium's Mach-port registration before any tests could execute. The command failed at browser launch; the complete 43-story CLI suite is **not verified as passing**. Five interaction stories were then run and checked through the supported browser UI, along with selected accessibility scans. This is useful evidence but does not replace the full command-line run.

On an unrestricted local terminal, run:

```sh
npx playwright install chromium
npm run test:stories
```

Storybook emitted a nonfatal warning because the sandbox disallowed writing its global user settings, and its dev watcher reported file-watch limits. Both local serving and the static build worked. The Storybook build also reports large chunks from documentation/test tooling; the application's own bundle builds successfully.

Axe in jsdom cannot compute browser color contrast; that rule is disabled only in the jsdom structural suite. Explicit contrast-ratio tests and selected real-browser Storybook scans supplement it. Manual screen-reader testing, all responsive zoom/keyboard combinations, all browser engines, and a complete WCAG 2.2 AA audit remain outstanding. No claim of accessibility certification is made.

## Product limitations

- Deterministic English patterns have a finite vocabulary and can misinterpret novel phrasing.
- Addresses have only basic demo format checks; no geocoding or postal validation.
- Shipment facts and date choices are fixed fictional November 2026 records.
- Session storage is local and optional; there is no secure server-side persistence.
- Transfers, delivery updates, and service errors are simulations.
- Analytics and feedback are local state only, without a reporting interface.
- No live AI, real carrier integration, authentication, payments, voice, or deployment.

## Before Phase 2

Owner review of the MVP; full Storybook CLI suite on a host that supports Chromium; screen-reader and broader responsive review; then an explicitly approved deployment plan. Future OpenAI/Netlify Functions boundaries are documented in architecture.md and have not been implemented.

## Task-first layout update

The homepage now starts with a tracking form that reads the shared fictional shipment records, followed by delivery-support actions. Test shipment IDs are available only inside the assistant. Both assistant layouts use a compact introduction and prompts without the decorative welcome heading. The launcher is an icon at rest and reveals its label on hover or keyboard focus. Regression tests cover homepage tracking, hidden test records, and actionable prompts in both layouts. Typecheck, production build, and all 64 local tests pass for this update.

Homepage tracking results and invalid-number feedback now display inline without opening chat. An explicit “Ask about this shipment” action opens the assistant with the selected shipment. Result statuses continue to use both icons and text. The local suite covers invalid-number recovery and confirms that tracking keeps chat minimized.

A compact “Try an example” row below the tracking field now offers the three fictional IDs with status labels. Selecting one fills and focuses the field without submitting or opening chat. Users then choose Track package. The local suite includes this behavior.

Tracking validation feedback now appears above the form. Download controls at the top of tracking results and the chat header save UTF-8 text reports locally; chat export includes structured shipment facts and explicitly labels pending proposals. Export content, download initiation, URL cleanup, error placement, and control availability have automated checks.
