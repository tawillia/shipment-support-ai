import { expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import App from "../App";
import {
  ConfirmationCard,
  ErrorMessage,
  ShipmentStatusCard,
} from "../components/ConversationUI";
import { mockShipments } from "../data/shipments";
async function check() {
  const results = await axe.run(document.body, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(results.violations.map((v) => `${v.id}: ${v.description}`)).toEqual(
    [],
  );
}
it("has no detectable structural accessibility violations on the supporting page", async () => {
  render(<App />);
  await check();
});
it("has accessible dialog controls and contains keyboard navigation", async () => {
  render(<App />);
  await userEvent.click(
    screen.getByRole("button", { name: "Open Shipment Support AI" }),
  );
  await check();
  await userEvent.tab({ shift: true });
  expect(within(screen.getByRole("dialog", {name: "Shipment Support AI"})).getByRole("textbox")).toHaveFocus();
  await userEvent.tab();
  expect(
    screen.getByRole("button", { name: "Reset conversation" }),
  ).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  expect(
    screen.getByRole("button", { name: "Open Shipment Support AI" }),
  ).toHaveFocus();
});
it("has accessible confirmation, status, and error structures", async () => {
  render(
    <main>
      <h1>Conversation components</h1>
      <h2>Shipment support</h2>
      <ConfirmationCard
        confirmation={{
          kind: "address",
          trackingNumber: "DEMO123456",
          value: "25 Example Street, Northbridge",
        }}
      />
      <ShipmentStatusCard shipment={mockShipments.DEMO234567} />
      <ErrorMessage>Data unavailable. Please retry.</ErrorMessage>
    </main>,
  );
  await check();
});
function luminance(hex: string) {
  const rgb = hex
    .match(/\w\w/g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
it.each([
  ["142b49", "ffffff"],
  ["57677c", "ffffff"],
  ["ffffff", "2563eb"],
  ["1d4ed8", "edf3ff"],
  ["92400e", "fff2da"],
  ["0f665e", "e8f6f0"],
  ["30445f", "ffffff"],
  ["173d77", "edf3ff"],
  ["52647c", "f7f9fc"],
  ["1e4789", "ffffff"],
])(
  "text pair #%s on #%s meets AA normal-text contrast",
  (foreground, background) => {
    const a = luminance(foreground),
      b = luminance(background);
    expect(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
  },
);
