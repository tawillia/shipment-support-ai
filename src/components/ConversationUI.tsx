import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  MapPin,
  Package,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Truck,
  UserRound,
} from "lucide-react";
import type {
  Message,
  PendingConfirmation,
  Shipment,
  SuggestedAction,
} from "../engine/types";
export function SuggestedPrompt({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="suggested-prompt" onClick={onClick} disabled={disabled}>
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
export function QuickReply({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="quick-reply" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
export function UserMessage({ children }: { children: ReactNode }) {
  return (
    <div className="user-row">
      <div className="user-message">{children}</div>
    </div>
  );
}
export function AssistantMessage({ children }: { children: ReactNode }) {
  return <div className="assistant-message">{children}</div>;
}
export function ClarificationPrompt({ children }: { children: ReactNode }) {
  return <div className="clarification">{children}</div>;
}
export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="error-message">
      <TriangleAlert size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
export function ShipmentStatusCard({ shipment }: { shipment: Shipment }) {
  const Icon =
    shipment.status === "Delivered"
      ? CheckCircle2
      : shipment.status === "Delayed"
        ? Clock3
        : Truck;
  return (
    <section
      className="shipment-card"
      aria-label={`Shipment ${shipment.trackingNumber}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">DEMO SHIPMENT</span>
        <span
          className={`status ${shipment.status === "Delivered" ? "delivered" : shipment.status === "Delayed" ? "delayed" : "transit"}`}
        >
          <Icon size={14} aria-hidden="true" />
          {shipment.status}
        </span>
      </div>
      <h3>{shipment.trackingNumber}</h3>
      <div className="shipment-route">
        <MapPin size={14} aria-hidden="true" />
        {shipment.route}
      </div>
      <div className="delivery-estimate">
        <span>
          {shipment.status === "Delivered"
            ? "Delivery complete"
            : "Estimated delivery"}
        </span>
        <strong>
          {shipment.status === "Delivered"
            ? "November 10, 2026"
            : shipment.estimatedDelivery || "Awaiting a new estimate"}
        </strong>
      </div>
      <p className="shipment-update">{shipment.latestUpdate}</p>
      <details>
        <summary>Delivery details</summary>
        <p>{shipment.address}</p>
      </details>
    </section>
  );
}
export function ConfirmationCard({
  confirmation,
  onConfirm,
  onCancel,
  disabled = false,
}: {
  confirmation: PendingConfirmation;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}) {
  return (
    <section className="confirmation-card" aria-label="Review delivery change">
      <div className="flex gap-2 items-center">
        <Package size={18} aria-hidden="true" />
        <strong>Review delivery change</strong>
      </div>
      <dl>
        <dt>Shipment</dt>
        <dd>{confirmation.trackingNumber}</dd>
        <dt>
          {confirmation.kind === "address"
            ? "New address"
            : "New delivery date"}
        </dt>
        <dd>{confirmation.value}</dd>
      </dl>
      <p>Fictional shipment · No real delivery will change.</p>
      <div className="flex flex-wrap gap-2">
        <button
          className="primary-button"
          onClick={onConfirm}
          disabled={disabled}
        >
          Confirm change
        </button>
        <button
          className="secondary-button"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
export function EscalationCard({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="escalation-card">
      <h3 className="flex items-center gap-2">
        <UserRound size={18} aria-hidden="true" />
        Support summary
      </h3>
      <p className="whitespace-pre-line">{summary}</p>
      <button
        className="secondary-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
        {copied ? "Copied" : "Copy summary"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Summary copied to clipboard" : ""}
      </span>
    </section>
  );
}
export function TypingIndicator() {
  return (
    <div className="typing-indicator" role="status">
      <span />
      <span />
      <span />
      <span className="sr-only">Preparing a demo response</span>
    </div>
  );
}
export function FeedbackControl({
  onFeedback,
}: {
  onFeedback?: (helpful: boolean) => void;
}) {
  const [value, setValue] = useState<boolean>();
  return (
    <div className="feedback">
      <span>Was this helpful?</span>
      <button
        aria-label="Helpful"
        aria-pressed={value === true}
        onClick={() => {
          setValue(true);
          onFeedback?.(true);
        }}
      >
        <ThumbsUp size={14} />
      </button>
      <button
        aria-label="Not helpful"
        aria-pressed={value === false}
        onClick={() => {
          setValue(false);
          onFeedback?.(false);
        }}
      >
        <ThumbsDown size={14} />
      </button>
      <span className="sr-only" role="status">
        {value === undefined ? "" : "Thank you for your feedback."}
      </span>
    </div>
  );
}
export function MessageComposer({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasBusy = useRef(false);
  useEffect(() => {
    if (
      wasBusy.current &&
      !disabled &&
      document.activeElement === document.body
    )
      inputRef.current?.focus();
    wasBusy.current = disabled;
  }, [disabled]);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue("");
    }
  }
  return (
    <form className="composer" onSubmit={submit}>
      <label className="sr-only" htmlFor={inputId}>
        Message Shipment Support AI
      </label>
      <textarea
        ref={inputRef}
        id={inputId}
        rows={1}
        maxLength={1000}
        placeholder="Ask about your shipment…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={disabled}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (value.trim() && !disabled) {
              onSend(value.trim());
              setValue("");
            }
          }
        }}
      />
      <button
        className="send-button"
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <ArrowUp size={20} />
      </button>
    </form>
  );
}
export function ConversationMessage({
  message,
  active,
  onAction,
  onFeedback,
  busy,
}: {
  message: Message;
  active: boolean;
  onAction: (value: string) => void;
  onFeedback: (helpful: boolean) => void;
  busy: boolean;
}) {
  if (message.role === "user") return <UserMessage>{message.text}</UserMessage>;
  const content =
    message.kind === "error" ? (
      <ErrorMessage>{message.text}</ErrorMessage>
    ) : message.kind === "clarification" ? (
      <ClarificationPrompt>{message.text}</ClarificationPrompt>
    ) : (
      <p>{message.text}</p>
    );
  return (
    <div className="assistant-row">
      <div className="message-avatar" aria-hidden="true">
        <Package size={16} />
      </div>
      <div className="assistant-content">
        <span className="message-author">Shipment Support AI</span>
        <AssistantMessage>{content}</AssistantMessage>
        {message.shipment && <ShipmentStatusCard shipment={message.shipment} />}
        {message.confirmation && (
          <ConfirmationCard
            confirmation={message.confirmation}
            disabled={!active || busy}
            onConfirm={() => onAction("Confirm change")}
            onCancel={() => onAction("Cancel")}
          />
        )}
        {message.summary && <EscalationCard summary={message.summary} />}
        {active && !message.confirmation && message.actions && (
          <div className="quick-replies" aria-label="Suggested next actions">
            {message.actions.map((a: SuggestedAction) => (
              <QuickReply
                key={a.value}
                disabled={busy}
                onClick={() => onAction(a.value)}
              >
                {a.label}
              </QuickReply>
            ))}
          </div>
        )}
        {active && message.kind !== "welcome" && (
          <FeedbackControl onFeedback={onFeedback} />
        )}
      </div>
    </div>
  );
}
