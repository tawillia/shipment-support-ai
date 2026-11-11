import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ShipmentStatusCard } from "./ConversationUI";
import { mockShipments } from "../data/shipments";
const meta = {
  title: "Conversation/ShipmentStatusCard",
  component: ShipmentStatusCard,
  tags: ["autodocs"],
  args: { shipment: mockShipments.DEMO123456 },
} satisfies Meta<typeof ShipmentStatusCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Delayed: Story = { args: { shipment: mockShipments.DEMO234567 } };
export const Delivered: Story = {
  args: { shipment: mockShipments.DEMO345678 },
};
export const LongContent: Story = {
  args: {
    shipment: {
      ...mockShipments.DEMO123456,
      latestUpdate:
        "Arrived at the Northbridge sorting facility. The next departure is scheduled for the evening. This fictional record demonstrates a long operational update wrapping within the shipment card.",
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
