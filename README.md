# Shipment Support AI

An independent, fictional logistics support prototype for exploring conversational UX. Parcelway is an invented service identity. No proprietary branding, customer data, real shipment API, live LLM, authentication, payments, or voice features are used.

## Run locally

Use Node.js 22.12+ or Node.js 24 LTS and npm. Tested here with Node 24.22.0.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Enter a tracking number to see its result directly on the page, or open the chat icon in the bottom-right corner (its label appears on hover or keyboard focus). The app starts minimized. Expand and minimize controls share a single conversation; Reset is the only action that clears it. Messages and simulated changes persist in sessionStorage for the current browser-tab session. If storage is unavailable, in-memory conversations still work.

## Commands

| Command                           | Purpose                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                     | Start local application                                                         |
| `npm run typecheck`               | TypeScript check                                                                |
| `npm test`                        | Engine, component, conversation, structural accessibility, contrast checks      |
| `npm run build`                   | Typecheck and production Vite build in `dist/`                                  |
| `npm run storybook`               | Start Storybook at http://localhost:6006                                        |
| `npm run build-storybook`         | Generate component documentation in `storybook-static/`                         |
| `npx playwright install chromium` | Install browser needed by Storybook tests                                       |
| `npm run test:stories`            | Run all Storybook rendering, play-function, and accessibility tests in Chromium |

The tests require no application services. Installing dependencies and the browser needs network access. On restricted machines, npm can use `--cache /path/to/a/writable/cache`. If Chromium cannot start because the host sandbox blocks macOS process registration, run `npm run test:stories` from a normal local terminal. Do not interpret a browser launch failure as a passed suite.

## Technology

React + TypeScript, Vite, Tailwind CSS v4, Lucide React, Storybook with docs/a11y/Vitest addons, Vitest, React Testing Library, user-event, axe-core, and Playwright for the Storybook browser provider. Exact dependency versions are locked in `package-lock.json`.

## Explore the scenarios

| Scenario       | Try this                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------- |
| A · Track      | “Where is my package?” → `DEMO123456`                                                         |
| B · Context    | “Track DEMO234567” → “Why is it late?”                                                        |
| C · Address    | Track `DEMO123456` → “Change delivery address” → sample fictional address → Confirm or Cancel |
| D · Reschedule | Track `DEMO123456` or `DEMO234567` → “Reschedule delivery” → offered date → Confirm           |
| E · Clarify    | “Can you change it?”                                                                          |
| F · Escalate   | “I need to speak with someone.” → simulated summary; no transfer                              |
| G · Recover    | Open **Try a demo shipment**, enable simulated lookup error, then track a shipment → Retry    |

`DEMO345678` is delivered and ineligible for changes. `DEMO234567` is delayed and allows rescheduling but not rerouting. Unknown numbers produce recovery options. Pending changes cannot be replaced by unrelated messages; confirm or cancel first. Human escalation can summarize a pending request without executing it.

## Components

Storybook documents UserMessage, AssistantMessage, SuggestedPrompt, QuickReply, ShipmentStatusCard, ClarificationPrompt, ConfirmationCard, ErrorMessage, EscalationCard, TypingIndicator, FeedbackControl, and MessageComposer. Applicable variants include interactions, disabled/loading, long content, delayed/delivered states, and mobile viewports. See [design system](docs/design-system.md).

## Documentation

- [Functional requirements and acceptance criteria](docs/functional-requirements.md)
- [Conversation design and example dialogues](docs/conversation-design.md)
- [Bot identity and reusable response patterns](docs/bot-identity.md)
- [Architecture, learning notes, and future integration](docs/architecture.md)
- [Validation report and limitations](docs/validation.md)

## Boundaries and Phase 2

Routing uses deterministic patterns, not production NLP. It recognizes a bounded set of English requests and does not understand arbitrary language. Addresses receive basic format validation only; dates are predefined November 2026 demo values. Statuses and routes do not update in real time. Session storage is local, not a secure or durable customer database; use fictional information only. Feedback and analytics stay in the session state and are never transmitted.

No deployment has been performed. Netlify is the intended future platform for the app and a separate Storybook site, after owner review and approval. Phase 2 is a documented design for secure server-side OpenAI integration through Netlify Functions; it is not implemented or activated.

Download icons at the top of a tracking result and the chat header save tracking details or the conversation as `.txt` files. These downloads are generated locally and do not contact an external service.

## Netlify configuration and readiness

`netlify.toml` sets `npm run build`, publish directory `dist`, Node.js 24, and a non-forced SPA fallback. `public/_redirects` carries the same fallback into manual uploads. No application environment variables are needed for this MVP. See [deployment readiness](docs/deployment-readiness.md) for current verification results and remaining browser-test limitations. Nothing has been deployed.
