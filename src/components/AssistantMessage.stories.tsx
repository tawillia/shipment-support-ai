import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AssistantMessage } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/AssistantMessage",
  component: AssistantMessage,
  tags: ["autodocs"],
  args: { children: "Here’s the latest update on your fictional shipment." },
} satisfies Meta<typeof AssistantMessage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongContent: Story = {
  args: {
    children:
      "This is a longer conversation response with additional context about a fictional shipment. The delivery estimate may change when the shipment leaves the sorting facility. You can ask a follow-up question, review your delivery options, or request a simulated support summary.",
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
