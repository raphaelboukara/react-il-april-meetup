# Component Browser Tests — The method and tools that made me love it
**Connecteam — March 16 — Raphael**

---

## Talk objective
Show, with a **real browser** demo, how a method + good tools transform component browser tests into:
- **more stable** tests (refactor-friendly)
- **more readable** tests (story-driven)
- **more reliable** tests (fewer false greens / false fails)

---

# Slides

## 1) Title
**Slide (text)**
- **Component Browser Tests**
- **The method and tools that made me love it**
- Connecteam — March 16 — Raphael

**What I say**
- "For a long time, writing component tests… I found it painful."
- "Today, with the right tools + a clear method, I genuinely enjoy writing them."
- "I'm going to show you why — with a real browser demo."

---

## 2) Why I used to hate writing component tests
**Slide (text)**
The frustrations:
- a) **I can't see what's happening** — very frustrating
- b) **"Did you forget `act`?"** — cryptic errors
- c) **Hover doesn't really work** — simulated events ≠ real interactions
- d) **My tests break when the DS implementation changes** — even though UX is identical
- e) **I don't want to mock my own code** — internal function mocking is fragile
- f) **The BE? It's Cursor who writes the tests!!** — the method must work for humans AND AI

**What I say**
- "Here's the chain of frustrations I had when writing component tests."
- "I couldn't see anything, I got weird errors, hover didn't work, my tests broke for no reason."
- "And when I mocked my own functions, any rename would kill the tests."
- "I needed something better."
- "Let me show you concrete examples of frustrations b and c."

---

## 3) Demo: frustration b — "Did you forget `act`?" (`progress` project)
**Slide (text)**
Project: `packages/progress`
- A `ProgressBar` component — native `<progress>` element
- Subscribes to `window` custom events (`progress-${id}`) to update its value
- Same component, same test logic — **two environments**

**What I do (live)**
- Show `ProgressBar` component code — `useState` + `useEffect` listening to `window.dispatchEvent`
- Show the **unit test** (JSDOM): wraps `dispatchEvent` in `act()`, synchronous `expect().toHaveValue(i)`
- Show the **browser test**: just dispatches the event and asserts — **no `act` needed**
- Run unit test → ✅ Green (with `act`)
- Remove `act` from unit test → ❌ Fails! State update not flushed
- Run browser test → ✅ Green (no `act` at all)

**What I say**
- "Here's a simple ProgressBar that listens to window events."
- "In the unit test, I need `act` to flush React's state updates. Without it — the test fails."
- "In the browser test, the exact same logic works without `act`. The browser handles it naturally."
- "Same component, same test — but the unit test forces me to know React internals."

**Code shown**

Unit test (requires `act`):
```typescript
it('should update progress when receiving a window event', () => {
  render(<ProgressBar id="upload" testId="pb" />);
  for (let i = 5; i <= 100; i = i + 5) {
    act(() => {
      window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    });
    expect(screen.getByTestId('pb')).toHaveValue(i);
  }
});
```

Browser test (no `act`):
```typescript
it('should update progress when receiving a window event', async () => {
  await render(<ProgressBar id="upload" testId="pb" />);
  for (let i = 5; i <= 100; i = i + 5) {
    window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    await expect.element(page.getByTestId('pb')).toHaveValue(i);
  }
});
```

---

## 4) Demo: frustration c — hover doesn't work in JSDOM (`progress-with-hover` project)
**Slide (text)**
Project: `packages/progress-with-hover`
- Same `ProgressBar` but with a **CSS-only hover popover** showing `{progress}%`
- CSS rule: `.progress-wrapper:hover .progress-popover { display: block }`
- **JSDOM cannot apply `:hover` CSS** — the popover never becomes visible

**What I do (live)**
- Show the component — wrapper div, `<progress>`, popover div with `display: none`, CSS `:hover` rule
- Show the **unit test**: dispatches events, hovers with `userEvent.hover()`, asserts `toBeVisible()`
- Run unit test → ❌ **Fails!** `expect(popover).toBeVisible()` — JSDOM doesn't trigger `:hover` CSS
- Show the **browser test**: same logic with `userEvent.hover()` from Vitest browser
- Run browser test → ✅ **Passes!** Real browser applies `:hover` CSS, popover becomes visible

**What I say**
- "Same ProgressBar, but now with a CSS hover popover."
- "The unit test hovers the element… but JSDOM doesn't apply CSS `:hover`. The popover stays hidden."
- "The test fails — not because my code is wrong, but because the environment can't handle it."
- "In the browser test — it just works. Real hover, real CSS, real result."
- "This is a false fail: my code is correct, but the test says it's broken."

**Code shown**

CSS rule:
```css
.progress-wrapper:hover .progress-popover {
  display: block;
}
```

Unit test (❌ fails — JSDOM can't apply `:hover` CSS):
```typescript
it('should show popover with progress value on hover', async () => {
  render(<ProgressBar id="upload" testId="pb" />);
  for (let i = 5; i <= 100; i = i + 5) {
    act(() => {
      window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    });
    expect(screen.getByTestId('pb-popover')).not.toBeVisible();
    await userEvent.hover(screen.getByTestId('pb'));
    expect(screen.getByTestId('pb-popover')).toBeVisible(); // ❌ FAILS HERE
    await userEvent.unhover(screen.getByTestId('pb'));
  }
});
```

Browser test (✅ passes — real browser handles `:hover`):
```typescript
it('should show popover with progress value on hover', async () => {
  await render(<ProgressBar id="upload" testId="pb" />);
  for (let i = 5; i <= 100; i = i + 5) {
    window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    await expect.element(page.getByTestId('pb-popover')).not.toBeVisible();
    await userEvent.hover(page.getByTestId('pb'));
    await expect.element(page.getByTestId('pb-popover')).toBeVisible(); // ✅ PASSES
    await userEvent.unhover(page.getByTestId('pb'));
  }
});
```

---

## 5) Demo: composing components — `table-tasks` project
**Slide (text)**
Project: `packages/table-tasks`
- A `TaskTable` component — table of tasks, each with a `ProgressBar` (from `progress-with-hover`)
- Shows real-world usage: multiple ProgressBars on the same page
- Each subscribes to its own `progress-${task.id}` event
- Storybook stories for visual showcase

**What I do (live)**
- Show the `TaskTable` component — imports `ProgressBar` from `@demo/progress-with-hover`
- Show Storybook with sample tasks (Design mockups: 100%, Build API: 75%, Frontend: 40%, Tests: 10%, Deploy: 0%)
- Hover over individual progress bars → popovers appear correctly on each one

**What I say**
- "Now let's see the ProgressBar in context — a task table with multiple progress bars."
- "Each one subscribes to its own event, each popover works independently."
- "This is what you'd build in a real app — and the browser tests handle it naturally."

---

## 6) A test written with JSDOM + RTL (the starting point)
**Slide (text)**
Let's look at a concrete example:
- A **Checkbox** component (from our mini Design System)
- A **CheckboxGroup** feature (text + multiple checkboxes)
- What it does (the UX)
- The tests (written with JSDOM + RTL)

**What I do (live)**
- Show the Checkbox component code
- Show the CheckboxGroup feature code
- Show what it does
- Show the tests
- Run the tests → ✅ Green!

**What I say**
- "Here's a test written with JSDOM + React Testing Library."
- "It tests a checkbox group built on a design system."
- "It's green! Great. But... what actually happened? I have no idea."
- "I can't see the UI. I'm testing blind."

---

## 7) Upgrade: Vitest Browser Mode — seeing the real thing
**Slide (text)**
**Vitest Browser Mode** = your Vitest tests run in a real browser (not JSDOM)

Why **Browser Mode**?
- You **see** the UI during the test
- Real interactions (hover, focus, pointer…)
- Less gap with production
- Debugging becomes visual

**What I do (live)**
- Rewrite the same tests with Vitest Browser Mode
- Run the tests → the browser opens, we see everything live

**What I say**
- "Now I rewrite with Vitest Browser Mode."
- "Look — we can actually see what's happening. It's beautiful."
- "Hover, focus, layout… it's the real thing."
- "We already saw this with the ProgressBar demos — no `act`, hover works, CSS applies."
- "This alone already solves frustrations a, b, and c."

---

## 8) The "Ouch" moment: DS team refactors Checkbox (same UX, broken tests)
**Slide (text)**
The Design System team refactors Checkbox internally
- No UX change — same visual, same behavior
- Just an implementation detail (wrapper/span/DOM structure…)

**What I do (live)**
- Apply the DS team's refactor to Checkbox
- Rerun the feature tests → ❌ They break!

**What I say**
- "Ok, now I'm going to break something on purpose."
- "The DS team refactored the Checkbox. Nothing changed for the user."
- "I rerun my tests… and they crash."
- "We changed nothing for the user… yet it breaks: why?"
- "Because my tests were looking at the implementation, not the experience."

---

## 9) The solution: Testkit
**Slide (text)**
**Testkit = usage-oriented driver**
- Stable interface to interact with a component
- Hides DOM details
- Exposes what the user can do / see

Checkbox testkit:
- `exists()`
- `check()` / `uncheck()`
- `isChecked()`
- (optional) `hover()` / `focus()` / `isDisabled()`

**What I do (live)**
- Show the Checkbox testkit code
- Explain: every component that participates receives a `testId`
- Rewrite the feature tests using the testkit

**What I say**
- "A testkit is an abstraction layer."
- "The test should speak the user's language: 'check', 'is checked'… not 'querySelector on the 3rd span'."
- "The testkit is the single place that knows the DOM."
- "Each component that the test interacts with gets a `testId`."

---

## 10) Rerun: refactor Checkbox again… and it passes
**Slide (text)**
Same internal change
✅ Tests pass
➡️ We tested the experience, not the DOM

**What I do (live)**
- Rerun the tests with testkits → ✅ Green!
- Apply another internal refactor to Checkbox
- Rerun → still ✅ Green!

**What I say**
- "I rerun — it works."
- "Now even if the DS team makes changes, I won't feel it."
- "We just gained the most important property: refactor-friendly."
- "The testkit is the agreement: the component refactors, the test stays stable."

---

## 11) Adding data: mocking internal functions (the trap)
**Slide (text)**
Now we add real data to the feature:
- The feature calls a function to fetch data
- We mock that function in the test

**What I do (live)**
- Add data-fetching to the feature
- Mock the internal function in the test
- Run → ✅ Green
- Rename the function → ❌ Tests break!

**What I say**
- "Now I add data. I mock the function that fetches it."
- "I run the tests — it works."
- "But now I rename the function…"
- "It doesn't work anymore."
- "I don't want to mock functions from my own code. It's fragile."

---

## 12) Mock at the farthest level: MSW
**Slide (text)**
**The idea: mock as far away as possible**
- Don't mock your own functions
- Mock the **HTTP layer** instead
- **MSW (Mock Service Worker)** intercepts browser HTTP calls

Why MSW?
- Works in the real browser
- Your code runs fully (fetch, axios, whatever)
- Rename functions? No problem — the HTTP mock still works

**What I do (live)**
- Introduce MSW to mock the API
- Rewrite the tests with MSW
- Run → ✅ Green
- Change the internal function (switch to axios) → still ✅ Green

**What I say**
- "The idea is to mock as far away as possible."
- "MSW mocks at the HTTP level — in the real browser."
- "I rewrite the tests, I run — it's green."
- "Now I change the function, I use axios instead of fetch."
- "It's still green. Because the mock is at the right level."

---

## 13) The method — a checklist that works for me AND for Cursor
**Slide (text)**
The method:
1) **Mock the APIs used** (with MSW — define defaults, override per test)
2) **Verify that each component ("lego") that participates has a `testId`**
3) **Instance a testkit for each DS component used**
4) **Write the story with testkit instances**

**What I say**
- "Here's the method, summarized in 4 steps."
- "It's a routine: once you have it, you always know where to start."
- "And the beautiful thing: this method works for me — and it works for Cursor too."
- "Because it's structured and explicit, even AI can follow it and write good tests."

---

## 14) Recap diagram (simple and memorable)
**Slide (diagram)**
**Feature test** = Test story → **Testkits** → UI (DS components)
In parallel: **MSW** → APIs

**What I say**
- "If you remember just one image: test story on top, testkits as adapters, MSW for data."

---

## 15) Conclusion: what it concretely changes
**Slide (text)**
What it brought me:
- Fewer false fails
- Painless refactors
- Tests that look like specs
- More confidence in UI behavior
- A method that works for humans AND AI

**What I say**
- "Tests become a development tool, not a punishment."
- "And above all: they hold up better in real life."
- "It works for me — it works for Cursor."

---

## 16) Q&A / discussion
**Slide (text)**
Questions:
- Where to draw the line between **testkit vs feature test**?
- What granularity of `testId`?
- How do we organize testkits in the repo?
- How does Cursor use this method?

**What I say**
- "I can also quickly show our organization in the repo if you're interested."

---

# Bonus: transitions (story phrases)
- "Here's the chain of frustrations…"
- "Let me show you concrete examples."
- "Same component, same test — but the unit test forces me to know React internals."
- "The test fails — not because my code is wrong, but because the environment can't handle it."
- "Now let's see it in context — a real feature with multiple progress bars."
- "It's green! But… what actually happened? I have no idea."
- "Look — we can actually see what's happening."
- "Ok, now I'm going to break something on purpose."
- "We changed nothing for the user… yet it breaks: why?"
- "The problem isn't the test, it's what the test looks at."
- "The testkit is the agreement: the component refactors, the test stays stable."
- "I don't want to mock my own code."
- "The idea: mock as far away as possible."
- "It works for me — it works for Cursor."

---

# Demo structure (exact order)
1) Show frustrations list
2) Demo `progress` — unit test needs `act`, browser test doesn't → frustration b
3) Demo `progress-with-hover` — hover fails in JSDOM, works in browser → frustration c
4) Demo `table-tasks` — ProgressBar composed in a real feature (Storybook)
5) Show JSDOM + RTL test (checkbox group) → green but blind → frustration a
6) Rewrite with Vitest Browser Mode → now we see
7) DS team refactors Checkbox → tests break → frustration d
8) Introduce testkit → rewrite tests → green, refactor again → still green
9) Add data, mock internal function → green, rename → breaks → frustration e
10) Introduce MSW → rewrite, run → green, change to axios → still green
11) Method checklist + diagram + conclusion

---

# Demo projects reference
| Project | Package | What it demonstrates |
|---------|---------|---------------------|
| `progress` | `@demo/progress` | `act` required in JSDOM, not in browser |
| `progress-with-hover` | `@demo/progress-with-hover` | CSS `:hover` fails in JSDOM, works in browser |
| `table-tasks` | `@demo/table-tasks` | Real-world composition with multiple ProgressBars |
| `design-system` | `@demo/design-system` | Checkbox component + testkit |
| `where-rtl-lost-me` | `@demo/where-rtl-lost-me` | CheckboxGroup feature tests |
