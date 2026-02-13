/**
 * Minimal user-event surface passed from Vitest Browser Mode (`userEvent` from `vitest/browser`).
 */
export interface TestkitUserEvent {
  hover(element: HTMLElement): Promise<void>;
  unhover(element: HTMLElement): Promise<void>;
  click(element: HTMLElement): Promise<void>;
}

function queryByTestId(root: HTMLElement, testId: string): HTMLElement {
  const sel = `[data-testid="${CSS.escape(testId)}"]`;
  if (root.matches(sel)) {
    return root;
  }
  const el = root.querySelector(sel);
  if (!el || !(el instanceof HTMLElement)) {
    throw new Error(`No element with data-testid="${testId}" found in container`);
  }
  return el;
}

/**
 * Drives and reads {@link ProgressBar} via stable `data-testid` values under `container`.
 *
 * **IDs:** `<progress>` uses `testId`; popover uses `` `${testId}-popover` ``; reset button uses `` `${testId}-reset` ``.
 * Match the `testId` prop you pass to `ProgressBar` (default in the component is `progress-bar`).
 *
 * **Construction:** `new ProgressBarTestkit(root, userEvent, testId)` where `root` is often `document.body` or a
 * table/card subtree (`page.getByTestId('…').element()`). Getters re-query the DOM each call; missing nodes throw
 * with a clear message (safe inside `expect.poll` until timeout — see Vitest docs).
 */
export class ProgressBarTestkit {
  constructor(
    private container: HTMLElement,
    private user: TestkitUserEvent,
    private testId: string,
  ) {}

  getProgressElement(): HTMLElement {
    return queryByTestId(this.container, this.testId);
  }

  getPopoverElement(): HTMLElement {
    return queryByTestId(this.container, `${this.testId}-popover`);
  }

  getResetButtonElement(): HTMLElement {
    return queryByTestId(this.container, `${this.testId}-reset`);
  }

  getProgressValue(): number {
    return (this.getProgressElement() as HTMLProgressElement).value;
  }

  getProgressPopoverText(): string {
    return this.getPopoverElement().textContent?.trim() ?? '';
  }

  async hover(): Promise<void> {
    await this.user.hover(this.getProgressElement());
  }

  async unhover(): Promise<void> {
    await this.user.unhover(this.getProgressElement());
  }

  async clickReset(): Promise<void> {
    await this.user.click(this.getResetButtonElement());
  }
}
