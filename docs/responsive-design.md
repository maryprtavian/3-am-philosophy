# Responsive design

Step 06, 23 September 2026.

These notes record Step 06 verification. Step 07 subsequently added browser history and transitions;
see [navigation and interaction](./navigation-and-interaction.md) for current behavior and totals.
Step 08 added a question for reflection at pauses and rechecked the layout matrix; see the
[experience review](./experience-review.md) for the latest change and totals.

The interface now implements the agreed reading-room style across narrow, wide, and short screens.
The question remains the focus: Georgia headings, system-font controls, a charcoal/ivory dark
appearance, warm-paper light appearance, and amber opening actions. System preference selects the
theme; the opening screen still has only one interactive control.

## Implementation decisions

`src/styles/global.css` defines tokens for color, font families, type sizes, line heights, spacing,
reading width, targets, radii, focus, and motion. `src/components/App.module.css` applies them to
the interface. The only component change is a `data-screen` attribute for screen-specific styling.
The content, reducer, and interaction behavior are unchanged.

- The reading region is capped at 38 rem (608 CSS pixels with the default font size). It is
  centered when it fits; the document grows and scrolls naturally when more height is needed.
- Questions scale from 2 to 3 rem, with a larger opening title. Type uses `rem` and `clamp()` so it
  follows text preferences while adapting to width. Text wraps without fixed heights or clipping.
- Side gutters range from 20 to 32 pixels at the default font size. Vertical spacing contracts on
  short screens. Controls stay in normal document flow.
- Below 40 rem of viewport width, answers stack. At wider sizes, a wrapping flex layout uses
  [`max-content` sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-basis)
  and a half-row minimum width: short labels receive equal columns; labels that need more space
  force full rows. No character-count guess or JavaScript resize listener is needed.
- Primary actions are softly rounded. Answer and primary targets are at least 52 pixels high;
  secondary controls are at least 44 × 44 pixels. Sizes scale with the root font size.
- Hover effects are limited to hover-capable devices. Focus keeps its visible three-pixel outline,
  and both answers use identical styles.
- `100dvh` tracks available viewport height, with `svh` and `vh` fallbacks. It is a minimum height,
  so long content expands the page. See the
  [viewport-unit reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length).
- `viewport-fit=cover` and padding based on
  [`env(safe-area-inset-*)`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)
  keep the reading region clear of reported device insets. Zoom is not disabled.
- Motion tokens are ready for Step 07, with a zero-duration value for reduced motion. Screen
  transitions have not been introduced in this step.

## Palette checks

The tests check computed foreground/background colors in each scheme. Text exceeds a 4.5:1
contrast threshold, and answer boundaries exceed 3:1 against both the control and page backgrounds.
The [W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
provides the text contrast reference. These focused checks are not a complete accessibility audit.

| Palette pair                 | Light  | Dark   |
| ---------------------------- | ------ | ------ |
| Secondary text / page        | 5.26:1 | 7.92:1 |
| Primary button text / button | 6.78:1 | 8.37:1 |
| Answer border / page         | 3.30:1 | 3.88:1 |
| Answer border / control      | 3.61:1 | 3.49:1 |

## Responsive verification

`e2e/layout.spec.ts` adds 20 Chromium tests to the existing eight browser journey tests. The layout
project is separate so the matrix does not run twice through the journey projects.

Four states are checked at every size in **both light and dark appearances**: welcome, the opening
question with short answers, the longest starter question and answer labels, and a pause.

| Viewport in CSS pixels | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| 320 × 568              | Minimum supported width and a short phone screen |
| 375 × 667              | Common narrow phone width                        |
| 390 × 844              | Larger phone width                               |
| 768 × 1024             | Tablet-sized layout                              |
| 1440 × 900             | Desktop reading region                           |
| 844 × 390              | Landscape-shaped viewport                        |
| 1280 × 480             | Short desktop window                             |

The tests measure horizontal overflow, clipped text, overlapping blocks, target dimensions, equal
answer widths, stacking behavior, and whether controls remain reachable through normal scrolling.
Extra cases in each scheme check 200% text size at 320 pixels, viewport-height changes from 844 to
500 pixels and back during a question, and the palette contrast thresholds.

Full-page images of the four states are saved under the ignored `test-results/` directory for visual
review. They are review artifacts rather than pixel-exact snapshots. Representative images were
visually inspected: desktop light questions, desktop dark pauses, narrow phone welcome and pause
screens, the 320-pixel long question, the 390-pixel question, the tablet long question, and the
landscape question. The default opening screen was also inspected in the in-app browser.

All **103 unit tests and 28 browser tests passed**, along with type checks, lint, formatting, and the
production build. No dependencies were added. The resulting production assets are 73.39 kB of
JavaScript and 1.64 kB of CSS, measured with gzip compression.

## Remaining verification

These are browser viewport and text-resize checks. They do not reproduce physical notches, mobile
browser chrome animations, browser zoom, or spoken screen-reader output. Real-device safe-area
checks, Firefox/WebKit, zoom, and the full accessibility review remain scheduled for later steps.
Step 07 has since integrated browser history, transitions, and rapid-input handling.
