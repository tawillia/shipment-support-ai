import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfirmationCard,
  MessageComposer,
  ShipmentStatusCard,
  SuggestedPrompt,
} from "./ConversationUI";
import { mockShipments } from "../data/shipments";
describe("conversation components", () => {
  it("routes a suggested prompt through its handler", async () => {
    const send = vi.fn();
    render(
      <SuggestedPrompt onClick={send}>Where is my package?</SuggestedPrompt>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(send).toHaveBeenCalledOnce();
  });
  it("prevents empty messages and sends using Enter", async () => {
    const send = vi.fn();
    render(<MessageComposer onSend={send} />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await userEvent.type(
      screen.getByRole("textbox"),
      "track DEMO123456{Enter}",
    );
    expect(send).toHaveBeenCalledWith("track DEMO123456");
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
  it("supports multiline input with Shift+Enter", async () => {
    const send = vi.fn();
    render(<MessageComposer onSend={send} />);
    await userEvent.type(
      screen.getByRole("textbox"),
      "line one{Shift>}{Enter}{/Shift}line two",
    );
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toHaveValue("line one\nline two");
  });
  it("exposes explicit confirm and cancel controls", async () => {
    const confirm = vi.fn(),
      cancel = vi.fn();
    render(
      <ConfirmationCard
        confirmation={{
          kind: "reschedule",
          trackingNumber: "DEMO123456",
          value: "November 14, 2026",
        }}
        onConfirm={confirm}
        onCancel={cancel}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm change" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("labels status and missing estimates independently of color", () => {
    render(<ShipmentStatusCard shipment={mockShipments.DEMO234567} />);
    expect(screen.getByText("Delayed")).toBeVisible();
    expect(screen.getByText("Awaiting a new estimate")).toBeVisible();
  });
});

it("keeps composer labels unique when multiple instances appear in documentation", () => {
  render(
    <>
      <MessageComposer onSend={() => {}} />
      <MessageComposer onSend={() => {}} />
    </>,
  );
  const inputs = screen.getAllByRole("textbox");
  expect(inputs[0].id).not.toBe(inputs[1].id);
  for (const input of inputs)
    expect(input).toHaveAccessibleName("Message Shipment Support AI");
});
it("keeps keyboard focus while the composer is read-only during a response", async () => {
  const view = render(<MessageComposer onSend={() => {}} />);
  const input = screen.getByRole("textbox");
  await userEvent.click(input);
  view.rerender(<MessageComposer onSend={() => {}} disabled />);
  expect(input).toHaveFocus();
  expect(input).toHaveAttribute("readonly");
  expect(input).toHaveAttribute("aria-disabled", "true");
  view.rerender(<MessageComposer onSend={() => {}} />);
  expect(input).toHaveFocus();
});
