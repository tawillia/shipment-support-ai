import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  ChevronDown,
  CircleHelp,
  Download,
  Maximize2,
  MessageSquare,
  Minus,
  Package,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  ConversationMessage,
  ShipmentStatusCard,
  ErrorMessage,
  MessageComposer,
  SuggestedPrompt,
  TypingIndicator,
} from "./components/ConversationUI";
import { initialState, respond, starters } from "./engine/conversation";
import { mockShipments } from "./data/shipments";
import type { ConversationState } from "./engine/types";
import { downloadText, trackingReport, conversationReport } from "./utils/download";
type Mode = "minimized" | "panel" | "expanded";
const storageKey = "parcelway-demo-v1";
function restore(): ConversationState {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
    if (
      saved &&
      Array.isArray(saved.messages) &&
      saved.shipments &&
      saved.context &&
      Array.isArray(saved.events)
    )
      return saved;
  } catch {
    /* storage unavailable */
  }
  return initialState();
}
export default function App() {
  const [state, setState] = useState(restore);
  const [mode, setMode] = useState<Mode>("minimized");
  const [busy, setBusy] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedNumber, setTrackedNumber] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const trackingInput = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const busyRef = useRef(false);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* Storage is optional */
    }
  }, [state]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const previousMode = useRef<Mode>("minimized");
  useEffect(() => {
    if (mode === "minimized" && previousMode.current !== "minimized") launcher.current?.focus();
    else if (mode !== "minimized") heading.current?.focus();
    previousMode.current = mode;
  }, [mode]);
  useEffect(() => {
    history.current?.scrollTo({
      top: state.messages.length > 1 || busy ? history.current.scrollHeight : 0,
      behavior: "auto",
    });
  }, [state.messages.length, busy, mode]);
  function send(text: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const token = generation.current;
    // A short local delay makes the pending state visible. No network call occurs.
    timer.current = setTimeout(() => {
      if (token !== generation.current) return;
      setState((prev) => respond(prev, text).state);
      busyRef.current = false;
      setBusy(false);
    }, 350);
  }
  function reset() {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    busyRef.current = false;
    setBusy(false);
    setState(initialState());
    setResetOpen(false);
    setDemoOpen(false);
    heading.current?.focus();
  }
  function launch() {
    setMode("panel");
  }
  const latestAssistant = [...state.messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;
  const started = state.messages.length > 1;
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="supporting-page" inert={mode !== "minimized"}>
        <div
          className="demo-banner"
          role="region"
          aria-label="Prototype notice"
        >
          <span className="demo-dot" /> A portfolio prototype. Every shipment
          and action is fictional.
        </div>
        <header className="site-header">
          <a className="brand" href="#main">
            <span className="brand-mark">
              <Box size={23} />
            </span>
            parcelway<span className="brand-period">.</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#tracking">Track a package</a>
            <a href="#how-it-works">How it works</a>
            <button className="nav-support" onClick={launch}>
              Get support <ArrowUpRight size={15} />
            </button>
          </nav>
        </header>
        <main id="main" className="site-main">
          <section id="tracking" className="tracking-section" aria-labelledby="tracking-heading">
            <h1 id="tracking-heading">Track a package</h1>
            <p className="tracking-intro">Check your shipment’s status or get help with your delivery.</p>
            {trackingError && <div id="tracking-error" className="tracking-feedback" role="alert"><ErrorMessage>{trackingError}</ErrorMessage></div>}
            <form className="tracking-form" onSubmit={e => {
                e.preventDefault();
                const number = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "");
                if (!number) return;
                setTrackedNumber(state.shipments[number] ? number : null);
                setTrackingError(state.shipments[number] ? "" : "We couldn’t find that tracking number. Check the number and try again. This prototype supports fictional shipments only.");
              }}>
              <label htmlFor="tracking-number">Tracking number</label>
              <div className="tracking-input-row">
                <input ref={trackingInput} id="tracking-number" value={trackingNumber} onChange={e=>{setTrackingNumber(e.target.value);setTrackingError("");setTrackedNumber(null);}} placeholder="Enter your tracking number" maxLength={64} required autoComplete="off" aria-invalid={Boolean(trackingError)} aria-describedby={trackingError ? "tracking-note tracking-error" : "tracking-note"}/>
                <button className="primary-button" type="submit" disabled={!trackingNumber.trim()}>Track package <ArrowRight size={17}/></button>
              </div>
              <div className="tracking-examples" role="group" aria-label="Example tracking numbers">
                <span>Try an example:</span>
                {Object.values(mockShipments).map(shipment => (
                  <button type="button" key={shipment.trackingNumber} aria-label={`Use ${shipment.trackingNumber} example (${shipment.status})`} onClick={() => {
                    setTrackingNumber(shipment.trackingNumber);
                    setTrackingError("");
                    setTrackedNumber(null);
                    trackingInput.current?.focus();
                  }}>{shipment.trackingNumber} <span>({shipment.status})</span></button>
                ))}
              </div>
              <p id="tracking-note">This prototype uses fictional shipments only.</p>
              <div className="tracking-help"><span>Need help finding your next step?</span><button type="button" onClick={launch}>Ask shipment support <ArrowUpRight size={15}/></button></div>
            </form>
            {trackedNumber && <section className="tracking-result" aria-labelledby="tracking-result-heading" aria-live="polite">
              <div className="tracking-result-header"><h2 id="tracking-result-heading">Tracking result</h2><button className="download-button" aria-label="Download tracking details" title="Download tracking details (.txt)" onClick={()=>downloadText(`tracking-${trackedNumber}.txt`,trackingReport(state.shipments[trackedNumber]))}><Download size={20}/></button></div>
              <ShipmentStatusCard shipment={state.shipments[trackedNumber]}/>
              <button className="secondary-button" onClick={()=>{launch();send(`Track ${trackedNumber}`);}}>Ask about this shipment <MessageSquare size={16}/></button>
            </section>}
            <div className="support-actions" aria-label="Delivery support options">
              {['Why is my delivery delayed?', 'Can I change my delivery address?', 'Can I reschedule my delivery?'].map(prompt=><button key={prompt} onClick={()=>{launch();send(prompt);}}>{prompt}<ArrowUpRight size={16}/></button>)}
            </div>
          </section>
          <section id="how-it-works" className="how-section">
            <div className="how-icon">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2>Support that keeps the thread.</h2>
              <p>
                Ask a follow-up. Change your mind. Pick up where you left off.
                <br />
                The assistant keeps your shipment in context, so you don’t have
                to repeat yourself.
              </p>
            </div>
          </section>
          <footer className="site-footer">
            <span>
              parcelway. <span>Independent educational prototype</span>
            </span>
            <span>Designed for a clearer next step.</span>
          </footer>
        </main>
      </div>
      {mode === "minimized" && (
        <div
          className="launcher-wrap"
          role="region"
          aria-label="Shipment support launcher"
        >
          <button
            ref={launcher}
            className="launcher"
            aria-label="Open Shipment Support AI"
            onClick={launch}
          >
            <MessageSquare size={22} />
            <span className="launcher-label">Ask shipment support</span>
          </button>
        </div>
      )}
      {mode !== "minimized" && (
        <section
          className={`assistant-shell ${mode}`}
          role="dialog"
          aria-modal="true"
          aria-label="Shipment Support AI"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setMode("minimized");
              setResetOpen(false);
            }
            if (e.key === "Tab") {
              const items = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled), textarea:not(:disabled), input:not(:disabled), summary, [tabindex="0"]',
                ),
              );
              const first = items[0],
                last = items[items.length - 1];
              if (
                e.shiftKey &&
                (document.activeElement === first ||
                  document.activeElement === heading.current)
              ) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <header className="assistant-header">
            <div className="assistant-identity">
              <span className="assistant-logo">
                <Package size={22} />
              </span>
              <div>
                <h2 ref={heading} tabIndex={-1}>
                  Shipment Support AI
                </h2>
                <span>
                  <span className="availability-dot" />
                  Your simulated support assistant
                </span>
              </div>
            </div>
            <div className="header-controls">
              <button
                aria-label="Reset conversation"
                title="Reset conversation"
                onClick={() => setResetOpen((v) => !v)}
              >
                <RotateCcw size={17} />
              </button>
              <button aria-label="Download conversation" title="Download conversation (.txt)" disabled={!started || busy} onClick={()=>downloadText("shipment-support-conversation.txt",conversationReport(state.messages))}><Download size={17}/></button>
              <button
                aria-label={
                  mode === "panel" ? "Expand assistant" : "Return to side panel"
                }
                title={mode === "panel" ? "Expand" : "Return to panel"}
                onClick={() => setMode(mode === "panel" ? "expanded" : "panel")}
              >
                {mode === "panel" ? (
                  <Maximize2 size={17} />
                ) : (
                  <ArrowDownLeft size={18} />
                )}
              </button>
              <button
                aria-label="Minimize assistant"
                title="Minimize"
                onClick={() => {
                  setMode("minimized");
                  setResetOpen(false);
                }}
              >
                <Minus size={19} />
              </button>
            </div>
          </header>
          {resetOpen && (
            <div
              className="reset-notice"
              role="group"
              aria-label="Reset confirmation"
            >
              <p>
                Start a new conversation? This clears messages and restores all
                demo shipments.
              </p>
              <button className="primary-button" onClick={reset}>
                Reset conversation
              </button>
              <button
                className="secondary-button"
                onClick={() => setResetOpen(false)}
              >
                Keep chatting
              </button>
            </div>
          )}
          <div className="assistant-disclosure">
            <ShieldCheck size={14} />
            <span>
              Demo experience · Fictional data · No real deliveries changed
            </span>
          </div>
          <div className="conversation-scroll" ref={history}>
            <div className="conversation-column">
              {!started ? (
                <div className="welcome">
                  <p>{state.messages[0].text}</p>
                  <span className="suggestions-label">
                    What can I help you with?
                  </span>
                  <div className="starters">
                    {starters.map((s) => (
                      <SuggestedPrompt
                        key={s}
                        disabled={busy}
                        onClick={() => send(s)}
                      >
                        {s}
                      </SuggestedPrompt>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="message-list"
                  role="log"
                  aria-label="Conversation history"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  {state.messages.map((m) => (
                    <ConversationMessage
                      key={m.id}
                      message={m}
                      active={m.id === latestAssistant}
                      onAction={send}
                      busy={busy}
                      onFeedback={(helpful) =>
                        setState((prev) => ({
                          ...prev,
                          events: [
                            ...prev.events,
                            {
                              type: "feedback",
                              detail: `${m.id}:${helpful ? "helpful" : "not_helpful"}`,
                            },
                          ],
                        }))
                      }
                    />
                  ))}
                </div>
              )}
              {busy && <TypingIndicator />}
            </div>
          </div>
          <div className="assistant-bottom">
            <div className="bottom-column">
              <button
                className="demo-toggle"
                aria-expanded={demoOpen}
                aria-controls="demo-tools"
                onClick={() => setDemoOpen(!demoOpen)}
              >
                <CircleHelp size={15} />
                Try a demo shipment
                <ChevronDown size={14} className={demoOpen ? "rotated" : ""} />
              </button>
              {demoOpen && (
                <div id="demo-tools" className="demo-tools">
                  <p>Use fictional information only.</p>
                  <div className="quick-replies">
                    {Object.values(mockShipments).map((s) => (
                      <button
                        className="quick-reply"
                        key={s.trackingNumber}
                        disabled={busy}
                        onClick={() => send(s.trackingNumber)}
                      >
                        {s.trackingNumber} · {s.status}
                      </button>
                    ))}
                  </div>
                  <label className="failure-toggle">
                    <input
                      type="checkbox"
                      checked={state.simulateFailure}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          simulateFailure: e.target.checked,
                        }))
                      }
                    />
                    Simulate next shipment lookup error
                  </label>
                </div>
              )}
              <MessageComposer disabled={busy} onSend={send} />
              <div className="composer-footer">
                <span>Simulated assistant. Responses may be limited.</span>
                <span>Enter to send</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
