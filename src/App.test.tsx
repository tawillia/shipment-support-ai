import { describe, expect, it } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
const user = userEvent.setup();
async function open() {
  await user.click(
    screen.getByRole("button", { name: "Open Shipment Support AI" }),
  );
}
async function send(text: string) {
  const input = within(screen.getByRole("dialog", {name: "Shipment Support AI"})).getByRole("textbox");
  await waitFor(() => expect(input).toHaveAttribute("aria-disabled", "false"));
  await user.type(input, text);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(input).toHaveAttribute("aria-disabled", "false"));
}
describe("complete conversation and shared modes", () => {
  it("tracks, preserves context across modes, confirms a change, then resets", async () => {
    render(<App />);
    await open();
    expect(
      screen.getAllByRole("dialog", { name: "Shipment Support AI" }),
    ).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: "Where is my package?" }),
    );
    await screen.findByText(
      "What’s your demo tracking number? You can choose a fictional shipment below.",
    );
    await user.click(screen.getByRole("button", { name: "DEMO123456" }));
    await screen.findByRole("region", { name: "Shipment DEMO123456" });
    await send("change address");
    await send("25 Example Street, Northbridge, NY 10001");
    await screen.findByRole("region", { name: "Review delivery change" });
    await user.click(screen.getByRole("button", { name: "Expand assistant" }));
    expect(
      screen.getByRole("region", { name: "Review delivery change" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Return to side panel" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Minimize assistant" }),
    );
    expect(
      screen.getByRole("button", { name: "Open Shipment Support AI" }),
    ).toHaveFocus();
    await open();
    await user.click(screen.getByRole("button", { name: "Confirm change" }));
    await screen.findByText(/simulated delivery address has been updated/);
    expect(
      screen.getAllByRole("dialog", { name: "Shipment Support AI" }),
    ).toHaveLength(1);
    await user.click(
      screen.getByRole("button", { name: "Reset conversation" }),
    );
    await user.click(
      within(
        screen.getByRole("group", { name: "Reset confirmation" }),
      ).getByRole("button", { name: "Reset conversation" }),
    );
    expect(
      screen.getByRole("button", { name: "Where is my package?" }),
    ).toBeVisible();
    expect(
      screen.queryByText("25 Example Street, Northbridge, NY 10001"),
    ).not.toBeInTheDocument();
  }, 15000);
  it("retains a delayed shipment for a free-text follow-up", async () => {
    render(<App />);
    await open();
    await send("track DEMO234567");
    await send("Why is it late?");
    expect(screen.getByText(/Severe weather has paused/)).toBeVisible();
  }, 10000);
  it("restores session history after unmounting", async () => {
    const view = render(<App />);
    await open();
    await send("track DEMO123456");
    view.unmount();
    render(<App />);
    await open();
    expect(
      screen.getByRole("region", { name: "Shipment DEMO123456" }),
    ).toBeVisible();
  }, 10000);
});

it('keeps the homepage focused on tracking with compact examples', () => {
 render(<App/>);
 expect(screen.getByRole('heading', {name:'Track a package'})).toBeVisible();
 expect(screen.getByRole('button', {name:'Track package'})).toBeDisabled();
 expect(screen.getByRole('button',{name:/Use DEMO123456 example/})).toBeVisible();
 expect(screen.getByRole('button',{name:/Use DEMO234567 example/})).toBeVisible();
 expect(screen.getByRole('button',{name:/Use DEMO345678 example/})).toBeVisible();
});
it('displays homepage tracking inline without opening the assistant', async () => {
 render(<App/>);
 await user.type(screen.getByRole('textbox',{name:'Tracking number'}),'DEMO123456');
 await user.click(screen.getByRole('button',{name:'Track package'}));
 await screen.findByRole('region',{name:'Shipment DEMO123456'});
 expect(screen.queryByRole('dialog',{name:'Shipment Support AI'})).not.toBeInTheDocument();
 expect(screen.getByText('In transit')).toBeVisible();
 expect(screen.getByRole('button',{name:'Download tracking details'})).toBeEnabled();
 await user.click(screen.getByRole('button',{name:'Ask about this shipment'}));
 await screen.findByRole('dialog',{name:'Shipment Support AI'});
},10000);
it('shows actionable prompts immediately in both conversation layouts', async () => {
 render(<App/>);await open();
 expect(screen.queryByText('LET’S FIND YOUR NEXT STEP')).not.toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Expand assistant'}));
 expect(screen.queryByText('LET’S FIND YOUR NEXT STEP')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Where is my package?'})).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Try a demo shipment'}));
 expect(screen.getByRole('button',{name:'DEMO123456 · In transit'})).toBeVisible();
});

it('displays invalid tracking feedback on the page and allows recovery', async () => {
 render(<App/>);
 const input=screen.getByRole('textbox',{name:'Tracking number'});
 await user.type(input,'DEMO999999');await user.click(screen.getByRole('button',{name:'Track package'}));
 expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t find that tracking number');
 expect(screen.getByRole('alert').compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect(input).toHaveAttribute('aria-invalid','true');
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 await user.clear(input);await user.type(input,'demo-234567');await user.click(screen.getByRole('button',{name:'Track package'}));
 expect(screen.queryByRole('alert')).not.toBeInTheDocument();
 expect(screen.getByText('Delayed')).toBeVisible();
 expect(screen.getByText('Awaiting a new estimate')).toBeVisible();
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('fills the tracking field from an example without submitting or opening chat', async () => {
 render(<App/>);
 await user.click(screen.getByRole('button',{name:'Use DEMO234567 example (Delayed)'}));
 const input=screen.getByRole('textbox',{name:'Tracking number'});
 expect(input).toHaveValue('DEMO234567');expect(input).toHaveFocus();
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.queryByRole('region',{name:'Shipment DEMO234567'})).not.toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Track package'}));
 expect(screen.getByRole('region',{name:'Shipment DEMO234567'})).toBeVisible();
});

it('offers a chat download in the header once a conversation has started', async () => {
 render(<App/>);await open();
 expect(screen.getByRole('button',{name:'Download conversation'})).toBeDisabled();
 await send('track DEMO123456');
 expect(screen.getByRole('button',{name:'Download conversation'})).toBeEnabled();
});
