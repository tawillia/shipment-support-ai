export type Intent =
  | "track"
  | "delay"
  | "address"
  | "reschedule"
  | "human"
  | "ambiguous"
  | "unsupported";
export type Shipment = {
  trackingNumber: string;
  status: "In transit" | "Delayed" | "Delivered";
  latestUpdate: string;
  estimatedDelivery?: string;
  route: string;
  address: string;
  canChangeAddress: boolean;
  canReschedule: boolean;
  delayReason?: string;
};
export type SuggestedAction = { label: string; value: string };
export type PendingConfirmation = {
  kind: "address" | "reschedule";
  trackingNumber: string;
  value: string;
};
export type ConversationContext = {
  activeShipment?: string;
  intent?: Intent;
  pendingClarification?: "tracking" | "address" | "date" | "intent";
  pendingConfirmation?: PendingConfirmation;
  failedRequest?: string;
};
export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  kind?:
    | "welcome"
    | "clarification"
    | "error"
    | "success"
    | "cancellation"
    | "escalation"
    | "confirmation";
  shipment?: Shipment;
  confirmation?: PendingConfirmation;
  summary?: string;
  actions?: SuggestedAction[];
};
export type AnalyticsEvent = {
  type:
    | "intent_recognized"
    | "clarification_requested"
    | "task_completed"
    | "task_failed"
    | "escalation_requested"
    | "feedback";
  detail: string;
};
export type ConversationState = {
  messages: Message[];
  context: ConversationContext;
  shipments: Record<string, Shipment>;
  events: AnalyticsEvent[];
  simulateFailure: boolean;
};
export type ConversationResponse = {
  state: ConversationState;
  message: Message;
};
/** A future remote provider must return validated intent/entities, never executable actions. */
export interface IntentProvider {
  classify(text: string): Intent | Promise<Intent>;
}
