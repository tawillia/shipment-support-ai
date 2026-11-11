import { describe, expect, it } from "vitest";
import {
  classifyIntent,
  extractTrackingNumber,
  initialState,
  respond,
} from "./conversation";
import { deliveryDates } from "../data/shipments";
import type { ConversationState } from "./types";
const turn = (s: ConversationState, t: string) => respond(s, t).state;
const last = (s: ConversationState) => s.messages.at(-1)!;
const tracked = (id = "DEMO123456") => turn(initialState(), `track ${id}`);
describe("intent recognition", () => {
  it.each([
    ["Where is my package?", "track"],
    ["locate it", "track"],
    ["Why is it late?", "delay"],
    ["reroute my package", "address"],
    ["another day", "reschedule"],
    ["talk to an agent", "human"],
    ["Can you change it?", "ambiguous"],
    ["tell me a joke", "unsupported"],
  ])("%s → %s", (text, intent) => expect(classifyIntent(text)).toBe(intent));
  it("extracts case-insensitive demo numbers", () => {
    expect(extractTrackingNumber("track demo-123456 please")).toBe(
      "DEMO123456",
    );
    expect(extractTrackingNumber("hello")).toBeUndefined();
  });
});
describe("context and recovery", () => {
  it("requests a number and retains the intended task", () => {
    let s = turn(initialState(), "Why is my delivery delayed?");
    expect(s.context.pendingClarification).toBe("tracking");
    s = turn(s, "DEMO234567");
    expect(last(s).text).toContain("Severe weather");
  });
  it("retains the active delayed shipment", () => {
    const s = turn(tracked("DEMO234567"), "Why is it late?");
    expect(last(s).shipment?.trackingNumber).toBe("DEMO234567");
    expect(last(s).text).toContain("Severe weather");
  });
  it("explains on-schedule and delivered statuses", () => {
    expect(last(turn(tracked(), "Why is it late?")).text).toContain(
      "on schedule",
    );
    expect(last(turn(tracked("DEMO345678"), "Why is it late?")).text).toContain(
      "already been delivered",
    );
  });
  it("offers clarification for ambiguous requests", () => {
    const s = turn(initialState(), "Can you change it?");
    expect(last(s).kind).toBe("clarification");
    expect(last(s).actions?.length).toBeGreaterThan(1);
  });
  it("rejects unknown numbers without replacing active shipment", () => {
    const s = turn(tracked(), "DEMO999999");
    expect(last(s).kind).toBe("error");
    expect(s.context.activeShipment).toBe("DEMO123456");
  });
  it("handles unsupported input with recovery", () => {
    const s = turn(initialState(), "write a poem");
    expect(last(s).kind).toBe("error");
    expect(last(s).actions?.length).toBeGreaterThan(0);
  });
  it("retries a one-shot service failure", () => {
    let s = initialState();
    s.simulateFailure = true;
    s = turn(s, "track DEMO123456");
    expect(last(s).kind).toBe("error");
    s = turn(s, "Retry");
    expect(last(s).shipment?.trackingNumber).toBe("DEMO123456");
    expect(s.simulateFailure).toBe(false);
  });
  it("preserves history and does not mutate previous state", () => {
    const old = tracked();
    const s = turn(old, "Why is it late?");
    expect(old.messages).toHaveLength(3);
    expect(s.messages).toHaveLength(5);
  });
  it("creates an honest escalation summary with shipment context", () => {
    const s = turn(tracked(), "I need a person");
    expect(last(s).summary).toContain("DEMO123456");
    expect(last(s).summary).toContain("no representative has been contacted");
    expect(s.events.at(-1)?.type).toBe("escalation_requested");
  });
});
describe("delivery modifications", () => {
  it("collects address then confirms before mutation", () => {
    let s = turn(tracked(), "Change delivery address");
    expect(s.context.pendingClarification).toBe("address");
    s = turn(s, "25 Example Street, Northbridge, NY 10001");
    expect(s.context.pendingConfirmation?.kind).toBe("address");
    expect(s.shipments.DEMO123456.address).toContain("18 Example");
    s = turn(s, "Confirm change");
    expect(s.shipments.DEMO123456.address).toContain("25 Example");
    expect(last(s).kind).toBe("success");
  });
  it("supports the sample-address quick reply", () => {
    const s = turn(turn(tracked(), "change address"), "Use sample address");
    expect(s.context.pendingConfirmation?.value).toContain("25 Example Street");
  });
  it("validates an incomplete address", () => {
    const s = turn(turn(tracked(), "change address"), "123");
    expect(s.context.pendingClarification).toBe("address");
    expect(s.context.pendingConfirmation).toBeUndefined();
  });
  it("rejects ineligible address changes", () => {
    const s = turn(tracked("DEMO234567"), "change address");
    expect(last(s).text).toContain("not eligible");
    expect(s.context.pendingClarification).toBeUndefined();
  });
  it("rejects modifications to delivered shipments", () => {
    const s = turn(tracked("DEMO345678"), "reschedule delivery");
    expect(last(s).text).toContain("already been delivered");
  });
  it("reschedules only to an offered date and only after confirmation", () => {
    let s = turn(tracked(), "reschedule delivery");
    s = turn(s, "tomorrow");
    expect(s.context.pendingConfirmation).toBeUndefined();
    s = turn(s, deliveryDates[0]);
    expect(s.shipments.DEMO123456.estimatedDelivery).toBe("November 13, 2026");
    s = turn(s, "yes");
    expect(s.shipments.DEMO123456.estimatedDelivery).toBe(deliveryDates[0]);
  });
  it("cancels without mutation", () => {
    let s = turn(turn(tracked(), "reschedule delivery"), deliveryDates[0]);
    s = turn(s, "Cancel");
    expect(s.context.pendingConfirmation).toBeUndefined();
    expect(s.shipments.DEMO123456.estimatedDelivery).toBe("November 13, 2026");
  });
  it("prevents accidental confirmation or overwriting the pending action", () => {
    let s = turn(turn(tracked(), "reschedule delivery"), deliveryDates[0]);
    s = turn(s, "track DEMO345678");
    expect(s.context.pendingConfirmation?.trackingNumber).toBe("DEMO123456");
    expect(s.context.activeShipment).toBe("DEMO123456");
    expect(s.shipments.DEMO123456.estimatedDelivery).toBe("November 13, 2026");
  });
  it("escalates a pending request without applying or losing it", () => {
    const s = turn(
      turn(turn(tracked(), "reschedule delivery"), deliveryDates[0]),
      "human",
    );
    expect(last(s).summary).toContain("not applied");
    expect(s.context.pendingConfirmation).toBeDefined();
  });
  it("does not confirm anything when no action is pending", () =>
    expect(last(turn(tracked(), "yes")).text).toContain("no change waiting"));
  it("reset state restores original records", () => {
    let s = turn(turn(tracked(), "reschedule delivery"), deliveryDates[0]);
    s = turn(s, "Confirm change");
    expect(initialState().shipments.DEMO123456.estimatedDelivery).toBe(
      "November 13, 2026",
    );
  });
});

describe("clarification regressions", () => {
  it("honors an explicit new intent supplied with a tracking number", () => {
    const s = turn(
      turn(initialState(), "Why is it delayed?"),
      "change address DEMO123456",
    );
    expect(s.context.pendingClarification).toBe("address");
  });
  it("accepts a fictional street name containing intent keywords", () => {
    const s = turn(
      turn(tracked(), "change address"),
      "25 Agent Track Street, Northbridge, NY 10001",
    );
    expect(s.context.pendingConfirmation?.value).toContain(
      "Agent Track Street",
    );
  });
  it("records the actual retry and sample-address button text in history", () => {
    let s = initialState();
    s.simulateFailure = true;
    s = turn(s, "track DEMO123456");
    s = turn(s, "Retry");
    expect(s.messages.at(-2)?.text).toBe("Retry");
    s = turn(turn(s, "change address"), "Use sample address");
    expect(s.messages.at(-2)?.text).toBe("Use sample address");
  });
});
