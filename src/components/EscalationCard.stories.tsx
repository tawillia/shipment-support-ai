import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EscalationCard } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/EscalationCard",
  component: EscalationCard,
  tags: ["autodocs"],
  args: {
    summary:
      "Demo handoff only — no representative has been contacted.\nShipment: DEMO234567\nCurrent request: delivery delay\nNo delivery changes made.",
  },
} satisfies Meta<typeof EscalationCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
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
