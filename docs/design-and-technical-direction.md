# The 3 A.M. Philosophy Button

Research and proposed implementation direction — 23 September 2026.

Status: research and a small interactive design concept are complete. Steps 01–05 now provide the
first playable implementation; see the [roadmap](./implementation-roadmap.md) for current progress.
The project directory was empty at the initial research inspection. The decisions below record the
original direction, including verification still scheduled for later steps.

Concept verification: inspected the opening and question layouts at desktop width and the question layouts at 375 and 320 CSS pixels. Both initial answers reached distinct follow-up questions; the back control restored the root question. At 320 pixels, the document had no horizontal overflow and both answer buttons measured 280 × 60 CSS pixels. The preview reported no browser console errors. This is a limited prototype check, not the production release checks described below.

## Product decision

Build a small, responsive reading experience. The opening screen has one button. Pressing it reveals one philosophical question and two equally prominent answers. Each answer leads to a deliberately connected question. The experience invites curiosity without interpreting the person, evaluating their answers, or tracking achievements.

The writing is the primary product. Hand-author the first set of questions and transitions. Randomize the entry point, then follow explicit answer links so choices have understandable consequences. For example:

- “Would immortality eventually make everything meaningless?”
- “Eventually, yes.” → “Does a moment matter because it ends, or because you were there?”
- “There would always be more.” → “If you had to forget a century to live another, would you still choose forever?”

Two answers are two interesting positions to explore, not an exhaustive taxonomy of possible beliefs. Avoid right/wrong language, leading labels, personality judgments, or an authoritative philosophical conclusion.

## Research and implications

| Reference                                                                                            | Observation                                                                                                                                                                   | Decision for this app                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [The Useless Web](https://theuselessweb.com/)                                                        | A prominent central button explains the main interaction immediately. Inspected its live opening screen.                                                                      | Make the opening action unmistakable and put personality into its wording and treatment.                                                                        |
| [The Evolution of Trust](https://ncase.me/trust/)                                                    | Its opening screen uses expressive typography, generous central space, and a clear play action. Inspected the live opening screen; this research did not audit the full game. | A playful intellectual experience can establish its character through typography and composition.                                                               |
| [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)             | Staged disclosure presents only the controls relevant to the current step.                                                                                                    | Show the current thought and its two choices; introduce secondary navigation only after starting.                                                               |
| [W3C: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) | The enhanced criterion specifies 44 × 44 CSS pixel targets, with exceptions.                                                                                                  | Use answer buttons at least 52 pixels high and secondary targets at least 44 × 44. This deliberately exceeds the 24-pixel WCAG 2.2 AA minimum target size rule. |
| [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                               | Content should remain usable when it reflows at narrow widths or high zoom.                                                                                                   | Support a 320 CSS pixel viewport, wrapping labels and natural page scrolling.                                                                                   |
| [W3C: Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                   | Ordinary text generally requires 4.5:1 contrast at AA.                                                                                                                        | Verify actual text/background pairs, including secondary navigation.                                                                                            |

These references support interaction and accessibility decisions. They do not establish that a particular aesthetic will be most engaging for this audience. The proposed mood is a design judgment to validate with a few people using the first playable version.

## Visual direction

Use a quiet reading-room mood: charcoal, warm ivory, a restrained amber accent, and large serif questions. Provide a warm-paper light appearance following the system preference. Start with Georgia for questions and a system sans-serif for controls; this avoids font downloads and keeps the first load small. The concept allows comparison with sans-serif questions.

The question is the visual focus, with a reading width of roughly 20–26 characters. Keep the overall interaction region approximately 600 pixels wide on desktop. Use whitespace rather than a dashboard, multiple cards, or decorative imagery. The opening action can be softly rounded; answer controls should be restrained and equal in emphasis.

Use brief transitions around 150–200 ms. Respect reduced-motion preferences. Present the entire question immediately, with no typing delay. Keep sound out of the first version.

## Responsive behavior and accessibility

- Mobile first: 20–24 pixels of side padding, large full-width answer buttons, stacked choices, fluid question typography.
- Desktop: center the reading region; show answers side by side only when their labels fit comfortably. Long answers may stay stacked.
- Allow vertical scrolling on short screens, landscape phones, and zoomed views. Use a minimum viewport height with modern small/dynamic viewport units and safe-area padding in the production app; never lock page height or clip long content.
- Use semantic headings and native buttons, visible focus, and no hover-dependent actions.
- Manage focus and screen-reader announcements when the question changes. Verify that the next question is announced once and the interaction remains understandable.
- Offer quiet “Go back” and “Leave this thought” controls after entry. The opening screen still contains exactly one interactive action.
- Preserve browser Back/Forward behavior during a session using the History API. Session answers need not appear in URLs.

## First-version scope

Aim for approximately 40–60 questions across five themes: identity, time, reality, meaning, and connection. Treat this as a content target, not a requirement to fill space. Review each link for a clear connection to the selected answer.

Model content as a directed graph of stable IDs. Branches may intentionally rejoin, which keeps authoring manageable. Avoid accidental cycles and immediate repetition. Reach a quiet pause after an authored sequence, generally around 4–8 questions, with an invitation to enter another rabbit hole. A finite collection should have honest stopping places rather than imply unlimited unseen content.

Keep session history in browser memory for v1; refreshing starts a new visit. No accounts, scores, answer uploads, database, or analytics are required. A generated-question service is a possible later experiment; it would add latency, operating cost, reliability concerns, and a server boundary that the curated version does not need.

## Technology decisions

| Layer                | Choice                                          | Reason                                                                                                                                                       |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI                   | React + TypeScript, strict mode                 | A small component model and explicit types for questions, choices, and session state.                                                                        |
| Development/build    | Vite + npm                                      | Straightforward local development and a static production build. Commit the lockfile and document the compatible Node LTS version selected when scaffolding. |
| Styles               | CSS Modules + CSS custom properties             | Enough structure for a small bespoke interface, with centralized spacing, color, and typography tokens.                                                      |
| Content              | Typed local TypeScript modules                  | Questions and answer links are versioned alongside the app and checked before release.                                                                       |
| State                | A small reducer and pure transition functions   | Deterministic branching and backtracking; React's built-in state is sufficient.                                                                              |
| Logic/content checks | Vitest                                          | Validate graph integrity and session behavior.                                                                                                               |
| Browser checks       | Playwright + axe-core                           | Exercise the flow in Chromium, Firefox, and WebKit; test mobile layouts and common accessibility problems.                                                   |
| Code quality         | ESLint, Prettier, TypeScript checks             | Consistent conventions and early feedback.                                                                                                                   |
| CI                   | GitHub Actions when the repository is connected | Run type checking, lint, content/logic tests, browser smoke tests, and the production build before changes land.                                             |
| Hosting              | Cloudflare Pages                                | Serve the generated static assets over HTTPS; no running application server needed.                                                                          |

[React's own documentation](https://react.dev/learn/build-a-react-app-from-scratch) describes the Vite + TypeScript setup and the tradeoffs of building without a full framework. For this single-view app with bundled content, server rendering, server data fetching, and a routing library offer little initial benefit. React is a maintainability choice, not a technical necessity; vanilla TypeScript could also implement the interaction with fewer runtime bytes.

[Vite documentation](https://vite.dev/guide/), [Vitest documentation](https://vitest.dev/guide/), and [Cloudflare's Vite deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) support this workflow. Select compatible stable releases at implementation time rather than copy version numbers from the research.

## Implementation boundaries

Separate the question content, pure traversal logic, and UI. Suggested modules: `content/` for the graph, `engine/` for transitions and validation, and `components/` for the welcome screen, question view, and pause screen. Keep architecture proportional to the app.

Render question text as text, not raw HTML. Bundle the content with the app, use no client secrets, keep dependencies limited, and add a small error fallback and a useful no-JavaScript message. Set page title, description, favicon, and social preview metadata in the static HTML.

Use semantic structure and CSS for the entire interaction. A UI kit, animation framework, global state library, backend, and generative AI API are unnecessary for this scope.

## Release checks

1. Validate unique IDs, exactly two choices per question, valid destinations, reachable questions, intentional endings, and no accidental cycles. Type checking alone cannot prove these graph properties.
2. Test that both answers follow their specified edges, backtracking restores the previous question, changing an answer discards the abandoned forward path, and restarting clears the current session.
3. Exercise complete paths, both entry choices, pause/restart, and Back/Forward in browser tests. Check rapid input cannot skip multiple questions during a transition.
4. Test layouts at 320, 375/390, 768, and 1440 CSS pixels, plus phone landscape, long content, light/dark appearance, reduced motion, and zoom. Check actual overflow and target dimensions.
5. Combine automated accessibility scans with manual keyboard and screen-reader checks. Automated scans cannot prove accessibility; [Playwright's guidance](https://playwright.dev/docs/accessibility-testing) recommends combining approaches.
6. Smoke-test real iOS Safari and Android Chrome before release. [Device emulation](https://playwright.dev/docs/emulation) is useful for repeatability but does not reproduce every physical-device behavior.
7. Inspect the production build on a throttled mobile connection. Set an initial JavaScript budget around 150 KB compressed and revisit it only with a concrete reason. Verify there are no network round trips between questions.
8. Ask a few people to use the first version without instructions. Watch whether they understand the button, read both choices, recognize the relationship between questions, and can leave or backtrack comfortably. Revise confusing wording before expanding the library.

## Build sequence

First establish the project and content model, then implement and review one polished rabbit hole on phone and desktop. Expand the content only after the interaction works. Finish with accessibility, browser, performance, and deployment checks.
