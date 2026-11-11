import { deliveryDates, mockShipments } from "../data/shipments";
import type {
  ConversationState,
  Intent,
  Message,
  SuggestedAction,
  ConversationResponse,
  IntentProvider,
} from "./types";
export const starters = [
  "Where is my package?",
  "Why is my delivery delayed?",
  "Can I change my delivery address?",
  "Can I reschedule my delivery?",
  "I need to speak with someone.",
];
const actions = (items: string[]): SuggestedAction[] =>
  items.map((label) => ({ label, value: label }));
const trackingActions = actions(Object.keys(mockShipments));
const followups = actions([
  "Track this shipment",
  "Why is it late?",
  "Change delivery address",
  "Reschedule delivery",
  "Speak with someone",
]);
export function extractTrackingNumber(text: string): string | undefined {
  return text
    .toUpperCase()
    .match(/\bDEMO[\s-]?\d+\b/)?.[0]
    .replace(/[\s-]/g, "");
}
export function classifyIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(human|agent|person|someone|representative|support team)\b/.test(t))
    return "human";
  if (/\b(address|redirect|reroute)\b/.test(t)) return "address";
  if (
    /\b(reschedule|postpone|delivery date|different day|another day|change.*date)\b/.test(
      t,
    )
  )
    return "reschedule";
  if (/\b(delay\w*|late|stuck|why.*long)\b/.test(t)) return "delay";
  if (
    /\b(track\w*|where|status|locate|when.*arrive|when.*deliver)\b/.test(t) ||
    extractTrackingNumber(text)
  )
    return "track";
  if (/\b(change|help|it|delivery|package|shipment)\b/.test(t))
    return "ambiguous";
  return "unsupported";
}
export const deterministicProvider: IntentProvider = {
  classify: classifyIntent,
};
export function initialState(): ConversationState {
  return {
    messages: [
      {
        id: "welcome",
        role: "assistant",
        kind: "welcome",
        text: "Hi, I’m your shipment assistant. I can help you track a package, understand a delay, or plan a delivery change.",
      },
    ],
    context: {},
    shipments: structuredClone(mockShipments),
    events: [],
    simulateFailure: false,
  };
}
export function respond(
  previous: ConversationState,
  raw: string,
  displayText: string = raw,
): ConversationResponse {
  const state = structuredClone(previous);
  const text = raw.trim();
  const lower = text.toLowerCase();
  let message: Message = {
    id: `m${state.messages.length + 1}`,
    role: "assistant",
    text: "",
  };
  const finish = (content: Partial<Message>): ConversationResponse => {
    message = { ...message, ...content };
    state.messages.push(message);
    return { state, message };
  };
  const event = (
    type: ConversationState["events"][number]["type"],
    detail: string,
  ) => state.events.push({ type, detail });
  state.messages.push({
    id: `m${state.messages.length}`,
    role: "user",
    text: displayText.trim(),
  });
  if (!text)
    return finish({
      text: "What would you like help with?",
      kind: "clarification",
      actions: actions(starters),
    });
  if (/^(cancel|never mind|nevermind|no|no thanks)[.!]?$/i.test(text)) {
    state.context.pendingConfirmation = undefined;
    state.context.pendingClarification = undefined;
    state.context.intent = undefined;
    state.context.failedRequest = undefined;
    return finish({
      text: "Cancelled. No delivery changes were made.",
      kind: "cancellation",
      actions: followups,
    });
  }
  const addressInput =
    state.context.pendingClarification === "address" && /^\d.{5,},/.test(text);
  if (classifyIntent(text) === "human" && !addressInput) {
    const active = state.context.activeShipment;
    const pending = state.context.pendingConfirmation;
    const summary = `Demo handoff only — no representative has been contacted.\nShipment: ${active || "Not provided"}\nCurrent request: ${state.context.intent || "General support"}\nPending change: ${pending ? `${pending.kind}: ${pending.value} (not applied)` : "None"}\nConversation: ${state.messages
      .filter((m) => m.role === "user")
      .map((m) => m.text)
      .join(" → ")}`;
    event("escalation_requested", active || "general");
    return finish({
      kind: "escalation",
      text: "Here’s a summary you can use when contacting support. This prototype cannot connect you to a real person.",
      summary,
      actions: pending ? actions(["Confirm change", "Cancel"]) : followups,
    });
  }
  if (state.context.pendingConfirmation) {
    const pending = state.context.pendingConfirmation;
    if (
      /^(confirm( change)?|yes(,? confirm)?|yes please|approve)[.!]?$/i.test(
        text,
      )
    ) {
      const shipment = state.shipments[pending.trackingNumber];
      if (pending.kind === "address") shipment.address = pending.value;
      else shipment.estimatedDelivery = pending.value;
      state.context.pendingConfirmation = undefined;
      state.context.pendingClarification = undefined;
      event("task_completed", pending.kind);
      return finish({
        kind: "success",
        text: `Your simulated ${pending.kind === "address" ? "delivery address" : "delivery date"} has been updated to ${pending.value}.`,
        shipment: { ...shipment },
        actions: followups,
      });
    }
    // Any unrelated input is prevented from silently replacing a pending action.
    return finish({
      kind: "confirmation",
      text: "Please confirm or cancel the pending change before starting another request.",
      confirmation: pending,
      actions: actions(["Confirm change", "Cancel"]),
    });
  }
  if (/^(yes|confirm( change)?)[.!]?$/i.test(text))
    return finish({
      text: "There is no change waiting for confirmation. What would you like to do?",
      kind: "clarification",
      actions: followups,
    });
  let intent = classifyIntent(text);
  const tracking = extractTrackingNumber(text);
  if (lower === "retry" && state.context.failedRequest)
    return respond(
      { ...previous, simulateFailure: false },
      state.context.failedRequest,
      text,
    );
  if (
    lower === "use sample address" &&
    state.context.pendingClarification === "address"
  )
    return respond(previous, "25 Example Street, Northbridge, NY 10001", text);
  if (
    state.context.pendingClarification === "address" &&
    (addressInput ||
      (intent !== "reschedule" &&
        !tracking &&
        intent !== "delay" &&
        intent !== "track"))
  ) {
    if (
      text.length < 12 ||
      !/\d/.test(text) ||
      !/[a-z]/i.test(text) ||
      !text.includes(",")
    )
      return finish({
        kind: "clarification",
        text: "Please enter a fictional street address and city, for example: 25 Example Street, Northbridge, NY 10001.",
        actions: actions(["Use sample address", "Cancel"]),
      });
    const confirmation = {
      kind: "address" as const,
      trackingNumber: state.context.activeShipment!,
      value: text,
    };
    state.context.pendingConfirmation = confirmation;
    state.context.pendingClarification = undefined;
    return finish({
      kind: "confirmation",
      text: "Review this simulated address change. Nothing changes until you confirm.",
      confirmation,
      actions: actions(["Confirm change", "Cancel"]),
    });
  }
  if (state.context.pendingClarification === "date") {
    if (deliveryDates.includes(text)) {
      const confirmation = {
        kind: "reschedule" as const,
        trackingNumber: state.context.activeShipment!,
        value: text,
      };
      state.context.pendingConfirmation = confirmation;
      state.context.pendingClarification = undefined;
      return finish({
        kind: "confirmation",
        text: "Review your new delivery date. Nothing changes until you confirm.",
        confirmation,
        actions: actions(["Confirm change", "Cancel"]),
      });
    }
    if (intent === "unsupported" || intent === "ambiguous")
      return finish({
        kind: "clarification",
        text: "Choose one of the available demo delivery dates.",
        actions: actions([...deliveryDates, "Cancel"]),
      });
  }
  if (
    tracking &&
    state.context.pendingClarification === "tracking" &&
    state.context.intent &&
    classifyIntent(text.replace(/\bDEMO[\s-]?\d+\b/i, "")) === "unsupported"
  )
    intent = state.context.intent;
  if (intent === "ambiguous") {
    state.context.pendingClarification = "intent";
    event("clarification_requested", "intent");
    return finish({
      kind: "clarification",
      text: "What would you like help with?",
      actions: actions([
        "Track this shipment",
        "Change delivery address",
        "Reschedule delivery",
        "Speak with someone",
      ]),
    });
  }
  if (intent === "unsupported")
    return finish({
      text: "I can help with shipment tracking, delays, address changes, rescheduling, or a support summary. Which would you like?",
      kind: "error",
      actions: actions(["Where is my package?", "Speak with someone"]),
    });
  state.context.intent = intent;
  event("intent_recognized", intent);
  if (tracking) {
    if (!state.shipments[tracking]) {
      state.context.pendingClarification = "tracking";
      event("task_failed", "invalid_tracking");
      return finish({
        kind: "error",
        text: `I couldn’t find ${tracking} in the fictional shipment records. Choose a demo shipment or try again.`,
        actions: trackingActions,
      });
    }
    state.context.activeShipment = tracking;
  }
  if (!state.context.activeShipment) {
    state.context.pendingClarification = "tracking";
    event("clarification_requested", "tracking");
    return finish({
      kind: "clarification",
      text: "What’s your demo tracking number? You can choose a fictional shipment below.",
      actions: trackingActions,
    });
  }
  if (state.simulateFailure) {
    state.simulateFailure = false;
    state.context.failedRequest = text;
    event("task_failed", "service_unavailable");
    return finish({
      kind: "error",
      text: "Shipment data is temporarily unavailable in this simulated service error. Your conversation is safe. Try again or prepare a support summary.",
      actions: actions(["Retry", "Speak with someone"]),
    });
  }
  state.context.pendingClarification = undefined;
  state.context.failedRequest = undefined;
  const shipment = state.shipments[state.context.activeShipment];
  if (intent === "track") {
    event("task_completed", "track");
    return finish({
      text: "Here’s the latest on your demo shipment.",
      shipment: { ...shipment },
      actions: followups,
    });
  }
  if (intent === "delay")
    return finish({
      text:
        shipment.delayReason ||
        (shipment.status === "Delivered"
          ? "This shipment has already been delivered."
          : "This shipment is on schedule. There is no reported delay."),
      shipment: { ...shipment },
      actions: followups,
    });
  const eligible =
    intent === "address" ? shipment.canChangeAddress : shipment.canReschedule;
  if (!eligible)
    return finish({
      kind: "error",
      text: `This shipment is not eligible for ${intent === "address" ? "an address change" : "rescheduling"} because ${shipment.status === "Delivered" ? "it has already been delivered" : "it is already at a hub that cannot reroute it"}. No changes have been made.`,
      actions: actions(["Track this shipment", "Speak with someone"]),
    });
  state.context.pendingClarification =
    intent === "address" ? "address" : "date";
  return finish({
    kind: "clarification",
    text:
      intent === "address"
        ? "This shipment is eligible. What fictional address should we deliver to? Include the street and city."
        : "This shipment is eligible. Which demo delivery date would you prefer?",
    actions: actions(
      intent === "address"
        ? ["Use sample address", "Cancel"]
        : [...deliveryDates, "Cancel"],
    ),
  });
}
