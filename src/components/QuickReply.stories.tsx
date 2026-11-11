import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { QuickReply } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/QuickReply",
  component: QuickReply,
  tags: ["autodocs"],
  args: { children: "Track this shipment", onClick: fn() },
} satisfies Meta<typeof QuickReply>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const LongContent: Story = {
  args: {
    children:
      "Understand why a shipment is delayed and explore the available delivery options without losing the current conversation context.",
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
