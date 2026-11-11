import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConfirmationCard } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/ConfirmationCard",
  component: ConfirmationCard,
  tags: ["autodocs"],
  args: {
    confirmation: {
      kind: "address",
      trackingNumber: "DEMO123456",
      value: "25 Example Street, Northbridge, NY 10001",
    },
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmationCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Confirm change" }),
    );
    await expect(args.onConfirm).toHaveBeenCalled();
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Reschedule: Story = {
  args: {
    confirmation: {
      kind: "reschedule",
      trackingNumber: "DEMO123456",
      value: "November 14, 2026",
    },
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  parameters: {
    viewport: {
      options: {
        mobile1: {
          name: "Mobile",
          styles: { width: "375px", height: "812px" },
        },
      },
    },
  },
};
