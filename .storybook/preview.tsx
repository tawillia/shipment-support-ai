import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
const preview: Preview = {
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          "Shared conversation components for side-panel and expanded layouts. All shipment information is fictional.",
      },
    },
  },
  decorators: [
    (Story) => (
      <main style={{ maxWidth: 480, padding: 20, margin: "auto" }}>
        <Story />
      </main>
    ),
  ],
};
export default preview;
