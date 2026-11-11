import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TypingIndicator } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/TypingIndicator",
  component: TypingIndicator,
  tags: ["autodocs"],
} satisfies Meta<typeof TypingIndicator>;
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
