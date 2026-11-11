# Design system and learning notes

## Tokens

`src/styles.css` imports Tailwind v4 and defines shared `@theme` tokens: navy `#142B49`, interactive blue `#2563EB`, success teal `#0F766E`, neutral surface `#F4F7FB`, and warning foreground `#92400E`. Warning amber from the proposal was darkened for small-text contrast. Status backgrounds are pale blue, amber, and teal. CSS variables also define border, muted text, focus, bubble radius, and panel shadow. Tailwind utilities handle common layout and spacing; named CSS components handle recurring conversation patterns, responsive layout, and states.

The system font stack avoids an external font dependency. Normal conversation text is 14px; mobile composer text is 16px to avoid automatic input zoom. The expanded conversation stays within a 720px column. The desktop panel is 480px wide; below 700px it uses the full dynamic viewport height.

## Component inventory

| Component           | Documented variants                                                         |
| ------------------- | --------------------------------------------------------------------------- |
| UserMessage         | Default, long content, mobile                                               |
| AssistantMessage    | Default, long content, mobile                                               |
| SuggestedPrompt     | Default, interactive, disabled, long content, mobile                        |
| QuickReply          | Default, interactive, disabled, long content, mobile                        |
| ShipmentStatusCard  | Default/in transit, delayed, delivered, long content, mobile                |
| ClarificationPrompt | Default, long content, mobile                                               |
| ConfirmationCard    | Default/address, interactive, disabled historical state, reschedule, mobile |
| ErrorMessage        | Default, long content, mobile                                               |
| EscalationCard      | Default, mobile; copy action is implemented in the component                |
| TypingIndicator     | Loading/default, mobile                                                     |
| FeedbackControl     | Default, interactive, mobile                                                |
| MessageComposer     | Default empty/disabled send, interactive, loading/disabled, mobile          |

Variants are applied where meaningful. Static message containers do not have artificial loading or disabled props. Errors are represented by ErrorMessage, and all shared components are composed into the same conversation UI in both display modes.

## Accessibility patterns

Native buttons, textarea, details, and checkbox provide standard keyboard behavior. Every icon-only control has an accessible name. Focus uses a visible blue outline. Opening and mode changes focus the assistant heading, minimizing returns to the launcher, and Tab is contained while the background is inert. Routine responses do not deliberately move focus. The conversation uses a polite log and loading uses a status announcement. Status icons always accompany text, so color is supplemental. Reduced-motion preferences disable the typing animation.

Automated contrast tests validate key foreground/background pairs against 4.5:1. Structural axe checks run in jsdom, where browser contrast computation is unavailable. Real-browser Storybook tests are separately configured; see the validation report for execution status. These checks do not constitute a complete WCAG audit.

## Learning path

Read the typed record definitions, follow one request through the pure `respond` transition, then inspect ConversationMessage to see how typed response data becomes UI. Compare a ConfirmationCard story with its disabled historical state. Finally, follow the App display mode: it changes presentation without replacing the conversation state.
