# Experience review

Step 08, 23 September 2026.

These notes record the starter experience review. Step 09 subsequently expanded the content;
see the [full library review](./library-review.md) for current counts and coverage.

Decision: keep the current interaction and starter writing, fix the missing question at pauses,
and proceed to content expansion in Step 09. This is an independent walkthrough and editorial
review by the implementation agent. It is not a first-time participant study, and it cannot
establish whether other people find the app intuitive or engaging.

## Review method

Reviewed the one-button opening, question/answer connections, reading comfort, back/leave controls,
pauses, and finite-library wording. Reread all 19 authored questions and both answer labels,
including the shared-question connections documented in the [starter review](./starter-content-review.md).
The app presents no personality judgments or success metrics.

Four complete routes were walked in the in-app browser. A/B denote the first/second answer for
this review only; these labels are not displayed in the product.

| Route             | Layout                      | Observed progression                                                                  |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| Copy BAB          | 390 × 844, dark, before fix | A separate person → shared friendships → remembered promises → pause                  |
| Immortality BBAA  | 390 × 844, dark, before fix | Memory loss → preserving happy memories → changing values → pause                     |
| Copy AAB          | 390 × 844, dark, after fix  | Another self → a private memory → claims to a name → pause with the question retained |
| Immortality AAAAA | 1440 × 900, dark, after fix | Endings → a last evening → ordinary Tuesdays → awareness of repetition → pause        |

The revised copy pause was inspected at 320 × 568 and 1440 × 900 as well. The longer pause with
revisit guidance was inspected at 320 × 568, and Leave returned to a single opening control.
Production-test captures were also visually reviewed for desktop/light, phone/dark, and
landscape/light pauses. The viewport override was reset and the preview returned to fresh welcome.

## Findings and decisions

| Area               | Evidence and interpretation                                                                                                                               | Decision                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Pause context      | The screen said “Stay with this question” but replaced the question with a generic heading. Reflection required remembering it or going back.             | Fixed: show the actual final question below the pause heading.                                                         |
| Opening            | Exactly one button, “Ask me a question,” states the action. No setup or explanation is needed to activate it in the walkthrough.                          | Keep. Whether a new visitor understands the premise remains a tryout question.                                         |
| Branch connections | The walked routes follow recognizable changes in perspective. The source review found no clear broken connection requiring a rewrite.                     | Keep the authored edges; review new shared questions against every incoming answer in Step 09.                         |
| Longer copy        | The longest question and its nuanced answer pair fit at 390 pixels, with no horizontal overflow. It asks for more reading than the surrounding questions. | Keep this deliberate long case. Prefer shorter wording for new questions and ask participants which lines they reread. |
| Pacing             | Copy pauses after three questions; immortality after four or five. Each click advances only when requested; there is no countdown or typing delay.        | Preserve these starter lengths. Aim for the agreed 4–8 questions in new collections, without padding a completed idea. |
| Tone               | Answers express positions rather than judgments about the reader. The pauses leave the issue open.                                                        | Keep the nonjudgmental tone and equal answer emphasis. Emotional response still needs participant feedback.            |
| Back and leave     | Both are present after entry and remain reachable on the small layouts. The walkthrough and browser suite restore the expected screens.                   | Keep the controls and wording. Discoverability and expectations should be observed in a tryout.                        |
| Revisit            | The message distinguishes having tried every opening from having explored every branch.                                                                   | Keep the explicit revisit wording as more collections are added.                                                       |

## Implemented fix

`App.tsx` derives the preceding question from the current session trail when displaying a pause.
It does not duplicate question text in the content library or save additional state. This matters
because the same pause can follow different questions, and browser history can restore an earlier
route. The preceding question must come from that route rather than the most recently seen one.

The question is rendered as plain text in a smaller serif paragraph using a shared typography
token. It is included with the pause invitation in the focused heading's accessible description.
No new control or live region was introduced. Spoken output still needs the planned screen-reader
check; the automated test verifies the accessible description and focus, not actual speech.

## Verification

`npm run check` passed TypeScript, ESLint, formatting, **103 unit tests**, the production build,
and **48 browser tests**. The added scenario runs in desktop/light and mobile/dark Chromium:

- Reach the shared copy pause through the name question and verify that question remains visible.
- Go back, change the friendship answer, and reach the same pause through the promise question.
- Verify the old question is absent and the accessible description contains the current one.
- Start another rabbit hole, return with Back, and traverse Back/Forward around the pause.

The existing 20 layout checks include the added paragraph because they measure all main text
blocks. They passed at 320, 375, 390, 768, and 1440 pixels, short/landscape sizes, both themes,
and 200% text size. The 320-pixel copy pause measured 578 pixels tall in a 568-pixel viewport;
normal scrolling kept the controls reachable. No clipping or overlap required a layout change.
The captured in-app console had no errors or warnings. The production assets measure
**74.27 kB gzip** of JavaScript and **1.79 kB gzip** of CSS. No dependencies were added.

## Feedback and next step

No external participant sessions were conducted. Feedback from the project owner was invited
during the review but was not available for these findings. The [tryout guide](./tryout-guide.md)
provides a neutral opening prompt, observation points, and questions for a short future session.
This limitation does not block the independent work allowed by the roadmap.

Step 09 expands the library toward 40–60 questions across the five themes. Carry forward the
pause-context fix, balanced choices, explicit answer links, and compact wording. Revisit reading
length and control discoverability when feedback arrives. Physical-device, Firefox/WebKit, actual
zoom, and spoken screen-reader verification remain Step 10 work.
