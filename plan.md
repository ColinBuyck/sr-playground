# Plan: Multi-Step Screen Reader Playground Form

## Context

The project currently holds a default Vite React template. This plan replaces it with the actual Screen Reader Playground: a 6-step wizard form that teaches first-time screen reader users the most fundamental navigation and interaction patterns. The form is both the content and the demonstration — every ARIA attribute used in building it is also the thing being taught.

---

## Step Breakdown

| Step | Concept | Key fields / interactions |
|---|---|---|
| 1 | Tab & Arrow Key Navigation | A small set of interactive elements (link, button, input, select, radio group) to Tab through and arrow-key within |
| 2 | Navigating by Heading | Name text input (hint text via `aria-describedby`); step content includes H1/H2/H3 hierarchy to navigate with H key |
| 3 | Form Labels | Email input (proper `<label>` association, hint text; contrasted with a "bad example" using placeholder only) |
| 4 | Required Fields & Validation | Postcode (required, `aria-invalid`, error via `aria-describedby`); Phone (optional) |
| 5 | Grouped Controls | Radio group (SR usage, `<fieldset>`+`<legend>`, `aria-required`); Checkbox group (devices) |
| 6 | Review + Landmarks vs Buttons | `<dl>` summary, Edit buttons with unique `aria-label`, Submit |

After submit: completion screen with focus managed to `<h1>` success heading.

### Step 1 detail — Tab & Arrow Key Navigation

**Concept:** Tab moves focus between interactive elements (links, buttons, inputs). Shift+Tab moves backwards. Arrow keys move between options *within* a group (radio buttons, select dropdowns) — they do not leave the group. This is the most fundamental distinction for keyboard and screen reader users.

**What the step contains:**
- A short explanatory paragraph before the interactive area
- A demo sandbox with: one `<a>` link (external, opens in new tab), one `<button>`, one `<input type="text">`, one `<select>`, and one radio group (3 options) — all inert/demo-only, not tied to form data
- A "your turn" prompt: "Tab through each element below. When you reach the radio group, use the arrow keys to move between options."
- A hidden `<input type="text" id="tab-answer">` at the bottom of the sandbox labelled "What key moves you between groups of options?" — a simple reflection question tied to `formData.tabAnswer`; no validation required

**Tip box content:**
> "**Tab** moves to the next interactive element. **Shift+Tab** moves backwards. **Arrow keys** move *within* a group — like between radio buttons or options in a dropdown. Your screen reader announces each element's role and label as focus moves."
>
> "What your screen reader says when you Tab to the button: 'Demo button, button.'"

---

## Architecture

```
src/
  types/
    form.ts               — FormData interface, StepIndex (0|1|2|3|4|5), STEP_TITLES, TOTAL_STEPS=6
  components/
    TipBox.tsx            — styled <div> with <h2>; NOT an <aside> (avoids duplicate landmark names)
    ProgressBar.tsx       — <nav aria-label="Form progress"> <ol> with aria-current="step"
    steps/
      Step1TabNavigation.tsx
      Step2Headings.tsx
      Step3Labels.tsx
      Step4Required.tsx   — owns postcodeError state + validation logic
      Step5Grouped.tsx
      Step6Review.tsx
  App.tsx                 — all step state, live region, headingRef, navigation handlers
  App.css                 — all new CSS (custom properties, .sr-only, .btn, .field, .tip-box)
  index.css               — keep unchanged
index.html                — title update only
```

### `src/types/form.ts`

```ts
export interface FormData {
  tabAnswer: string;   // Step 1 reflection question
  name: string;        // Step 2
  email: string;       // Step 3
  phone: string;       // Step 4 (optional)
  postcode: string;    // Step 4 (required)
  srUsage: string;     // Step 5 radio
  devices: string[];   // Step 5 checkboxes
}

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5
export const TOTAL_STEPS = 6
export const STEP_TITLES: Record<StepIndex, string> = {
  0: 'Tab and Arrow Key Navigation',
  1: 'Navigating by Heading',
  2: 'Form Labels',
  3: 'Required Fields and Validation',
  4: 'Grouped Controls',
  5: 'Review and Submit',
}
```

---

## Key Patterns

### Focus management on step transitions

`App.tsx` owns a single `headingRef = useRef<HTMLHeadingElement>(null)` passed as a prop to every step. Each step's `<h1>` receives `ref={headingRef}` and `tabIndex={-1}`. A `useEffect` fires on `currentStep` change:

```ts
useEffect(() => {
  const id = requestAnimationFrame(() => headingRef.current?.focus())
  return () => cancelAnimationFrame(id)
}, [currentStep])
```

A separate `completionRef` handles the post-submit heading with the same pattern, triggered by `submitted` state.

`tabIndex={-1}` makes headings programmatically focusable without entering the Tab order. Add `.step-title:focus { outline: none }` in CSS (safe — this element is never Tab-focused).

### Live region

A single `<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">` rendered by App, **outside all landmarks**, announces step transitions (e.g. "Step 2 of 6: Navigating by Heading"). Driven by `liveMessage` state set in `goNext`/`goBack`/`goToStep`. Visually hidden with `.sr-only` (not `display:none` — must stay in the AT tree).

### Validation (Step 4 only)

Step4Required owns `postcodeError` state and a `postcodeRef`. On "Next" click with empty postcode:
- Set error message, set `aria-invalid="true"`, move focus to the input via `postcodeRef.current?.focus()`
- Do NOT call `onNext` — stay on the step
- Error `<p id="postcode-error">` is always in the DOM (empty when valid, `visibility: hidden`) — referenced in `aria-describedby` at all times. **No `role="alert"`** — focus moves to the input, which causes the SR to re-read `aria-describedby` including the error text.
- Clear error when user starts typing a non-empty value.

### Grouped controls (Step 5)

- `<fieldset aria-required="true">` + `<legend>` for the radio group
- `<span aria-hidden="true">*</span>` inside legend for the asterisk (decorative, not read by SR)
- Plain `<fieldset>` + `<legend>` for the checkbox group (optional)

### Review step (Step 6)

- Summary in `<dl>` / `<dt>` / `<dd>` pairs
- Edit buttons: `<button aria-label="Edit step 1, Tab and Arrow Key Navigation">` — unique `aria-label` per button
- Tip box explains these are `<button>` elements (in-page action) not `<a>` elements (navigation)

---

## ARIA Quick Reference

| Element | Attributes |
|---|---|
| All step `<h1>` | `tabIndex={-1}`, `id="step-heading"`, `ref={headingRef}` |
| Wrapping `<section>` | `aria-labelledby="step-heading"` |
| Live region `<div>` | `role="status"`, `aria-live="polite"`, `aria-atomic="true"` |
| ProgressBar `<nav>` | `aria-label="Form progress"` |
| Active progress `<li>` | `aria-current="step"` |
| Step 1 demo sandbox | `role="group"` + `aria-label="Interactive demo"` on the wrapper `<div>` |
| Step 1 reflection input | `aria-describedby="tab-answer-hint"` |
| Step 2 name input | `aria-describedby="name-hint"`, `autoComplete="given-name"` |
| Step 3 email input | `aria-describedby="email-hint"`, `type="email"`, `autoComplete="email"` |
| Step 4 postcode input | `aria-required="true"`, `aria-invalid="true"/"false"`, `aria-describedby="postcode-hint postcode-error"`, `autoComplete="postal-code"` |
| Step 5 radio `<fieldset>` | `aria-required="true"` |
| Step 5 legend asterisk `<span>` | `aria-hidden="true"` |
| Step 6 Edit buttons | `aria-label="Edit step N, [title]"` (unique per button) |

---

## CSS

### Design token layer — `index.css` `:root` block (extend, do not overwrite)

Add all new tokens alongside the existing ones. Tokens are grouped by semantic purpose, not by component:

```css
/* Semantic colour tokens */
--color-input-border: #767676;       /* 4.54:1 on white — passes 3:1 UI threshold */
--color-input-border-focus: var(--accent);
--color-error: #c0392b;
--color-error-bg: #fdf2f2;
--color-error-border: #e74c3c;
--color-success: #1a7a4a;
--color-tip-bg: var(--accent-bg);
--color-tip-border: var(--accent);

/* Spacing scale */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Layout tokens */
--layout-step-max-width: 680px;
--layout-step-padding: var(--space-2xl) var(--space-xl);

/* Shape tokens */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;

/* Interactive element tokens */
--size-touch-target: 44px;           /* WCAG 2.5.5 minimum */
--focus-ring: 0 0 0 3px var(--accent);

/* Typography tokens */
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 20px;
--font-size-heading-step: 32px;

@media (prefers-color-scheme: dark) {
  --color-input-border: #9ca3af;
  --color-error: #f87171;
  --color-error-bg: #2c1f1f;
  --color-error-border: #f87171;
  --color-success: #34d399;
}
```

### Component class layer — `App.css`

Component classes consume tokens only — no raw values. New component styles go in `App.css` alongside the existing ones.

```css
/* Utility */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
           overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* Buttons */
.btn { font: inherit; font-size: var(--font-size-md); font-weight: 500;
       padding: 10px var(--space-lg); border-radius: var(--radius-md);
       border: 2px solid transparent; cursor: pointer;
       min-height: var(--size-touch-target); min-width: var(--size-touch-target);
       transition: box-shadow 0.2s, background-color 0.2s; }
.btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.btn-primary  { background: var(--accent); color: #fff; }
.btn-secondary { background: transparent; color: var(--text-h); border-color: var(--color-input-border); }

/* Form fields */
.field { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-lg); }
.field label { font-weight: 500; font-size: var(--font-size-md); color: var(--text-h); }
.field input, .field select {
  font: inherit; font-size: var(--font-size-md);
  padding: 10px 12px; border: 2px solid var(--color-input-border);
  border-radius: var(--radius-md); background: var(--bg); color: var(--text-h);
  min-height: var(--size-touch-target); }
.field input:focus-visible, .field select:focus-visible {
  outline: none; box-shadow: var(--focus-ring); border-color: var(--color-input-border-focus); }
.field input[aria-invalid="true"] { border-color: var(--color-error-border); }
.field-hint  { font-size: var(--font-size-sm); color: var(--text); margin: 0; }
.field-error { font-size: var(--font-size-sm); color: var(--color-error); font-weight: 500; margin: 0; }
.field-error--hidden { visibility: hidden; }   /* keeps DOM node; aria-describedby ref stays valid */

/* Tip box */
.tip-box { background: var(--color-tip-bg); border: 1px solid var(--color-tip-border);
           border-radius: var(--radius-lg); padding: var(--space-lg) var(--space-xl);
           margin: var(--space-xl) 0; }
.tip-box h2 { font-size: var(--font-size-md); font-weight: 600; color: var(--accent); margin: 0 0 var(--space-sm); }

/* Step layout */
.step-content { text-align: left; max-width: var(--layout-step-max-width);
                margin: 0 auto; padding: var(--layout-step-padding);
                width: 100%; box-sizing: border-box; }
.step-title { font-size: var(--font-size-heading-step); letter-spacing: -0.5px; margin: 0 0 var(--space-sm); }
.step-title:focus { outline: none; }   /* programmatic-focus only; never Tab-focused */

/* Demo sandbox (Step 1) */
.demo-sandbox { border: 2px dashed var(--color-input-border); border-radius: var(--radius-lg);
                padding: var(--space-xl); display: flex; flex-direction: column;
                gap: var(--space-md); margin: var(--space-lg) 0; }
```

`index.html`: Update `<title>` to `Screen Reader Playground — Learn Screen Reader Basics`

---

## TypeScript Notes

- `StepIndex` is `0 | 1 | 2 | 3 | 4 | 5` — use a lookup object in `renderStep()` rather than a switch to avoid needing a `default` branch
- `onChange` prop: `(field: keyof FormData, value: string | string[]) => void` — use a separate `onDevicesChange` prop for the checkbox handler to avoid a type union awkwardness
- `noUnusedLocals` / `noUnusedParameters` enforced — every imported type and prop must be used

---

## Implementation Phases

Each phase ends in a runnable, demoable state.

### Phase 1 — Shell (navigable skeleton, no real content)

Goal: The wizard is running. You can Tab through steps and see the heading change. Nothing looks good yet.

1. Update `index.html` title
2. Create `src/types/form.ts` — `FormData`, `StepIndex`, `STEP_TITLES`, `TOTAL_STEPS`
3. Rewrite `src/App.tsx` — step state, `headingRef`, live region, `goNext`/`goBack`, placeholder rendering for all 6 steps as `<p>Step N placeholder</p>`
4. Add `.sr-only` and base token variables to `index.css` `:root`

**Demo check:** `npm run dev` — stepping Next/Back moves focus to each step's `<h1>` and live region announces the step title.

---

### Phase 2 — Shared components + design tokens

Goal: The visual shell looks correct. Progress bar works. Tip box is styled. Form field classes exist.

5. Rewrite `src/App.css` — all token-consuming component classes (`.btn`, `.field`, `.tip-box`, `.step-content`, `.step-title`, `.demo-sandbox`)
6. Create `src/components/TipBox.tsx`
7. Create `src/components/ProgressBar.tsx`
8. Wire `ProgressBar` into `App.tsx` above the step area

**Demo check:** Progress dots update with each step. Back/Next buttons are styled. Heading and layout look correct.

---

### Phase 3 — Steps 1 & 2 (keyboard fundamentals + headings)

Goal: The two foundational concept steps are fully built and teach their content.

9. Create `src/components/steps/Step1TabNavigation.tsx` — demo sandbox with link, button, input, select, radio group; reflection input; tip box
10. Create `src/components/steps/Step2Headings.tsx` — name input with hint text; H1/H2/H3 hierarchy in content; tip box

**Demo check:** Tab through all elements on Step 1 sandbox. SR announces each role. Step 2 heading hierarchy navigable with H key in VoiceOver/NVDA.

---

### Phase 4 — Steps 3 & 4 (labels + validation)

Goal: Form label and validation patterns are demoable end-to-end.

11. Create `src/components/steps/Step3Labels.tsx` — email input with proper label + hint; tip box explaining placeholder vs label
12. Create `src/components/steps/Step4Required.tsx` — postcode (required, validation, `aria-invalid`), phone (optional); tip box

**Demo check:** Attempt to advance past Step 4 with empty postcode — focus moves to input, error text is read by SR. Clear the error by typing.

---

### Phase 5 — Steps 5 & 6 (grouped controls + review)

Goal: The full form is completable and submittable.

13. Create `src/components/steps/Step5Grouped.tsx` — radio group + checkbox group with `<fieldset>`/`<legend>`; tip box
14. Create `src/components/steps/Step6Review.tsx` — `<dl>` summary, Edit buttons with unique `aria-label`, Submit
15. Wire `onGoToStep` and `handleSubmit` into App; add completion screen with `completionRef`

**Demo check:** Complete all 6 steps, verify summary shows correct values, submit shows completion heading with focus. Edit a step from the review and return.

---

## Verification

1. `npm run build` — TypeScript strict mode catches missing props and type errors
2. `npm run lint` — ESLint catches hooks violations
3. `npm run dev` — test keyboard-only navigation (Tab, Shift+Tab, Space, Enter, arrow keys)
4. Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows) and verify:
   - Step 1 sandbox: Tab moves between elements, arrow keys move within the radio group and select
   - Step 2: H key jumps between the H1/H2/H3 headings in the step content
   - Each input announces its label and hint text
   - Postcode error on Step 4 is read after a failed Next attempt
   - Radio/checkbox groups announce the legend (question) before each option
   - Focus moves to the step heading on every transition
   - Live region announces the step number and title
   - Edit buttons on Step 6 have unique accessible names
5. Verify colour contrast for `--input-border` and white text on `.btn-primary` before shipping
