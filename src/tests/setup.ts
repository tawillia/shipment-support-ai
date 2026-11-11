import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
Element.prototype.scrollTo = vi.fn();

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
