# Screen Reader Playground — Plan

A 7-step wizard form built with USWDS that teaches first-time screen reader users the most fundamental navigation patterns. The UI is both the lesson and the demonstration — every semantic HTML choice is the thing being taught.

---

## Tech Stack

- React 19 + Vite + TypeScript (strict)
- `@uswds/uswds` 3.x — component classes + SCSS tokens
- `sass` dev dependency — required to use USWDS token functions
- Vite `css.preprocessorOptions.scss.loadPaths` pointing to `node_modules/@uswds/uswds/packages`

USWDS tokens are accessed in SCSS via:
```scss
@use "uswds-core" as uswds;
color: uswds.color('base-darker');
padding: uswds.units(2);
```

---

## Design Direction

Prioritize simplicity and clarity in the style of government sites built with USWDS (login.gov, usa.gov, vote.gov):

- **Typography:** Public Sans; clear hierarchy between heading and body sizes
- **Color:** USWDS government blue (`primary`) for actions; neutral grays for text and borders; white backgrounds
- **Whitespace:** generous padding and spacing; content never feels cramped
- **Layout:** single-column, centered, max-width constrained; no sidebars or decorative columns
- **No decoration:** no gradients, drop shadows, illustrations, or ornamental elements; every visual element serves a functional purpose
- **Plain language:** tip box copy is short, direct, and jargon-free

---

## Steps

| # | Concept | What the user learns |
|---|---|---|
| 1 | Tab Navigation | Tab moves focus between interactive elements; Shift+Tab goes back |
| 2 | Arrow Key Navigation | Arrow keys move between options within a group (radios, tabs, menus) |
| 3 | Navigating by Heading | Screen readers can jump between headings with a single key; heading hierarchy matters |
| 4 | Form Labels | Every input needs a visible `<label>`; placeholder text is not a label |
| 5 | Required Fields & Validation | Required fields must be marked in the label; errors must be associated with the input |
| 6 | Grouped Controls | `<fieldset>` and `<legend>` give a radio or checkbox group a shared question |
| 7 | Review & Submit | Landmarks let users jump to sections; button labels must describe the action |

Post-submit: completion screen with focus moved to success `<h1>`.

---

## Semantic HTML Principles (per step)

**Step 1 — Tab Navigation**
Use only natively focusable elements (`<button>`, `<a>`, `<input>`) in the demo area. Show how a `<div>` is skipped while a `<button>` is not. The lesson: semantic elements come with built-in keyboard behavior for free.

**Step 2 — Arrow Key Navigation**
Use a `<fieldset>` + `<legend>` with `<input type="radio">`. Native radio inputs handle arrow-key roving automatically — no JavaScript needed. This is the clearest demonstration of why semantic HTML beats `<div>` + ARIA.

**Step 3 — Navigating by Heading**
The step itself uses a proper `<h1>`. The tip explains how heading elements create a navigable document outline and why skipping levels (e.g. `<h1>` → `<h3>`) breaks that structure.

**Step 4 — Form Labels**
Every input has an explicit `<label for="...">` paired to the input's `id`. Placeholders disappear when the user types and have no semantic relationship to the input — teach this by showing both patterns side by side.

**Step 5 — Required Fields & Validation**
The word "required" appears in the `<label>` text, not only as a visual asterisk. Errors are `<p>` elements adjacent to and linked with the input — a colour change or icon alone communicates nothing to a screen reader.

**Step 6 — Grouped Controls**
`<fieldset>` + `<legend>` is the semantic container for any group of related inputs. Without it, a screen reader user hears "Yes" with no context. With it, they hear the question before each option.

**Step 7 — Review & Submit**
Use landmark elements (`<main>`, `<nav>`, `<header>`) so users can jump to sections. Use `<dl>` / `<dt>` / `<dd>` for the review summary — it communicates key/value pairs semantically. Button text must describe the action, not the mechanism.

---

## File Structure

```
src/
  types/form.ts               FormData, StepIndex (0–6), STEP_TITLES, TOTAL_STEPS
  components/
    TipBox.tsx                usa-alert usa-alert--info; explains the concept for each step
    ProgressBar.tsx           usa-step-indicator; aria-current="true" on active segment
    steps/
      Step1TabNav.tsx         focusable vs non-focusable element demo
      Step2ArrowNav.tsx       radio group with fieldset/legend; arrow key demo
      Step3Headings.tsx       name input; tip explains heading hierarchy
      Step4Labels.tsx         email input; label vs placeholder explanation
      Step5Required.tsx       postcode (required) + phone (optional); inline error
      Step6Grouped.tsx        radio group (SR usage) + checkbox group (devices)
      Step7Review.tsx         dl summary; landmark explanation; submit
  App.tsx                     step state, live region, headingRef, navigation handlers
  App.scss                    shell/layout only; USWDS tokens for spacing/color
  index.scss                  resets, #root layout; USWDS tokens for base styles
  main.tsx                    imports uswds.min.css, index.scss, App
```

---

## Key Patterns

### Focus management on step transitions
`App.tsx` owns a `headingRef` passed to every step. Each step's `<h1>` has `tabIndex={-1}` so it can receive programmatic focus without entering the tab order. A `useEffect` fires `headingRef.current?.focus()` inside `requestAnimationFrame` on each step change.

### Live region
A single `<div role="status" aria-live="polite" aria-atomic="true" className="usa-sr-only">` outside all landmarks announces step transitions ("Step 3 of 7: Navigating by Heading").

### Validation (Step 5)
On a failed Next attempt: set `aria-invalid="true"` on the input, populate the error element, move focus to the input. The error `<p>` is always in the DOM (`visibility: hidden` when empty) so its `id` reference in `aria-describedby` is always valid. No `role="alert"` — focus movement already causes the screen reader to re-read the associated description.

---

## USWDS Component Mapping

| Purpose | USWDS class(es) |
|---|---|
| Progress bar | `usa-step-indicator`, `usa-step-indicator__segment` |
| Tip/info box | `usa-alert usa-alert--info usa-alert--no-icon` |
| Text input | `usa-form-group`, `usa-label`, `usa-hint`, `usa-input` |
| Error state | `usa-form-group--error`, `usa-input--error`, `usa-error-message` |
| Radio group | `usa-radio`, `usa-radio__input`, `usa-radio__label` |
| Checkbox group | `usa-checkbox`, `usa-checkbox__input`, `usa-checkbox__label` |
| Primary button | `usa-button` |
| Back button | `usa-button usa-button--outline` |
| Edit links (review) | `usa-button usa-button--unstyled` |
| Screen-reader only | `usa-sr-only` |

---

## Implementation Phases

### Phase 1 — Shell
- `index.html` title
- `src/types/form.ts`
- Install `sass`, configure `vite.config.ts` loadPaths
- `index.scss` + `App.scss` with USWDS tokens
- `App.tsx` skeleton: step state, live region, headingRef, navigation handlers
- `ProgressBar.tsx` + `TipBox.tsx`
- Stub step components (heading + "coming soon")

**Demoable:** shell navigates all 7 steps, progress bar updates, focus moves to each heading, live region fires.

### Phase 2 — Steps 1–4
- `Step1TabNav.tsx` — focusable vs non-focusable element demo
- `Step2ArrowNav.tsx` — radio group arrow key demo
- `Step3Headings.tsx` — name input with hint
- `Step4Labels.tsx` — email input; label vs placeholder

**Demoable:** first four steps fully functional.

### Phase 3 — Steps 5–6
- `Step5Required.tsx` — postcode + phone, validation, inline error
- `Step6Grouped.tsx` — radio + checkbox groups with fieldset/legend

**Demoable:** validation flow and grouped controls work end-to-end.

### Phase 4 — Review & Completion
- `Step7Review.tsx` — `<dl>` summary, Edit buttons, Submit
- Completion screen with focus moved to success heading

**Demoable:** full wizard end-to-end.
