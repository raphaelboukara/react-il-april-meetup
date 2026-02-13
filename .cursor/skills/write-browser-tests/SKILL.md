---
name: write-browser-tests
description: Writes Vitest Browser Mode tests for React components using testkits (HTMLElement + data-testid), MSW for HTTP, and vitest-browser-react. Use when adding or changing *.browser.test.tsx files or browser test patterns in this repo.
---

# Write browser tests (Vitest Browser Mode)

Use this repo’s **component test workflow**: MSW at the network layer, **testkits** for anything you interact with, **`await render`** from `vitest-browser-react`, and **`userEvent` / `page` from `vitest/browser`**.

## Component test workflow (order matters)

1. **Mount the service worker** — `setupWorker`, `beforeAll` → `worker.start({ onUnhandledRequest: 'bypass' })`, `afterEach` → `worker.resetHandlers()`, `afterAll` → `worker.stop()`. Skip this block only when the component does not fetch.
2. **Detect and mock APIs** — List real endpoints (method + path + response shape). Register handlers with `http.get` / `http.post` + `HttpResponse.json(...)`. Use `worker.use(...)` inside a test for one-off overrides.
3. **Create testkit instances** — One testkit per component instance you will drive or read (e.g. several widgets, each with its own `testId`). Pass an **`HTMLElement` root**, **`userEvent` from `vitest/browser`**, and the **`data-testid` prefix** the component uses. You may construct testkits **before** `render`; queries run when you call getters/actions.
4. **`await render(<Component />)`** — Always await render in browser mode.
5. **Write the scenario** — Wait for async UI, drive interactions, assert. See **Locators vs `HTMLElement` and `expect.poll`** below.

## Locators vs `HTMLElement` and **`expect.poll`**

Vitest’s **`expect.element(locator)`** is sugar for **`expect.poll(() => locator)`** (same retry interval / timeout). In this repo, **spell retriable DOM checks as `await expect.poll(() => …)`** so the polled value is obvious.

- **Locators** — **`page.getByTestId(...)`**, **`page.getByText(...)`**, etc. return **locators**. For presence / visibility after async work, use **`await expect.poll(() => page.getByTestId('…')).toBeInTheDocument()`**, **`.toBeVisible()`**, **`.not.toBeInTheDocument()`**, etc. You can assign a locator once and poll it: `const target = page.getByTestId('x'); await expect.poll(() => target).toBeVisible()`.
- **Testkits** return **`HTMLElement`** from getters (e.g. **`getProgressElement()`**). They are **not** locators. After the UI is stable, **`expect(testkit.getProgressElement()).toBeInTheDocument()`** is fine. If the node may appear late, **poll the getter** so each attempt re-queries: **`await expect.poll(() => testkit.getProgressElement()).toBeInTheDocument()`** — do **not** use **`expect.element`** with a raw **`HTMLElement`**.
- **Values** from the DOM: prefer testkit accessors (**`getProgressValue()`**, **`getProgressPopoverText()`**) and **`expect(...).toBe(...)`** — not **`.toHaveValue()`** on `<progress>`.

## Imports (typical)

```typescript
import { render } from 'vitest-browser-react';
import { it, expect, describe, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
```

Add component, test ID, and testkit imports as needed.

## Testkits

Testkits are **framework-agnostic**: they take an **`HTMLElement` scope** and use **`querySelector('[data-testid="…"]')`** (with `CSS.escape`) under that root. They accept **`userEvent` from `vitest/browser`** because it matches the `TestkitUserEvent` shape (`hover` / `unhover` / `click` on `HTMLElement`).

**Repo convention — file names**

- **Testkit:** `*.testkit.ts`, usually colocated as `ComponentName.testkit.ts` beside `ComponentName.tsx`.
- **Example browser test:** `ComponentName.browser.test.tsx` in the same folder (or the package’s existing pattern).

**How to find a testkit:** search the workspace for `*.testkit.ts`, or open the component’s folder — the testkit normally lives next to that component’s `.tsx`. Use the colocated `*.browser.test.tsx` as the usage template.

**Do not copy testkit APIs into this skill.** When you use a testkit:

1. **Open the colocated `*.testkit.ts`** — JSDoc there is the source of truth for constructor, getters, actions, and `data-testid` naming.
2. **Mirror patterns from the matching `*.browser.test.tsx`** (imports, root element choice, `expect.poll` vs immediate asserts).

**Choosing `root`:** use **`document.body`** when every relevant `data-testid` is unique on the page; otherwise scope with **`page.getByTestId('…').element() as HTMLElement`** (or another stable subtree) after async UI is ready.

## MSW worker snippet (copy-paste shape)

```typescript
const worker = setupWorker(
  http.get('/api/your-endpoint', () => HttpResponse.json([])),
);

beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  worker.resetHandlers();
});

afterAll(() => {
  worker.stop();
});
```

## Rules

- **Browser test file name:** `*.browser.test.tsx`.
- **Testkit file name:** `*.testkit.ts` (colocated with the component when possible).
- **Never** `act()` — browser mode flushes like a real document; use **`await expect.poll(() => …)`** for retriable DOM/locator assertions or **`vi.waitFor`** when waiting on updates.
- **Never** mock `fetch` / axios in module code — mock **HTTP with MSW** so the component under test still calls real `fetch`.
- **Never** assert on child implementation details (`-popover`, `-reset` raw selectors) when a **testkit** exists — use the testkit.
- **Never** use `.toHaveValue()` on `<progress>` in these tests — use **`getProgressValue()`**.
- **Always** `await render(...)`.
- **Retriable DOM:** prefer **`await expect.poll(() => …).toBeInTheDocument()`** / **`.toBeVisible()`** / etc. over **`await expect.element(…)`** (Vitest documents them as equivalent; explicit **`expect.poll`** is the house style). The callback should return a **locator** from **`page`** or the result of a **testkit getter** that re-queries the DOM each call — not a stale **`HTMLElement`** captured once outside the poll.
- **`userEvent` / interactions:** prefer **testkit methods** so hover/click go through the same paths as production.
