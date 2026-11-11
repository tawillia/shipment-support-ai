# Functional requirements

P1 is the functional baseline; P2 supersedes its original centered-only layout. One assistant owns all three display modes. All information is fictional.

| ID    | Requirement and acceptance criterion                                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Welcome names supported tasks and shows exactly five actionable starters.                                                                                                   |
| FR-02 | Typed messages use the same engine as buttons; messages survive mode changes and same-tab refresh where sessionStorage is available.                                        |
| FR-03 | Patterns and synonyms route tracking, delay, address, rescheduling, and human-support requests. Unit tests cover all intents.                                               |
| FR-04 | Active shipment, intent, clarification, and confirmation persist between turns. “Why is it late?” reuses active context.                                                    |
| FR-05 | Demo tracking numbers are normalized and checked against the mock record map. Unknown numbers offer examples.                                                               |
| FR-06 | Cards show tracking number, labeled status, latest update, route, and delivery estimate or explicit missing-estimate message.                                               |
| FR-07 | Only the latest assistant response exposes contextual quick replies. Welcome starters disappear after the first completed turn.                                             |
| FR-08 | Ambiguous input produces one question with specific choices.                                                                                                                |
| FR-09 | Mock eligibility gates address changes and rescheduling before collection. Delivered shipments cannot change.                                                               |
| FR-10 | A pending proposal is displayed separately; only an explicit affirmative applies it. Unrelated input cannot overwrite it.                                                   |
| FR-11 | Unsupported input, invalid numbers, and one-shot simulated lookup failure have recovery paths. Retry does not require re-entering the number.                               |
| FR-12 | Human support creates a copyable summary stating that no real transfer occurred. It includes active shipment and any unconfirmed change.                                    |
| FR-13 | Welcome/empty conversation, loading indicator, disabled sending, error, confirmation, success, and cancellation are distinct states.                                        |
| FR-14 | Named controls, visible focus, keyboard navigation, polite conversation log, labeled statuses, contrast checks, Escape to minimize, and focus return support accessibility. |
| FR-15 | Helpful/not helpful toggle buttons acknowledge feedback to screen readers.                                                                                                  |
| FR-16 | Intent, clarification, completion, failure, escalation, and feedback events are appended to local state.                                                                    |

## Display-state acceptance

- Launcher opens a right-side panel on desktop. The fictional webpage remains visible.
- Expand uses the same assistant component, engine, state, and history with a centered conversation column.
- Minimize and restore preserve pending proposals and shipment mutations.
- On narrow screens the assistant fills the viewport; history scrolls while the composer stays outside that scroll area.
- The assistant behaves as a modal support workspace while open: background content is inert, Tab stays within the assistant, and Escape restores the launcher.
- Reset asks for confirmation, then clears history, context, analytics, simulated error settings, and modified mock data.

## Scope and exclusions

Included: local simulation, finite English intent routing, three demo shipments, address collection, predefined dates, basic address validation, component documentation, automated tests, and future integration design.

Excluded: real tracking, carrier branding, production NLP, authentication, real customer records, real transfers, live AI, payments, voice, and deployment. Production security and full assistive-technology certification are outside this prototype; review requirements are recorded in the validation report.
