import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MessageComposer } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/MessageComposer",
  component: MessageComposer,
  tags: ["autodocs"],
  args: { onSend: fn() },
} satisfies Meta<typeof MessageComposer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { disabled: true } };
export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole("button", { name: "Send message" }),
    ).toBeDisabled();
    await userEvent.type(c.getByRole("textbox"), "track DEMO123456");
    await userEvent.click(c.getByRole("button", { name: "Send message" }));
    await expect(args.onSend).toHaveBeenCalledWith("track DEMO123456");
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
