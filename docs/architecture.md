# Architecture

## Local MVP

```text
src/data/shipments.ts       Fictional records and offered dates
src/engine/types.ts         Domain contracts and future provider boundary
src/engine/conversation.ts  Pure deterministic request → state transition
src/components/             Shared UI, component tests, and stories
src/App.tsx                 One state owner, session storage, mode/focus lifecycle
src/styles.css              Tailwind theme, reusable visual patterns, responsive rules
src/tests/                  Test setup, structural axe and contrast checks
.storybook/                 Docs, interaction/a11y configuration
```

The UI owns one ConversationState. Both typed input and suggested actions call the same `send` function. A short local delay exposes the loading state; then `respond` clones the previous state, recognizes intent, resolves entities/context, validates eligibility, and returns the next state plus an assistant message. No network call is made.

Messages contain optional structured shipment snapshots, confirmation proposals, escalation summaries, and actions. Presentation components render these typed values without deciding business eligibility. `ConversationContext` holds active shipment, current intent, pending clarification, pending confirmation, and retry request. A pending confirmation identifies its shipment explicitly, so it cannot accidentally apply to a subsequently selected shipment.

Only confirmation applies mock address/date changes. Cancellation discards proposals. Reset restores fresh cloned records. The one-shot error flag is consumed during lookup and offers Retry. Local analytics are append-only events inside the same session state; no analytics service is connected.

Display mode is a separate UI state (`minimized`, `panel`, `expanded`). The app conditionally displays one assistant instance and changes its layout class. It never creates a second engine or chat history. The browser session snapshot is written to sessionStorage when state changes; storage failures fall back to memory.

## Why these choices

- A pure engine supports fast tests without React, network access, or an LLM.
- One state owner prevents layouts from disagreeing on active shipments or pending changes.
- Typed message payloads keep shipment cards and confirmations reusable in Storybook.
- Historical cards are snapshots, preserving what the user saw at each turn.
- Shared Tailwind tokens and component CSS keep both layouts visually consistent.
- Native controls and contained focus support keyboard users without a UI framework.
- `IntentProvider` is an asynchronous-capable extension boundary; the current deterministic implementation is local. A future provider should propose typed intent/entities; it must not execute shipment mutations.

## Phase 2 design — not implemented

Proposed flow: browser → same-origin Netlify Function → input/policy validation → OpenAI API intent proposal → schema and business validation → existing response components. Keep a deterministic fallback for timeout, rejection, invalid output, or service failure.

API credentials belong in server-side Netlify runtime environment settings. Never use a browser-exposed `VITE_` variable for a secret. Use a restricted project credential, rotation procedures, and operational monitoring. Official background: [API keys and service accounts](https://developers.openai.com/api/docs/guides/api-keys).

A narrow function/structured-output schema should allow only the supported intent enum and bounded entity fields. Strict schemas improve output shape reliability; application code still must validate eligibility and authorization. See [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling). These are architectural proposals, not active integrations.

Before enabling:

1. Validate request shape, content length, session identifier, tracking-number format, and permitted enum values. Reject malformed data before calling the model.
2. Apply per-session and per-origin/IP rate limits using server-side storage; enforce request, token, time, and daily spending budgets. Return a recoverable bounded error when limits are reached.
3. Permit only record lookup, delay explanation, proposal creation, cancellation, and explicit confirmation. No arbitrary fetch, shell, tool names, or model-directed writes.
4. Treat user messages, shipment descriptions, and model output as untrusted data. Keep instructions separate from data; ignore attempts to change policy, reveal secrets, or invent actions. Do not rely on prompting as the only defense.
5. Keep authoritative shipment state and eligibility checks server-side before any future real action. Bind a pending proposal to a session, shipment, immutable replacement value, and expiry; recheck on confirmation. Add idempotency and replay protection.
6. Never infer authorization from a model response. A visible explicit user confirmation must be tied to the validated proposal before execution. A production system would need an authorization design; authentication remains out of the MVP.
7. Minimize data sent to the provider. Add consent, retention rules, redacted logs, and privacy review before any use of customer data. Current demo data is fictional.
8. Map provider timeouts, refusals, invalid schema, rate limits, and unavailable data to safe deterministic recovery responses. Do not fabricate shipment facts.
9. Extend adversarial, ambiguous-intent, cancellation, and stale-proposal evaluations. Preserve the existing deterministic test suite and add server boundary tests.

## Netlify delivery plan

No site or account has been registered and no deployment has occurred. After owner review and the outstanding browser/a11y verification, use `npm ci && npm run build` with publish directory `dist`. Publish Storybook separately using `npm run build-storybook` with publish directory `storybook-static`. Add server functions only in Phase 2 after the policies above are implemented and reviewed. Deployment requires explicit owner approval under P2.
